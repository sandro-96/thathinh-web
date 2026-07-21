import axiosInstance from "./axiosInstance";

// Thêm _t (cache-buster) + header no-cache để tránh trình duyệt trả kết quả cũ
// cho cùng URL GET — kết quả "quanh đây" phải luôn realtime.
export const getNearby = (radiusKm) =>
  axiosInstance.get("/nearby", {
    params: { ...(radiusKm ? { radiusKm } : {}), _t: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
