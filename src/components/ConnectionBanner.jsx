import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

/**
 * Hiện banner "đang kết nối lại" khi WebSocket rớt quá {@code delayMs}
 * (tránh nhấp nháy lúc kết nối lần đầu hoặc gián đoạn ngắn).
 */
export function ConnectionBanner({ delayMs = 3000 }) {
  const { connected } = useWebSocket();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (connected) {
      setShow(false);
      return undefined;
    }
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [connected, delayMs]);

  if (!show) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-500 text-white text-xs py-1.5 px-4"
    >
      <WifiOff className="h-3.5 w-3.5" />
      Mất kết nối — đang thử kết nối lại...
    </div>
  );
}
