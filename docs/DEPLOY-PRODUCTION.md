# Deploy Production — Thả Thính (AWS, dùng chung EC2 với salsales)

Production chạy **cùng EC2** với [salsales (sotuci.vn)](../../salsales-management-web/docs/deploy/PROD-RUNBOOK.md):

| Thành phần | salsales | Thả Thính |
|------------|----------|-----------|
| EC2 | `i-08167ad5505b5b164` | **cùng máy** |
| EIP | `13.215.133.238` | **cùng EIP** |
| App port | `8080` (`salsales.service`) | `8081` (`thathinh.service`) |
| API domain | `api.sotuci.vn` | `api.thathinh.vn` |
| Web | S3 + CloudFront | S3 + CloudFront |
| Region | `ap-southeast-1` | `ap-southeast-1` |

```
Cloudflare DNS
  thathinh.vn / www     → CloudFront (thathinh-web-prod)
  api.thathinh.vn       → A → 13.215.133.238 (Caddy → :8081)
```

---

## 0. Checklist trước khi bắt đầu

- [ ] Domain `thathinh.vn` quản lý trên **Cloudflare** (hoặc DNS có thể trỏ A/CNAME)
- [ ] MongoDB Atlas **prod** (cluster/DB riêng `thathinhdb`), whitelist **chỉ** EIP `13.215.133.238/32`
- [ ] Code đã merge `develop` → `main` (cả `thathinh-web` và `thathinh-backend`)
- [ ] Google OAuth client: thêm origins `https://thathinh.vn`, `https://www.thathinh.vn`

---

## 1. AWS — S3 buckets (một lần)

```bash
cd thathinh-backend
bash ops/aws/create-prod-buckets.sh
```

| Bucket | Mục đích |
|--------|----------|
| `thathinh-web-prod` | Frontend `dist/` |
| `thathinh-deploy-prod` | JAR CI/CD (`backend/thathinh-latest.jar`) |
| `thathinh-assets` | Upload avatar/chat (đã có) |
| `thathinh-backup-prod` | Mongo backup (tuỳ chọn) |

### CloudFront (frontend)

1. ACM certificate **`thathinh.vn` + `www.thathinh.vn`** ở region **us-east-1**
2. Tạo distribution:
   - Origin: `thathinh-web-prod` (OAC, bucket private)
   - Default root: `index.html`
   - Custom error: 403/404 → `/index.html` (SPA)
   - Alternate domain: `thathinh.vn`, `www.thathinh.vn`
3. Lưu **Distribution ID** → GitHub secret `CF_DISTRIBUTION_ID` (repo `thathinh-web`)

### DNS (Cloudflare)

| Record | Type | Target |
|--------|------|--------|
| `thathinh.vn` | CNAME | CloudFront domain |
| `www` | CNAME | CloudFront domain |
| `api` | A | `13.215.133.238` |

---

## 2. IAM — mở rộng role hiện có

### 2.1. GitHub OIDC `github-actions-deploy`

**Trust policy** — thêm 2 repo (giữ nguyên salsales):

```json
"token.actions.githubusercontent.com:sub": [
  "repo:sandro-96/salsales-management-web:ref:refs/heads/main",
  "repo:sandro-96/salsales-management-backend:ref:refs/heads/main",
  "repo:sandro-96/thathinh-web:ref:refs/heads/main",
  "repo:sandro-96/thathinh-backend:ref:refs/heads/main"
]
```

**Permissions** — attach thêm inline policy từ  
`thathinh-backend/ops/aws/iam-github-actions-thathinh-addon.json`  
(đổi `THATHINH_CF_DIST_ID` thành ID thật).

### 2.2. EC2 role `ec2-salsales-prod`

Attach thêm `ops/aws/iam-ec2-thathinh-addon.json` (đọc deploy bucket, S3 uploads, SSM `/thathinh/prod/*`).

---

## 3. SSM Parameter Store

Prefix: `/thathinh/prod/` — danh sách đầy đủ: `thathinh-backend/ops/aws/ssm-parameters.example.env`

```bash
aws ssm put-parameter --name /thathinh/prod/MONGODB_URI \
  --value "mongodb+srv://..." --type SecureString --overwrite --region ap-southeast-1

aws ssm put-parameter --name /thathinh/prod/JWT_SECRET \
  --value "$(openssl rand -base64 32)" --type SecureString --overwrite --region ap-southeast-1

# ... các key còn lại (String hoặc SecureString)
```

> `JWT_SECRET` prod **phải khác** staging Render.

---

## 4. EC2 — cài Thả Thính (một lần)

Vào EC2 qua **SSM Session Manager** (không SSH).

```bash
sudo mkdir -p /opt/thathinh
sudo chown ec2-user:ec2-user /opt/thathinh

# Copy từ repo (hoặc scp qua SSM):
#   ops/ec2/load-env.sh
#   ops/ec2/thathinh.service
#   ops/ec2/setup-shared-ec2.sh
sudo cp thathinh.service /etc/systemd/system/
sudo cp load-env.sh /opt/thathinh/
sudo chmod +x /opt/thathinh/load-env.sh

# Nạp env từ SSM (sau khi đã tạo params)
sudo bash /opt/thathinh/load-env.sh

sudo systemctl daemon-reload
sudo systemctl enable thathinh
```

### Caddy — thêm `api.thathinh.vn`

Mở Caddyfile hiện tại (cùng file `api.sotuci.vn`), thêm block từ  
`thathinh-backend/ops/ec2/caddy-snippet.caddy`:

```bash
sudo systemctl reload caddy
curl -s http://127.0.0.1:8081/actuator/health   # sau khi có JAR
curl -s https://api.thathinh.vn/actuator/health   # sau khi DNS + cert OK
```

### Deploy JAR lần đầu

Cách nhanh: push `main` trên `thathinh-backend` → GitHub Actions deploy.  
Hoặc thủ công:

```bash
aws s3 cp target/thathinh-backend-*.jar s3://thathinh-deploy-prod/backend/thathinh-latest.jar
# rồi chạy lệnh SSM giống workflow, hoặc:
sudo aws s3 cp s3://thathinh-deploy-prod/backend/thathinh-latest.jar /opt/thathinh/app.jar
sudo systemctl restart thathinh
```

---

## 5. GitHub Actions

### Secrets (Settings → Actions)

| Secret | Repo | Giá trị |
|--------|------|---------|
| `AWS_ROLE_ARN` | web + backend | `arn:aws:iam::336457598093:role/github-actions-deploy` |
| `CF_DISTRIBUTION_ID` | **web** | CloudFront Thả Thính |
| `GOOGLE_CLIENT_ID_PROD` | **web** | OAuth prod |
| `EC2_INSTANCE_ID` | backend (tuỳ chọn) | `i-08167ad5505b5b164` |

### Workflows (đã có trong repo)

| Repo | File | Trigger |
|------|------|---------|
| `thathinh-web` | `.github/workflows/deploy-frontend-prod.yml` | push `main` |
| `thathinh-backend` | `.github/workflows/deploy-backend-prod.yml` | push `main` |

---

## 6. Go-live checklist

- [ ] `https://thathinh.vn` — landing load
- [ ] `https://api.thathinh.vn/actuator/health` → `{"status":"UP"}`
- [ ] `salsales` vẫn OK: `https://api.sotuci.vn/actuator/health`
- [ ] Login Google
- [ ] Lưu profile (bio)
- [ ] Chat topic + WebSocket
- [ ] Upload ảnh → `thathinh-assets`
- [ ] UptimeRobot monitor `https://api.thathinh.vn/actuator/health`

---

## 7. Vận hành hàng ngày

```bash
# Trạng thái cả hai app trên EC2
sudo systemctl status salsales thathinh --no-pager

# Log Thả Thính
sudo journalctl -u thathinh -n 120 --no-pager

# Reload secrets + restart
sudo bash /opt/thathinh/load-env.sh
sudo systemctl restart thathinh
```

---

## 8. So sánh staging vs prod

| | Staging | Production |
|---|---------|------------|
| FE | Vercel (`develop`) | S3 + CloudFront |
| BE | Render Docker | EC2 JAR `:8081` |
| Mongo | Atlas (0.0.0.0/0) | Atlas (EIP only) |
| S3 | `AWS_S3_REQUIRED=false` | `true` + `thathinh-assets` |

Chi phí thêm ước tính: **~$10–15/tháng** (CloudFront + S3 + Atlas nếu cluster riêng). EC2 **$0 thêm** (dùng chung).
