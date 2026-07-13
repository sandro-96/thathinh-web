import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const closeButtonClass =
  "fixed z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-md opacity-95 hover:bg-black/80 hover:opacity-100 active:scale-95 transition-all ring-2 ring-white/25 shadow-lg top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]";

export function ImageLightbox({ src, alt = "Xem ảnh", open, onOpenChange }) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-3xl w-[95vw] p-2 sm:p-3 bg-transparent border-0 shadow-none"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[85vh] object-contain rounded-lg select-none"
          draggable={false}
        />
        <DialogClose className={cn(closeButtonClass)} aria-label="Đóng">
          <X className="h-6 w-6" strokeWidth={2.25} />
          <span className="sr-only">Đóng</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export { closeButtonClass as imageLightboxCloseClass };
