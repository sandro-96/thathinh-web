import { cn } from "@/lib/utils";
import { genderRingClass } from "@/lib/gender";
import { ClickableAvatar } from "@/components/ui/clickable-avatar";

/**
 * Avatar có viền màu theo giới tính (nam xanh / nữ hồng / khác tím) để dễ phân biệt.
 * Bọc {@link ClickableAvatar} nên vẫn xem được ảnh gốc khi bấm.
 */
export function GenderAvatar({ gender, className, ...props }) {
  return (
    <ClickableAvatar
      className={cn(genderRingClass(gender), "ring-offset-2 ring-offset-background", className)}
      {...props}
    />
  );
}
