import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

/**
 * Avatar có thể bấm để xem ảnh gốc (lightbox). Click dùng stopPropagation để không kích hoạt parent.
 */
export function ClickableAvatar({
  src,
  alt = "Ảnh đại diện",
  fallback,
  className,
  fallbackClassName,
  previewable = true,
  onClick,
}) {
  const [open, setOpen] = useState(false);
  const canPreview = previewable && src;

  const handleClick = (e) => {
    if (canPreview) {
      e.stopPropagation();
      e.preventDefault();
      setOpen(true);
    }
    onClick?.(e);
  };

  const avatar = (
    <Avatar className={cn(canPreview && "cursor-zoom-in", className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
    </Avatar>
  );

  if (!canPreview) {
    return avatar;
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e);
          }
        }}
        className="inline-flex rounded-full cursor-zoom-in"
        aria-label={`Xem ${alt}`}
      >
        {avatar}
      </span>
      <ImageLightbox src={src} alt={alt} open={open} onOpenChange={setOpen} />
    </>
  );
}
