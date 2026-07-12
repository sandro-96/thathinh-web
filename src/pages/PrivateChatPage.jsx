import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Send, ArrowLeft, Sparkles, MoreVertical, UserMinus, Ban, History, Bell, BellOff, Flag } from "lucide-react";
import {
  getConversationMessages, sendConversationMessage, sendConversationImage, getConversation, importFlirtHistory,
  markConversationRead, sendConversationTyping, reactConversationMessage, deleteConversationMessage, toggleConversationMute,
} from "@/api/conversationApi";
import { unfriend, blockUser, unblockUser, reportUser } from "@/api/friendApi";
import { FLIRT_REPORT_REASONS } from "@/constants/reportReasons";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { usePaginatedMessages } from "@/hooks/usePaginatedMessages";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/utils";
import { WS_TYPES } from "@/constants/websocket";
import { EmptyState } from "@/components/EmptyState";
import { ChatMessagesPanel } from "@/components/chat/ChatMessagesPanel";
import { ChatImageButton } from "@/components/chat/ChatImageButton";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { ReplyPreviewBar, replyPreviewText } from "@/components/chat/ReplyPreviewBar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { PartnerProfileDialog } from "@/components/chat/PartnerProfileDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PrivateChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [meta, setMeta] = useState(null);
  const [text, setText] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerReadAt, setPartnerReadAt] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(FLIRT_REPORT_REASONS[0]);
  const [reporting, setReporting] = useState(false);
  const initialReadCapturedRef = useRef(false);
  const [initialReadAt, setInitialReadAt] = useState(null);
  const [hasInitialUnread, setHasInitialUnread] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const fetchPage = useCallback(async (cursor) => {
    const res = await getConversationMessages(conversationId, cursor);
    return res.data.data || [];
  }, [conversationId]);

  const {
    messages, hasMore, loading, loadingMore, error, loadInitial, appendMessage, handleScroll, setMessages,
    patchMessage, removeMessage, replaceMessage,
  } = usePaginatedMessages(fetchPage);

  const loadConversation = () => {
    return getConversation(conversationId)
      .then((res) => {
        const data = res.data.data;
        setPartner({
          nickname: data.partnerNickname,
          avatarUrl: data.partnerAvatarUrl,
          id: data.partnerId,
          age: data.partnerAge,
          gender: data.partnerGender,
          bio: data.partnerBio,
          interests: data.partnerInterests,
          photos: data.partnerPhotos,
        });
        setMeta(data);
        if (data.partnerLastReadAt) setPartnerReadAt(new Date(data.partnerLastReadAt));
        // Ghi lại mốc đã đọc + số chưa đọc lúc mở (trước khi đánh dấu đã đọc) để vẽ vạch "Tin chưa đọc".
        if (!initialReadCapturedRef.current) {
          initialReadCapturedRef.current = true;
          setHasInitialUnread(data.unreadCount > 0);
          setInitialReadAt(data.myLastReadAt || null);
        }
        return data;
      })
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải được hội thoại")));
  };

  useEffect(() => {
    loadInitial();
    // Nạp hội thoại (lấy mốc đã đọc) TRƯỚC rồi mới đánh dấu đã đọc, tránh race.
    loadConversation().finally(() => markConversationRead(conversationId).catch(() => {}));
  }, [conversationId, loadInitial]);

  useEffect(() => {
    if (!user?.id) return;
    const unsubMsg = subscribe(`/topic/conversations/${conversationId}/messages`, (msg) => {
      if (msg.type === WS_TYPES.PRIVATE_MESSAGE && msg.data) {
        // Tin của chính mình đã được thêm lạc quan / từ REST — bỏ qua echo để tránh nháy đôi.
        if (msg.data.senderId === user?.id) return;
        setPartnerTyping(false);
        appendMessage({ ...msg.data, mine: false });
        markConversationRead(conversationId).catch(() => {});
      }
      if (msg.type === WS_TYPES.PRIVATE_TYPING && msg.data?.userId && msg.data.userId !== user?.id) {
        setPartnerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      }
      if (msg.type === WS_TYPES.PRIVATE_READ && msg.data?.readerId && msg.data.readerId !== user?.id) {
        setPartnerReadAt(msg.data.readAt ? new Date(msg.data.readAt) : new Date());
      }
      if (msg.type === WS_TYPES.PRIVATE_MESSAGE_UPDATED && msg.data) {
        patchMessage(msg.data.id, { ...msg.data, mine: msg.data.senderId === user?.id });
      }
    });
    return () => {
      unsubMsg();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, subscribe, user?.id, appendMessage, patchMessage]);

  const sendText = async (content, replyToId, tempId) => {
    try {
      const res = await sendConversationMessage(conversationId, content, replyToId || undefined);
      replaceMessage(tempId, { ...res.data.data, mine: true });
    } catch (err) {
      patchMessage(tempId, { _status: "failed" });
      toast.error(getApiErrorMessage(err, "Gửi thất bại"));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    if (meta?.blockedByMe || meta?.blockedByPartner) {
      toast.error("Không thể nhắn tin với người dùng này");
      return;
    }
    const reply = replyingTo;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    appendMessage({
      id: tempId,
      senderId: user?.id,
      content,
      sentAt: new Date().toISOString(),
      mine: true,
      _status: "sending",
      replyToId: reply?.id || null,
      replyToSenderNickname: reply ? (reply.senderNickname || partner?.nickname) : null,
      replyToPreview: reply ? replyPreviewText(reply) : null,
      replyToImageUrl: reply?.imageUrl || null,
    });
    setText("");
    setReplyingTo(null);
    sendText(content, reply?.id, tempId);
  };

  const handleRetry = (msg) => {
    patchMessage(msg.id, { _status: "sending" });
    sendText(msg.content, msg.replyToId, msg.id);
  };

  const handleSendImages = async (files) => {
    if (meta?.blockedByMe || meta?.blockedByPartner) {
      toast.error("Không thể nhắn tin với người dùng này");
      return;
    }
    const caption = text.trim();
    const replyToId = replyingTo?.id;
    if (caption) setText("");
    setReplyingTo(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await sendConversationImage(
          conversationId, files[i], i === 0 ? caption : undefined, i === 0 ? replyToId : undefined
        );
        appendMessage({ ...res.data.data, mine: true });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể gửi ảnh"));
    }
  };

  const handleReact = async (messageId, emoji) => {
    if (String(messageId).startsWith("temp-")) return;
    try {
      const res = await reactConversationMessage(conversationId, messageId, emoji);
      patchMessage(res.data.data.id, { ...res.data.data, mine: res.data.data.senderId === user?.id });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể thả cảm xúc"));
    }
  };

  const handleDelete = async (messageId) => {
    if (String(messageId).startsWith("temp-")) {
      removeMessage(messageId);
      return;
    }
    try {
      const res = await deleteConversationMessage(conversationId, messageId);
      patchMessage(res.data.data.id, { ...res.data.data, mine: res.data.data.senderId === user?.id });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể thu hồi"));
    }
  };

  const handleToggleMute = async () => {
    try {
      const res = await toggleConversationMute(conversationId);
      setMeta(res.data.data);
      toast.success(res.data.data.muted ? "Đã tắt thông báo hội thoại" : "Đã bật lại thông báo");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể cập nhật"));
    }
  };

  const insertEmoji = (emoji) => setText((t) => t + emoji);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (meta?.blockedByMe || meta?.blockedByPartner) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      sendConversationTyping(conversationId).catch(() => {});
    }
  };

  const handleImportHistory = async () => {
    try {
      const res = await importFlirtHistory(conversationId);
      const data = res.data.data;
      if (data.alreadyImported) {
        toast.info("Lịch sử flirt đã được chuyển trước đó");
      } else {
        toast.success(`Đã chuyển ${data.importedCount} tin nhắn flirt sang chat riêng`);
        setMessages([]);
        loadInitial();
      }
      loadConversation();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể chuyển lịch sử"));
    }
  };

  const runConfirmAction = async () => {
    if (!partner?.id || !confirmAction) return;
    try {
      if (confirmAction === "unfriend") {
        await unfriend(partner.id);
        toast.success("Đã huỷ kết bạn");
        navigate("/chats");
      } else if (confirmAction === "block") {
        await blockUser(partner.id);
        toast.success("Đã chặn người dùng");
        navigate("/chats");
      } else if (confirmAction === "unblock") {
        await unblockUser(partner.id);
        toast.success("Đã bỏ chặn");
        loadConversation();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setConfirmAction(null);
    }
  };

  const handleReport = async () => {
    if (!partner?.id) return;
    setReporting(true);
    try {
      await reportUser(partner.id, reportReason);
      toast.success("Đã gửi báo cáo. Cảm ơn bạn đã phản hồi.");
      setReportOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể gửi báo cáo"));
    } finally {
      setReporting(false);
    }
  };

  const messagingDisabled = meta?.blockedByMe || meta?.blockedByPartner;

  const lastMineMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === user?.id) return messages[i];
    }
    return null;
  }, [messages, user?.id]);

  const firstUnreadId = useMemo(() => {
    if (!hasInitialUnread) return null;
    const threshold = initialReadAt ? new Date(initialReadAt).getTime() : 0;
    const found = messages.find(
      (m) => m.senderId !== user?.id && !String(m.id).startsWith("temp-") &&
        m.sentAt && new Date(m.sentAt).getTime() > threshold
    );
    return found?.id || null;
  }, [messages, hasInitialUnread, initialReadAt, user?.id]);

  const isSeen =
    partnerReadAt &&
    lastMineMessage?.sentAt &&
    new Date(lastMineMessage.sentAt).getTime() <= partnerReadAt.getTime();

  const statusText = partnerTyping
    ? "đang nhập..."
    : meta?.blockedByMe
    ? "Bạn đã chặn người này"
    : meta?.blockedByPartner
    ? "Người này đã chặn bạn"
    : meta?.partnerOnline
    ? "Đang hoạt động"
    : meta?.partnerLastSeenAt
    ? `Hoạt động ${formatDistanceToNow(new Date(meta.partnerLastSeenAt), { addSuffix: true, locale: vi })}`
    : "Tin nhắn riêng";
  const statusHighlight = partnerTyping || meta?.partnerOnline;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/chats" aria-label="Quay lại danh sách trò chuyện"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left rounded-lg px-1 py-0.5 hover:bg-muted/60 transition-colors"
          aria-label="Xem hồ sơ đối phương"
        >
          <span className="relative shrink-0">
            <Avatar>
              <AvatarImage src={partner?.avatarUrl} alt={`Ảnh đại diện của ${partner?.nickname || "bạn bè"}`} />
              <AvatarFallback>{partner?.nickname?.[0]}</AvatarFallback>
            </Avatar>
            {meta?.partnerOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{partner?.nickname || "Bạn bè"}</p>
            <p className={cn("text-xs truncate", statusHighlight ? "text-emerald-600" : "text-muted-foreground")}>
              {statusText}
            </p>
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Tuỳ chọn khác"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!meta?.flirtHistoryImported && (
              <DropdownMenuItem onClick={handleImportHistory}>
                <History className="h-4 w-4 mr-2" /> Chuyển lịch sử flirt
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleToggleMute}>
              {meta?.muted
                ? (<><Bell className="h-4 w-4 mr-2" /> Bật thông báo</>)
                : (<><BellOff className="h-4 w-4 mr-2" /> Tắt thông báo</>)}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmAction("unfriend")}>
              <UserMinus className="h-4 w-4 mr-2" /> Huỷ kết bạn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setReportReason(FLIRT_REPORT_REASONS[0]); setReportOpen(true); }}>
              <Flag className="h-4 w-4 mr-2" /> Báo cáo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {meta?.blockedByMe ? (
              <DropdownMenuItem onClick={() => setConfirmAction("unblock")}>
                <Ban className="h-4 w-4 mr-2" /> Bỏ chặn
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction("block")}>
                <Ban className="h-4 w-4 mr-2" /> Chặn người dùng
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChatMessagesPanel
        messages={messages}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        error={error}
        onRetry={loadInitial}
        onScroll={handleScroll}
        bottomRef={bottomRef}
        firstUnreadMessageId={firstUnreadId}
        typingIndicator={partnerTyping ? (
          <TypingIndicator avatarUrl={partner?.avatarUrl} name={partner?.nickname} />
        ) : null}
        emptyState={(
          <EmptyState
            icon={Sparkles}
            title="Bắt đầu nhắn riêng"
            description={
              meta?.flirtHistoryImported
                ? `Gửi tin nhắn tới ${partner?.nickname || "bạn bè"}`
                : `Gửi tin nhắn hoặc chuyển lịch sử flirt từ phiên thả thính`
            }
            action={!meta?.flirtHistoryImported && (
              <Button variant="outline" onClick={handleImportHistory}>Chuyển lịch sử flirt</Button>
            )}
            className="flex-1 py-16"
          />
        )}
        renderMessage={(m) => (
          <MessageBubble
            key={m.id}
            seen={isSeen && m.id === lastMineMessage?.id}
            currentUserId={user?.id}
            showName={false}
            onReact={handleReact}
            onReply={setReplyingTo}
            onDelete={handleDelete}
            onRetry={handleRetry}
            onDiscard={(msg) => removeMessage(msg.id)}
            message={{
              ...m,
              mine: m.senderId === user?.id,
              senderNickname: m.senderId === user?.id ? user?.nickname : partner?.nickname,
              senderAvatarUrl: m.senderId === user?.id ? user?.avatarUrl : partner?.avatarUrl,
            }}
          />
        )}
      />

      <div className="pt-3">
        {replyingTo && (
          <ReplyPreviewBar
            senderLabel={replyingTo.senderId === user?.id ? "chính bạn" : (partner?.nickname || "bạn bè")}
            preview={replyPreviewText(replyingTo)}
            imageUrl={replyingTo.imageUrl}
            onCancel={() => setReplyingTo(null)}
          />
        )}
      <form onSubmit={handleSend} className="flex gap-2">
        <ChatImageButton onSend={handleSendImages} disabled={messagingDisabled} />
        <EmojiPicker onSelect={insertEmoji} disabled={messagingDisabled} />
        <Input
          value={text}
          onChange={handleTextChange}
          placeholder={messagingDisabled ? "Không thể nhắn tin" : "Nhắn riêng..."}
          disabled={messagingDisabled}
          className="rounded-full h-11 px-4"
        />
        <Button
          type="submit"
          size="icon"
          disabled={messagingDisabled || !text.trim()}
          aria-label="Gửi tin nhắn"
          className="h-11 w-11 rounded-full bg-rose-500 hover:bg-rose-600 shrink-0 shadow-md shadow-rose-500/30 transition-transform active:scale-90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      </div>

      <PartnerProfileDialog open={profileOpen} onOpenChange={setProfileOpen} partner={partner} />

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Báo cáo {partner?.nickname || "người dùng"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Chọn lý do báo cáo. Admin sẽ xem xét.</p>
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FLIRT_REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)} disabled={reporting}>Huỷ</Button>
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleReport} disabled={reporting}>
              {reporting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "unfriend" && "Huỷ kết bạn?"}
              {confirmAction === "block" && "Chặn người dùng?"}
              {confirmAction === "unblock" && "Bỏ chặn?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "unfriend" && "Bạn sẽ không thể nhắn tin riêng với người này nữa."}
              {confirmAction === "block" && "Người này sẽ không thể kết bạn, thả thính hoặc nhắn tin với bạn."}
              {confirmAction === "unblock" && "Người này có thể tương tác lại với bạn (cần kết bạn lại để nhắn riêng)."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={runConfirmAction}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
