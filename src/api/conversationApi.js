import axiosInstance from "./axiosInstance";

export const listConversations = () => axiosInstance.get("/conversations");
export const getConversation = (id) => axiosInstance.get(`/conversations/${id}`);
export const markConversationRead = (id) => axiosInstance.post(`/conversations/${id}/read`);
export const getConversationMessages = (id, cursor) =>
  axiosInstance.get(`/conversations/${id}/messages`, { params: { cursor, limit: 50 } });
export const sendConversationMessage = (id, content, replyToId) =>
  axiosInstance.post(`/conversations/${id}/messages`, { content, replyToId });
export const sendConversationImage = (id, file, content, replyToId) => {
  const form = new FormData();
  form.append("file", file);
  if (content) form.append("content", content);
  if (replyToId) form.append("replyToId", replyToId);
  return axiosInstance.post(`/conversations/${id}/messages/image`, form);
};
export const sendConversationTyping = (id) =>
  axiosInstance.post(`/conversations/${id}/typing`);
export const reactConversationMessage = (id, messageId, emoji) =>
  axiosInstance.post(`/conversations/${id}/messages/${messageId}/reactions`, { emoji });
export const deleteConversationMessage = (id, messageId) =>
  axiosInstance.delete(`/conversations/${id}/messages/${messageId}`);
export const toggleConversationMute = (id) =>
  axiosInstance.post(`/conversations/${id}/mute`);
export const importFlirtHistory = (conversationId) =>
  axiosInstance.post(`/conversations/${conversationId}/import-flirt-history`);
