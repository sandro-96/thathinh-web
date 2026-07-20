import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { WebSocketProvider } from "@/contexts/WebSocketProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useViewportHeightVar } from "@/hooks/useViewportHeightVar";
import { AppLayout } from "@/layouts/AppLayout";
import {
  ProtectedRoute,
  GuestRoute,
  AdminRoute,
  ProfileCompleteRoute,
} from "@/routes/guards";
import { HomeRoute } from "@/routes/HomeRoute";
import { RouteSeo } from "@/routes/RouteSeo";
import { SEO_LONG_TAIL_PATHS } from "@/lib/seoLongTailPages";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const TopicsPage = lazy(() => import("@/pages/TopicsPage"));
const TopicChatPage = lazy(() => import("@/pages/TopicChatPage"));
const FlirtPage = lazy(() => import("@/pages/FlirtPage"));
const FlirtChatPage = lazy(() => import("@/pages/FlirtChatPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const ChatListPage = lazy(() => import("@/pages/ChatListPage"));
const NearbyPage = lazy(() => import("@/pages/NearbyPage"));
const PrivateChatPage = lazy(() => import("@/pages/PrivateChatPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const ChatLamQuenPage = lazy(() => import("@/pages/ChatLamQuenPage"));
const SeoLongTailPage = lazy(() => import("@/pages/SeoLongTailPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageFallback() {
  return (
    <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
      Đang tải...
    </div>
  );
}

export default function App() {
  useViewportHeightVar();
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <RouteSeo />
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/chat-lam-quen-online" element={<ChatLamQuenPage />} />
                  {SEO_LONG_TAIL_PATHS.map((path) => (
                    <Route key={path} path={path} element={<SeoLongTailPage />} />
                  ))}
                  <Route path="/topics/:slug" element={<ProtectedRoute><TopicChatPage /></ProtectedRoute>} />
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/topics" element={<TopicsPage />} />
                    <Route path="/nearby" element={<NearbyPage />} />
                    <Route path="/chats" element={<ChatListPage />} />
                    <Route path="/chats/:conversationId" element={<PrivateChatPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route
                      path="/flirt"
                      element={
                        <ProfileCompleteRoute>
                          <FlirtPage />
                        </ProfileCompleteRoute>
                      }
                    />
                    <Route
                      path="/flirt/chat/:sessionId"
                      element={
                        <ProfileCompleteRoute>
                          <FlirtChatPage />
                        </ProfileCompleteRoute>
                      }
                    />
                  </Route>
                  <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                  <Route path="/" element={<HomeRoute />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster richColors position="top-center" />
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
