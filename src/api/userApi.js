import axiosInstance from "./axiosInstance";

export const getCurrentUser = () => axiosInstance.get("/user/me");
export const getAccountStatus = () => axiosInstance.get("/user/me/account-status");
export const updateProfile = (data) => axiosInstance.put("/user/me", data);
export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axiosInstance.post("/user/me/avatar", form);
};
export const addProfilePhoto = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axiosInstance.post("/user/me/photos", form);
};
export const removeProfilePhoto = (url) =>
  axiosInstance.delete("/user/me/photos", { params: { url } });
