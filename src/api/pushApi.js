import axiosInstance from "./axiosInstance";

export const getPushPublicKey = () => axiosInstance.get("/push/public-key");
export const subscribePush = (subscription) => axiosInstance.post("/push/subscribe", subscription);
export const unsubscribePush = (endpoint) => axiosInstance.post("/push/unsubscribe", { endpoint });
