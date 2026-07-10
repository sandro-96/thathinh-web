import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_GROUPS = [
  {
    label: "Cảm xúc",
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😜", "🤪", "😎", "🥰", "😇", "🙂", "🤗", "🤔", "😴", "😭", "😅", "😳", "🥺"],
  },
  {
    label: "Cử chỉ",
    emojis: ["👍", "👎", "👏", "🙌", "🙏", "🤝", "💪", "👋", "✌️", "🤟", "👌", "🫶", "🤙", "🫂"],
  },
  {
    label: "Tình yêu",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💖", "💗", "💓", "💞", "💕", "💘", "💌", "🌹", "😻"],
  },
  {
    label: "Khác",
    emojis: ["🔥", "✨", "🎉", "🎁", "🌸", "🌈", "☀️", "🌙", "⭐", "💯", "👀", "🍀", "🍰", "☕", "🍻", "🎶"],
  },
];

export function EmojiPicker({ onSelect, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          aria-label="Chọn biểu tượng cảm xúc"
          className="h-11 w-11 rounded-full shrink-0 text-muted-foreground hover:text-rose-500"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-64 max-w-[calc(100vw-1.5rem)] p-2">
        <div className="max-h-64 overflow-y-auto space-y-2">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-medium text-muted-foreground px-1 mb-1">{group.label}</p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="h-8 w-8 rounded-md text-lg leading-none hover:bg-muted transition-colors"
                    onClick={() => {
                      onSelect(emoji);
                      setOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
