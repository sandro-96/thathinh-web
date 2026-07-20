import axiosInstance from "./axiosInstance";

export const getNearby = (radiusKm) =>
  axiosInstance.get("/nearby", { params: radiusKm ? { radiusKm } : {} });
