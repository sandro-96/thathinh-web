import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, User, Shield, Inbox } from "lucide-react";
import { toast } from "sonner";
import { myTopics } from "@/api/topicApi";
import { listConversations } from "@/api/conversationApi";
import { listFriendRequests } from "@/api/friendApi";
import { sendHeartbeat } from "@/api/presenceApi";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTabNotification } from "@/hooks/useTabNotification";
import { WS_TYPES } from "@/constants/websocket";
import { isProfileComplete } from "@/lib/profile";
import { registerPush } from "@/lib/push";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectionBanner } from "@/components/ConnectionBanner";

const tabs = [
  { to: "/topics", icon: MessageCircle, label: "Topic" },
  { to: "/chats", icon: Inbox, label: "Tin nhắn" },
  { to: "/flirt", icon: Heart, label: "Thả thính" },
  { to: "/profile", icon: User, label: "Hồ sơ" },
];

function TabBadges({ tabTo, joinedCount, pendingRequests, unreadTotal }) {
  const chatsBadge = pendingRequests + unreadTotal;
  return (
    <>
      {tabTo === "/topics" && joinedCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] leading-none justify-center rounded-full bg-rose-500 pointer-events-none">
          {joinedCount}
        </Badge>
      )}
      {tabTo === "/chats" && chatsBadge > 0 && (
        <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] leading-none justify-center rounded-full bg-rose-500 pointer-events-none">
          {chatsBadge > 99 ? "99+" : chatsBadge}
        </Badge>
      )}
    </>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribe } = useWebSocket();
  const { notify } = useTabNotification();
  const [joinedCount, setJoinedCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const refreshUnread = useCallback(() => {
    listConversations()
      .then((res) => {
        const list = res.data.data || [];
        setUnreadTotal(list.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
      })
      .catch(() => setUnreadTotal(0));
  }, []);

  const refreshPendingRequests = useCallback(() => {
    listFriendRequests()
      .then((res) => setPendingRequests((res.data.data || []).length))
      .catch(() => setPendingRequests(0));
  }, []);

  useEffect(() => {
    if (!user) {
      setJoinedCount(0);
      setPendingRequests(0);
      setUnreadTotal(0);
      return;
    }
    myTopics()
      .then((res) => setJoinedCount((res.data.data || []).length))
      .catch(() => setJoinedCount(0));
    refreshPendingRequests();
    refreshUnread();
  }, [user, refreshPendingRequests, refreshUnread]);

  useEffect(() => {
    // Không tự bật prompt xin quyền lúc vào app (UX xấu trên mobile & bị iOS bỏ qua nếu
    // không xuất phát từ thao tác người dùng). Chỉ đồng bộ subscription nếu đã được cấp quyền.
    // Việc xin quyền chuyển sang nút "Bật thông báo" trong trang Hồ sơ.
    if (user?.id && typeof Notification !== "undefined" && Notification.permission === "granted") {
      registerPush();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const beat = () => {
      if (!document.hidden) sendHeartbeat().catch(() => {});
    };
    beat();
    const interval = setInterval(beat, 30000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const unsubFriends = subscribe(`/topic/users/${user.id}/friends`, (msg) => {
      if (msg.type === WS_TYPES.FRIEND_REQUEST) {
        refreshPendingRequests();
        if (!pathname.startsWith("/chats")) {
          toast.info("Có lời mời kết bạn mới", {
            action: { label: "Xem", onClick: () => navigate("/chats") },
          });
        }
      }
      if (msg.type === WS_TYPES.FRIEND_ACCEPTED) {
        refreshPendingRequests();
        refreshUnread();
        if (!pathname.startsWith("/chats")) {
          toast.success("Đã kết bạn!", {
            action: { label: "Nhắn tin", onClick: () => navigate("/chats") },
          });
        }
      }
      if (msg.type === WS_TYPES.CONVERSATION_UPDATED) {
        refreshUnread();
        const data = msg.data;
        if (data?.unread && !data.muted && data.id && pathname !== `/chats/${data.id}`) {
          toast.info(`Tin nhắn mới từ ${data.partnerNickname || "bạn bè"}`, {
            action: { label: "Xem", onClick: () => navigate(`/chats/${data.id}`) },
          });
          notify("Tin nhắn mới", {
            body: `${data.partnerNickname || "Bạn bè"} vừa nhắn cho bạn`,
            tag: `conv-${data.id}`,
            onClick: () => navigate(`/chats/${data.id}`),
          });
        }
      }
    });

    const unsubFlirt = subscribe(`/topic/users/${user.id}/flirt`, (msg) => {
      if (msg.type === WS_TYPES.FLIRT_MATCHED && msg.data?.sessionId) {
        const sessionId = msg.data.sessionId;
        notify("Đã ghép đôi! 💕", {
          body: "Bạn vừa được ghép với một người mới — vào chat ngay!",
          tag: "flirt-match",
          onClick: () => navigate(`/flirt/chat/${sessionId}`),
        });
        if (pathname.startsWith("/flirt")) {
          navigate(`/flirt/chat/${sessionId}`);
          toast.success("Đã tìm được đối tác!");
        } else {
          toast.success("Đã tìm được đối tác!", {
            duration: 10000,
            action: { label: "Vào chat", onClick: () => navigate(`/flirt/chat/${sessionId}`) },
          });
        }
      }
    });

    return () => {
      unsubFriends();
      unsubFlirt();
    };
  }, [user?.id, subscribe, pathname, navigate, refreshPendingRequests, refreshUnread, notify]);

  const tabHref = (to) => (to === "/flirt" && !isProfileComplete(user) ? "/profile?onboarding=1" : to);
  const tabActive = (to) => pathname.startsWith(to);

  // Màn hình chat 1:1 (chat riêng / thả thính đã match): ẩn bottom bar để không
  // vướng khi gõ tin nhắn hoặc bấm gửi, và cho khung chat chiếm trọn chiều cao.
  const isChatRoute =
    /^\/chats\/[^/]+$/.test(pathname) || /^\/flirt\/chat\/[^/]+$/.test(pathname);

  return (
    <div
      className="flex flex-col overflow-hidden bg-gradient-to-b from-rose-50 to-white dark:from-background dark:to-background"
      style={{ height: "var(--vvh, 100dvh)" }}
    >
      <ConnectionBanner />
      <header className="sticky top-0 z-40 border-b border-rose-100/70 dark:border-border bg-background/70 backdrop-blur-xl px-4 py-3">
        <div className="container max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/topics"
            className="font-bold text-lg sm:text-xl bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent shrink-0 transition-transform hover:scale-[1.03]"
          >
            Thả Thính
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {tabs.map(({ to, icon: Icon, label }) => {
              const active = tabActive(to);
              return (
                <Link
                  key={to}
                  to={tabHref(to)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm relative transition-colors",
                    active ? "text-rose-700 dark:text-rose-300 font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-rose-100 dark:bg-rose-500/15"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    <Icon className="h-4 w-4" />
                    <TabBadges
                      tabTo={to}
                      joinedCount={joinedCount}
                      pendingRequests={pendingRequests}
                      unreadTotal={unreadTotal}
                    />
                  </span>
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={cn("flex-1 min-h-0", isChatRoute ? "overflow-hidden" : "overflow-y-auto")}>
        <div
          className={cn(
            "container max-w-3xl mx-auto",
            isChatRoute ? "h-full px-3 sm:px-4 py-2 sm:py-3" : "px-4 py-4 pb-24 md:pb-8"
          )}
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(isChatRoute && "h-full")}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {!isChatRoute && (
        <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-rose-100/70 dark:border-border bg-background/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="flex justify-around py-1.5">
            {tabs.map(({ to, icon: Icon, label }) => {
              const active = tabActive(to);
              return (
                <Link
                  key={to}
                  to={tabHref(to)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] relative transition-colors active:scale-95",
                    active ? "text-rose-600" : "text-muted-foreground"
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                    <TabBadges
                      tabTo={to}
                      joinedCount={joinedCount}
                      pendingRequests={pendingRequests}
                      unreadTotal={unreadTotal}
                    />
                  </span>
                  {label}
                  {to === "/flirt" && !isProfileComplete(user) && (
                    <span className="absolute top-0 right-2 h-2 w-2 rounded-full bg-rose-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
