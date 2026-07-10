import axiosInstance from "./axiosInstance";

export const listFriendRequests = () => axiosInstance.get("/friends/requests");
export const listBlockedUsers = () => axiosInstance.get("/friends/blocked");
export const acceptFriendRequest = (id) => axiosInstance.post(`/friends/requests/${id}/accept`);
export const declineFriendRequest = (id) => axiosInstance.post(`/friends/requests/${id}/decline`);
export const unfriend = (partnerId) => axiosInstance.delete(`/friends/${partnerId}`);
export const blockUser = (partnerId) => axiosInstance.post(`/friends/${partnerId}/block`);
export const unblockUser = (partnerId) => axiosInstance.delete(`/friends/${partnerId}/block`);
export const reportUser = (partnerId, reason) => axiosInstance.post(`/friends/${partnerId}/report`, { reason });
