import axiosInstance from "./axiosInstance";

export const listTopics = (params) => axiosInstance.get("/topics", { params });
export const myTopics = () => axiosInstance.get("/topics/my");
export const getTopic = (id) => axiosInstance.get(`/topics/${id}`);
export const getTopicBySlug = (slug) => axiosInstance.get(`/topics/slug/${slug}`);
export const joinTopic = (id) => axiosInstance.post(`/topics/${id}/join`);
export const leaveTopic = (id) => axiosInstance.post(`/topics/${id}/leave`);
export const getTopicMessages = (id, cursor) =>
  axiosInstance.get(`/topics/${id}/messages`, { params: { cursor, limit: 50 } });
export const sendTopicMessage = (id, content) =>
  axiosInstance.post(`/topics/${id}/messages`, { content });
export const topicPresence = (id, action) =>
  axiosInstance.post(`/topics/${id}/presence`, { action });
export const topicTyping = (id) => axiosInstance.post(`/topics/${id}/typing`);
