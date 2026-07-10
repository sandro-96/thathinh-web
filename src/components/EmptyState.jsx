import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 py-10 px-4",
        className,
      )}
    >
      {Icon && (
        <div className="rounded-full bg-rose-50 p-4 text-rose-400">
          <Icon className="h-8 w-8" />
        </div>
      )}
      {title && <p className="font-medium text-foreground">{title}</p>}
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}
