# Thả Thính Web

React + Vite frontend cho thathinh.vn

## Chạy local

```bash
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

## Deploy (Vercel)

1. Import repo vào Vercel
2. Set env:
   - `VITE_API_BASE_URL=https://api.thathinh.vn/api`
   - `VITE_WS_URL=https://api.thathinh.vn/ws`
   - `VITE_SITE_URL=https://thathinh.vn`
3. Domain: `thathinh.vn`
