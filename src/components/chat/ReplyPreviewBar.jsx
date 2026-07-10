import { CornerUpLeft, X } from "lucide-react";

export function ReplyPreviewBar({ senderLabel, preview, imageUrl, onCancel }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-l-2 border-rose-400 bg-muted/60 rounded-md mb-2 animate-fade-up">
      <CornerUpLeft className="h-4 w-4 text-rose-500 shrink-0" />
      {imageUrl && (
        <img src={imageUrl} alt="Ảnh được trả lời" className="h-9 w-9 rounded object-cover shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-rose-600">Trả lời {senderLabel}</p>
        <p className="text-xs text-muted-foreground truncate">{preview || "Tin nhắn"}</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Huỷ trả lời"
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function replyPreviewText(message) {
  if (!message) return "";
  if (message.content) return message.content;
  if (message.imageUrl) return "📷 Hình ảnh";
  return "";
}
