import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { getCurrentUser } from "@/api/userApi";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const res = await getCurrentUser();
      const profile = res.data.data;
      setUser({
        id: decoded.sub,
        email: profile.email,
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl,
        gender: profile.gender,
        birthDate: profile.birthDate,
        preferences: profile.preferences,
        profileComplete: profile.profileComplete,
        verified: profile.verified !== false,
        role: decoded.role?.replace("ROLE_", "") || "USER",
      });
    } catch {
      logout();
    } finally {
      setReady(true);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loadUser, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
