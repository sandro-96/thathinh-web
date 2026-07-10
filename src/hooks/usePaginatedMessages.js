import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 50;

/**
 * Tin nhắn chat với load-more khi scroll lên (cursor = sentAt của tin cũ nhất).
 */
export function usePaginatedMessages(fetchPage) {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const scrollPreserveRef = useRef(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const page = await fetchPage();
      setMessages(page);
      setHasMore(page.length >= PAGE_SIZE);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  // Cập nhật một phần tin nhắn theo id (reactions, thu hồi, trạng thái gửi...).
  const patchMessage = useCallback((idOrMsg, patch) => {
    const id = typeof idOrMsg === "string" ? idOrMsg : idOrMsg.id;
    const data = typeof idOrMsg === "string" ? patch : idOrMsg;
    setMessages((prev) => {
      if (!prev.some((m) => m.id === id)) return prev;
      return prev.map((m) => (m.id === id ? { ...m, ...data } : m));
    });
  }, []);

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Thay tin nhắn lạc quan (tempId) bằng tin thật từ server, tránh trùng nếu WS đã thêm.
  const replaceMessage = useCallback((tempId, newMsg) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === tempId ? newMsg : m));
      const seen = new Set();
      return next.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const oldest = messages[0];
    scrollPreserveRef.current = oldest?.sentAt;
    try {
      const older = await fetchPage(oldest.sentAt);
      if (older.length < PAGE_SIZE) setHasMore(false);
      if (older.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = older.filter((m) => !ids.has(m.id));
          return [...merged, ...prev];
        });
      }
    } catch {
      // Giữ nguyên tin đã tải; người dùng có thể cuộn để thử lại.
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, messages]);

  const handleScroll = useCallback((e) => {
    if (e.currentTarget.scrollTop < 64) {
      loadMore();
    }
  }, [loadMore]);

  return {
    messages,
    setMessages,
    hasMore,
    loading,
    loadingMore,
    error,
    loadInitial,
    appendMessage,
    patchMessage,
    removeMessage,
    replaceMessage,
    handleScroll,
    scrollPreserveRef,
  };
}

export function preserveScrollAfterPrepend(viewport, prevScrollHeight) {
  if (!viewport || !prevScrollHeight) return;
  const delta = viewport.scrollHeight - prevScrollHeight;
  viewport.scrollTop += delta;
}
