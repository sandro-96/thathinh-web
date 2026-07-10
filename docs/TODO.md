# Thả Thính — Backlog phát triển

> **Cách dùng:** Làm từ trên xuống trong mục **Must have**. Mỗi tuần chọn 1–3 task. Đánh dấu `[x]` khi xong.  
> **Repos:** `thathinh-backend` + `thathinh-web`  
> **Domain:** thathinh.vn

---

## Trạng thái hiện tại (MVP+)

| Hạng mục | Trạng thái |
|----------|------------|
| Auth (register/login, JWT, nickname) | ✅ Cơ bản |
| Profile (nickname, avatar, preferences) | ✅ Cơ bản |
| Topic chat (list, join, chat, WS) | ✅ + tìm kiếm/lọc, online, typing |
| Thả thính (match, chat 1:1, end, report) | ✅ + lịch sử session |
| Kết bạn / chat riêng / chặn | ✅ |
| Thông báo realtime toàn app | ✅ |
| Admin (topic, user, report, dashboard) | ✅ + metrics, unban |
| Deploy production | ⬜ Chưa |
| An toàn & chống spam | 🟡 Rate limit + validation + ban đồng bộ |
| Onboarding đầy đủ | ✅ |

---

## Phase 1 — Ổn định & dùng được với bạn bè test

### Must have — đã xong

- [x] Scaffold backend + frontend
- [x] Onboarding profile + redirect
- [x] Validation nickname, rate limit
- [x] Empty state, error UX, topic seed
- [x] Test flow end-to-end cơ bản

### Should have — đã xong

- [x] Landing page, badge topic, pagination, OAuth, email verify
- [x] Countdown flirt, WS FLIRT_ENDED, bug kỹ thuật

---

## Phase 2 — Beta nhỏ (mở cho ~50–100 user)

### Must have

- [ ] **Deploy staging:** Railway (API) + Vercel (web)
- [ ] **Deploy production:** `api.thathinh.vn` + `thathinh.vn`
- [ ] **CORS + env production** cấu hình đúng
- [ ] **MongoDB Atlas** production (backup, IP whitelist)
- [x] **S3 avatar** — upload S3 + CDN URL (`AWS_S3_PUBLIC_URL_BASE`), `AWS_S3_REQUIRED=true` trên prod
- [x] **Moderation:** admin xem report + ban + ghi chú
- [x] **Ban user:** đồng bộ JWT filter + API chat
- [x] **Privacy:** không lộ email trong chat/API public
- [x] **Terms + Privacy:** `/terms`, `/privacy`

### Should have

- [x] Tìm kiếm topic theo tên
- [x] Lọc topic theo type (PROVINCE, CLUB, …)
- [x] Typing indicator trong chat topic
- [x] Số người “đang online” trong topic
- [x] Lịch sử flirt session (`GET /api/flirt/history`)
- [ ] Admin: tạo/sửa topic có upload ảnh cover
- [ ] i18n: chuẩn hoá text tiếng Việt toàn app
- [x] SEO: OG meta + manifest PWA (add to home screen)
- [ ] OG image PNG thật (`public/og-image.png`) cho social share

### Metrics (admin dashboard)

- [x] DAU (ước tính từ user active hôm nay)
- [x] User đăng ký mới hôm nay
- [x] Số tin nhắn / ngày (topic + riêng)
- [x] Số flirt session / ngày + tỷ lệ match
- [x] Số report pending

### Social & UX (bổ sung sau MVP)

- [x] Kết bạn, chat riêng, unfriend
- [x] Block user + danh sách người đã chặn (Profile)
- [x] Red dot tin nhắn chưa đọc
- [x] Thông báo realtime toàn app (match, friend, DM)
- [x] Nav desktop
- [x] Lý do báo cáo (form chọn, không hardcode)
- [x] Admin: badge banned + unban user
- [x] E2E test: kết bạn, chat riêng, block, ban (`SocialFlowIntegrationTest`)

---

## Phase 3 — Sau launch

- [ ] Topic theo quận/huyện
- [ ] Cải thiện thuật toán match
- [ ] Redis cho match queue (multi-instance)
- [ ] Push notification (web/email khi match)
- [ ] Frontend automated tests (Vitest/Playwright)

---

## Won't have (giai đoạn đầu)

- [ ] ~~Swipe card kiểu Tinder~~
- [ ] ~~Gửi ảnh/file trong chat~~
- [ ] ~~Video / voice call~~
- [ ] ~~App native iOS/Android~~ (chỉ PWA trước)

---

## Env S3 production (tham khảo)

```env
AWS_S3_BUCKET=thathinh-assets
AWS_S3_REGION=ap-southeast-1
AWS_S3_PUBLIC_URL_BASE=https://cdn.thathinh.vn
AWS_S3_REQUIRED=true
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
```

---

## Changelog

| Ngày | Việc đã làm |
|------|-------------|
| 2026-07-08 | MVP scaffold, rate limit, empty state, E2E |
| 2026-07-08 | Phase 1 should-have: landing, OAuth, email verify |
| 2026-07-08 | Fix flirt match, report flow, friend/block/DM |
| 2026-07-08 | Unread red dot, global WS, ban sync, nav desktop, Terms/Privacy |
| 2026-07-08 | S3 avatar stable, topic search/filter, admin metrics, flirt history, typing/online, SocialFlow E2E |

---

## Chạy local

```bash
# Backend
cd thathinh-backend && mvn spring-boot:run

# Frontend
cd thathinh-web && npm run dev
```

**API:** `http://localhost:8080/api` · **Web:** `http://localhost:5173` · **WS:** `http://localhost:8080/ws`
