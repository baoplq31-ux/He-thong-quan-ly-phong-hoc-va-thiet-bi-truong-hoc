# SOFTWARE REQUIREMENTS SPECIFICATION – SRS

## HỆ THỐNG QUẢN LÝ PHÒNG HỌC VÀ THIẾT BỊ TRƯỜNG HỌC

**Phiên bản:** 1.0  
**Vai trò xây dựng tài liệu:** Business Analyst  
**Loại hệ thống:** Web Application  
**Đối tượng sử dụng:** Trường học / Cao đẳng / Đại học

---

# 1. GIỚI THIỆU

## 1.1. Mục đích tài liệu

Tài liệu Software Requirements Specification – SRS mô tả các yêu cầu nghiệp vụ và yêu cầu phần mềm của hệ thống quản lý phòng học và thiết bị trường học.

Tài liệu được sử dụng làm cơ sở cho:

- Phân tích và thống nhất yêu cầu với người dùng.
- Thiết kế hệ thống.
- Thiết kế cơ sở dữ liệu.
- Thiết kế giao diện.
- Lập trình hệ thống.
- Xây dựng test case.
- Kiểm thử và nghiệm thu sản phẩm.
- Bảo trì và mở rộng hệ thống trong tương lai.

---

# 2. BỐI CẢNH NGHIỆP VỤ

## 2.1. Hiện trạng

Trong nhiều trường học, việc quản lý phòng học và thiết bị vẫn được thực hiện bằng Excel, giấy tờ hoặc trao đổi trực tiếp.

Một số vấn đề thường gặp:

- Khó xác định phòng nào đang trống.
- Phòng có thể bị đăng ký trùng thời gian.
- Giáo viên phải liên hệ trực tiếp với bộ phận quản lý phòng để đặt phòng.
- Khó theo dõi thiết bị đang được sử dụng ở phòng nào.
- Không biết chính xác thiết bị đang hoạt động, hư hỏng hay bảo trì.
- Việc mượn và trả thiết bị chưa có lịch sử rõ ràng.
- Khó thống kê số lần sử dụng phòng.
- Khó thống kê tình trạng thiết bị.
- Ban quản lý mất nhiều thời gian tổng hợp báo cáo.
- Phân quyền người dùng chưa rõ ràng.

---

# 3. MỤC TIÊU HỆ THỐNG

Hệ thống được xây dựng nhằm:

1. Quản lý tập trung thông tin phòng học.
2. Quản lý danh mục và tình trạng thiết bị.
3. Cho phép người dùng tra cứu phòng học.
4. Cho phép giảng viên hoặc nhân viên đặt phòng.
5. Cho phép người dùng gửi yêu cầu mượn thiết bị.
6. Hỗ trợ quy trình duyệt hoặc từ chối yêu cầu đặt phòng.
7. Hỗ trợ quy trình duyệt hoặc từ chối yêu cầu mượn thiết bị.
8. Quản lý lịch sử sử dụng phòng.
9. Quản lý lịch sử mượn/trả thiết bị.
10. Theo dõi thiết bị hư hỏng, sửa chữa và bảo trì.
11. Phân quyền người dùng theo chức năng.
12. Hỗ trợ thống kê và báo cáo phục vụ công tác quản lý.

---

# 4. PHẠM VI HỆ THỐNG

## 4.1. Trong phạm vi

Hệ thống bao gồm các phân hệ:

- Quản lý đăng nhập.
- Quản lý tài khoản.
- Quản lý phân quyền.
- Quản lý phòng học.
- Quản lý loại phòng.
- Quản lý lịch sử dụng phòng.
- Đặt phòng học.
- Phê duyệt yêu cầu đặt phòng.
- Quản lý thiết bị.
- Quản lý loại thiết bị.
- Mượn thiết bị.
- Trả thiết bị.
- Phê duyệt yêu cầu mượn thiết bị.
- Theo dõi tình trạng thiết bị.
- Quản lý bảo trì và sửa chữa.
- Quản lý nhập/xuất thiết bị.
- Tra cứu.
- Thống kê.
- Báo cáo.

## 4.2. Ngoài phạm vi phiên bản 1.0

Phiên bản đầu tiên chưa bắt buộc triển khai:

- Thanh toán trực tuyến.
- Quản lý học phí.
- Quản lý điểm sinh viên.
- Quản lý lịch giảng dạy toàn trường.
- Quản lý tuyển sinh.
- Quản lý ký túc xá.
- Nhận diện khuôn mặt.
- Mở cửa phòng bằng IoT.
- Điều khiển thiết bị phòng học từ xa.

Các chức năng trên có thể được phát triển trong các phiên bản sau.

---

# 5. CÁC BÊN LIÊN QUAN

| Stakeholder | Vai trò |
|---|---|
| Ban giám hiệu | Theo dõi tình hình sử dụng cơ sở vật chất |
| Quản trị viên | Quản lý hệ thống và phân quyền |
| Nhân viên quản lý phòng học | Quản lý phòng và xử lý yêu cầu đặt phòng |
| Nhân viên quản lý thiết bị | Quản lý thiết bị, mượn/trả và bảo trì |
| Giảng viên | Tra cứu và đặt phòng, mượn thiết bị |
| Nhân viên | Tra cứu và gửi yêu cầu sử dụng |
| Sinh viên | Tra cứu thông tin được cho phép |
| Bộ phận kỹ thuật | Sửa chữa và bảo trì thiết bị |

---

# 6. ACTOR VÀ PHÂN QUYỀN

## 6.1. Sinh viên

Sinh viên có thể:

- Đăng nhập.
- Xem danh sách phòng học.
- Tra cứu phòng học.
- Xem phòng đang trống.
- Xem thiết bị của phòng.
- Xem lịch sử yêu cầu của bản thân nếu được cấp quyền.

Sinh viên không được:

- Phê duyệt yêu cầu.
- Thay đổi thông tin phòng.
- Thay đổi thiết bị.
- Quản lý người dùng.

---

## 6.2. Giảng viên / nhân viên

Giảng viên hoặc nhân viên có thể:

- Đăng nhập.
- Tra cứu phòng.
- Xem lịch sử dụng phòng.
- Xem phòng trống.
- Tạo yêu cầu đặt phòng.
- Chọn thời gian sử dụng.
- Chọn mục đích sử dụng.
- Gửi yêu cầu mượn thiết bị.
- Theo dõi trạng thái yêu cầu.
- Xem lịch sử đặt phòng.
- Xem lịch sử mượn thiết bị.
- Hủy yêu cầu nếu yêu cầu chưa được xử lý.

---

## 6.3. Nhân viên quản lý phòng học

Có quyền:

- Quản lý danh sách phòng.
- Thêm phòng.
- Sửa thông tin phòng.
- Cập nhật tình trạng phòng.
- Xem lịch sử dụng phòng.
- Xem yêu cầu đặt phòng.
- Duyệt yêu cầu đặt phòng.
- Từ chối yêu cầu đặt phòng.
- Phân công phòng.
- Khóa phòng tạm thời.
- Đánh dấu phòng bảo trì.
- Xem báo cáo sử dụng phòng.

---

## 6.4. Nhân viên quản lý thiết bị

Có quyền:

- Quản lý danh mục thiết bị.
- Thêm thiết bị.
- Sửa thông tin thiết bị.
- Cập nhật tình trạng thiết bị.
- Xem yêu cầu mượn thiết bị.
- Duyệt yêu cầu mượn.
- Từ chối yêu cầu mượn.
- Lập phiếu xuất thiết bị.
- Lập phiếu nhập/trả thiết bị.
- Ghi nhận thiết bị hư hỏng.
- Quản lý bảo trì.
- Quản lý sửa chữa.
- Xem lịch sử thiết bị.
- Xem báo cáo thiết bị.

---

## 6.5. Quản trị viên – Admin

Admin có toàn quyền quản lý hệ thống:

- Quản lý người dùng.
- Tạo tài khoản.
- Sửa tài khoản.
- Khóa/mở tài khoản.
- Xóa tài khoản theo quy định.
- Gán vai trò.
- Phân quyền.
- Quản lý danh mục chung.
- Quản lý phòng.
- Quản lý thiết bị.
- Xem báo cáo tổng hợp.
- Theo dõi hoạt động hệ thống.
- Cấu hình hệ thống.

---

# 7. BUSINESS RULES – QUY TẮC NGHIỆP VỤ

## BR-01 – Tài khoản

Mỗi người dùng phải có một tài khoản duy nhất.

Không được tồn tại hai tài khoản có cùng username/email/mã nhân sự hoặc mã sinh viên nếu trường sử dụng các trường này làm thông tin định danh.

---

## BR-02 – Phân quyền

Người dùng chỉ được truy cập những chức năng tương ứng với vai trò đã được cấp.

---

## BR-03 – Đặt phòng

Một phòng không được có hai yêu cầu đã duyệt trùng cùng khoảng thời gian.

Ví dụ:

Phòng A101 đã được đặt:

08:00 – 10:00

thì hệ thống không được cho phép duyệt một yêu cầu khác:

09:00 – 11:00

cho cùng phòng A101.

---

## BR-04 – Tình trạng phòng

Phòng có thể có các trạng thái:

- Sẵn sàng.
- Đang sử dụng.
- Bảo trì.
- Tạm khóa.
- Ngừng sử dụng.

Phòng đang bảo trì, tạm khóa hoặc ngừng sử dụng không được đặt.

---

## BR-05 – Yêu cầu đặt phòng

Yêu cầu đặt phòng có các trạng thái:

- Chờ duyệt.
- Đã duyệt.
- Từ chối.
- Đã hủy.
- Đã hoàn thành.

---

## BR-06 – Hủy yêu cầu

Người gửi chỉ được hủy yêu cầu khi yêu cầu chưa bắt đầu sử dụng.

---

## BR-07 – Thiết bị

Mỗi thiết bị phải có mã thiết bị duy nhất.

---

## BR-08 – Tình trạng thiết bị

Thiết bị có thể có các trạng thái:

- Sẵn sàng.
- Đang sử dụng.
- Đang cho mượn.
- Đang bảo trì.
- Hư hỏng.
- Thanh lý.

---

## BR-09 – Mượn thiết bị

Thiết bị chỉ được cho mượn khi:

- Thiết bị đang ở trạng thái sẵn sàng.
- Số lượng khả dụng lớn hơn hoặc bằng số lượng yêu cầu.

---

## BR-10 – Yêu cầu mượn thiết bị

Trạng thái gồm:

- Chờ duyệt.
- Đã duyệt.
- Từ chối.
- Đã nhận thiết bị.
- Đã trả.
- Quá hạn.
- Đã hủy.

---

## BR-11 – Trả thiết bị

Khi người dùng trả thiết bị, nhân viên quản lý phải xác nhận:

- Số lượng trả.
- Thời gian trả.
- Tình trạng thiết bị.

Nếu có hư hỏng phải lập ghi nhận sự cố.

---

## BR-12 – Lịch sử

Các giao dịch quan trọng phải lưu lịch sử.

Ví dụ:

- Ai tạo yêu cầu.
- Ai duyệt.
- Ai từ chối.
- Thời gian xử lý.
- Người chỉnh sửa dữ liệu.
- Giá trị trước và sau khi sửa nếu áp dụng audit log.

---

# 8. YÊU CẦU CHỨC NĂNG

# 8.1. Module xác thực

## FR-AUTH-01 – Đăng nhập

Hệ thống cho phép người dùng đăng nhập bằng:

- Tên đăng nhập hoặc email.
- Mật khẩu.

**Input:**

- Username/email.
- Password.

**Output:**

Nếu đúng:

- Đăng nhập thành công.
- Chuyển tới Dashboard.

Nếu sai:

- Hiển thị thông báo đăng nhập không thành công.

---

## FR-AUTH-02 – Đăng xuất

Người dùng có thể đăng xuất khỏi hệ thống.

Sau khi đăng xuất:

- Phiên đăng nhập bị hủy.
- Người dùng được chuyển về trang đăng nhập.

---

## FR-AUTH-03 – Đổi mật khẩu

Người dùng được phép đổi mật khẩu.

Thông tin:

- Mật khẩu hiện tại.
- Mật khẩu mới.
- Xác nhận mật khẩu mới.

---

# 8.2. Module quản lý người dùng

## FR-USER-01 – Xem danh sách người dùng

Admin có thể xem:

- Mã người dùng.
- Họ tên.
- Email.
- Vai trò.
- Trạng thái tài khoản.

---

## FR-USER-02 – Tạo tài khoản

Admin có thể tạo tài khoản mới.

Thông tin tối thiểu:

- Họ tên.
- Username.
- Email.
- Mật khẩu ban đầu.
- Vai trò.
- Trạng thái.

---

## FR-USER-03 – Cập nhật tài khoản

Admin có thể thay đổi:

- Họ tên.
- Email.
- Vai trò.
- Trạng thái.

---

## FR-USER-04 – Khóa tài khoản

Admin có thể khóa tài khoản.

Người dùng bị khóa không thể đăng nhập.

---

## FR-USER-05 – Gán vai trò

Admin có thể gán một hoặc nhiều vai trò cho tài khoản tùy mô hình triển khai.

---

# 8.3. Module quản lý phòng học

## FR-ROOM-01 – Xem danh sách phòng

Hệ thống hiển thị:

- Mã phòng.
- Tên phòng.
- Tòa nhà.
- Tầng.
- Loại phòng.
- Sức chứa.
- Trạng thái.

---

## FR-ROOM-02 – Thêm phòng

Người có quyền có thể tạo phòng mới.

Thông tin:

- Mã phòng.
- Tên phòng.
- Tòa nhà.
- Tầng.
- Loại phòng.
- Sức chứa.
- Mô tả.
- Trạng thái.

---

## FR-ROOM-03 – Cập nhật phòng

Cho phép cập nhật:

- Tên phòng.
- Loại.
- Sức chứa.
- Tình trạng.
- Thông tin khác.

---

## FR-ROOM-04 – Tìm kiếm phòng

Có thể tìm theo:

- Mã phòng.
- Tên phòng.
- Tòa nhà.
- Loại phòng.
- Sức chứa.
- Trạng thái.

---

## FR-ROOM-05 – Xem chi tiết phòng

Chi tiết gồm:

- Thông tin phòng.
- Danh sách thiết bị.
- Lịch sử dụng.
- Trạng thái.
- Lịch bảo trì nếu có.

---

## FR-ROOM-06 – Cập nhật tình trạng phòng

Nhân viên quản lý phòng có thể chuyển trạng thái phòng.

---

# 8.4. Module đặt phòng

## FR-BOOK-01 – Xem phòng trống

Người dùng nhập:

- Ngày.
- Giờ bắt đầu.
- Giờ kết thúc.
- Số lượng người.

Hệ thống trả về danh sách phòng phù hợp.

---

## FR-BOOK-02 – Tạo yêu cầu đặt phòng

Người dùng nhập:

- Phòng mong muốn.
- Ngày sử dụng.
- Giờ bắt đầu.
- Giờ kết thúc.
- Số người.
- Mục đích.
- Ghi chú.

Hệ thống tạo yêu cầu ở trạng thái:

**Chờ duyệt.**

---

## FR-BOOK-03 – Kiểm tra trùng lịch

Trước khi tạo hoặc duyệt yêu cầu, hệ thống phải kiểm tra lịch phòng.

Nếu bị trùng:

Hệ thống cảnh báo và không cho phép duyệt.

---

## FR-BOOK-04 – Xem yêu cầu

Nhân viên quản lý phòng có thể xem danh sách:

- Chờ duyệt.
- Đã duyệt.
- Từ chối.
- Đã hủy.
- Hoàn thành.

---

## FR-BOOK-05 – Duyệt yêu cầu

Nhân viên quản lý có thể chọn:

**Duyệt**

Hệ thống:

1. Kiểm tra lịch.
2. Cập nhật yêu cầu thành Đã duyệt.
3. Ghi nhận người duyệt.
4. Ghi nhận thời gian duyệt.
5. Cập nhật lịch phòng.

---

## FR-BOOK-06 – Từ chối yêu cầu

Nhân viên quản lý có thể từ chối yêu cầu.

Bắt buộc nhập:

**Lý do từ chối.**

---

## FR-BOOK-07 – Hủy yêu cầu

Người tạo được phép hủy yêu cầu nếu thỏa mãn business rule.

---

## FR-BOOK-08 – Theo dõi trạng thái

Người gửi yêu cầu có thể xem:

- Chờ duyệt.
- Đã duyệt.
- Từ chối.
- Đã hủy.
- Hoàn thành.

---

## FR-BOOK-09 – Xem lịch phòng

Hệ thống cung cấp lịch dạng:

- Ngày.
- Tuần.
- Tháng.

---

# 8.5. Module thiết bị

## FR-EQP-01 – Danh sách thiết bị

Hiển thị:

- Mã thiết bị.
- Tên thiết bị.
- Loại.
- Phòng.
- Số lượng.
- Tình trạng.

---

## FR-EQP-02 – Thêm thiết bị

Thông tin:

- Mã thiết bị.
- Tên.
- Loại.
- Hãng sản xuất.
- Model.
- Ngày mua.
- Phòng.
- Tình trạng.
- Ghi chú.

---

## FR-EQP-03 – Cập nhật thiết bị

Nhân viên được phép cập nhật thông tin thiết bị.

---

## FR-EQP-04 – Tìm kiếm thiết bị

Tìm kiếm theo:

- Mã.
- Tên.
- Loại.
- Phòng.
- Tình trạng.

---

## FR-EQP-05 – Xem lịch sử thiết bị

Hệ thống hiển thị:

- Lịch sử sử dụng.
- Lịch sử mượn.
- Lịch sử sửa chữa.
- Lịch sử bảo trì.
- Lịch sử điều chuyển.

---

# 8.6. Module mượn/trả thiết bị

## FR-BORROW-01 – Tạo yêu cầu mượn

Người dùng chọn:

- Thiết bị.
- Số lượng.
- Ngày mượn.
- Ngày trả dự kiến.
- Mục đích.
- Ghi chú.

---

## FR-BORROW-02 – Kiểm tra thiết bị khả dụng

Hệ thống kiểm tra số lượng thiết bị khả dụng.

Nếu không đủ:

- Hiển thị cảnh báo.
- Không cho phép duyệt quá số lượng khả dụng.

---

## FR-BORROW-03 – Duyệt yêu cầu mượn

Nhân viên thiết bị có thể duyệt yêu cầu.

---

## FR-BORROW-04 – Từ chối yêu cầu

Nhân viên có thể từ chối và nhập lý do.

---

## FR-BORROW-05 – Xuất thiết bị

Khi giao thiết bị:

- Tạo phiếu xuất.
- Ghi nhận người nhận.
- Thời gian nhận.
- Số lượng.
- Tình trạng ban đầu.

---

## FR-BORROW-06 – Trả thiết bị

Khi trả:

- Nhân viên xác nhận trả.
- Kiểm tra tình trạng.
- Cập nhật kho.
- Cập nhật trạng thái yêu cầu.

---

## FR-BORROW-07 – Quá hạn

Nếu thời gian hiện tại lớn hơn ngày trả dự kiến nhưng thiết bị chưa trả:

Hệ thống đánh dấu:

**Quá hạn.**

---

# 8.7. Module bảo trì thiết bị

## FR-MAIN-01 – Ghi nhận thiết bị hỏng

Nhân viên có thể ghi nhận:

- Thiết bị.
- Thời gian.
- Mô tả lỗi.
- Người phát hiện.
- Mức độ lỗi.

---

## FR-MAIN-02 – Tạo phiếu bảo trì

Thông tin:

- Thiết bị.
- Loại bảo trì.
- Ngày bắt đầu.
- Nội dung.
- Nhân viên phụ trách.

---

## FR-MAIN-03 – Hoàn thành bảo trì

Sau khi sửa xong:

- Cập nhật ngày hoàn thành.
- Nội dung xử lý.
- Kết quả.
- Tình trạng thiết bị sau sửa chữa.

---

# 8.8. Module báo cáo

## FR-REPORT-01 – Báo cáo sử dụng phòng

Thống kê:

- Số lượt sử dụng phòng.
- Thời lượng sử dụng.
- Phòng sử dụng nhiều nhất.
- Phòng ít sử dụng.

Bộ lọc:

- Ngày.
- Tuần.
- Tháng.
- Học kỳ.

---

## FR-REPORT-02 – Báo cáo thiết bị

Thống kê:

- Tổng số thiết bị.
- Đang sử dụng.
- Đang cho mượn.
- Hư hỏng.
- Đang bảo trì.
- Đã thanh lý.

---

## FR-REPORT-03 – Báo cáo yêu cầu

Thống kê:

- Tổng yêu cầu.
- Đã duyệt.
- Từ chối.
- Chờ duyệt.
- Đã hủy.

---

## FR-REPORT-04 – Xuất báo cáo

Người có quyền có thể xuất báo cáo dạng:

- Excel.
- PDF.

---

# 9. QUY TRÌNH NGHIỆP VỤ CHÍNH

# 9.1. Quy trình đặt phòng

**Actor chính:** Giảng viên/Nhân viên

Luồng:

Bắt đầu  
→ Đăng nhập  
→ Chọn chức năng đặt phòng  
→ Chọn ngày và thời gian  
→ Hệ thống kiểm tra phòng trống  
→ Người dùng chọn phòng  
→ Nhập mục đích  
→ Gửi yêu cầu  
→ Hệ thống ghi nhận trạng thái Chờ duyệt  
→ Nhân viên quản lý phòng xem yêu cầu  
→ Kiểm tra lịch  
→ Duyệt/Từ chối.

Nếu duyệt:

→ Cập nhật lịch phòng  
→ Thông báo người yêu cầu  
→ Hoàn thành.

Nếu từ chối:

→ Nhập lý do  
→ Thông báo người yêu cầu  
→ Hoàn thành.

---

# 9.2. Quy trình mượn thiết bị

Người dùng  
→ Đăng nhập  
→ Tìm thiết bị  
→ Chọn thiết bị  
→ Nhập số lượng  
→ Chọn thời gian mượn  
→ Gửi yêu cầu  
→ Nhân viên thiết bị tiếp nhận  
→ Kiểm tra số lượng  
→ Duyệt/Từ chối.

Nếu duyệt:

→ Lập phiếu xuất  
→ Giao thiết bị  
→ Cập nhật trạng thái Đang cho mượn  
→ Người dùng sử dụng  
→ Trả thiết bị  
→ Kiểm tra tình trạng  
→ Lập phiếu nhập/trả  
→ Cập nhật số lượng  
→ Hoàn tất.

---

# 9.3. Quy trình xử lý thiết bị hỏng

Phát hiện thiết bị lỗi  
→ Nhân viên ghi nhận sự cố  
→ Thiết bị chuyển trạng thái Hư hỏng  
→ Tạo phiếu bảo trì  
→ Phân công kỹ thuật viên  
→ Sửa chữa  
→ Kiểm tra  
→ Cập nhật kết quả.

Nếu sửa thành công:

→ Trạng thái Sẵn sàng.

Nếu không thể sửa:

→ Đề xuất thanh lý.

---

# 10. YÊU CẦU DỮ LIỆU

Các thực thể chính của hệ thống bao gồm:

## 10.1. User

Các trường cơ bản:

- user_id.
- username.
- password_hash.
- full_name.
- email.
- phone.
- status.
- created_at.
- updated_at.

---

## 10.2. Role

- role_id.
- role_name.
- description.

Ví dụ:

- ADMIN.
- ROOM_MANAGER.
- EQUIPMENT_MANAGER.
- LECTURER.
- STAFF.
- STUDENT.

---

## 10.3. Room

- room_id.
- room_code.
- room_name.
- building.
- floor.
- room_type.
- capacity.
- status.
- description.

---

## 10.4. RoomBooking

- booking_id.
- user_id.
- room_id.
- booking_date.
- start_time.
- end_time.
- purpose.
- attendee_count.
- status.
- reject_reason.
- approved_by.
- approved_at.
- created_at.

---

## 10.5. Equipment

- equipment_id.
- equipment_code.
- equipment_name.
- category_id.
- room_id.
- manufacturer.
- model.
- quantity.
- available_quantity.
- purchase_date.
- status.
- description.

---

## 10.6. EquipmentBorrow

- borrow_id.
- user_id.
- borrow_date.
- expected_return_date.
- actual_return_date.
- purpose.
- status.
- approved_by.
- approved_at.
- reject_reason.

---

## 10.7. BorrowDetail

- borrow_detail_id.
- borrow_id.
- equipment_id.
- quantity.
- returned_quantity.
- return_condition.

---

## 10.8. Maintenance

- maintenance_id.
- equipment_id.
- issue_description.
- start_date.
- end_date.
- assigned_to.
- repair_result.
- cost.
- status.

---

## 10.9. Notification

- notification_id.
- user_id.
- title.
- content.
- type.
- is_read.
- created_at.

---

## 10.10. AuditLog

- log_id.
- user_id.
- action.
- module.
- object_id.
- old_value.
- new_value.
- timestamp.

---

# 11. QUAN HỆ DỮ LIỆU CHÍNH

Một User có thể có nhiều RoomBooking.

Một Room có thể có nhiều RoomBooking.

Một User có thể có nhiều yêu cầu EquipmentBorrow.

Một EquipmentBorrow có nhiều BorrowDetail.

Một Equipment có thể xuất hiện trong nhiều BorrowDetail.

Một Equipment có thể có nhiều Maintenance.

Một Room có nhiều Equipment.

Một User có thể có nhiều Notification.

---

# 12. YÊU CẦU PHI CHỨC NĂNG

## NFR-01 – Hiệu năng

Các thao tác thông thường phải phản hồi trong khoảng thời gian hợp lý.

Mục tiêu:

- Trang cơ bản: dưới 3 giây trong điều kiện sử dụng bình thường.
- Tìm kiếm: dưới 3 giây.
- Thao tác CRUD: dưới 3 giây.
- Báo cáo phức tạp: dưới 10 giây.

---

## NFR-02 – Bảo mật

Hệ thống phải:

- Xác thực người dùng.
- Phân quyền phía server.
- Không dựa hoàn toàn vào việc ẩn nút trên giao diện.
- Mã hóa/hash mật khẩu trước khi lưu.
- Chống SQL Injection.
- Chống XSS.
- Kiểm tra dữ liệu đầu vào.
- Bảo vệ API yêu cầu đăng nhập.

---

## NFR-03 – Session

Phiên đăng nhập phải hết hạn sau khoảng thời gian không hoạt động được cấu hình.

---

## NFR-04 – Audit

Các hành động quản trị quan trọng phải được ghi log.

---

## NFR-05 – Khả dụng

Hệ thống phải hoạt động ổn định trong thời gian trường học làm việc.

---

## NFR-06 – Responsive

Giao diện phải sử dụng được trên:

- Desktop.
- Laptop.
- Tablet.

Điện thoại có thể hỗ trợ responsive ở các chức năng cơ bản.

---

## NFR-07 – Trình duyệt

Hỗ trợ các phiên bản hiện đại của:

- Chrome.
- Edge.
- Firefox.

---

## NFR-08 – Backup

Dữ liệu phải có cơ chế sao lưu định kỳ.

---

## NFR-09 – Khả năng mở rộng

Thiết kế phải cho phép bổ sung:

- Cơ sở.
- Tòa nhà.
- Loại phòng.
- Loại thiết bị.
- Vai trò.
- Chức năng mới.

mà không cần thay đổi toàn bộ hệ thống.

---

## NFR-10 – Dễ sử dụng

Các thao tác chính không nên yêu cầu quá nhiều bước.

Thông báo lỗi phải dễ hiểu.

Ví dụ:

Không sử dụng:

`Error 500`

đối với người dùng cuối.

Nên sử dụng:

`Không thể đặt phòng vì thời gian này đã có lịch sử dụng.`

---

# 13. VALIDATION DỮ LIỆU

Hệ thống phải kiểm tra:

### Tài khoản

- Username không được để trống.
- Email đúng định dạng.
- Username không được trùng.

### Phòng

- Mã phòng không được trùng.
- Sức chứa > 0.

### Đặt phòng

- Ngày sử dụng không hợp lệ thì không cho phép gửi.
- Giờ kết thúc phải lớn hơn giờ bắt đầu.
- Số người phải > 0.
- Số người không được vượt sức chứa phòng nếu nhà trường áp dụng quy định này.

### Thiết bị

- Mã thiết bị không được trùng.
- Số lượng không âm.
- Số lượng khả dụng không lớn hơn tổng số lượng.

### Mượn thiết bị

- Ngày trả dự kiến phải sau hoặc bằng ngày mượn.
- Số lượng mượn > 0.
- Không được duyệt quá số lượng thiết bị khả dụng.

---

# 14. THÔNG BÁO HỆ THỐNG

Hệ thống nên gửi thông báo khi:

- Yêu cầu đặt phòng được tạo.
- Yêu cầu được duyệt.
- Yêu cầu bị từ chối.
- Yêu cầu bị hủy.
- Yêu cầu mượn thiết bị được duyệt.
- Yêu cầu mượn bị từ chối.
- Thiết bị sắp đến hạn trả.
- Thiết bị quá hạn.
- Phòng bị thay đổi trạng thái.

Thông báo phiên bản đầu có thể hiển thị trực tiếp trên website.

Các phiên bản sau có thể tích hợp:

- Email.
- Mobile Push Notification.
- Zalo hoặc hệ thống thông báo nội bộ.

---

# 15. DASHBOARD

## 15.1. Dashboard Admin

Hiển thị:

- Tổng người dùng.
- Tổng số phòng.
- Phòng đang sử dụng.
- Phòng đang bảo trì.
- Tổng thiết bị.
- Thiết bị hỏng.
- Yêu cầu chờ duyệt.
- Biểu đồ sử dụng phòng.
- Biểu đồ tình trạng thiết bị.

---

## 15.2. Dashboard quản lý phòng

Hiển thị:

- Yêu cầu đặt phòng chờ duyệt.
- Phòng đang sử dụng.
- Phòng trống.
- Phòng bảo trì.
- Lịch sử dụng trong ngày.

---

## 15.3. Dashboard quản lý thiết bị

Hiển thị:

- Yêu cầu mượn đang chờ.
- Thiết bị đang mượn.
- Thiết bị quá hạn.
- Thiết bị hỏng.
- Thiết bị bảo trì.

---

## 15.4. Dashboard giảng viên

Hiển thị:

- Lịch đặt phòng gần nhất.
- Yêu cầu chờ duyệt.
- Thiết bị đang mượn.
- Thông báo mới.

---

# 16. MA TRẬN PHÂN QUYỀN

| Chức năng | Sinh viên | Giảng viên / Nhân viên | QL phòng | QL thiết bị | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Đăng nhập | ✓ | ✓ | ✓ | ✓ | ✓ |
| Xem phòng | ✓ | ✓ | ✓ | ✓ | ✓ |
| Xem thiết bị | ✓ | ✓ | ✓ | ✓ | ✓ |
| Đặt phòng | Theo quyền | ✓ | ✓ |  | ✓ |
| Hủy yêu cầu của mình | Theo quyền | ✓ | ✓ |  | ✓ |
| Duyệt đặt phòng |  |  | ✓ |  | ✓ |
| Quản lý phòng |  |  | ✓ |  | ✓ |
| Mượn thiết bị | Theo quyền | ✓ | ✓ | ✓ | ✓ |
| Duyệt mượn thiết bị |  |  |  | ✓ | ✓ |
| Quản lý thiết bị |  |  |  | ✓ | ✓ |
| Quản lý bảo trì |  |  |  | ✓ | ✓ |
| Quản lý tài khoản |  |  |  |  | ✓ |
| Phân quyền |  |  |  |  | ✓ |
| Báo cáo phòng |  |  | ✓ |  | ✓ |
| Báo cáo thiết bị |  |  |  | ✓ | ✓ |
| Báo cáo tổng hợp |  |  | Theo quyền | Theo quyền | ✓ |

---

# 17. USE CASE DANH SÁCH TỔNG QUÁT

Các Use Case chính:

### Nhóm Authentication

- UC01 – Đăng nhập.
- UC02 – Đăng xuất.
- UC03 – Đổi mật khẩu.

### Nhóm phòng học

- UC04 – Xem danh sách phòng.
- UC05 – Tìm kiếm phòng.
- UC06 – Xem phòng trống.
- UC07 – Xem chi tiết phòng.
- UC08 – Thêm phòng.
- UC09 – Cập nhật phòng.
- UC10 – Cập nhật trạng thái phòng.

### Nhóm đặt phòng

- UC11 – Tạo yêu cầu đặt phòng.
- UC12 – Xem yêu cầu đặt phòng.
- UC13 – Duyệt đặt phòng.
- UC14 – Từ chối đặt phòng.
- UC15 – Hủy yêu cầu.
- UC16 – Xem lịch sử đặt phòng.

### Nhóm thiết bị

- UC17 – Xem thiết bị.
- UC18 – Tìm kiếm thiết bị.
- UC19 – Thêm thiết bị.
- UC20 – Sửa thiết bị.
- UC21 – Cập nhật tình trạng thiết bị.

### Nhóm mượn thiết bị

- UC22 – Tạo yêu cầu mượn.
- UC23 – Duyệt yêu cầu mượn.
- UC24 – Từ chối yêu cầu.
- UC25 – Xuất thiết bị.
- UC26 – Trả thiết bị.
- UC27 – Xem lịch sử mượn.

### Nhóm bảo trì

- UC28 – Báo hỏng thiết bị.
- UC29 – Tạo phiếu bảo trì.
- UC30 – Cập nhật bảo trì.
- UC31 – Hoàn thành bảo trì.

### Nhóm quản trị

- UC32 – Quản lý người dùng.
- UC33 – Quản lý vai trò.
- UC34 – Phân quyền.
- UC35 – Xem nhật ký hệ thống.

### Nhóm báo cáo

- UC36 – Báo cáo phòng.
- UC37 – Báo cáo thiết bị.
- UC38 – Báo cáo yêu cầu.
- UC39 – Xuất báo cáo.

---

# 18. MÔ TẢ USE CASE CHI TIẾT MẪU

## UC11 – Tạo yêu cầu đặt phòng

**Actor:** Giảng viên/Nhân viên

**Mục đích:**  
Cho phép người dùng tạo yêu cầu sử dụng phòng.

### Tiền điều kiện

- Người dùng đã đăng nhập.
- Tài khoản đang hoạt động.
- Người dùng có quyền đặt phòng.

### Luồng chính

1. Người dùng chọn chức năng Đặt phòng.
2. Hệ thống hiển thị form.
3. Người dùng chọn ngày sử dụng.
4. Người dùng nhập giờ bắt đầu.
5. Người dùng nhập giờ kết thúc.
6. Người dùng nhập số người.
7. Hệ thống tìm phòng phù hợp.
8. Người dùng chọn phòng.
9. Người dùng nhập mục đích.
10. Người dùng nhấn Gửi yêu cầu.
11. Hệ thống kiểm tra dữ liệu.
12. Hệ thống kiểm tra lịch.
13. Hệ thống tạo yêu cầu.
14. Trạng thái được thiết lập là Chờ duyệt.
15. Hệ thống thông báo tạo yêu cầu thành công.

### Luồng ngoại lệ

**A1 – Thời gian không hợp lệ**

Hệ thống hiển thị:

`Giờ kết thúc phải lớn hơn giờ bắt đầu.`

**A2 – Phòng đã có lịch**

Hệ thống hiển thị:

`Phòng đã có lịch sử dụng trong khoảng thời gian này.`

**A3 – Thiếu dữ liệu**

Hệ thống yêu cầu người dùng bổ sung thông tin bắt buộc.

### Hậu điều kiện

Một yêu cầu đặt phòng mới được lưu vào hệ thống.

---

# 19. ACCEPTANCE CRITERIA MẪU

## AC-BOOK-01 – Đặt phòng thành công

**Given:** Người dùng đã đăng nhập và có quyền đặt phòng.

**And:** Phòng A101 đang trống từ 08:00 đến 10:00.

**When:** Người dùng tạo yêu cầu sử dụng phòng A101 từ 08:00 đến 10:00.

**Then:**

- Hệ thống lưu yêu cầu.
- Trạng thái là Chờ duyệt.
- Yêu cầu xuất hiện trong danh sách của người quản lý.

---

## AC-BOOK-02 – Không cho phép trùng lịch

**Given:** Phòng A101 đã có lịch từ 08:00 đến 10:00.

**When:** Một yêu cầu khác được duyệt từ 09:00 đến 11:00.

**Then:**

- Hệ thống không cho phép duyệt.
- Hiển thị cảnh báo trùng lịch.

---

## AC-EQP-01 – Không cho mượn vượt tồn kho

**Given:**

Máy chiếu có:

`available_quantity = 2`

**When:**

Người dùng yêu cầu mượn:

`quantity = 3`

**Then:**

Hệ thống không cho phép duyệt số lượng 3.

---

# 20. WIREFRAME / DANH SÁCH MÀN HÌNH

Hệ thống dự kiến có các màn hình:

1. Login.
2. Dashboard.
3. Danh sách phòng.
4. Chi tiết phòng.
5. Thêm phòng.
6. Cập nhật phòng.
7. Lịch sử dụng phòng.
8. Đặt phòng.
9. Danh sách yêu cầu đặt phòng.
10. Chi tiết yêu cầu.
11. Danh sách thiết bị.
12. Chi tiết thiết bị.
13. Thêm thiết bị.
14. Cập nhật thiết bị.
15. Mượn thiết bị.
16. Danh sách yêu cầu mượn.
17. Phiếu giao thiết bị.
18. Phiếu trả thiết bị.
19. Danh sách bảo trì.
20. Chi tiết bảo trì.
21. Quản lý người dùng.
22. Phân quyền.
23. Báo cáo phòng.
24. Báo cáo thiết bị.
25. Nhật ký hoạt động.
26. Hồ sơ cá nhân.
27. Thông báo.

---

# 21. ƯU TIÊN PHÁT TRIỂN

Có thể chia yêu cầu theo MoSCoW.

## Must Have

Bắt buộc:

- Đăng nhập.
- Phân quyền.
- Quản lý phòng.
- Tìm kiếm phòng.
- Đặt phòng.
- Kiểm tra trùng lịch.
- Duyệt/từ chối đặt phòng.
- Quản lý thiết bị.
- Mượn/trả thiết bị.
- Duyệt/từ chối mượn.
- Quản lý tài khoản.

## Should Have

Nên có:

- Dashboard.
- Thông báo.
- Báo cáo.
- Quản lý bảo trì.
- Lịch sử hoạt động.

## Could Have

Có thể bổ sung:

- QR Code thiết bị.
- QR Code phòng.
- Email notification.
- Import Excel.
- Export Excel/PDF.

## Won't Have – phiên bản hiện tại

Chưa thực hiện:

- IoT.
- Nhận diện khuôn mặt.
- Mobile App riêng.
- Tích hợp hệ thống học tập bên ngoài.

---

# 22. GIẢ ĐỊNH VÀ RÀNG BUỘC

## Giả định

- Mỗi người dùng có tài khoản riêng.
- Nhà trường đã có danh sách phòng.
- Nhà trường đã có danh sách thiết bị.
- Người quản lý chịu trách nhiệm xác nhận dữ liệu thực tế.
- Người dùng có kết nối Internet hoặc mạng nội bộ.

## Ràng buộc

- Người dùng không được truy cập dữ liệu ngoài quyền hạn.
- Hệ thống phải ngăn đặt phòng trùng lịch.
- Thiết bị không được cho mượn vượt số lượng khả dụng.
- Các nghiệp vụ quan trọng phải có lịch sử.

---

# 23. TIÊU CHÍ NGHIỆM THU TOÀN HỆ THỐNG

Hệ thống được xem là đáp ứng phiên bản 1.0 khi:

1. Người dùng có thể đăng nhập đúng vai trò.
2. Người dùng chỉ nhìn thấy chức năng tương ứng quyền của mình.
3. Nhân viên có thể quản lý phòng.
4. Người dùng có thể tìm phòng trống.
5. Người dùng có thể gửi yêu cầu đặt phòng.
6. Người quản lý có thể duyệt/từ chối yêu cầu.
7. Không thể duyệt hai lịch đặt phòng bị trùng.
8. Nhân viên có thể quản lý thiết bị.
9. Người dùng có thể yêu cầu mượn thiết bị.
10. Không thể cho mượn vượt số lượng khả dụng.
11. Hệ thống ghi nhận quá trình mượn và trả.
12. Có thể theo dõi thiết bị hư hỏng và bảo trì.
13. Admin có thể quản lý tài khoản và phân quyền.
14. Dữ liệu được lưu chính xác vào cơ sở dữ liệu.
15. Người không có quyền không thể truy cập chức năng quản trị bằng URL hoặc API.
16. Có thể tra cứu lịch sử hoạt động cơ bản.
17. Có thể xem các báo cáo quản lý chính.

---

# 24. KIẾN TRÚC NGHIỆP VỤ ĐỀ XUẤT

Có thể chia hệ thống thành 6 module chính:

**Module 1 – Authentication & User Management**

→ Login  
→ User  
→ Role  
→ Permission

**Module 2 – Classroom Management**

→ Room  
→ Room Type  
→ Room Schedule  
→ Room Booking

**Module 3 – Equipment Management**

→ Equipment  
→ Equipment Category  
→ Equipment Status

**Module 4 – Borrow Management**

→ Borrow Request  
→ Borrow Detail  
→ Checkout  
→ Return

**Module 5 – Maintenance**

→ Incident  
→ Maintenance  
→ Repair History

**Module 6 – Reporting**

→ Dashboard  
→ Statistics  
→ Reports  
→ Audit Logs

---

# 25. KẾT LUẬN

Hệ thống quản lý phòng học và thiết bị trường học được xây dựng nhằm số hóa hoạt động quản lý cơ sở vật chất của nhà trường.

Giải pháp tập trung vào ba nghiệp vụ chính:

**Quản lý phòng học**

+

**Quản lý thiết bị**

+

**Quản lý yêu cầu sử dụng**

Thông qua cơ chế phân quyền, hệ thống bảo đảm từng nhóm người dùng chỉ thực hiện các nghiệp vụ thuộc trách nhiệm của mình.

Hệ thống giúp giảm thao tác thủ công, hạn chế đặt phòng trùng lịch, kiểm soát tình trạng thiết bị, lưu trữ lịch sử và hỗ trợ nhà trường ra quyết định dựa trên dữ liệu.