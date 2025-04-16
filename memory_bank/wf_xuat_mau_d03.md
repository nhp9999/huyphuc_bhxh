# Workflow: xuat_mau_d03

## Current tasks from user prompt
- Tạo chức năng xuất excel mẫu d03-ts cho hệ thống BHXH

## Plan (simple)
1. Tìm hiểu cấu trúc dự án và các service liên quan
2. Xác định các trường thông tin cần xuất cho mẫu D03-TS
3. Tạo service D03 cho việc xử lý dữ liệu
4. Thêm chức năng xuất Excel vào service D03
5. Tạo các model/interface cần thiết
6. Tích hợp với API backend (nếu cần)
7. Kiểm tra và test chức năng

## Steps
1. Tìm hiểu cấu trúc thư mục và các service hiện có
2. Tìm kiếm các file liên quan đến xuất Excel trong dự án hiện tại
3. Tạo D03Service với phương thức xuất Excel
4. Tạo các interface/model cho D03
5. Thêm chức năng xuất Excel mẫu D03-TS
6. Kiểm tra và test chức năng

## Things done
- Tạo file workflow để theo dõi tiến độ
- Tìm hiểu cấu trúc thư mục và các service hiện có
- Tìm kiếm các file liên quan đến xuất Excel trong dự án
- Tạo D03Service với các interface/model và phương thức xuất Excel
- Tạo component XuatMauD03Component với form cho phép người dùng chọn tùy chọn xuất Excel
- Tích hợp component vào routing của ứng dụng
- Sửa lỗi biên dịch cho component và service
- Sửa lỗi URL API bị trùng lặp
- Cập nhật service để sử dụng file Excel template thay vì tạo mới
- Cập nhật interface D03TSOptions theo yêu cầu mới
- Cập nhật component XuatMauD03Component để hỗ trợ xuất dữ liệu từ template

## Things not done yet
- Tạo file template Excel mẫu D03-TS (d03-ts-template.xlsx) và thêm vào thư mục assets/templates
- Kiểm tra và test chức năng xuất Excel với dữ liệu thực
- Kiểm tra các vị trí điền dữ liệu trong file template (có thể cần điều chỉnh các dòng/cột trong code)
