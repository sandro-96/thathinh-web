import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CornerUpLeft, MoreHorizontal, Trash2, Loader2, AlertCircle, RotateCw } from "lucide-react";
import { ClickableAvatar } from "@/components/ui/clickable-avatar";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function LinkifiedText({ text, isMine }) {
  const parts = String(text).split(URL_REGEX);
  return parts.map((part, i) => {
    if (!part) return null;
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={(e) => e.stopPropagation()}
          className={cn("underline underline-offset-2 break-all", isMine ? "text-white font-medium" : "text-rose-600")}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function MessageBubble({
  message,
  seen = false,
  currentUserId,
  showName = true,
  onReact,
  onReply,
  onDelete,
  onRetry,
  onDiscard,
}) {
  const isMine = message.mine;
  const name = message.senderNickname || "Ẩn danh";
  const time = message.sentAt
    ? format(new Date(message.sentAt), "HH:mm", { locale: vi })
    : "";
  const [lightbox, setLightbox] = useState(false);

  const status = message._status;
  const isSending = status === "sending";
  const isFailed = status === "failed";
  const deleted = message.deleted;
  const hasImage = Boolean(message.imageUrl) && !deleted;
  const hasText = Boolean(message.content) && !deleted;
  const reactionEntries = Object.entries(message.reactions || {}).filter(
    ([, users]) => Array.isArray(users) && users.length > 0
  );
  const hasActions = Boolean(onReact || onReply || (isMine && onDelete));
  const canAct = !deleted && !isSending && !isFailed && hasActions;

  const meta = (
    <div className={cn("text-[10px] mt-1 text-right flex items-center gap-1 justify-end", isMine ? "text-white/70" : "text-muted-foreground")}>
      {time}
      {isMine && seen && !isSending && !isFailed && " · Đã xem"}
      {isSending && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
    </div>
  );

  return (
    <div className={cn("group flex w-full gap-1.5 animate-msg-in", isMine ? "flex-row-reverse" : "flex-row")}>
      {!isMine && (
        <ClickableAvatar
          className="h-8 w-8 shrink-0 self-end"
          src={message.senderAvatarUrl}
          alt={`Ảnh đại diện của ${name}`}
          fallback={name[0]?.toUpperCase()}
        />
      )}

      <div className={cn("flex flex-col max-w-[82%] sm:max-w-[75%]", isMine ? "items-end" : "items-start")}>
        {deleted ? (
          <div className="rounded-2xl px-3.5 py-2 border border-dashed text-sm italic text-muted-foreground">
            Tin nhắn đã được thu hồi
          </div>
        ) : (
          <div className="flex items-end gap-1 max-w-full">
            {canAct && isMine && (
              <MessageActions
                message={message} isMine={isMine} onReact={onReact} onReply={onReply} onDelete={onDelete}
              />
            )}
            <div className={cn("flex flex-col min-w-0", isMine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "rounded-2xl shadow-sm overflow-hidden max-w-full",
                  isMine ? "rounded-br-md" : "rounded-bl-md",
                  isMine ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white" : "bg-muted border",
                  isFailed && "opacity-70",
                  !hasImage && "px-3.5 py-2"
                )}
              >
                {!isMine && showName && !hasImage && (
                  <div className="text-xs font-medium mb-1 opacity-80">{name}</div>
                )}

                {message.replyToId && (
                  <div
                    className={cn(
                      "mb-1.5 rounded-md px-2 py-1 text-xs border-l-2 flex items-center gap-2",
                      hasImage && "mx-3.5 mt-2",
                      isMine ? "bg-white/15 border-white/50" : "bg-background/60 border-rose-400"
                    )}
                  >
                    {message.replyToImageUrl && (
                      <img
                        src={message.replyToImageUrl}
                        alt="Ảnh được trả lời"
                        loading="lazy"
                        className="h-9 w-9 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="font-medium opacity-90 block truncate">{message.replyToSenderNickname || "Tin nhắn"}</span>
                      <p className="opacity-80 truncate">{message.replyToPreview}</p>
                    </div>
                  </div>
                )}

                {hasImage && (
                  <button type="button" onClick={() => setLightbox(true)} className="block w-full leading-none" aria-label="Xem ảnh">
                    <img src={message.imageUrl} alt="Ảnh đã gửi" loading="eager" decoding="async" className="max-h-72 w-full object-cover cursor-zoom-in" />
                  </button>
                )}

                {hasImage ? (
                  <div className="px-3.5 py-2">
                    {!isMine && showName && <div className="text-xs font-medium mb-1 opacity-80">{name}</div>}
                    {hasText && <p className="whitespace-pre-wrap break-words leading-relaxed text-sm"><LinkifiedText text={message.content} isMine={isMine} /></p>}
                    {meta}
                  </div>
                ) : (
                  <>
                    {hasText && <p className="whitespace-pre-wrap break-words leading-relaxed text-sm"><LinkifiedText text={message.content} isMine={isMine} /></p>}
                    {meta}
                  </>
                )}
              </div>

              {reactionEntries.length > 0 && (
                <div className={cn("flex flex-wrap gap-1 mt-1", isMine ? "justify-end" : "justify-start")}>
                  {reactionEntries.map(([emoji, users]) => {
                    const mine = users.includes(currentUserId);
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onReact?.(message.id, emoji)}
                        className={cn(
                          "flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs shadow-sm transition-colors",
                          mine ? "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-200" : "bg-background hover:bg-muted"
                        )}
                      >
                        <span>{emoji}</span>
                        <span className="tabular-nums">{users.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {canAct && !isMine && (
              <MessageActions
                message={message} isMine={isMine} onReact={onReact} onReply={onReply} onDelete={onDelete}
              />
            )}
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2 mt-1 text-[11px] text-destructive">
            <AlertCircle className="h-3 w-3" /> Gửi lỗi
            <button type="button" onClick={() => onRetry?.(message)} className="inline-flex items-center gap-0.5 underline hover:no-underline">
              <RotateCw className="h-3 w-3" /> Gửi lại
            </button>
            <button type="button" onClick={() => onDiscard?.(message)} className="underline hover:no-underline">Bỏ</button>
          </div>
        )}
      </div>

      {hasImage && (
        <ImageLightbox
          src={message.imageUrl}
          alt="Ảnh phóng to"
          open={lightbox}
          onOpenChange={setLightbox}
        />
      )}
    </div>
  );
}

function MessageActions({ message, isMine, onReact, onReply, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Tuỳ chọn tin nhắn"
          className="mb-1 h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isMine ? "end" : "start"} className="w-44">
        {onReact && (
          <div className="flex justify-between px-1 py-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
                className="h-8 w-8 rounded-full text-lg leading-none hover:bg-muted transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        {onReact && (onReply || isMine) && <DropdownMenuSeparator />}
        {onReply && (
          <DropdownMenuItem onClick={() => onReply(message)}>
            <CornerUpLeft className="h-4 w-4 mr-2" /> Trả lời
          </DropdownMenuItem>
        )}
        {isMine && onDelete && (
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(message.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Thu hồi
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
