import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { MessageCircle, UserPlus, Search, Check, X, BellOff } from "lucide-react";
import { listConversations } from "@/api/conversationApi";
import { listFriendRequests, acceptFriendRequest, declineFriendRequest } from "@/api/friendApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { WS_TYPES } from "@/constants/websocket";
import { EmptyState } from "@/components/EmptyState";
import { ChatListSkeleton } from "@/components/chat/ChatListSkeleton";
import { ClickableAvatar } from "@/components/ui/clickable-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ChatListPage() {
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { subscribe } = useWebSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    Promise.all([
      listConversations().then((r) => setConversations(r.data.data || [])),
      listFriendRequests().then((r) => setRequests(r.data.data || [])),
    ])
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải được tin nhắn")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribe(`/topic/users/${user.id}/friends`, (msg) => {
      if (msg.type === WS_TYPES.FRIEND_REQUEST || msg.type === WS_TYPES.FRIEND_ACCEPTED || msg.type === WS_TYPES.CONVERSATION_UPDATED) {
        load();
      }
    });
    return unsub;
  }, [user?.id, subscribe]);

  const handleAccept = async (id) => {
    try {
      const res = await acceptFriendRequest(id);
      toast.success("Đã kết bạn!");
      const convId = res.data.data?.id;
      if (convId) navigate(`/chats/${convId}`);
      else load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDecline = async (id) => {
    try {
      await declineFriendRequest(id);
      toast.info("Đã từ chối");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (c.partnerNickname || "").toLowerCase().includes(q));
  }, [conversations, search]);

  if (loading) {
    return <ChatListSkeleton />;
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-xl sm:text-2xl font-bold">Tin nhắn</h1>
        <p className="text-muted-foreground text-sm">Chat riêng với bạn bè sau khi kết bạn</p>
      </div>

      {requests.length > 0 && (
        <section className="space-y-2 animate-fade-up stagger-1">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <UserPlus className="h-4 w-4" /> Lời mời kết bạn
            <Badge className="ml-1 bg-rose-500 h-5">{requests.length}</Badge>
          </h2>
          {requests.map((r) => (
            <Card key={r.id} className="border-rose-200/70 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-500/5">
              <CardContent className="pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ClickableAvatar
                    src={r.requesterAvatarUrl}
                    alt={`Ảnh đại diện của ${r.requesterNickname}`}
                    fallback={r.requesterNickname?.[0]}
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.requesterNickname}</p>
                    <p className="text-xs text-muted-foreground">Muốn kết bạn với bạn</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="outline" onClick={() => handleDecline(r.id)} aria-label="Từ chối" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="bg-rose-500 hover:bg-rose-600 rounded-full" onClick={() => handleAccept(r.id)} aria-label="Chấp nhận">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Chưa có tin nhắn riêng"
          description="Kết bạn sau khi thả thính để nhắn tin riêng, không cần ở trong phiên thả thính nữa"
          action={
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link to="/flirt">Đi thả thính</Link>
            </Button>
          }
        />
      ) : (
        <>
          {conversations.length > 4 && (
            <div className="relative animate-fade-up stagger-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 rounded-full"
                placeholder="Tìm bạn bè..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Không tìm thấy bạn bè phù hợp</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((c, i) => (
                <Link key={c.id} to={`/chats/${c.id}`} className="block">
                  <Card
                    className={cn(
                      "hover:border-rose-300 hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-up",
                      c.unread && "bg-rose-50/50 dark:bg-rose-500/5 border-rose-200/70 dark:border-rose-500/20"
                    )}
                    style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                  >
                    <CardContent className="pt-4 flex items-center gap-3">
                      <span className="relative shrink-0">
                        <ClickableAvatar
                          src={c.partnerAvatarUrl}
                          alt={`Ảnh đại diện của ${c.partnerNickname}`}
                          fallback={c.partnerNickname?.[0]}
                        />
                        {c.partnerOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                        )}
                        {c.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-background">
                            {c.unreadCount > 99 ? "99+" : c.unreadCount}
                          </span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("truncate flex items-center gap-1", c.unread ? "font-semibold" : "font-medium")}>
                            {c.partnerNickname}
                            {c.muted && <BellOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          </p>
                          {c.lastMessageAt && (
                            <span className={cn("text-xs shrink-0", c.unread ? "text-rose-500 font-medium" : "text-muted-foreground")}>
                              {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true, locale: vi })}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          c.unread ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {c.lastMessagePreview || "Bắt đầu trò chuyện"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
