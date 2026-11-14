# EduFacility

Hệ thống quản lý phòng học, thiết bị, đặt phòng, mượn thiết bị và bảo trì.

## Cấu trúc triển khai

- `frontend/`: React + Vite, triển khai frontend lên Vercel.
- `backend/`: NestJS + Prisma, triển khai API lên Render.
- PostgreSQL: database dùng chung cho backend.

Hướng dẫn chạy local, cấu hình môi trường và triển khai: [DEPLOYMENT.md](./DEPLOYMENT.md).

Ứng dụng Next.js cũ và SQLite `dev.db` vẫn được giữ ở thư mục gốc để làm bản tham chiếu. Dữ liệu SQLite chưa tự được chép sang PostgreSQL. Migration PostgreSQL ban đầu chỉ tạo cấu trúc bảng; `backend/prisma/seed.ts` tạo dữ liệu mẫu và xóa các bản ghi trong database đích trước khi seed.
