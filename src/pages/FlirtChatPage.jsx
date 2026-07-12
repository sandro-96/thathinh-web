import { useEffect, useRef, useState, useCallback } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { Send, Flag, LogOut, Sparkles, UserPlus, MessageSquare, Ban, History } from "lucide-react";

import {
  getFlirtMessages, sendFlirtMessage, sendFlirtImage, endFlirt, reportFlirt, getFlirtStatus,
  sendFriendRequest, getFlirtFriendStatus, importFlirtHistoryFromSession, sendFlirtTyping,
  reactFlirtMessage, deleteFlirtMessage,
} from "@/api/flirtApi";

import { acceptFriendRequest, blockUser } from "@/api/friendApi";

import { useAuth } from "@/hooks/useAuth";

import { useWebSocket } from "@/hooks/useWebSocket";

import { usePaginatedMessages } from "@/hooks/usePaginatedMessages";

import { getApiErrorMessage } from "@/lib/apiErrors";

import { WS_TYPES } from "@/constants/websocket";
import { FLIRT_REPORT_REASONS } from "@/constants/reportReasons";

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

  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,

  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,

} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



const ICEBREAKERS = [
  "Chào cậu, hôm nay của cậu thế nào? 😊",
  "Nếu được đi du lịch ngay bây giờ, cậu chọn nơi nào?",
  "Cậu là team cà phê hay team trà sữa? ☕🧋",
  "Kể mình nghe một điều thú vị về cậu đi!",
  "Cuối tuần cậu thích làm gì để thư giãn?",
];

export default function FlirtChatPage() {

  const { sessionId } = useParams();

  const { user } = useAuth();

  const { subscribe } = useWebSocket();

  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [text, setText] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportReason, setReportReason] = useState(FLIRT_REPORT_REASONS[0]);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);



  const fetchPage = useCallback(async (cursor) => {

    const res = await getFlirtMessages(sessionId, cursor);

    return res.data.data || [];

  }, [sessionId]);



  const {

    messages, hasMore, loading, loadingMore, error, loadInitial, appendMessage, handleScroll,
    patchMessage, removeMessage, replaceMessage,

  } = usePaginatedMessages(fetchPage);



  useEffect(() => {

    getFlirtStatus()

      .then((res) => {

        const data = res.data.data;

        if (data.status === "ENDED") {

          toast.info("Phiên thả thính đã kết thúc");

          navigate("/flirt");

          return;

        }

        setPartner({
          nickname: data.partnerNickname,
          avatarUrl: data.partnerAvatarUrl,
          age: data.partnerAge,
          gender: data.partnerGender,
          bio: data.partnerBio,
          interests: data.partnerInterests,
          photos: data.partnerPhotos,
        });

      })

      .catch((err) => toast.error(getApiErrorMessage(err, "Không tải được phiên")));

    loadInitial();
    refreshFriendStatus();
  }, [sessionId, navigate, loadInitial]);

  const refreshFriendStatus = () => {
    getFlirtFriendStatus(sessionId)
      .then((res) => setFriendStatus(res.data.data))
      .catch(() => {});
  };



  useEffect(() => {

    if (!user?.id) return;

    const unsubMsg = subscribe(`/topic/flirt/${sessionId}/messages`, (msg) => {

      if (msg.type === WS_TYPES.FLIRT_MESSAGE && msg.data) {

        // Bỏ qua echo tin của chính mình (đã thêm lạc quan / từ REST) để tránh nháy đôi.
        if (msg.data.senderId === user?.id) return;
        setPartnerTyping(false);
        appendMessage({ ...msg.data, mine: false });

      }

      if (msg.type === WS_TYPES.FLIRT_TYPING && msg.data?.userId && msg.data.userId !== user?.id) {
        setPartnerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      }

      if (msg.type === WS_TYPES.FLIRT_MESSAGE_UPDATED && msg.data) {
        patchMessage(msg.data.id, { ...msg.data, mine: msg.data.senderId === user?.id });
      }

    });

    const unsubFlirt = subscribe(`/topic/users/${user.id}/flirt`, (msg) => {
      if (msg.type === WS_TYPES.FLIRT_ENDED && msg.data?.sessionId === sessionId) {
        if (msg.data?.reason === "REPORTED" && msg.data?.role === "REPORTED") {
          toast.warning("Phiên chat đã kết thúc do có báo cáo về bạn. Admin đang xem xét.");
        } else if (msg.data?.reason === "REPORTED") {
          toast.success("Đã gửi báo cáo. Phiên chat đã kết thúc.");
        } else {
          toast.info("Đối tác đã kết thúc trò chuyện");
        }
        navigate("/flirt");
      }
    });
    const unsubFriends = subscribe(`/topic/users/${user.id}/friends`, (msg) => {
      if (msg.type === WS_TYPES.FRIEND_ACCEPTED && msg.data?.id) {
        refreshFriendStatus();
        toast.success("Đã kết bạn! Bạn có thể nhắn tin riêng");
      }
      if (msg.type === WS_TYPES.FRIEND_REQUEST) {
        refreshFriendStatus();
      }
    });
    return () => {
      unsubMsg();
      unsubFlirt();
      unsubFriends();
      clearTimeout(typingTimeoutRef.current);
    };

  }, [sessionId, subscribe, user?.id, appendMessage, patchMessage, navigate]);

  const sendTextMsg = async (content, replyToId, tempId) => {
    try {
      const res = await sendFlirtMessage(sessionId, content, replyToId || undefined);
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
      replyToSenderNickname: reply ? (reply.mine ? "Bạn" : "Đối phương") : null,
      replyToPreview: reply ? replyPreviewText(reply) : null,
      replyToImageUrl: reply?.imageUrl || null,
    });
    setText("");
    setReplyingTo(null);
    sendTextMsg(content, reply?.id, tempId);
  };

  const handleRetry = (msg) => {
    patchMessage(msg.id, { _status: "sending" });
    sendTextMsg(msg.content, msg.replyToId, msg.id);
  };

  const handleSendImages = async (files) => {
    const caption = text.trim();
    const replyToId = replyingTo?.id;
    if (caption) setText("");
    setReplyingTo(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await sendFlirtImage(
          sessionId, files[i], i === 0 ? caption : undefined, i === 0 ? replyToId : undefined
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
      const res = await reactFlirtMessage(sessionId, messageId, emoji);
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
      const res = await deleteFlirtMessage(sessionId, messageId);
      patchMessage(res.data.data.id, { ...res.data.data, mine: res.data.data.senderId === user?.id });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể thu hồi"));
    }
  };

  const insertEmoji = (emoji) => setText((t) => t + emoji);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      sendFlirtTyping(sessionId).catch(() => {});
    }
  };

  const handleFriendRequest = async () => {
    try {
      const res = await sendFriendRequest(sessionId);
      const data = res.data.data;
      refreshFriendStatus();
      if (data.conversationId) {
        toast.success("Đã kết bạn!");
      } else {
        toast.success("Đã gửi lời mời kết bạn");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleAcceptFriend = async () => {
    try {
      const res = await acceptFriendRequest(friendStatus.incomingRequestId);
      refreshFriendStatus();
      toast.success("Đã kết bạn! Lịch sử flirt sẽ được chuyển sang chat riêng");
      if (res.data.data?.id) setFriendStatus((s) => ({ ...s, conversationId: res.data.data.id, status: "ACCEPTED" }));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handlePrivateChat = () => {
    if (friendStatus?.conversationId) {
      navigate(`/chats/${friendStatus.conversationId}`);
    }
  };

  const handleCopyFlirtHistory = async () => {
    try {
      const res = await importFlirtHistoryFromSession(sessionId);
      const data = res.data.data;
      if (data.alreadyImported) {
        toast.info("Lịch sử đã được chuyển sang chat riêng");
      } else {
        toast.success(`Đã chuyển ${data.importedCount} tin nhắn sang chat riêng`);
      }
      refreshFriendStatus();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể chuyển lịch sử"));
    }
  };

  const handleBlock = async () => {
    if (!friendStatus?.partnerId) return;
    try {
      await blockUser(friendStatus.partnerId);
      toast.success("Đã chặn người dùng");
      navigate("/flirt");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleEnd = async () => {

    try {

      await endFlirt(sessionId);

      toast.info("Đã kết thúc trò chuyện");

      navigate("/flirt");

    } catch (err) {

      toast.error(getApiErrorMessage(err, "Không thể kết thúc"));

    }

  };



  const handleReport = async () => {

    try {

      await reportFlirt(sessionId, reportReason);

      toast.success("Đã gửi báo cáo");

      navigate("/flirt");

    } catch (err) {

      toast.error(getApiErrorMessage(err, "Không thể gửi báo cáo"));

    }

  };



  return (

    <div className="flex flex-col h-full min-h-0">

      <div className="flex items-center justify-between mb-3 pb-3 border-b">

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 min-w-0 text-left rounded-lg -ml-1 pl-1 pr-2 py-0.5 hover:bg-muted/60 transition-colors"
          aria-label="Xem hồ sơ đối phương"
        >

          <span className="relative shrink-0 rounded-full p-[2px] bg-gradient-to-br from-rose-400 to-pink-600">
            <Avatar className="ring-2 ring-background">

              <AvatarImage src={partner?.avatarUrl} alt={`Ảnh đại diện của ${partner?.nickname || "đối tác"}`} />

              <AvatarFallback>{partner?.nickname?.[0]}</AvatarFallback>

            </Avatar>
          </span>

          <div className="min-w-0">
            <span className="font-medium truncate block leading-tight">{partner?.nickname || "Đối tác"}</span>
            {partnerTyping ? (
              <span className="text-xs text-emerald-600">đang nhập...</span>
            ) : (
              <span className="text-xs text-rose-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Đã ghép đôi
              </span>
            )}
          </div>

        </button>

        <div className="flex gap-1">

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chặn đối tác"><Ban className="h-4 w-4 text-red-500" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Chặn {partner?.nickname}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Người này sẽ không thể kết bạn, thả thính hoặc nhắn tin với bạn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction onClick={handleBlock}>Chặn</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>

            <AlertDialogTrigger asChild>

              <Button variant="ghost" size="icon" aria-label="Báo cáo đối tác"><Flag className="h-4 w-4 text-orange-500" /></Button>

            </AlertDialogTrigger>

            <AlertDialogContent>

              <AlertDialogHeader>

                <AlertDialogTitle>Báo cáo đối tác?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>Chọn lý do báo cáo. Admin sẽ xem xét và xử lý.</p>
                    <Select value={reportReason} onValueChange={setReportReason}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FLIRT_REPORT_REASONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AlertDialogDescription>

              </AlertDialogHeader>

              <AlertDialogFooter>

                <AlertDialogCancel>Huỷ</AlertDialogCancel>

                <AlertDialogAction onClick={handleReport}>Báo cáo</AlertDialogAction>

              </AlertDialogFooter>

            </AlertDialogContent>

          </AlertDialog>

          <Button variant="ghost" size="icon" onClick={handleEnd} aria-label="Kết thúc trò chuyện">

            <LogOut className="h-4 w-4" />

          </Button>

        </div>

      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {friendStatus?.status === "ACCEPTED" && friendStatus.conversationId ? (
          <>
            <Button size="sm" variant="outline" onClick={handlePrivateChat} className="gap-1">
              <MessageSquare className="h-4 w-4" /> Nhắn riêng
            </Button>
            {!friendStatus.flirtHistoryImported && (
              <Button size="sm" variant="outline" onClick={handleCopyFlirtHistory} className="gap-1">
                <History className="h-4 w-4" /> Chuyển lịch sử flirt
              </Button>
            )}
          </>
        ) : friendStatus?.incomingRequestId ? (
          <Button size="sm" className="bg-rose-500 hover:bg-rose-600 gap-1" onClick={handleAcceptFriend}>
            <UserPlus className="h-4 w-4" /> Chấp nhận kết bạn
          </Button>
        ) : friendStatus?.status === "PENDING" && friendStatus.requestedByMe ? (
          <Button size="sm" variant="secondary" disabled>Đang chờ đối tác chấp nhận</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handleFriendRequest} className="gap-1">
            <UserPlus className="h-4 w-4" /> Kết bạn
          </Button>
        )}
        <p className="text-xs text-muted-foreground self-center">
          Kết bạn để nhắn riêng — có thể kết thúc thả thính và chat trong Tin nhắn
        </p>
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

        typingIndicator={partnerTyping ? (
          <TypingIndicator avatarUrl={partner?.avatarUrl} name={partner?.nickname} />
        ) : null}

        emptyState={(

          <EmptyState

            icon={Sparkles}

            title="Bắt đầu trò chuyện"

            description={`Gửi lời chào tới ${partner?.nickname || "đối tác"} để phá băng nhé!`}

            className="flex-1 py-16"

            action={(
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {ICEBREAKERS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setText(prompt)}
                    className="rounded-full border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

          />

        )}

        renderMessage={(m) => (

          <MessageBubble

            key={m.id}

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

              replyToSenderNickname: m.replyToId
                ? (m.replyToSenderId
                    ? (m.replyToSenderId === user?.id ? "Bạn" : "Đối phương")
                    : m.replyToSenderNickname)
                : null,

            }}

          />

        )}

      />



      <div className="pt-3">
        {replyingTo && (
          <ReplyPreviewBar
            senderLabel={replyingTo.mine ? "chính bạn" : (partner?.nickname || "đối tác")}
            preview={replyPreviewText(replyingTo)}
            imageUrl={replyingTo.imageUrl}
            onCancel={() => setReplyingTo(null)}
          />
        )}
      <form onSubmit={handleSend} className="flex gap-2">

        <ChatImageButton onSend={handleSendImages} />
        <EmojiPicker onSelect={insertEmoji} />

        <Input
          value={text}
          onChange={handleTextChange}
          placeholder="Nhắn gì đó..."
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
      </div>

      <PartnerProfileDialog open={profileOpen} onOpenChange={setProfileOpen} partner={partner} />

    </div>

  );

}


