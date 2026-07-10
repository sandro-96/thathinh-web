import axiosInstance from "./axiosInstance";

export const startFlirt = () => axiosInstance.post("/flirt/start");
export const cancelFlirt = () => axiosInstance.post("/flirt/cancel");
export const getFlirtStatus = () => axiosInstance.get("/flirt/status");
export const getFlirtHistory = (limit = 20) =>
  axiosInstance.get("/flirt/history", { params: { limit } });
export const getFlirtMessages = (sessionId, cursor) =>
  axiosInstance.get(`/flirt/${sessionId}/messages`, { params: { cursor, limit: 50 } });
export const sendFlirtMessage = (sessionId, content, replyToId) =>
  axiosInstance.post(`/flirt/${sessionId}/messages`, { content, replyToId });
export const sendFlirtImage = (sessionId, file, content, replyToId) => {
  const form = new FormData();
  form.append("file", file);
  if (content) form.append("content", content);
  if (replyToId) form.append("replyToId", replyToId);
  return axiosInstance.post(`/flirt/${sessionId}/messages/image`, form);
};
export const sendFlirtTyping = (sessionId) =>
  axiosInstance.post(`/flirt/${sessionId}/typing`);
export const reactFlirtMessage = (sessionId, messageId, emoji) =>
  axiosInstance.post(`/flirt/${sessionId}/messages/${messageId}/reactions`, { emoji });
export const deleteFlirtMessage = (sessionId, messageId) =>
  axiosInstance.delete(`/flirt/${sessionId}/messages/${messageId}`);
export const endFlirt = (sessionId) => axiosInstance.post(`/flirt/${sessionId}/end`);
export const reportFlirt = (sessionId, reason) =>
  axiosInstance.post(`/flirt/${sessionId}/report`, { reason });
export const sendFriendRequest = (sessionId) =>
  axiosInstance.post(`/flirt/${sessionId}/friend-request`);
export const getFlirtFriendStatus = (sessionId) =>
  axiosInstance.get(`/flirt/${sessionId}/friend-status`);
export const importFlirtHistoryFromSession = (sessionId) =>
  axiosInstance.post(`/flirt/${sessionId}/import-flirt-history`);
