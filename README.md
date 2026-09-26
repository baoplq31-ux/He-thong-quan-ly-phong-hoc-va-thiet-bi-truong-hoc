# Đề tài He-thong-quan-ly-phong-hoc-va-thiet-bi-truong-hoc

**Nhóm 10**

| Họ và tên | MSSV |
| :--- | :--- |
| Mai The Vinh | 2606042022 |
| Phan Le Quoc bao | 2606042019 |
| Nguyen Huu Minh Nhat | 20606042035 |

---

### Các bước tiến trình (19/9/2026)

### 🔐 1. Phân hệ Hệ thống & Quản trị
* **Đăng nhập & Điều hướng:** Tự động nhận diện vai trò và hiển thị bảng điều khiển (Dashboard) tương ứng với từng quyền hạn.
* **Quản lý Tài khoản (Admin):** Cấp phát, cập nhật thông tin và khóa/mở khóa tài khoản sử dụng của giáo viên và giáo vụ.

### 🗂️ 2. Phân hệ Quản lý Danh mục
* **🏢 Quản lý Phòng học:** Khai báo mã phòng, tên phòng, sức chứa, phân loại (Phòng Lý thuyết / Thực hành) và cập nhật trạng thái khả dụng.
* **💻 Quản lý Thiết bị:** Theo dõi danh mục thiết bị (Máy chiếu, Micro, Loa, Laptop...). Quản lý mã định danh độc nhất và tình trạng vật lý (Tốt / Hỏng).

### 🔄 3. Phân hệ Mượn & Trả (Nghiệp vụ cốt lõi)
* **📅 Tra cứu lịch trực tuyến (Giáo viên):** Hiển thị trực quan trạng thái phòng/thiết bị (Trống / Đã đặt) theo từng ca học và ngày cụ thể để tránh đụng lịch.
* **📝 Đăng ký mượn (Giáo viên):** Khởi tạo phiếu yêu cầu điện tử (chọn ngày, ca học, phòng và thiết bị cần mượn đi kèm).
* **✅ Kiểm duyệt đơn (Giáo vụ):** Quản lý danh sách các đơn "Chờ duyệt". Thao tác chấp nhận hoặc từ chối đơn (bắt buộc nhập lý do nếu từ chối).
* **🤝 Bàn giao & Thu hồi (Giáo vụ):** Xác nhận trạng thái "Đã bàn giao" khi xuất kho và "Đã thu hồi" khi nhận lại. Hệ thống tự động reset đối tượng về trạng thái "Trống".

### 🛠️ 4. Phân hệ Bảo trì & Báo cáo
* **⚠️ Báo hỏng khẩn cấp (Giáo viên):** Báo cáo ngay lập tức trên hệ thống nếu thiết bị gặp sự cố trong quá trình giảng dạy.
* **🔧 Quản lý bảo trì (Giáo vụ):** Chuyển thiết bị lỗi sang trạng thái "Đang sửa chữa". Hệ thống sẽ tự động khóa, không cho phép đưa thiết bị này vào các đơn đăng ký mới.
* **📊 Thống kê & Báo cáo:** Xuất dữ liệu thống kê tình trạng kho hiện tại, công suất mượn phòng học và thiết bị theo tuần/tháng.
