import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Send, DoorOpen, MessagesSquare, LogOut, ArrowLeft } from "lucide-react";
import {
  getTopicBySlug, joinTopic, leaveTopic, getTopicMessages, sendTopicMessage,
  topicPresence, topicTyping,
} from "@/api/topicApi";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { usePaginatedMessages } from "@/hooks/usePaginatedMessages";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { WS_TYPES } from "@/constants/websocket";
import { EmptyState } from "@/components/EmptyState";
import { ChatMessagesPanel } from "@/components/chat/ChatMessagesPanel";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TopicChatPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribe } = useWebSocket();

  const [topic, setTopic] = useState(null);
  const [text, setText] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingNickname, setTypingNickname] = useState(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const bottomRef = useRef(null);

  const fetchPage = useCallback(async (cursor) => {
    if (!topic?.id) return [];
    const res = await getTopicMessages(topic.id, cursor);
    return res.data.data || [];
  }, [topic?.id]);

  const {
    messages, hasMore, loading, loadingMore, error, loadInitial, appendMessage, handleScroll,
  } = usePaginatedMessages(fetchPage);

  useEffect(() => {
    setLoadError(false);
    getTopicBySlug(slug)
      .then((res) => setTopic(res.data.data))
      .catch((err) => {
        setLoadError(true);
        toast.error(getApiErrorMessage(err, "Không tải được phòng"));
      });
  }, [slug]);

  useEffect(() => {
    if (!topic?.id || !topic.joined) return;
    loadInitial();
    const unsub = subscribe(`/topic/topics/${topic.id}/messages`, (msg) => {
      if (msg.type === WS_TYPES.TOPIC_MESSAGE && msg.data) {
        appendMessage({ ...msg.data, mine: msg.data.senderId === user?.id });
      }
    });
    return unsub;
  }, [topic?.id, topic?.joined, subscribe, user?.id, loadInitial, appendMessage]);

  useEffect(() => {
    if (!topic?.id || !topic.joined) return undefined;
    setOnlineCount(topic.onlineCount || 0);
    topicPresence(topic.id, "join").catch(() => {});
    const heartbeat = setInterval(() => {
      topicPresence(topic.id, "heartbeat").catch(() => {});
    }, 30000);
    const unsubPresence = subscribe(`/topic/topics/${topic.id}/presence`, (msg) => {
      if (msg.type === WS_TYPES.TOPIC_PRESENCE && msg.data?.onlineCount != null) {
        setOnlineCount(msg.data.onlineCount);
      }
      if (msg.type === WS_TYPES.TOPIC_TYPING && msg.data?.nickname) {
        if (msg.data.userId !== user?.id) {
          setTypingNickname(msg.data.nickname);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingNickname(null), 3000);
        }
      }
    });
    return () => {
      clearInterval(heartbeat);
      clearTimeout(typingTimeoutRef.current);
      unsubPresence();
      topicPresence(topic.id, "leave").catch(() => {});
    };
  }, [topic?.id, topic?.joined, subscribe, user?.id]);

  const handleJoin = async () => {
    try {
      const res = await joinTopic(topic.id);
      setTopic(res.data.data);
      toast.success("Đã tham gia topic!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể tham gia"));
    }
  };

  const handleLeave = async () => {
    try {
      const res = await leaveTopic(topic.id);
      setTopic(res.data.data);
      toast.success("Đã rời phòng");
      navigate("/topics");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể rời phòng"));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendTopicMessage(topic.id, text.trim());
      setText("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gửi thất bại"));
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!topic?.joined) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      topicTyping(topic.id).catch(() => {});
    }
  };

  const headerTitle = topic?.name || (loadError ? "Không tìm thấy phòng" : "Đang tải...");

  let body;
  if (!topic && !loadError) {
    body = (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Đang tải...
      </div>
    );
  } else if (loadError || !topic) {
    body = (
      <EmptyState
        icon={DoorOpen}
        title="Không tìm thấy phòng"
        description="Phòng có thể đã bị xoá hoặc không còn hoạt động"
        className="flex-1"
        action={
          <Button asChild variant="outline">
            <Link to="/topics">Về danh sách phòng</Link>
          </Button>
        }
      />
    );
  } else if (!topic.joined) {
    body = (
      <EmptyState
        icon={DoorOpen}
        title="Bạn chưa tham gia phòng này"
        description={topic.description || "Tham gia để xem và gửi tin nhắn cùng mọi người"}
        className="flex-1"
        action={
          user ? (
            <Button onClick={handleJoin} className="bg-rose-500 hover:bg-rose-600">
              Tham gia để trò chuyện
            </Button>
          ) : (
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link to="/login">Đăng nhập để tham gia</Link>
            </Button>
          )
        }
      />
    );
  } else {
    body = (
      <>
        <ChatMessagesPanel
          key={topic?.id ?? slug}
          messages={messages}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          onRetry={loadInitial}
          onScroll={handleScroll}
          bottomRef={bottomRef}
          emptyState={(
            <EmptyState
              icon={MessagesSquare}
              title="Chưa có tin nhắn"
              description="Hãy là người đầu tiên chào mọi người trong phòng này!"
              className="flex-1 py-16"
            />
          )}
          renderMessage={(m) => (
            <MessageBubble key={m.id} message={{ ...m, mine: m.senderId === user?.id }} />
          )}
        />
        <form onSubmit={handleSend} className="flex gap-2 pt-3">
          <EmojiPicker onSelect={(emoji) => setText((t) => t + emoji)} />
          <Input
            value={text}
            onChange={handleTextChange}
            placeholder="Nhập tin nhắn..."
            className="rounded-full h-11 px-4"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Gửi tin nhắn"
            disabled={!text.trim()}
            className="h-11 w-11 rounded-full bg-rose-500 hover:bg-rose-600 shrink-0 shadow-md shadow-rose-500/30 transition-transform active:scale-90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden bg-gradient-to-b from-rose-50 to-white dark:from-background dark:to-background"
      style={{ height: "var(--vvh, 100dvh)" }}
    >
      <header className="sticky top-0 z-40 border-b border-rose-100/70 dark:border-border bg-background/70 backdrop-blur-xl">
        <div className="container max-w-3xl mx-auto flex items-center gap-2 px-3 sm:px-4 py-2.5">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/topics" aria-label="Về danh sách phòng"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate leading-tight">{headerTitle}</h1>
            {topic && (
              <div className="flex gap-2 mt-0.5 flex-wrap items-center text-xs text-muted-foreground">
                <span>{topic.memberCount} thành viên</span>
                {topic.joined && onlineCount > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {onlineCount} online
                  </span>
                )}
                {typingNickname && (
                  <span className="text-rose-500">· {typingNickname} đang nhập...</span>
                )}
              </div>
            )}
          </div>
          {topic?.joined && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 shrink-0">
                  <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Rời phòng</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rời phòng {topic.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn sẽ không nhận tin nhắn từ phòng này nữa. Có thể tham gia lại sau.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Ở lại</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeave}>Rời phòng</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="container max-w-3xl mx-auto h-full px-3 sm:px-4 py-2 sm:py-3 flex flex-col">
          {body}
        </div>
      </main>
    </div>
  );
}
