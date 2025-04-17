# Tài liệu tóm tắt tính năng xuất D03 từ lịch sử kê khai

## 1. Tổng quan

Tính năng xuất D03 từ lịch sử kê khai cho phép người dùng xuất file Excel mẫu D03-TS cho một hoặc nhiều bản ghi BHYT/BHXH đã được kê khai trong hệ thống. Tính năng này giúp người dùng dễ dàng tạo các báo cáo D03 chuẩn xác và đẹp mắt mà không cần phải nhập lại dữ liệu thủ công.

## 2. Các tính năng chính

### 2.1. Xuất D03 cho một bản ghi
- Cho phép xuất file Excel mẫu D03-TS cho một bản ghi BHYT hoặc BHXH cụ thể
- Tự động điền đầy đủ thông tin người tham gia, số tiền, thời gian đóng, v.v.
- Định dạng ngày tháng theo chuẩn dd/MM/yyyy

### 2.2. Xuất D03 cho nhiều bản ghi
- Cho phép chọn nhiều bản ghi cùng lúc bằng checkbox
- Hỗ trợ chức năng "Chọn tất cả" để chọn nhanh tất cả bản ghi
- Hiển thị số lượng bản ghi đã chọn trên nút xuất D03
- Tự động tính toán và hiển thị tổng số tiền cho tất cả bản ghi

### 2.3. Giao diện người dùng
- Nút xuất D03 được đặt ở header của màn hình để dễ tiếp cận
- Checkbox cho phép chọn nhiều bản ghi cùng lúc
- Thông báo rõ ràng khi xuất thành công hoặc thất bại

## 3. Kiến trúc kỹ thuật

### 3.1. Backend
- Endpoint API: `GET /api/d03/record/{loaiKeKhai}/{keKhaiId}`
- Controller: `D03Controller.cs`
- Xử lý dữ liệu và định dạng ngày tháng chuẩn xác

### 3.2. Frontend
- Component: `LichSuKeKhaiComponent`
- Service: `D03Service`
- Sử dụng ExcelJS để tạo và định dạng file Excel
- Sử dụng file-saver để tải file Excel về máy người dùng

### 3.3. Luồng dữ liệu
1. Người dùng chọn một hoặc nhiều bản ghi và nhấn nút "Xuất D03"
2. Frontend gọi API để lấy dữ liệu D03 cho (các) bản ghi đã chọn
3. Backend truy vấn dữ liệu và trả về thông tin D03
4. Frontend sử dụng ExcelJS để tạo file Excel từ template có sẵn
5. Frontend điền dữ liệu vào file Excel và định dạng theo chuẩn
6. File Excel được tải về máy người dùng

## 4. Cách sử dụng

### 4.1. Xuất D03 cho một bản ghi
1. Truy cập màn hình "Lịch sử kê khai"
2. Tìm kiếm bản ghi cần xuất D03
3. Chọn checkbox bên trái bản ghi đó
4. Nhấn nút "Xuất D03" ở header

### 4.2. Xuất D03 cho nhiều bản ghi
1. Truy cập màn hình "Lịch sử kê khai"
2. Chọn checkbox bên trái các bản ghi cần xuất D03 (hoặc nhấn "Chọn tất cả")
3. Nhấn nút "Xuất D03" ở header

## 5. Xử lý lỗi và giới hạn

### 5.1. Xử lý lỗi
- Hiển thị thông báo lỗi rõ ràng khi không thể tải template Excel
- Xử lý các trường hợp dữ liệu không hợp lệ hoặc thiếu
- Log lỗi chi tiết để dễ dàng debug

### 5.2. Giới hạn
- Hiệu suất có thể giảm khi xuất số lượng lớn bản ghi cùng lúc
- Cần kiểm tra kỹ lưỡng trên các trình duyệt khác nhau

## 6. Cải tiến trong tương lai

### 6.1. Cải tiến đã lên kế hoạch
- Tối ưu hiệu suất khi xuất nhiều bản ghi cùng lúc
- Thêm tùy chọn tùy chỉnh template Excel
- Hỗ trợ xuất file PDF từ template D03

### 6.2. Kiểm thử
- Kiểm thử đầy đủ trên các trình duyệt khác nhau
- Kiểm thử với số lượng lớn bản ghi
- Kiểm thử với các loại dữ liệu khác nhau

## 7. Kết luận

Tính năng xuất D03 từ lịch sử kê khai là một công cụ mạnh mẽ giúp người dùng dễ dàng tạo các báo cáo D03 chuẩn xác và đẹp mắt. Với giao diện thân thiện và khả năng xử lý nhiều bản ghi cùng lúc, tính năng này sẽ giúp tiết kiệm thời gian và công sức cho người dùng.
