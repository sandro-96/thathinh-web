import { Loader2, AlertTriangle, ChevronDown } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { preserveScrollAfterPrepend } from "@/hooks/usePaginatedMessages";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function dateDividerLabel(value) {
  const d = new Date(value);
  if (isToday(d)) return "Hôm nay";
  if (isYesterday(d)) return "Hôm qua";
  return format(d, "EEEE, dd/MM/yyyy", { locale: vi });
}

function DateDivider({ date }) {
  return (
    <div className="sticky top-1 z-10 flex items-center justify-center py-1 pointer-events-none">
      <span className="rounded-full bg-muted/95 backdrop-blur px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
        {dateDividerLabel(date)}
      </span>
    </div>
  );
}

function UnreadDivider() {
  return (
    <div className="flex items-center gap-2 py-1 text-rose-500">
      <span className="h-px flex-1 bg-rose-300/60" />
      <span className="text-[11px] font-medium shrink-0">Tin chưa đọc</span>
      <span className="h-px flex-1 bg-rose-300/60" />
    </div>
  );
}

function shouldShowDivider(prev, current) {
  if (!current?.sentAt) return false;
  if (!prev?.sentAt) return true;
  return !isSameDay(new Date(prev.sentAt), new Date(current.sentAt));
}

function MessagesSkeleton() {
  const rows = [true, false, false, true, false];
  return (
    <div className="flex-1 space-y-4 py-4 px-1" aria-busy="true">
      {rows.map((mine, i) => (
        <div key={i} className={cn("flex gap-2", mine ? "flex-row-reverse" : "flex-row")}>
          {!mine && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          <Skeleton className={cn("h-12 rounded-2xl", i % 2 ? "w-48" : "w-36")} />
        </div>
      ))}
    </div>
  );
}

const NEAR_BOTTOM_THRESHOLD = 320;
const IMAGE_SCROLL_DELAYS_MS = [0, 80, 200, 500, 1000, 2000];

export function ChatMessagesPanel({
  messages,
  loading,
  loadingMore,
  hasMore,
  error,
  onRetry,
  onScroll,
  emptyState,
  renderMessage,
  typingIndicator,
  firstUnreadMessageId,
  bottomRef,
  className,
}) {
  const viewportRef = useRef(null);
  const prevHeightRef = useRef(0);
  const lastMessageIdRef = useRef(null);
  const nearBottomRef = useRef(true);
  const initialScrollDoneRef = useRef(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const stickToBottom = useCallback((behavior = "auto") => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    nearBottomRef.current = true;
    setShowScrollDown(false);
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    stickToBottom(behavior);
  }, [stickToBottom]);

  const updateScrollDown = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
    setShowScrollDown(distanceFromBottom > NEAR_BOTTOM_THRESHOLD);
  }, []);

  const handleViewportScroll = (e) => {
    onScroll?.(e);
    updateScrollDown();
  };

  const scheduleBottomStick = useCallback((behavior = "auto") => {
    const timers = IMAGE_SCROLL_DELAYS_MS.map((ms) =>
      window.setTimeout(() => {
        if (nearBottomRef.current) stickToBottom(behavior);
      }, ms)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [stickToBottom]);

  useEffect(() => {
    updateScrollDown();
  }, [messages.length, updateScrollDown]);

  useEffect(() => {
    if (loading) {
      initialScrollDoneRef.current = false;
      return;
    }
    if (messages.length === 0) return;
    if (initialScrollDoneRef.current) return;
    initialScrollDoneRef.current = true;
    return scheduleBottomStick("auto");
  }, [loading, messages.length, scheduleBottomStick]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last?.id || loadingMore) return;
    if (last.id === lastMessageIdRef.current) return;
    lastMessageIdRef.current = last.id;
    return scheduleBottomStick("smooth");
  }, [messages, loadingMore, scheduleBottomStick]);

  useEffect(() => {
    if (!typingIndicator) return;
    if (nearBottomRef.current) stickToBottom("smooth");
  }, [typingIndicator, stickToBottom]);

  useEffect(() => {
    if (loadingMore) {
      prevHeightRef.current = viewportRef.current?.scrollHeight || 0;
    }
  }, [loadingMore]);

  useEffect(() => {
    if (!loadingMore && prevHeightRef.current) {
      preserveScrollAfterPrepend(viewportRef.current, prevHeightRef.current);
      prevHeightRef.current = 0;
    }
  }, [messages.length, loadingMore]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onImageLoad = (e) => {
      if (e.target?.tagName !== "IMG") return;
      if (nearBottomRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
      }
      updateScrollDown();
    };
    viewport.addEventListener("load", onImageLoad, true);

    const content = viewport.firstElementChild;
    let ro;
    if (content && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (nearBottomRef.current) {
          viewport.scrollTop = viewport.scrollHeight;
        }
        updateScrollDown();
      });
      ro.observe(content);
    }

    return () => {
      viewport.removeEventListener("load", onImageLoad, true);
      ro?.disconnect();
    };
  }, [updateScrollDown]);

  if (loading) {
    return <MessagesSkeleton />;
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">Không tải được tin nhắn.</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>Thử lại</Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative flex-1 min-h-0 flex flex-col", className)}>
      <div
        ref={viewportRef}
        onScroll={handleViewportScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden pr-2"
      >
        <div className="space-y-3 py-2">
          {loadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loadingMore && hasMore && messages.length > 0 && (
            <p className="text-center text-xs text-muted-foreground py-1">Cuộn lên để xem tin cũ hơn</p>
          )}
          {messages.length === 0
            ? emptyState
            : messages.map((m, i) => (
                <Fragment key={m.id ?? i}>
                  {shouldShowDivider(messages[i - 1], m) && <DateDivider date={m.sentAt} />}
                  {firstUnreadMessageId && m.id === firstUnreadMessageId && <UnreadDivider />}
                  {renderMessage(m, i)}
                </Fragment>
              ))}
          {typingIndicator}
          <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
        </div>
      </div>

      {showScrollDown && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Cuộn xuống tin mới nhất"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center hover:bg-rose-600 transition-all animate-scale-in"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
