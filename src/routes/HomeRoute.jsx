import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/LandingPage";

export function HomeRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">Đang tải...</div>;
  if (user) return <Navigate to="/topics" replace />;
  return <LandingPage />;
}
