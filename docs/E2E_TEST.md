# E2E Test — Thả Thính

## Tự động (API integration)

Chạy full flow qua MockMvc (cần MongoDB tại `localhost:27017`):

```bash
cd thathinh-backend
.\mvnw.cmd test -Dtest=EndToEndFlowIntegrationTest
```

Database test riêng: `thathinh_e2e_test` (không ảnh hưởng DB dev).

**Flow được test:**
1. Đăng ký 2 user (nam + nữ)
2. Join topic → gửi tin → user kia đọc được
3. Thả thính → match → chat 1:1
4. Báo cáo phiên flirt
5. Admin login → xem báo cáo → đánh dấu REVIEWED

## Thủ công (2 trình duyệt / 2 tài khoản)

### Chuẩn bị
- Backend: `.\mvnw.cmd spring-boot:run` (port 8080)
- Frontend: `npm run dev` (port 5173)
- 2 tài khoản test hoặc 2 cửa sổ ẩn danh

### Checklist

| # | Bước | Kỳ vọng |
|---|------|---------|
| 1 | Đăng ký user mới (nickname, gender, ngày sinh ≥18) | Redirect profile hoặc topics, toast thành công |
| 2 | Vào **Phòng trò chuyện** → chọn topic → **Tham gia** | Badge "Đã tham gia", vào được chat |
| 3 | Gửi tin nhắn trong topic | Tin hiện trong phòng |
| 4 | User 2 join cùng topic | User 2 thấy tin của user 1 (refresh hoặc WS realtime) |
| 5 | Vào **Thả thính** → bấm nút tim (cả 2 user) | Match thành công, chuyển sang chat 1:1 |
| 6 | Chat flirt, gửi vài tin | Tin hiển thị 2 chiều |
| 7 | Báo cáo đối tác (icon cờ) | Toast "Đã gửi báo cáo", quay về màn flirt |
| 8 | Login admin `admin@thathinh.vn` / `Admin@123` → `/admin` | Dashboard + tab Báo cáo có report PENDING |
| 9 | Admin bấm "Đã xem" hoặc "Ban user" | Report chuyển trạng thái |

### Admin mặc định
- Email: `admin@thathinh.vn`
- Mật khẩu: `Admin@123`
