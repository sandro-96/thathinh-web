import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_IMAGES = 6;

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

    const images = selected.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      toast.error("Chỉ hỗ trợ gửi ảnh");
      return;
    }
    if (images.some((f) => f.size > 15 * 1024 * 1024)) {
      toast.error("Có ảnh quá lớn (tối đa 15MB)");
      return;
    }
    const limited = images.slice(0, MAX_IMAGES);
    if (images.length > MAX_IMAGES) {
      toast.info(`Chỉ gửi tối đa ${MAX_IMAGES} ảnh mỗi lần`);
    }

    setUploading(true);
    try {
      const compressed = await Promise.all(
        limited.map((file) =>
          imageCompression(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
          })
        )
      );
      await onSend(compressed);
    } catch {
      toast.error("Không thể gửi ảnh");
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
