import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAvatarPresets, chooseAvatarPreset } from "@/api/userApi";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/utils";
import { genderRingClass } from "@/lib/gender";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Hộp thoại chọn avatar mặc định theo giới tính. Preset lấy từ backend (đồng bộ với
 * avatar sinh lúc đăng ký), nên nam/nữ có màu nền và khuôn mặt khác nhau.
 */
export function AvatarPickerDialog({ open, onOpenChange, gender, currentUrl, onChosen }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingSeed, setSavingSeed] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAvatarPresets()
      .then((res) => setPresets(res.data.data || []))
      .catch(() => setPresets([]))
      .finally(() => setLoading(false));
  }, [open]);

  const pick = async (seed) => {
    setSavingSeed(seed);
    try {
      await chooseAvatarPreset(seed);
      toast.success("Đã đổi avatar");
      onChosen?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể đổi avatar"));
    } finally {
      setSavingSeed(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn avatar</DialogTitle>
          <DialogDescription>
            Ảnh gợi ý theo giới tính. Bạn vẫn có thể tải ảnh thật bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto py-1">
            {presets.map((p) => {
              const active = currentUrl === p.url;
              return (
                <button
                  key={p.seed}
                  type="button"
                  onClick={() => pick(p.seed)}
                  disabled={savingSeed !== null}
                  aria-label={`Chọn avatar ${p.seed}`}
                  className={cn(
                    "relative aspect-square rounded-full overflow-hidden transition-transform hover:scale-105",
                    genderRingClass(gender),
                    active && "ring-4 ring-rose-500"
                  )}
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {savingSeed === p.seed && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
