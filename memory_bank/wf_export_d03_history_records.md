# Workflow: Export D03 History Records

## Current tasks from user prompt
- Xuất D03 từ lịch sử kê khai
- Sửa lỗi định dạng ngày sinh trong file Excel
- Thêm checkbox để chọn nhiều bảng ghi và xuất D03 cùng lúc

## Plan (simple)
1. Phân tích và hiểu cấu trúc hệ thống hiện tại
2. Phát triển backend API để lấy dữ liệu D03 cho từng bảng ghi
3. Phát triển frontend để hiển thị nút xuất D03 cho từng bảng ghi
4. Sửa lỗi định dạng ngày sinh trong file Excel
5. Thêm tính năng chọn nhiều bảng ghi và xuất D03 cùng lúc

## Steps
1. Tạo endpoint mới trong D03Controller.cs để lấy dữ liệu D03 cho một bảng ghi cụ thể
2. Thêm phương thức mới trong D03Service.ts để gọi API và xuất Excel
3. Cập nhật giao diện LichSuKeKhaiComponent để hiển thị nút xuất D03
4. Sửa cách xử lý ngày sinh trong D03Controller.cs và D03Service.ts
5. Thêm checkbox và chức năng chọn nhiều bảng ghi trong LichSuKeKhaiComponent
6. Thêm phương thức xuất D03 cho nhiều bảng ghi đã chọn

## Things done
1. Đã tạo endpoint mới `GET /api/d03/record/{loaiKeKhai}/{keKhaiId}` trong D03Controller.cs
2. Đã thêm phương thức `getD03DataForRecord` và `xuatExcelMauD03TSTuBangGhi` trong D03Service.ts
3. Đã thêm cột "Thao tác" với nút xuất D03 vào bảng lịch sử kê khai
4. Đã sửa lỗi hiển thị ngày sinh trong file Excel:
   - Sửa cách xử lý ngày sinh trong D03Controller.cs
   - Cải thiện cách xử lý ngày sinh trong D03Service.ts
5. Đã thêm checkbox vào mỗi dòng trong bảng lịch sử kê khai
6. Đã thêm nút "Xuất D03" cho các bảng ghi đã chọn
7. Đã thêm phương thức `xuatD03TuNhieuBangGhi` để xuất D03 cho nhiều bảng ghi cùng lúc

## Things not done yet
1. Kiểm thử đầy đủ tính năng trên giao diện người dùng
2. Tối ưu hiệu suất khi xuất nhiều bảng ghi cùng lúc
3. Triển khai tính năng lên hệ thống production
