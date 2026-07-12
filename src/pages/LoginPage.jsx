import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { login, register } from "@/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthPath } from "@/lib/profile";
import { validateNickname } from "@/lib/nicknameValidation";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Eye, EyeOff, Loader2 } from "lucide-react";

function maxBirthDateFor18Plus() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    gender: "OTHER",
    birthDate: "",
  });
  const { establishSession, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const maxBirthDate = maxBirthDateFor18Plus();

  useEffect(() => {
    if (searchParams.get("banned") === "1") {
      toast.error("Tài khoản của bạn đã bị khoá. Liên hệ admin nếu cần hỗ trợ.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      const err = validateNickname(form.nickname);
      if (err) {
        setNicknameError(err);
        toast.error(err);
        return;
      }
    }
    setNicknameError("");
    setLoading(true);
    try {
      const res = isRegister
        ? await register({
            email: form.email,
            password: form.password,
            nickname: form.nickname,
            gender: form.gender,
            birthDate: form.birthDate,
          })
        : await login({ email: form.email, password: form.password });
      const { accessToken, refreshToken, profileComplete } = res.data.data;
      establishSession(accessToken, refreshToken, { profileComplete });
      toast.success(isRegister ? "Đăng ký thành công!" : "Đăng nhập thành công!");
      if (isRegister) {
        const profile = await refreshProfile();
        navigate(
          profile?.verified !== false
            ? getPostAuthPath(profile?.profileComplete ?? profileComplete)
            : "/verify-email?pending=1",
        );
      } else {
        navigate(getPostAuthPath(profileComplete));
      }
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "4103") {
        toast.error(getApiErrorMessage(err));
        navigate("/verify-email?pending=1");
        return;
      }
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-white dark:from-background dark:via-background dark:to-background animate-gradient-pan p-4">
      <Card className="w-full max-w-md animate-scale-in shadow-xl shadow-rose-500/10 border-rose-100 dark:border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-1 h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Heart className="h-6 w-6 text-white fill-white/90" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Thả Thính</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isRegister ? "Tạo tài khoản mới để bắt đầu" : "Đăng nhập để tiếp tục"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <Label>Nickname</Label>
                  <Input
                    value={form.nickname}
                    onChange={(e) => {
                      setForm({ ...form, nickname: e.target.value });
                      setNicknameError(validateNickname(e.target.value) || "");
                    }}
                    placeholder="Tên hiển thị trong chat"
                    minLength={3}
                    maxLength={20}
                    required
                  />
                  {nicknameError && (
                    <p className="text-xs text-destructive mt-1">{nicknameError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">3–20 ký tự: chữ, số, gạch dưới</p>
                </div>
                <div>
                  <Label>Giới tính</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ngày sinh (từ 18 tuổi)</Label>
                  <Input
                    type="date"
                    value={form.birthDate}
                    max={maxBirthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">hoặc</span>
            </div>
          </div>
          <GoogleLoginButton />
          <p className="text-center text-sm mt-4">
            {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <button type="button" className="text-rose-600 underline" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </button>
          </p>
          <p className="text-center text-sm mt-2">
            <Link to="/" className="text-muted-foreground">← Về trang chủ</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link to="/terms" className="underline hover:text-foreground">Điều khoản</Link>
            {" "}và{" "}
            <Link to="/privacy" className="underline hover:text-foreground">Quyền riêng tư</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
