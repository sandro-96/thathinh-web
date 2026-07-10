import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isProfileComplete } from "@/lib/profile";

export function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.verified === false && !location.pathname.startsWith("/verify-email")) {
    return <Navigate to="/verify-email?pending=1" replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) {
    return (
      <Navigate
        to={isProfileComplete(user) ? "/topics" : "/profile?onboarding=1"}
        replace
      />
    );
  }
  return children;
}

export function ProfileCompleteRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isProfileComplete(user)) {
    return <Navigate to="/profile?onboarding=1" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user || user.role !== "ADMIN") return <Navigate to="/topics" replace />;
  return children;
}
