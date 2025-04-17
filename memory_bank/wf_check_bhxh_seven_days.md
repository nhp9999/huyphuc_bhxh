## Current tasks from user prompt
- Thêm tính năng kiểm tra mã số BHXH đã kê khai trong 7 ngày để ngăn việc tạo nhiều kê khai cùng mã số BHXH
- Sửa lỗi cột xã NKQ và huyện NKQ ở Danh sách kê khai hiển thị mã thay vì tên

## Plan (simple)
1. Tìm hiểu cấu trúc dữ liệu và API hiện tại liên quan đến kê khai BHYT
2. Tìm kiếm các file liên quan đến việc kê khai BHYT và xử lý mã số BHXH
3. Thiết kế và triển khai API kiểm tra mã số BHXH đã kê khai trong 7 ngày gần nhất
4. Cập nhật giao diện người dùng để hiển thị thông báo và xử lý logic khi người dùng nhập mã số BHXH đã tồn tại
5. Kiểm tra và test tính năng mới

## Steps
1. Tìm kiếm các file liên quan đến kê khai BHYT và xử lý mã số BHXH trong backend
2. Tìm kiếm các file liên quan đến kê khai BHYT và xử lý mã số BHXH trong frontend
3. Thiết kế API endpoint mới để kiểm tra mã số BHXH đã kê khai trong 7 ngày
4. Triển khai API endpoint trong backend
5. Cập nhật service trong frontend để gọi API mới
6. Cập nhật component kê khai BHYT để sử dụng service mới và hiển thị thông báo
7. Kiểm tra và test tính năng mới

## Things done
- Cập nhật file workflow để theo dõi tiến độ công việc
- Tìm kiếm các file liên quan đến kê khai BHYT và xử lý mã số BHXH trong backend
- Tìm kiếm các file liên quan đến kê khai BHYT và xử lý mã số BHXH trong frontend
- Thiết kế API endpoint mới để kiểm tra mã số BHXH đã kê khai trong 7 ngày
- Triển khai API endpoint trong backend (thêm endpoint `check-ma-so-bhxh` vào KeKhaiBHYTController)
- Cập nhật service trong frontend để gọi API mới (thêm phương thức `checkMaSoBHXH` vào KeKhaiBHYTService)
- Cập nhật component kê khai BHYT để sử dụng service mới và hiển thị thông báo (cập nhật phương thức `onSearchBHYT` và thêm phương thức `continueSearchBHXH`)
- Sửa lỗi TypeScript trong component KeKhaiBHYTComponent
- Cập nhật phương thức `handleSearchMultipleOk` để kiểm tra nhiều mã số BHXH đã kê khai trong 7 ngày
- Thêm phương thức mới `continueMultipleSearch` để tách logic xử lý nhiều mã số BHXH
- Kiểm tra code đã triển khai và xác nhận tính đúng đắn của giải pháp
- Sửa lỗi cột xã NKQ và huyện NKQ ở Danh sách kê khai hiển thị mã thay vì tên:
  - Thêm phương thức `preloadXaData()` và `preloadHuyenData()` để tải trước dữ liệu địa chỉ
  - Cải thiện phương thức `getXaTen()` và `getHuyenTen()` để tìm kiếm tên hiệu quả hơn
  - Thêm thuộc tính `xa_nkq_ten` và `huyen_nkq_ten` vào interface KeKhaiBHYT
  - Cập nhật giao diện HTML để hiển thị tên xã và tên huyện

## Things not done yet
- Kiểm tra và test tính năng mới trong môi trường thực tế
