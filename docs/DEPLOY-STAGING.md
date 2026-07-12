# Deploy Staging — Thả Thính Web (Vercel)

Frontend là SPA (React + Vite). Staging deploy từ nhánh **`develop`**.

## 1. Import repo vào Vercel

1. Vercel → **Add New… → Project** → import `sandro-96/thathinh-web`.
2. Framework Preset: **Vite** (tự nhận). Build Command: `npm run build`, Output: `dist`.
3. **Production Branch**: đặt là `develop` cho project staging (hoặc tạo 1 project riêng "thathinh-web-staging" trỏ nhánh `develop`).
4. `vercel.json` đã có sẵn rewrite SPA (`/(.*) → /`) nên không cần cấu hình thêm.

## 2. Environment Variables (Vercel → Settings → Environment Variables)

| Key | Giá trị staging | Ghi chú |
|-----|-----------------|---------|
| `VITE_API_BASE_URL` | `https://<be-staging>.onrender.com/api` | URL BE staging (Render), có hậu tố `/api` |
| `VITE_WS_URL` | `https://<be-staging>.onrender.com/ws` | WebSocket endpoint |
| `VITE_APP_GOOGLE_CLIENT_ID` | `123456789-xxx.apps.googleusercontent.com` | **Cùng Client ID** với `GOOGLE_CLIENT_ID` trên Render (xem mục 3) |
| `VITE_SITE_URL` | `https://<fe-staging>.vercel.app` | Dùng cho canonical/OG/sitemap |
| `VITE_OG_IMAGE_PATH` | `/og-image.png` | Đã có sẵn asset |

> Sau khi biết domain BE staging, cập nhật lại `VITE_API_BASE_URL` / `VITE_WS_URL` rồi **redeploy**.

## 3. Google OAuth — sửa lỗi `origin mismatch`

`@react-oauth/google` kiểm tra **origin trang web** (domain FE), không phải URL backend.

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Mở **OAuth 2.0 Client ID** loại **Web application** (dùng cho đăng nhập web).
3. **Authorized JavaScript origins** — thêm **chính xác** URL FE (không có `/` cuối):
   - `http://localhost:5173` (dev)
   - `https://<tên-project>.vercel.app` (staging — copy từ Vercel → Domains)
   - `https://thathinh.vn` (production, khi có)
4. **Không cần** Authorized redirect URIs cho flow nút Google (`GoogleLogin` dùng popup/credential, không redirect).
5. Vercel: `VITE_APP_GOOGLE_CLIENT_ID` = Client ID ở bước 2.
6. Render: `GOOGLE_CLIENT_ID` = **cùng** Client ID đó.
7. **Redeploy FE** sau khi đổi env Vercel (Vite bake biến lúc build).

> Mỗi domain preview Vercel (`xxx-git-branch-user.vercel.app`) cần thêm origin riêng nếu bạn test trên preview URL, không chỉ domain production của project.

## 4. Chặn Google index staging (quan trọng)

Staging **không nên** bị Google index (tránh trùng nội dung với production). Chọn 1 cách:

- **Khuyến nghị**: Vercel → Settings → **Deployment Protection** → bật *Vercel Authentication* (password/SSO) cho môi trường Preview/Staging.
- Hoặc override `public/robots.txt` cho bản staging thành:

```
User-agent: *
Disallow: /
```

  (Chỉ set `VITE_SITE_URL` = domain production khi lên production để sinh sitemap thật.)

## 5. Kiểm tra sau deploy

- [ ] Trang landing `/` load, gọi login/register OK (BE staging đã CORS cho domain FE).
- [ ] `https://<fe-staging>.vercel.app/og-image.png` trả 200.
- [ ] WebSocket kết nối (mở phòng topic, thấy presence).
- [ ] Nếu bật SEO: View Source thấy `og:image` absolute; `/sitemap.xml` 200.
