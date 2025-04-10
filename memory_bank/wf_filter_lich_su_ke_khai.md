# Workflow: Filter lịch sử kê khai

## Nhiệm vụ hiện tại
- Cập nhật hệ thống sao cho lịch sử kê khai chỉ hiển thị các kê khai mà tài khoản đó tạo

## Kế hoạch
Kiểm tra và cập nhật các controller liên quan đến lịch sử kê khai để đảm bảo rằng dữ liệu được lọc theo người dùng đang đăng nhập, trừ khi người dùng có quyền admin.

## Các bước
1. Xác định controller xử lý lịch sử kê khai
2. Xem xét cách dữ liệu được truy xuất hiện tại
3. Thêm điều kiện lọc theo người tạo (nguoi_tao)
4. Đảm bảo admin vẫn có thể xem tất cả dữ liệu
5. Kiểm tra việc xuất dữ liệu ra file Excel

## Đã hoàn thành
- Đã xác định controller xử lý lịch sử kê khai (LichSuKeKhaiController)
- Đã thêm logic để lấy thông tin người dùng hiện tại
- Đã thêm điều kiện kiểm tra vai trò người dùng
- Đã thêm điều kiện lọc dữ liệu theo người tạo nếu không phải admin/super_admin
- Đã cập nhật cả 4 phương thức trong controller:
  - GetLichSuKeKhai: Lấy lịch sử kê khai BHYT
  - ExportLichSuKeKhai: Xuất file Excel lịch sử kê khai BHYT
  - GetLichSuKeKhaiBHXH: Lấy lịch sử kê khai BHXH
  - ExportLichSuKeKhaiBHXH: Xuất file Excel lịch sử kê khai BHXH

## Chưa hoàn thành
- Kiểm tra và xác nhận chức năng trên môi trường thực tế 