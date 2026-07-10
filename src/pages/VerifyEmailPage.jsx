import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Mail, MailCheck } from "lucide-react";
import { verifyEmail, resendVerification } from "@/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const pending = searchParams.get("pending");
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(token ? "verifying" : pending ? "pending" : "idle");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(async () => {
        setStatus("success");
        toast.success("Email đã được xác minh!");
        await loadUser();
      })
      .catch((err) => {
        setStatus("error");
        toast.error(getApiErrorMessage(err, "Liên kết không hợp lệ"));
      });
  }, [token, loadUser]);

  const handleResend = async () => {
    const email = user?.email;
    if (!email) {
      toast.error("Vui lòng đăng nhập lại");
      navigate("/login");
      return;
    }
    setSending(true);
    try {
      await resendVerification(email);
      toast.success("Đã gửi lại email xác minh");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-white dark:from-background dark:via-background dark:to-background animate-gradient-pan p-4">
      <Card className="w-full max-w-md animate-scale-in shadow-xl shadow-rose-500/10 border-rose-100 dark:border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-rose-600">Xác minh email</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "verifying" && (
            <p className="text-center text-muted-foreground py-8">Đang xác minh...</p>
          )}
          {status === "success" && (
            <EmptyState
              icon={MailCheck}
              title="Xác minh thành công!"
              description="Bạn có thể dùng đầy đủ tính năng của Thả Thính"
              action={
                <Button asChild className="bg-rose-500 hover:bg-rose-600">
                  <Link to="/topics">Vào app</Link>
                </Button>
              }
            />
          )}
          {status === "error" && (
            <EmptyState
              icon={Mail}
              title="Liên kết không hợp lệ"
              description="Liên kết có thể đã hết hạn. Gửi lại email xác minh."
              action={
                <Button onClick={handleResend} disabled={sending} className="bg-rose-500 hover:bg-rose-600">
                  {sending ? "Đang gửi..." : "Gửi lại email"}
                </Button>
              }
            />
          )}
          {(status === "pending" || status === "idle") && !token && (
            <EmptyState
              icon={Mail}
              title="Kiểm tra hộp thư"
              description={
                user?.email
                  ? `Chúng tôi đã gửi link xác minh tới ${user.email}. Nhấn link trong email để kích hoạt tài khoản.`
                  : "Đăng nhập và kiểm tra email để xác minh tài khoản."
              }
              action={
                <div className="flex flex-col gap-2 w-full">
                  <Button onClick={handleResend} disabled={sending} variant="outline">
                    {sending ? "Đang gửi..." : "Gửi lại email"}
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/login">Về đăng nhập</Link>
                  </Button>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
