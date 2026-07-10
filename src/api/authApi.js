import axiosInstance from "./axiosInstance";

export const login = (data) => axiosInstance.post("/auth/login", data);
export const register = (data) => axiosInstance.post("/auth/register", data);
export const loginGoogle = (data) => axiosInstance.post("/auth/login/google", data);
export const logout = (refreshToken) => axiosInstance.post("/auth/logout", { refreshToken });
export const verifyEmail = (token) => axiosInstance.get("/auth/verify-email", { params: { token } });
export const resendVerification = (email) =>
  axiosInstance.post("/auth/resend-verification", { email });
