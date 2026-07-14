# SEO — Thả Thính (thathinh.vn)

Hướng dẫn index Google, từ khóa hiện tại, và **cách cạnh tranh từ khóa với các trang khác**.

---

## 1. Từ khóa đang nhắm

### Brand (dễ index nhất)
- `thathinh.vn`, `thathinh`, `Thả Thính`, `thả thính app`

### Generic (cạnh tranh cao, cần thời gian)
- `hẹn hò online`, `chat làm quen`, `làm quen người lạ`
- `ghép đôi ngẫu nhiên`, `trò chuyện ẩn danh`, `kết bạn online`
- `phòng chat theo sở thích`, `dating việt nam`, `chat 1:1`
- `ứng dụng hẹn hò`, `tìm bạn bè online`

### Từ khóa đối thủ / nhu cầu tương tự (trang `/chat-lam-quen-online`)
- `chat với người lạ`, `chat người lạ`, `chat ngẫu nhiên`
- `tinder`, `badoo`, `omegle` (+ `việt nam`)
- `nguoilaoi`, `người lạ ơi`
- `thay thế tinder`, `app làm quen`

Trang chuyên dụng: **https://thathinh.vn/chat-lam-quen-online** — nội dung so sánh use case (không claim liên kết thương hiệu).

### Long-tail (nên ưu tiên giai đoạn đầu)
- `app thả thính online`, `chat làm quen theo sở thích`
- `ghép đôi chat 1:1 miễn phí`, `hẹn hò ẩn danh việt nam`
- `chat làm quen tphcm`, `chat làm quen sài gòn`
- `phòng chat theo sở thích`, `hẹn hò online an toàn`

Trang long-tail đã có:
- https://thathinh.vn/chat-lam-quen-tphcm
- https://thathinh.vn/chat-theo-so-thich
- https://thathinh.vn/hen-ho-online-an-toan

Meta keywords nằm trong `index.html` và `src/lib/seoConfig.js`.  
**Google gần như không dùng thẻ keywords** — quan trọng hơn: **title, description, nội dung landing, FAQ, schema JSON-LD**.

---

## 2. Trang được Google index

| URL | Ghi chú |
|-----|---------|
| `/` | Landing + FAQ + schema FAQPage |
| `/chat-lam-quen-online` | Chat người lạ, Tinder/Badoo/nguoilaoi (comparison SEO) |
| `/chat-lam-quen-tphcm` | Chat làm quen TP.HCM / Sài Gòn |
| `/chat-theo-so-thich` | Phòng chat theo sở thích |
| `/hen-ho-online-an-toan` | Hẹn hò online an toàn |
| `/login` | Đăng ký |
| `/terms` | Điều khoản |
| `/privacy` | Chính sách |

**Không index** (đúng thiết kế): `/topics`, `/chats`, `/flirt`, `/profile` — nội dung sau đăng nhập.

Build prod với `VITE_SITE_URL=https://thathinh.vn` → sinh `sitemap.xml` + `Sitemap:` trong `robots.txt`.

Kiểm tra:
- https://thathinh.vn/robots.txt
- https://thathinh.vn/sitemap.xml

---

## 3. Google Search Console (làm ngay)

1. Vào https://search.google.com/search-console  
2. **Add property** → **Domain** → `thathinh.vn`  
3. Verify qua **DNS TXT** trên Cloudflare (Google cung cấp record)  
4. Sau khi verified → **Sitemaps** → submit: `https://thathinh.vn/sitemap.xml`  
5. **URL Inspection** → nhập `https://thathinh.vn/` → **Request indexing**  
6. Theo dõi **Performance** sau 1–4 tuần: impressions, clicks, queries

### Kiểm tra đã index chưa

Google search:
```
site:thathinh.vn
```

---

## 4. Muốn hiện khi search từ khóa của **trang khác** — làm thế nào?

Đây là câu hỏi **SEO cạnh tranh** (competitive keywords). Ví dụ: người search `omegle`, `Tinder`, `chat người lạ` — bạn muốn `thathinh.vn` cũng xuất hiện.

### Thực tế

Google xếp hạng theo:
1. **Search intent** — trang có trả lời đúng ý người tìm không?
2. **Authority** — domain uy tín, backlink, lịch sử
3. **Content depth** — nội dung unique, đủ dài, cập nhật
4. **Technical** — tốc độ, mobile, HTTPS, schema
5. **User signals** — CTR, thời gian on-site (gián tiếp)

**Không có cách "bật switch"** để chen vào từ khóa mà đối thủ đã chiếm vững. Cần chiến lược dài hạn.

### Chiến lược khả thi cho Thả Thính

#### A. Long-tail trước, head keyword sau
- Đừng chỉ nhắm `hẹn hò online` (cạnh Tinder, Facebook Dating…)
- Nhắm: `thả thính online`, `chat ghép đôi 1:1 việt nam`, `phòng chat theo sở thích`
- Landing + FAQ đã chứa các cụm này

#### B. Trang so sánh / alternative (rất hiệu quả)
Tạo trang public (ví dụ `/blog/omegle-thay-the` hoặc section landing):
- "Thả Thính — lựa chọn làm quen online tại Việt Nam"
- So sánh tính năng: topic chat + ghép 1:1 + nickname
- **Không** copy brand đối thủ; mô tả đúng khác biệt

#### C. Nội dung theo địa phương / sở thích
- "Chat làm quen TP.HCM", "phòng chat game", "hẹn hò cùng sở thích đọc sách"
- Mỗi chủ đề = 1 bài hoặc 1 landing nhỏ → dễ lên top long-tail

#### D. Backlink & mention
- Đăng giới thiệu app trên forum, Facebook group, TikTok bio
- Bài PR, Product Hunt, guest post
- Google tin **trang được nhắc tới** từ nơi khác

#### E. Google Ads (nhanh, trả phí)
Trong khi SEO organic lên chậm:
- Chạy quảng cáo tìm kiếm cho `chat làm quen`, `hẹn hò online`
- Landing `thathinh.vn` với CTA đăng ký
- Đo conversion, tối ưu từ khóa có CPC hợp lý

**Hướng dẫn chi tiết:** [`docs/GOOGLE-ADS-GUIDE.md`](./GOOGLE-ADS-GUIDE.md)

#### F. Social & branded search
- Video TikTok/Reels: "app thả thính là gì"
- Khi nhiều người search **Thả Thính** → Google liên kết brand với các query generic

### Những gì **không** nên làm
- Nhồi từ khóa (keyword stuffing) — Google phạt
- Mua backlink spam
- Copy nội dung đối thủ
- Cloaking / ẩn nội dung cho bot

---

## 5. Cấu trúc SEO trong code

| File | Vai trò |
|------|---------|
| `index.html` | Meta tĩnh cho crawler không chạy JS |
| `src/lib/seoConfig.js` | Title, description, FAQ, JSON-LD |
| `src/lib/seoHead.js` | Cập nhật head khi SPA navigate |
| `src/routes/RouteSeo.jsx` | Gắn SEO mỗi route |
| `src/pages/LandingPage.jsx` | Nội dung text + FAQ |
| `scripts/seoSitemapPlugin.js` | Sitemap + OG build time |
| `public/robots.txt` | Allow/disallow crawlers |

Schema trên `/`: `Organization`, `WebSite`, `WebApplication`, `FAQPage`.

---

## 6. Checklist sau mỗi deploy prod

- [ ] `VITE_SITE_URL=https://thathinh.vn` trong workflow build
- [ ] View source `/` có canonical + og:image absolute
- [ ] `/sitemap.xml` trả 200
- [ ] Search Console: không lỗi coverage
- [ ] Rich Results Test: https://search.google.com/test/rich-results (FAQ schema)
- [ ] PageSpeed Insights mobile ≥ 70 (càng cao càng tốt)

---

## 7. Roadmap SEO đề xuất (3–6 tháng)

| Tháng | Việc |
|-------|------|
| 1 | Search Console + index + chia sẻ link mạng xã hội |
| 2 | 2–3 bài long-tail ("chat làm quen online an toàn", …) |
| 3 | Trang so sánh / use-case (không cần đặt tên đối thủ) |
| 4–6 | Backlink, PR, Ads thử nghiệm, đo query trong Search Console |

---

## 8. Theo dõi hiệu quả

Search Console → **Performance** → xem:
- **Queries** — từ khóa nào đã hiện impression
- **Pages** — `/` có click chưa
- **Average position** — vị trí trung bình (càng thấp càng tốt)

Mục tiêu tháng đầu: `site:thathinh.vn` ≥ 4 trang, brand query `thathinh` có kết quả.  
Mục tiêu tháng 2–3: long-tail đầu tiên vào top 20.
