import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClickableAvatar } from "@/components/ui/clickable-avatar";
import { ImageLightbox } from "@/components/ui/image-lightbox";

const GENDER_LABEL = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };

export function PartnerProfileDialog({ open, onOpenChange, partner }) {
  const [preview, setPreview] = useState(null);
  if (!partner) return null;

  const metaParts = [];
  if (partner.age) metaParts.push(`${partner.age} tuổi`);
  if (partner.gender && GENDER_LABEL[partner.gender]) metaParts.push(GENDER_LABEL[partner.gender]);
  const photos = partner.photos || [];
  const interests = partner.interests || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Hồ sơ {partner.nickname || "đối phương"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="rounded-full p-[3px] bg-gradient-to-br from-rose-400 to-pink-600">
                <ClickableAvatar
                  className="h-20 w-20 ring-2 ring-background"
                  src={partner.avatarUrl}
                  alt={`Ảnh đại diện của ${partner.nickname}`}
                  fallback={partner.nickname?.[0]}
                  fallbackClassName="text-2xl"
                />
              </span>
              <div>
                <p className="font-semibold text-lg leading-tight">{partner.nickname || "Đối phương"}</p>
                {metaParts.length > 0 && (
                  <p className="text-sm text-muted-foreground">{metaParts.join(" · ")}</p>
                )}
              </div>
            </div>

            {partner.bio && (
              <div className="rounded-lg bg-muted/60 p-3 text-sm whitespace-pre-wrap break-words text-center">
                {partner.bio}
              </div>
            )}

            {interests.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {interests.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-200 px-3 py-1 text-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setPreview(url)}
                    className="aspect-square rounded-lg overflow-hidden border"
                  >
                    <img src={url} alt="Ảnh hồ sơ" loading="lazy" className="h-full w-full object-cover cursor-zoom-in" />
                  </button>
                ))}
              </div>
            )}

            {!partner.bio && interests.length === 0 && photos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">Đối phương chưa cập nhật giới thiệu.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        src={preview}
        alt="Ảnh hồ sơ"
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
      />
    </>
  );
}
