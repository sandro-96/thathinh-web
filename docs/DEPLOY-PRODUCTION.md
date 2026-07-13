# Deploy Production — Thả Thính (AWS, dùng chung EC2 với salsales)

> **Trạng thái: ⏸ CHỜ MUA DOMAIN** (cập nhật 2026-07-13)  
> Chưa có domain → **dừng tại đây**. Sau khi mua `thathinh.vn` (hoặc domain khác), quay lại doc này và làm từ **Bước 0.1** trở đi.  
> Code + workflow CI/CD đã sẵn trên `main` (FE `1336feb`, BE `d2d910d`).

---

## Tổng quan hạ tầng

Production chạy **cùng EC2** với [salsales (sotuci.vn)](../../salsales-management-web/docs/deploy/PROD-RUNBOOK.md):

| Thành phần | salsales | Thả Thính |
|------------|----------|-----------|
| EC2 | `i-08167ad5505b5b164` | **cùng máy** |
| EIP | `13.215.133.238` | **cùng EIP** |
| App port | `8080` (`salsales.service`) | `8081` (`thathinh.service`) |
| API domain | `api.sotuci.vn` | `api.<domain-của-bạn>` |
| Web | S3 + CloudFront | S3 + CloudFront |
| Region | `ap-southeast-1` | `ap-southeast-1` |

```
Cloudflare DNS (sau khi có domain)
  <domain> / www     → CloudFront (thathinh-web-prod)
  api.<domain>       → A → 13.215.133.238 (Caddy → :8081)
```

**Thay `<domain>`** bằng domain thật (ví dụ `thathinh.vn`) trong toàn bộ hướng dẫn dưới đây.

---

## Đã xong (không cần domain)

- [x] Code merge `develop` → `main` (cả `thathinh-web`, `thathinh-backend`)
- [x] GitHub Actions workflow prod (FE + BE)
- [x] Script EC2: `thathinh-backend/ops/ec2/*`
- [x] Template IAM/SSM: `thathinh-backend/ops/aws/*`
- [x] `.env.production` mẫu (URL sẽ cập nhật khi có domain)

## Cần domain mới làm được

- [ ] ACM SSL + CloudFront CNAME
- [ ] DNS Cloudflare (`@`, `www`, `api`)
- [ ] Google OAuth origins
- [ ] `FRONTEND_URL`, `CORS_ORIGIN_*`, `VITE_SITE_URL` prod
- [ ] Caddy block `api.<domain>`
- [ ] Go-live test

## Có thể làm trước khi mua domain (tuỳ chọn)

- [ ] Bước 1 — S3 buckets (`create-prod-buckets.sh`)
- [ ] Bước 3 — IAM mở rộng role GitHub + EC2
- [ ] Bước 4 — MongoDB Atlas prod + whitelist EIP `13.215.133.238/32`
- [ ] Bước 6.2 — Cài `/opt/thathinh` trên EC2 (chưa cần Caddy/DNS)

---

# Hướng dẫn từng bước (làm sau khi có domain)

## Bước 0 — Chuẩn bị

### 0.1 Domain
1. Mua domain (khuyến nghị: `thathinh.vn`)
2. Trỏ nameserver về **Cloudflare**
3. Ghi lại domain chính xác: `________________`

### 0.2 MongoDB Atlas prod
1. [MongoDB Atlas](https://cloud.mongodb.com) → cluster Singapore hoặc DB `thathinhdb`
2. **Database Access** → user + password
3. **Network Access** → **chỉ** `13.215.133.238/32` (không `0.0.0.0/0`)
4. Copy URI:
   ```
   mongodb+srv://USER:PASS@cluster....mongodb.net/thathinhdb?retryWrites=true&w=majority
   ```

### 0.3 Google OAuth
[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Web client → **Authorized JavaScript origins**:
- `https://<domain>`
- `https://www.<domain>`

### 0.4 AWS CLI
```powershell
aws sts get-caller-identity
# Account: 336457598093
```

---

## Bước 1 — S3 buckets (5 phút)

```bash
cd thathinh-backend
bash ops/aws/create-prod-buckets.sh
```

| Bucket | Mục đích |
|--------|----------|
| `thathinh-web-prod` | Frontend `dist/` |
| `thathinh-deploy-prod` | JAR CI/CD |
| `thathinh-assets` | Upload ảnh (đã có) |
| `thathinh-backup-prod` | Backup Mongo (tuỳ chọn) |

```bash
aws s3 ls | grep thathinh
```

---

## Bước 2 — CloudFront + SSL (20–30 phút)

### 2.1 ACM (region **us-east-1** bắt buộc)
- Domain: `<domain>`
- SAN: `www.<domain>`
- Validation: DNS (thêm CNAME Cloudflare theo ACM)
- Đợi **Issued**

### 2.2 CloudFront distribution
| Mục | Giá trị |
|-----|---------|
| Origin | `thathinh-web-prod` + OAC |
| CNAME | `<domain>`, `www.<domain>` |
| SSL | Cert ACM us-east-1 |
| Default root | `index.html` |
| Custom error | 403/404 → `/index.html` (200) |

Lưu **Distribution ID** (`E...`) → GitHub secret `CF_DISTRIBUTION_ID` (repo `thathinh-web`).

Áp bucket policy OAC cho `thathinh-web-prod`.

---

## Bước 3 — IAM (10 phút)

### 3.1 `github-actions-deploy`
Trust policy — thêm:
```json
"repo:sandro-96/thathinh-web:ref:refs/heads/main",
"repo:sandro-96/thathinh-backend:ref:refs/heads/main"
```

Inline policy: `thathinh-backend/ops/aws/iam-github-actions-thathinh-addon.json`  
(đổi `THATHINH_CF_DIST_ID` → ID CloudFront thật)

### 3.2 `ec2-salsales-prod`
Attach: `thathinh-backend/ops/aws/iam-ec2-thathinh-addon.json`

---

## Bước 4 — SSM Parameter Store (15 phút)

Prefix: `/thathinh/prod/` — mẫu đầy đủ: `thathinh-backend/ops/aws/ssm-parameters.example.env`

```powershell
$REGION = "ap-southeast-1"
$DOMAIN = "thathinh.vn"   # đổi khi có domain thật

aws ssm put-parameter --region $REGION --name /thathinh/prod/MONGODB_URI `
  --value "mongodb+srv://..." --type SecureString --overwrite

aws ssm put-parameter --region $REGION --name /thathinh/prod/JWT_SECRET `
  --value "RANDOM-32-CHARS-MIN" --type SecureString --overwrite

aws ssm put-parameter --region $REGION --name /thathinh/prod/FRONTEND_URL `
  --value "https://$DOMAIN" --type String --overwrite

aws ssm put-parameter --region $REGION --name /thathinh/prod/CORS_ORIGIN_0 `
  --value "https://$DOMAIN" --type String --overwrite

aws ssm put-parameter --region $REGION --name /thathinh/prod/CORS_ORIGIN_1 `
  --value "https://www.$DOMAIN" --type String --overwrite

# ... các key còn lại — xem ssm-parameters.example.env
```

> `JWT_SECRET` prod **khác** staging Render.

Kiểm tra:
```bash
aws ssm get-parameters-by-path --region ap-southeast-1 --path /thathinh/prod --recursive
```

---

## Bước 5 — GitHub Secrets (5 phút)

### `sandro-96/thathinh-web`
| Secret | Giá trị |
|--------|---------|
| `AWS_ROLE_ARN` | `arn:aws:iam::336457598093:role/github-actions-deploy` |
| `CF_DISTRIBUTION_ID` | CloudFront Bước 2 |
| `GOOGLE_CLIENT_ID_PROD` | OAuth Client ID |

### `sandro-96/thathinh-backend`
| Secret | Giá trị |
|--------|---------|
| `AWS_ROLE_ARN` | Cùng ARN |
| `EC2_INSTANCE_ID` | `i-08167ad5505b5b164` |

Cập nhật `.env.production` / workflow nếu domain khác `thathinh.vn`:
- `VITE_SITE_URL=https://<domain>`
- `VITE_API_BASE_URL=https://api.<domain>/api`
- `VITE_WS_URL=https://api.<domain>/ws`

---

## Bước 6 — EC2 setup (20 phút)

Vào EC2 `i-08167ad5505b5b164` → **Session Manager**.

```bash
sudo mkdir -p /opt/thathinh
sudo chown ec2-user:ec2-user /opt/thathinh
# Copy ops/ec2/load-env.sh → /opt/thathinh/
# Copy ops/ec2/thathinh.service → /etc/systemd/system/
sudo chmod +x /opt/thathinh/load-env.sh
sudo bash /opt/thathinh/load-env.sh
sudo systemctl daemon-reload
sudo systemctl enable thathinh
```

### Caddy — thêm `api.<domain>`
Thêm block từ `ops/ec2/caddy-snippet.caddy` (đổi `api.thathinh.vn` → `api.<domain>`):

```bash
sudo systemctl reload caddy
```

### DNS Cloudflare
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `api` | `13.215.133.238` | DNS only (grey) |

---

## Bước 7 — Deploy backend (10 phút)

GitHub → `thathinh-backend` → Actions → **Deploy backend (prod)** → Run workflow (`main`).

```bash
curl -s http://127.0.0.1:8081/actuator/health      # trên EC2
curl -s https://api.<domain>/actuator/health        # public
curl -s https://api.sotuci.vn/actuator/health      # salsales vẫn OK
```

---

## Bước 8 — DNS web + deploy frontend (15 phút)

### Cloudflare
| Type | Name | Target |
|------|------|--------|
| CNAME | `@` | `xxxx.cloudfront.net` |
| CNAME | `www` | Cùng CloudFront |

GitHub → `thathinh-web` → Actions → **Deploy frontend (prod)** → Run workflow.

Kiểm tra: `https://<domain>` load, API gọi `https://api.<domain>/api`.

---

## Bước 9 — Go-live checklist

- [ ] `https://<domain>` OK
- [ ] `https://api.<domain>/actuator/health` → UP
- [ ] `https://api.sotuci.vn/actuator/health` → UP (salsales không ảnh hưởng)
- [ ] Login Google
- [ ] Lưu profile / tiểu sử
- [ ] Chat + WebSocket
- [ ] Upload ảnh → `thathinh-assets`
- [ ] UptimeRobot monitor API health

---

## Xử lý lỗi thường gặp

| Triệu chứng | Cách xử lý |
|-------------|------------|
| GitHub Actions fail S3 | IAM Bước 3; bucket đã tạo |
| SSM deploy fail | EC2 Online; role EC2 có S3 + SSM |
| `thathinh` restart loop | `journalctl -u thathinh -n 50` — Mongo/JWT |
| CORS | SSM `CORS_ORIGIN_0/1`; reload env + restart |
| Cert API lỗi | DNS `api` → EIP; `journalctl -u caddy` |
| Mongo timeout | Atlas whitelist `13.215.133.238/32` |

---

## Vận hành

```bash
sudo systemctl status salsales thathinh --no-pager
sudo journalctl -u thathinh -n 120 --no-pager
sudo bash /opt/thathinh/load-env.sh && sudo systemctl restart thathinh
```

---

## Khi mua domain xong — làm gì?

1. Cập nhật biến `$DOMAIN` trong doc / SSM / `.env.production`
2. Làm **Bước 0.1** → **Bước 9** theo thứ tự
3. Nhắn lại trong chat: *"đã mua domain X, tiếp tục deploy prod"* để được hỗ trợ từng bước

**Thứ tự tóm tắt:**
```
0. Domain + Atlas + Google OAuth
1. S3 → 2. CloudFront → 3. IAM → 4. SSM → 5. GitHub secrets
6. EC2 + Caddy + DNS api → 7. Deploy BE → 8. DNS web + Deploy FE → 9. Test
```
