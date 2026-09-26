# Đề tài He-thong-quan-ly-phong-hoc-va-thiet-bi-truong-hoc

**Nhóm 10**

| Họ và tên | MSSV |
| :--- | :--- |
| Mai The Vinh | 2606042022 |
| Phan Le Quoc bao | 2606042019 |
| Nguyen Huu Minh Nhat | 20606042035 |

---

### Báo cáo tiến độ dự án
## 📌 Tiến độ dự án (19/9/2026)

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

* ## 📌 Tiến độ dự án 26/09/2026

### 1. Nội dung đã thực hiện hôm nay
* **Phân tích đối tượng & Phân quyền hệ thống:**
  * Xác định rõ 4 nhóm đối tượng chính: Admin (Quản trị viên), Cán bộ quản lý thiết bị/phòng, Giáo viên và Học sinh.
  * Phân định rõ quyền hạn, nhiệm vụ và luồng tương tác của từng vai trò trên website.
* **Chuẩn hóa & Thiết kế Sơ đồ Hệ thống:**
  * Vẽ sơ đồ phân cấp đối tượng (Role-Based Access Control) và sơ đồ luồng hoạt động (Workflow).
* **Mở rộng & Tinh chỉnh Yêu cầu Giao diện Website (UI/UX):**
  * Tinh chỉnh lại 4 phân hệ chính theo chuẩn tài liệu SRS (Phân hệ Hệ thống, Danh mục Core, Mượn - Trả, Sửa chữa & Báo cáo).
  * Thiết kế bổ sung các luồng giao diện mở rộng: Báo hỏng khẩn cấp, Phê duyệt đơn mượn kèm lý do từ chối, và Quy trình bàn giao/thu hồi tài sản.

---

### 2. Các điểm cải tiến & Tinh chỉnh trọng tâm (Key Enhancements)
* **Tối ưu hóa thuật ngữ:** Đổi tên vai trò "Giáo vụ" thành "Cán bộ quản lý thiết bị/phòng" để sát với thực tế vận hành và chuyên nghiệp hơn trong báo cáo.
* **Bổ sung phân quyền Học sinh:** Đưa học sinh vào luồng người dùng chính (được phép đăng ký mượn dụng cụ thể thao/ngoại khóa) thay vì chỉ phục vụ giáo viên.
* **Kiểm soát trạng thái tài sản chặt chẽ:** Thêm luồng kiểm tra thiết bị khi trả (Bàn giao ➔ Thu hồi ➔ Đánh giá hư hỏng ➔ Tự động cập nhật trạng thái kho).
