# API Design — Hệ thống quản lý phòng học và thiết bị

Tài liệu này mô tả các route đang được triển khai trong `edu-facility/app/api`.
API dùng JSON, session cookie và Prisma/SQLite; các API nghiệp vụ yêu cầu đăng
nhập trừ khi ghi chú khác.

## 1. Danh sách route thực tế

| Nhóm | Method | Endpoint | Mô tả |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | Đăng nhập, tạo session |
| Auth | GET | `/api/auth/me` | Lấy tài khoản của session hiện tại |
| Auth | POST | `/api/auth/logout` | Thu hồi session hiện tại |
| Quản trị | POST | `/api/auth/change-password` | Quản trị viên đặt lại mật khẩu tài khoản bất kỳ |
| Dữ liệu | GET | `/api/data` | Tải phòng, thiết bị, lịch, sự cố; danh sách người dùng chỉ dành cho cán bộ quản lý |
| Phòng | POST/PATCH/DELETE | `/api/rooms` | Tạo, sửa hoặc xóa; `PATCH`/`DELETE` nhận `id` trong JSON body |
| Thiết bị | POST/PATCH/DELETE | `/api/equipment` | Tạo, sửa hoặc xóa; `PATCH`/`DELETE` nhận `id` trong JSON body |
| Đặt phòng | POST | `/api/bookings` | Tạo yêu cầu đặt phòng, gán chủ sở hữu theo session |
| Đặt phòng | GET | `/api/bookings?date=DD/MM/YYYY&start=HH:mm&end=HH:mm&attendeeCount=n` | Tìm phòng trống theo ngày, giờ và sức chứa |
| Đặt phòng | PATCH/DELETE | `/api/bookings` | Sửa, đổi trạng thái, hủy hoặc xóa; nhận `id` trong JSON body |
| Mượn thiết bị | GET/POST | `/api/borrowings` | Danh sách phiếu theo quyền hoặc tạo phiếu |
| Mượn thiết bị | GET/PATCH/DELETE | `/api/borrowings/:id` | Xem, sửa trạng thái/trả hoặc xóa phiếu |
| Bảo trì | GET/POST | `/api/maintenance` | Liệt kê hoặc tạo phiếu; cán bộ thiết bị/quản trị viên |
| Bảo trì | PATCH | `/api/maintenance/:id` | Ghi kết quả, hoàn tất bảo trì và cập nhật số lượng khả dụng |
| Nhật ký | GET | `/api/audit-logs` | Lấy tối đa 200 bản ghi gần nhất; chỉ quản trị viên |
| Sự cố | POST/PATCH/DELETE | `/api/incidents` | Tạo, cập nhật hoặc xóa; `PATCH`/`DELETE` nhận `id` trong JSON body |
| Người dùng | POST/PATCH/DELETE | `/api/users` | Quản trị người dùng; `PATCH`/`DELETE` nhận `id` trong JSON body |
| Thông báo | GET/POST/PATCH/DELETE | `/api/notifications` | Lấy, tạo, đánh dấu đã đọc hoặc xóa thông báo của tài khoản hiện tại |

Không có `GET /api/rooms`, `GET /api/equipment` hoặc `GET /api/users`.
Thông tin đọc được lấy từ `GET /api/data`. Các route collection dùng JSON body
chứa `id` cho thao tác cập nhật/xóa; không dùng `/api/<resource>/:id`. Route
`[id]` hiện có cho mượn thiết bị và bảo trì.

## 2. Xác thực, quyền và phạm vi dữ liệu

- Frontend gửi session cookie bằng `credentials: "include"`.
- Người dùng thường chỉ nhận các yêu cầu đặt phòng do mình tạo và lịch đã duyệt
  hoặc hoàn thành. Tên người khác bị ẩn trên lịch dùng chung.
- Danh sách tài khoản chỉ được trả cho quản trị viên/cán bộ thiết bị.
- Người dùng thường chỉ nhận sự cố do chính tài khoản đó tạo (liên kết bằng ID,
  không dựa vào tên hiển thị); cán bộ quản lý nhận toàn bộ sự cố.
- Chỉ quản trị viên mới được đặt lại mật khẩu, thông qua màn hình quản lý người
  dùng; tài khoản thường không có chức năng tự đổi mật khẩu.
- Tạo đặt phòng lấy `userId` và tên người đặt từ session; không tin chủ sở hữu do
  client gửi lên. Chủ yêu cầu có thể hủy phiếu của mình khi đang chờ duyệt/đã
  duyệt. Chỉ cán bộ quản lý mới được duyệt, từ chối, hoàn thành hoặc xóa.
- Cán bộ thiết bị và quản trị viên được quản lý bảo trì. Nhật ký hệ thống chỉ
  dành cho quản trị viên.
- Người dùng chỉ có thể xóa thông báo của chính mình; có thể xóa từng thông báo
  hoặc xóa hàng loạt thông báo đã đọc.

## 3. Payload chính

### Quản trị đặt lại mật khẩu

`POST /api/auth/change-password`

```json
{
  "userId": 15,
  "newPassword": "mat-khau-moi",
  "confirmPassword": "mat-khau-moi"
}
```

Chỉ quản trị viên được gọi API này. Mật khẩu mới dài 8–128 ký tự; mọi session
của tài khoản được chọn sẽ bị thu hồi.

### Đặt phòng

`POST /api/bookings`

```json
{
  "date": "15/11/2026",
  "time": "07:00–09:00",
  "room": "A101",
  "course": "Học phần",
  "person": "Tên hiển thị",
  "attendeeCount": 30,
  "note": "Ghi chú (không bắt buộc)"
}
```

Trạng thái ban đầu là `Chờ duyệt`. Ngày dùng định dạng `DD/MM/YYYY`; thời gian
phải có giờ kết thúc sau giờ bắt đầu. Hệ thống kiểm tra sức chứa, lịch trùng và
từ chối phòng ở trạng thái `Bảo trì`, `Tạm khóa` hoặc `Ngừng sử dụng`.

Ví dụ tìm phòng trống:

```http
GET /api/bookings?date=15%2F11%2F2026&start=07%3A00&end=09%3A00&attendeeCount=30
```

Các thao tác cập nhật dùng `PATCH /api/bookings`:

```json
{ "id": 15, "status": "Đã duyệt" }
```

```json
{ "id": 15, "status": "Từ chối", "rejectionReason": "Phòng cần bảo trì" }
```

Từ chối bắt buộc có lý do. Chỉ yêu cầu đang chờ duyệt có thể được duyệt/từ
chối; chỉ yêu cầu đã duyệt có thể hoàn thành. Hủy dùng thao tác riêng:

```json
{ "id": 15, "action": "cancel" }
```

Sửa lịch gửi các trường `date`, `time`, `room`, `course`, `person`,
`attendeeCount` và `note`; yêu cầu sẽ trở lại trạng thái `Chờ duyệt`.

### Bảo trì

`POST /api/maintenance` nhận `equipmentId`, `quantity`, `type`,
`issueDescription`, `startDate`, `content` và tùy chọn `assignedTo`. Khi hoàn tất,
`PATCH /api/maintenance/:id` nhận `repairResult`, `conditionAfter` (`Tốt`,
`Cần kiểm tra` hoặc `Hỏng`) và tùy chọn `cost`.

### Cập nhật và xóa trên route collection

Các thao tác thay đổi phòng, thiết bị, sự cố và người dùng gửi `id` cùng các
trường cần cập nhật trong JSON body. Ví dụ:

```http
PATCH /api/equipment
Content-Type: application/json
```

```json
{ "id": 7, "quantity": 12 }
```

Xóa dùng cùng endpoint với method `DELETE` và body `{ "id": 7 }`.

## 4. Response và lỗi

Response thành công không dùng một envelope thống nhất: tùy route, dữ liệu được
trả trực tiếp hoặc trong trường `data`, cùng với `message` khi cần. Lỗi nghiệp
vụ thường có dạng:

```json
{ "message": "Phòng đã có lịch đặt trùng khung giờ này." }
```

HTTP status thể hiện kết quả (ví dụ `400` dữ liệu không hợp lệ, `401` chưa đăng
nhập, `403` không đủ quyền, `404` không tìm thấy, `409` xung đột, `500` lỗi máy
chủ). Một số route có response riêng; client nên kiểm tra `response.ok` và dùng
`message` nếu có. Hiện tại API không cam kết các mã lỗi nghiệp vụ dạng số hoặc
field `success`/`error.code`.

## 5. Các giới hạn hiện tại

- `GET /api/audit-logs` trả tối đa 200 bản ghi mới nhất, chưa có phân trang.
- `GET /api/data` là API tổng hợp; quyền lọc được thực thi tại server.
- Các bộ lọc lịch ngày/tuần/tháng được dựng ở giao diện từ dữ liệu trả về; API
  tìm phòng trống hỗ trợ lọc theo ngày, khoảng giờ và sức chứa.
- Báo cáo CSV/Excel được tải trực tiếp; xuất PDF mở hộp thoại in của trình duyệt,
  nơi người dùng chọn “Lưu thành PDF”.
