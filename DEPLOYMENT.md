# Triển khai EduFacility theo 3 phần

```text
frontend/  React + Vite  → Vercel
backend/   NestJS        → Render Web Service
PostgreSQL              → PostgreSQL managed (ví dụ Render, Neon, Supabase)
```

## Chạy local

1. Cài PostgreSQL, tạo database và cập nhật `backend/.env` theo `backend/.env.example`.
2. Trong `backend/`: `npm install`, `npm run db:generate`, `npm run db:deploy`, `npm run db:seed`, `npm run start:dev`.
3. Trong `frontend/`: `npm install`, `npm run dev`.
4. Vite chuyển tiếp `/api` đến `http://localhost:3000`. Nếu backend chạy cổng khác, đặt `API_PROXY_TARGET`.

Tài khoản demo do seed tạo: `QT001` / `123456` (hoặc email quản trị trong seed). Hãy đổi mật khẩu sau khi đăng nhập.

## Render backend

- Root Directory: `backend`
- Build Command: `npm install && npm run db:generate && npm run build`
- Start Command: `npm run start:prod`
- Thêm `DATABASE_URL` (chuỗi kết nối PostgreSQL), `DIRECT_URL` nếu nhà cung cấp yêu cầu URL kết nối trực tiếp, và `FRONTEND_ORIGIN` là domain Vercel (không có dấu `/` cuối).
- Chạy `npm run db:deploy` một lần sau khi tạo database và mỗi lần triển khai migration mới. `PORT` được Render cung cấp tự động.
- `/health` là health check endpoint.

## Vercel frontend

- Root Directory: `frontend`
- Framework: Vite; Build Command: `npm run build`; Output Directory: `dist`.
- Trong `frontend/vercel.json`, thay `REPLACE_WITH_RENDER_BACKEND` bằng hostname dịch vụ Render thực tế (ví dụ `my-api.onrender.com`). Quy tắc này chuyển tiếp `/api/*` để phiên đăng nhập cookie vẫn cùng origin với frontend.

## Cơ sở dữ liệu hiện có

Migration PostgreSQL đầu tiên tạo schema trống. Lệnh seed thêm dữ liệu mẫu và **xóa dữ liệu hiện có trong database đích trước khi seed**. Database SQLite `dev.db` cũ được giữ nguyên; dữ liệu trong đó chưa tự chuyển sang PostgreSQL. Không chạy seed lên database có dữ liệu cần giữ. Muốn mang dữ liệu cũ sang, cần xuất/chuyển từng bảng theo schema mới trước khi cho người dùng sử dụng hệ thống mới.
