import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, BellRing, BellOff, Share, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerPush } from "@/lib/push";

function detectIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function NotificationSettingsCard() {
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [perm, setPerm] = useState(supported ? Notification.permission : "unsupported");
  const [busy, setBusy] = useState(false);
  const iosNeedsInstall = detectIOS() && !isStandalone();

  useEffect(() => {
    if (supported) setPerm(Notification.permission);
  }, [supported]);

  const enable = async () => {
    if (!supported) return;
    setBusy(true);
    try {
      let p = Notification.permission;
      if (p === "default") p = await Notification.requestPermission();
      setPerm(p);
      if (p === "granted") {
        await registerPush();
        toast.success("Đã bật thông báo");
      } else if (p === "denied") {
        toast.error("Thông báo đang bị chặn. Hãy bật lại trong cài đặt trình duyệt.");
      }
    } catch {
      toast.error("Không thể bật thông báo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="animate-fade-up stagger-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-muted-foreground" /> Thông báo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!supported ? (
          <p className="text-sm text-muted-foreground">Trình duyệt của bạn không hỗ trợ thông báo đẩy.</p>
        ) : perm === "granted" ? (
          <p className="text-sm text-emerald-600 flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Đã bật thông báo cho tin nhắn & ghép đôi.
          </p>
        ) : perm === "denied" ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <BellOff className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Thông báo đang bị chặn. Hãy vào cài đặt trình duyệt cho trang này và bật lại quyền Thông báo.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Bật để nhận thông báo khi có tin nhắn riêng mới hoặc được ghép đôi, kể cả khi không mở tab.
            </p>
            <Button onClick={enable} disabled={busy} className="bg-rose-500 hover:bg-rose-600 gap-1.5">
              <BellRing className="h-4 w-4" /> {busy ? "Đang bật..." : "Bật thông báo"}
            </Button>
          </>
        )}

        {iosNeedsInstall && (
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <Share className="h-4 w-4 mt-0.5 shrink-0 text-rose-500" />
            <p>
              Trên iPhone/iPad, để nhận thông báo đẩy bạn cần thêm ứng dụng vào Màn hình chính:
              bấm nút <span className="font-medium">Chia sẻ</span> trong Safari →{" "}
              <span className="font-medium">Thêm vào MH chính</span>, rồi mở app từ biểu tượng đó.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
