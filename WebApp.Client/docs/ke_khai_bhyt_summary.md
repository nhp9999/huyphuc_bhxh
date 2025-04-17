# Tài liệu tóm tắt tính năng kê khai BHYT

## Mục đích

Tính năng kê khai BHYT trong hệ thống BHXH được phát triển nhằm:

- Hỗ trợ đại lý thu BHXH quản lý việc kê khai bảo hiểm y tế cho người tham gia
- Tự động hóa quy trình tìm kiếm thông tin BHXH từ hệ thống SSMV2
- Tính toán chính xác số tiền phải đóng dựa trên phương án đóng
- Quản lý thông tin cá nhân và biên lai thu tiền
- Tích hợp với hệ thống quản lý đợt kê khai và thanh toán

## Quy trình kê khai BHYT

### 1. Tìm kiếm thông tin BHXH
- Kết nối với hệ thống SSMV2 để tìm kiếm thông tin BHXH của người tham gia
- Có thể yêu cầu đăng nhập vào hệ thống SSMV2 để truy xuất dữ liệu
- Hiển thị thông tin BHXH hiện có (nếu có) để người dùng xác nhận

### 2. Nhập thông tin cá nhân
- Nhập các thông tin cơ bản: họ tên, CCCD/CMND, ngày sinh, giới tính
- Nhập thông tin địa chỉ: tỉnh/thành phố, quận/huyện, phường/xã, địa chỉ cụ thể
- Nhập thông tin liên hệ: số điện thoại, email

### 3. Nhập thông tin BHYT
- Nhập/xác nhận số thẻ BHYT, mã số BHXH
- Chọn phương án đóng BHYT (theo tháng, quý, 6 tháng, năm)
- Hệ thống tự động tính toán số tiền phải đóng

### 4. Xử lý biên lai
- Tạo biên lai thu tiền với thông tin: số biên lai, ngày biên lai, số tiền
- Liên kết với quyển biên lai hiện có trong hệ thống
- Lưu trữ thông tin biên lai để theo dõi và báo cáo

### 5. Hoàn thành kê khai
- Lưu thông tin kê khai vào hệ thống
- Liên kết với đợt kê khai hiện tại
- Cập nhật trạng thái và thống kê của đợt kê khai

## Mô hình dữ liệu

### Thông tin cá nhân
- Họ tên: Tên đầy đủ của người tham gia BHYT
- CCCD/CMND: Số căn cước công dân hoặc chứng minh nhân dân
- Ngày sinh: Ngày tháng năm sinh
- Giới tính: Nam/Nữ
- Địa chỉ: Thông tin địa chỉ đầy đủ (tỉnh, huyện, xã, địa chỉ chi tiết)

### Thông tin BHXH/BHYT
- Số thẻ BHYT: Mã định danh thẻ bảo hiểm y tế
- Mã số BHXH: Mã số bảo hiểm xã hội của người tham gia
- Phương án đóng: Hình thức đóng phí (tháng, quý, 6 tháng, năm)
- Số tiền đóng: Số tiền phải đóng dựa trên phương án đã chọn

### Thông tin biên lai
- Số biên lai: Mã định danh của biên lai
- Ngày biên lai: Ngày tạo biên lai
- Quyển biên lai: Thông tin về quyển biên lai (quyển số, từ số, đến số)
- Nhân viên thu: Người thực hiện thu tiền

## Giao diện người dùng

### Màn hình tìm kiếm thông tin BHXH
- Form tìm kiếm với các trường: CCCD/CMND, họ tên, ngày sinh
- Kết quả tìm kiếm hiển thị thông tin BHXH hiện có
- Nút "Tiếp tục" để chuyển sang bước nhập thông tin

### Màn hình nhập thông tin cá nhân
- Form nhập thông tin cá nhân với các trường bắt buộc
- Các dropdown chọn địa chỉ (tỉnh, huyện, xã)
- Kiểm tra và xác thực dữ liệu nhập vào

### Màn hình nhập thông tin BHYT
- Form nhập thông tin BHYT
- Dropdown chọn phương án đóng
- Hiển thị số tiền phải đóng được tính tự động

### Màn hình xử lý biên lai
- Form nhập thông tin biên lai
- Dropdown chọn quyển biên lai
- Hiển thị thông tin biên lai đã tạo

## Tích hợp với các module khác

### Tích hợp với module Quản lý đợt kê khai
- Liên kết kê khai BHYT với đợt kê khai hiện tại
- Cập nhật thống kê của đợt kê khai (tổng số thẻ, tổng số tiền)

### Tích hợp với module Quản lý biên lai
- Sử dụng quyển biên lai từ hệ thống quản lý biên lai
- Cập nhật trạng thái của biên lai đã sử dụng

### Tích hợp với module Thanh toán
- Liên kết với quy trình thanh toán của đợt kê khai
- Hỗ trợ tạo mã QR thanh toán (qua VietQR API)

## Báo cáo và xuất dữ liệu

### Xuất danh sách kê khai
- Xuất danh sách kê khai BHYT theo đợt kê khai
- Hỗ trợ xuất file Excel, PDF

### Xuất mẫu D03
- Tạo báo cáo theo mẫu D03 của BHXH
- Hỗ trợ xuất file Word, PDF

### Thống kê và báo cáo
- Thống kê số lượng kê khai theo thời gian
- Báo cáo tổng hợp theo đợt kê khai

## Cải tiến và phát triển

### Cải thiện UX
- Tối ưu quy trình tìm kiếm và điền thông tin BHXH
- Cải thiện giao diện người dùng để dễ sử dụng hơn

### Tăng cường xác thực dữ liệu
- Kiểm tra và xác thực dữ liệu nhập vào
- Cảnh báo lỗi và gợi ý sửa lỗi

### Tối ưu hiệu suất
- Tối ưu hiệu suất khi tải danh sách địa chỉ lớn
- Cải thiện tốc độ tìm kiếm thông tin BHXH
