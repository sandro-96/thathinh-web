import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TypingIndicator({ avatarUrl, name = "Đối phương", showAvatar = true }) {
  return (
    <div className="flex items-end gap-2 animate-msg-in" aria-label={`${name} đang nhập`}>
      {showAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatarUrl} alt="" />
          <AvatarFallback>{name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className="rounded-2xl rounded-bl-md bg-muted border px-3.5 py-2.5 flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
