# Google Ads — Thả Thính (thathinh.vn)

Hướng dẫn tạo chiến dịch Search Ads, landing page, và đo conversion đăng ký.

---

## 1. Chuẩn bị trước khi chạy Ads

| Hạng mục | Trạng thái |
|----------|------------|
| Site prod | https://thathinh.vn |
| Landing SEO | `/`, `/chat-lam-quen-online`, long-tail pages |
| Search Console | Verify domain + submit sitemap |
| GA4 + gtag | Bật `VITE_GA_MEASUREMENT_ID` (mục 3) |
| Conversion tracking | Bật `VITE_GOOGLE_ADS_CONVERSION_SEND_TO` (mục 4) |

---

## 2. Tạo tài khoản Google Ads

1. Vào https://ads.google.com  
2. Chọn **Tạo tài khoản** → quốc gia **Việt Nam**, múi giờ **(GMT+07:00)**  
3. Mục tiêu: **Tạo chuyển đổi trên website** (hoặc Leads)  
4. Thanh toán: thẻ tín dụng/ghi nợ (Google có thể yêu cầu xác minh)

> **Lưu ý:** Dịch vụ hẹn hò / chat người lạ có thể bị Google hạn chế quảng cáo. Nếu bị từ chối, đổi copy nhấn mạnh **"chat làm quen / cộng đồng / kết bạn online"**, tránh từ ngữ quá gợi cảm.

---

## 3. Google Analytics 4 (GA4)

### 3.1 Tạo property
1. https://analytics.google.com → **Admin** → **Create property**  
2. Tên: `Thả Thính`  
3. Time zone: Vietnam  
4. **Web** data stream → URL: `https://thathinh.vn`  
5. Copy **Measurement ID** dạng `G-XXXXXXXXXX`

### 3.2 Bật trên website
Thêm vào GitHub Secrets repo `thathinh-web` (hoặc `.env.production`):

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Workflow `deploy-frontend-prod.yml` đã truyền biến này vào bước build.  
Sau deploy, kiểm tra DevTools → Network có request `googletagmanager.com/gtag/js`.

### 3.3 Liên kết GA4 ↔ Google Ads
1. Google Ads → **Tools** → **Data manager** (hoặc Linked accounts)  
2. Link **Google Analytics 4** property vừa tạo  
3. Bật **Auto-tagging** trong Google Ads (Settings → Account settings)

---

## 4. Conversion — đăng ký mới

Code đã gửi event khi **đăng ký email thành công** (`LoginPage` → `trackSignUp`).

### 4.1 Tạo conversion action trong Google Ads
1. Google Ads → **Goals** → **Conversions** → **New conversion action**  
2. Category: **Sign-up**  
3. Source: **Website**  
4. Domain: `thathinh.vn`  
5. Chọn **Add a conversion action manually using code**  
6. Copy **Conversion ID** (`AW-123456789`) và **Conversion label** (`AbCdEfGhIjK`)

### 4.2 Cấu hình env
Format `send_to` = `AW-CONVERSION_ID/CONVERSION_LABEL`

GitHub Secret:
```
VITE_GOOGLE_ADS_CONVERSION_SEND_TO=AW-123456789/AbCdEfGhIjK
```

Hoặc local `.env.production`:
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_ADS_CONVERSION_SEND_TO=AW-123456789/AbCdEfGhIjK
```

Redeploy frontend → đăng ký thử 1 tài khoản → sau 24–48h xem **Conversions** trong Google Ads.

> Đăng nhập Google hiện chỉ gửi GA4 `login`, **không** fire Ads conversion (tránh đếm trùng user cũ).

---

## 5. Chiến dịch Search — setup từng bước

### 5.1 Campaign
| Mục | Giá trị khuyến nghị |
|-----|----------------------|
| Loại | **Search** |
| Mục tiêu | Leads / Website traffic |
| Conversion | Sign-up (mục 4) |
| Networks | Chỉ **Google Search** (tắt Display ban đầu) |
| Locations | **Vietnam** |
| Languages | Vietnamese |
| Budget | **50.000–150.000 VND/ngày** (thử 2 tuần) |
| Bidding | Maximize conversions (sau khi có ≥15 conversion) hoặc **Maximize clicks** giai đoạn đầu |

### 5.2 Ad group & từ khóa

**Ad group 1 — Chat làm quen**
```
"chat làm quen online"
"chat làm quen"
"chat với người lạ"
[làm quen online]
```

**Ad group 2 — Hẹn hò / ghép đôi**
```
"hẹn hò online"
"ghép đôi chat"
"thả thính online"
```

**Ad group 3 — Long-tail (CPC thấp hơn)**
```
"chat làm quen tphcm"
"phòng chat theo sở thích"
"hẹn hò online an toàn"
```

**Từ khóa loại (Negative keywords):**
```
miễn phí tải
apk
ios app store
tinder login
badoo login
omegle
video call
```

### 5.3 Responsive Search Ads (RSA)

**Final URL:** `https://thathinh.vn/chat-lam-quen-online`  
(hoặc `https://thathinh.vn` — test A/B sau 2 tuần)

**Headlines (tối đa 15, chọn 5–8):**
- Thả Thính — Chat Làm Quen
- Ghép Đôi 1:1 Miễn Phí
- Chat Theo Sở Thích
- Làm Quen Online Việt Nam
- Chỉ Cần Nickname
- Hẹn Hò Online Nhẹ Nhàng
- Thử Miễn Phí — thathinh.vn
- Phòng Chat Theo Tỉnh

**Descriptions:**
- Chat làm quen & thả thính ghép đôi 1:1. Miễn phí, từ 18 tuổi. Đăng ký 1 phút.
- Phòng chat theo sở thích + ghép ngẫu nhiên có kiểm soát. Báo cáo, chặn user vi phạm.
- Thả Thính — nền tảng chat làm quen cho người Việt tại thathinh.vn.

**Extensions (nên bật):**
- **Sitelinks:** Đăng ký, Chat TP.HCM, Chat theo sở thích, Hẹn hò an toàn  
- **Callouts:** Miễn phí, Từ 18 tuổi, Chat 1:1, Theo sở thích  
- **Structured snippet:** Dịch vụ: Chat topic, Thả thính, Kết bạn

---

## 6. UTM — theo dõi nguồn trong GA4

Thêm suffix vào Final URL (Google Ads tự thêm nếu bật auto-tagging `gclid`).  
Hoặc thủ công:

```
https://thathinh.vn/chat-lam-quen-online?utm_source=google&utm_medium=cpc&utm_campaign=chat-lam-quen
```

GA4 → Reports → Traffic acquisition → xem `google / cpc`.

---

## 7. KPI & tối ưu (tuần 2–4)

| Chỉ số | Mục tiêu ban đầu |
|--------|------------------|
| CTR | > 3% |
| CPC | < 3.000–8.000 VND (tùy từ khóa) |
| Cost / đăng ký | < 30.000–50.000 VND |
| % hoàn thiện profile | > 50% user từ Ads |

**Tối ưu:**
- Tắt từ khóa CPC cao, 0 conversion  
- Tăng bid ad group long-tail hiệu quả  
- Test landing `/` vs `/chat-lam-quen-online`  
- Pause ad copy CTR thấp

---

## 8. Checklist deploy tracking

- [ ] `VITE_GA_MEASUREMENT_ID` trong GitHub Secrets  
- [ ] `VITE_GOOGLE_ADS_CONVERSION_SEND_TO` trong GitHub Secrets  
- [ ] Deploy frontend prod xong  
- [ ] Đăng ký test → GA4 Realtime có event `sign_up`  
- [ ] Google Ads conversion status: **Recording** (sau 1–2 ngày)  
- [ ] Campaign live với budget giới hạn

---

## 9. Landing pages cho Ads

| URL | Dùng cho |
|-----|----------|
| https://thathinh.vn/chat-lam-quen-online | Ad group chat người lạ |
| https://thathinh.vn/chat-lam-quen-tphcm | Geo TP.HCM |
| https://thathinh.vn/chat-theo-so-thich | Sở thích / hobby |
| https://thathinh.vn/hen-ho-online-an-toan | Copy nhấn an toàn |

---

## 10. Chi phí tham khảo (VN, 2026)

| Từ khóa | CPC ước tính |
|---------|--------------|
| chat làm quen online | 2.000–6.000 VND |
| hẹn hò online | 5.000–15.000 VND |
| tinder | 10.000–25.000 VND (không khuyến nghị) |
| chat làm quen tphcm | 1.500–4.000 VND |

Ngân sách thử: **1–3 triệu VND/tháng** → đo cost per signup trước khi scale.

---

## Files liên quan trong code

| File | Vai trò |
|------|---------|
| `src/lib/analytics.js` | gtag init + conversion |
| `src/main.jsx` | Gọi `initAnalytics()` |
| `src/pages/LoginPage.jsx` | `trackSignUp` khi đăng ký email |
| `.env.example` | Biến môi trường |
| `.github/workflows/deploy-frontend-prod.yml` | Inject secrets lúc build |
