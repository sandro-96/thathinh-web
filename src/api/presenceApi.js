import axiosInstance from "./axiosInstance";

export const sendHeartbeat = () => axiosInstance.post("/presence/heartbeat");
