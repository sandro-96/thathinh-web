import axiosInstance from "./axiosInstance";

export const getDashboard = () => axiosInstance.get("/admin/dashboard");
export const listUsers = () => axiosInstance.get("/admin/users");
export const banUser = (id, banned) =>
  axiosInstance.post(`/admin/users/${id}/ban`, null, { params: { banned } });
export const listAdminTopics = () => axiosInstance.get("/admin/topics");
export const createTopic = (data) => axiosInstance.post("/admin/topics", data);
export const updateTopic = (id, data) => axiosInstance.put(`/admin/topics/${id}`, data);
export const deleteTopic = (id) => axiosInstance.delete(`/admin/topics/${id}`);
export const listReports = (status) =>
  axiosInstance.get("/admin/reports", { params: { status } });
export const reviewReport = (id, data) =>
  axiosInstance.post(`/admin/reports/${id}/review`, data);
