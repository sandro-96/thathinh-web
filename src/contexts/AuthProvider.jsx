import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { getCurrentUser } from "@/api/userApi";

function userFromProfile(decoded, profile) {
  return {
    id: decoded.sub,
    email: profile.email,
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl,
    gender: profile.gender,
    birthDate: profile.birthDate,
    preferences: profile.preferences,
    profileComplete: profile.profileComplete,
    verified: profile.verified !== false,
    bio: profile.bio,
    interests: profile.interests,
    photos: profile.photos,
    role: decoded.role?.replace("ROLE_", "") || "USER",
  };
}

function shellUserFromToken(decoded, meta = {}) {
  return {
    id: decoded.sub,
    email: decoded.email ?? meta.email,
    nickname: meta.nickname,
    avatarUrl: meta.avatarUrl,
    gender: meta.gender,
    birthDate: meta.birthDate,
    preferences: meta.preferences,
    profileComplete: meta.profileComplete ?? false,
    verified: meta.verified ?? true,
    bio: meta.bio,
    interests: meta.interests,
    photos: meta.photos,
    role: decoded.role?.replace("ROLE_", "") || "USER",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setReady(true);
    navigate("/login");
  }, [navigate]);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      const res = await getCurrentUser();
      const next = userFromProfile(decoded, res.data.data);
      setUser(next);
      return next;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) logout();
      return null;
    }
  }, [logout]);

  /** Lưu token + user tối thiểu ngay để redirect, fetch profile đầy đủ ở background. */
  const establishSession = useCallback(
    (accessToken, refreshToken, meta = {}) => {
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      const decoded = jwtDecode(accessToken);
      setUser(shellUserFromToken(decoded, meta));
      setReady(true);
      void refreshProfile();
    },
    [refreshProfile],
  );

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setReady(true);
      return null;
    }
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setReady(true);
      return null;
    }
    setUser((prev) => prev ?? shellUserFromToken(decoded));
    setReady(true);
    return refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loadUser, establishSession, refreshProfile, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
