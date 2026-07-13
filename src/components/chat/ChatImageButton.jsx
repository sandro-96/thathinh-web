import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_IMAGES = 6;
const MAX_PICK_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isHeic(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return type.includes("heic") || type.includes("heif") || /\.hei[cf]$/.test(name);
}

/** Một số gallery mobile không set MIME — nhận theo type hoặc đuôi file. */
function isImageFile(file) {
  if (file.type?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|hei[cf])$/i.test(file.name || "");
}

/**
 * Nén ảnh cho chat. Mobile: tắt Web Worker, fallback file gốc nếu ≤5MB.
 */
async function prepareChatImage(file) {
  const mobile = isMobileDevice();
  const baseOpts = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1600,
    useWebWorker: !mobile,
    fileType: "image/jpeg",
  };

  try {
    let out = await imageCompression(file, baseOpts);
    if (out.size > MAX_UPLOAD_BYTES) {
      out = await imageCompression(file, {
        ...baseOpts,
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: false,
      });
    }
    return out;
  } catch {
    if (isHeic(file)) {
      throw new Error("HEIC");
    }
    if (file.size <= MAX_UPLOAD_BYTES && isImageFile(file)) {
      return file;
    }
    throw new Error("COMPRESS");
  }
}

/**
 * Nút đính ảnh cho khung chat (chỉ dùng ở chat riêng & thả thính đã match).
 * Hỗ trợ chọn NHIỀU ảnh: nén tất cả phía client rồi gọi `onSend(files[])`.
 * `onSend` tự xử lý caption + gửi tuần tự và bắt lỗi API.
 */
export function ChatImageButton({ onSend, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (selected.length === 0) return;

    const images = selected.filter(isImageFile);
    if (images.length === 0) {
      toast.error("Chỉ hỗ trợ gửi ảnh");
      return;
    }
    if (images.some((f) => f.size > MAX_PICK_BYTES)) {
      toast.error("Có ảnh quá lớn (tối đa 15MB)");
      return;
    }
    const limited = images.slice(0, MAX_IMAGES);
    if (images.length > MAX_IMAGES) {
      toast.info(`Chỉ gửi tối đa ${MAX_IMAGES} ảnh mỗi lần`);
    }

    setUploading(true);
    try {
      const prepared = [];
      for (const file of limited) {
        try {
          prepared.push(await prepareChatImage(file));
        } catch (err) {
          if (err?.message === "HEIC") {
            toast.error("Ảnh HEIC: chọn từ Thư viện hoặc chụp lại bằng Camera");
          } else {
            toast.error("Không xử lý được ảnh này. Thử ảnh nhỏ hơn hoặc chụp lại.");
          }
          return;
        }
      }
      await onSend(prepared);
    } catch {
      toast.error("Không thể gửi ảnh lên máy chủ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleChange} />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        aria-label="Gửi ảnh"
        className="h-11 w-11 rounded-full shrink-0 text-muted-foreground hover:text-rose-500"
      >
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
      </Button>
    </>
  );
}
