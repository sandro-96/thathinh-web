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
| `VITE_APP_GOOGLE_CLIENT_ID` | *(client id staging)* | Google OAuth; để trống nếu chưa dùng |
| `VITE_SITE_URL` | `https://<fe-staging>.vercel.app` | Dùng cho canonical/OG/sitemap |
| `VITE_OG_IMAGE_PATH` | `/og-image.png` | Đã có sẵn asset |

> Sau khi biết domain BE staging, cập nhật lại `VITE_API_BASE_URL` / `VITE_WS_URL` rồi **redeploy**.

## 3. Chặn Google index staging (quan trọng)

Staging **không nên** bị Google index (tránh trùng nội dung với production). Chọn 1 cách:

- **Khuyến nghị**: Vercel → Settings → **Deployment Protection** → bật *Vercel Authentication* (password/SSO) cho môi trường Preview/Staging.
- Hoặc override `public/robots.txt` cho bản staging thành:

```
User-agent: *
Disallow: /
```

  (Chỉ set `VITE_SITE_URL` = domain production khi lên production để sinh sitemap thật.)

## 4. Kiểm tra sau deploy

- [ ] Trang landing `/` load, gọi login/register OK (BE staging đã CORS cho domain FE).
- [ ] `https://<fe-staging>.vercel.app/og-image.png` trả 200.
- [ ] WebSocket kết nối (mở phòng topic, thấy presence).
- [ ] Nếu bật SEO: View Source thấy `og:image` absolute; `/sitemap.xml` 200.
