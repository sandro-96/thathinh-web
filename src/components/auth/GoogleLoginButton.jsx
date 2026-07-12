import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { loginGoogle } from "@/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthPath } from "@/lib/profile";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useNavigate } from "react-router-dom";

const clientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;

function GoogleLoginButtonInner() {
  const { loadUser } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    try {
      const res = await loginGoogle({ idToken: credentialResponse.credential });
      const { accessToken, refreshToken, profileComplete } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      await loadUser();
      toast.success("Đăng nhập Google thành công!");
      navigate(getPostAuthPath(profileComplete));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() =>
          toast.error(
            "Google từ chối origin. Thêm URL trang này vào Authorized JavaScript origins trong Google Cloud Console, rồi redeploy FE.",
            { duration: 8000 },
          )
        }
        text="continue_with"
        shape="rectangular"
        theme="outline"
        size="large"
        locale="vi"
      />
    </div>
  );
}

export function GoogleLoginButton() {
  if (!clientId) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLoginButtonInner />
    </GoogleOAuthProvider>
  );
}
