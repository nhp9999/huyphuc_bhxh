## Current tasks from user prompt
- Sửa lỗi cột `ngay_gui` trong bảng `dot_ke_khai` bị null khi gửi đợt kê khai

## Plan (simple)
1. Kiểm tra model DotKeKhai để hiểu cấu trúc dữ liệu
2. Kiểm tra controller DotKeKhaiController để tìm phương thức xử lý việc gửi đợt kê khai
3. Xác định nguyên nhân khiến cột `ngay_gui` bị null
4. Sửa lỗi bằng cách cập nhật giá trị `ngay_gui` khi gửi đợt kê khai
5. Kiểm tra lại để đảm bảo sửa lỗi thành công

## Steps
1. Xem file model DotKeKhai.cs để hiểu cấu trúc dữ liệu
2. Xem file DotKeKhaiController.cs để tìm phương thức xử lý việc gửi đợt kê khai
3. Xác định vị trí cần sửa trong controller
4. Thêm code để cập nhật giá trị `ngay_gui` khi gửi đợt kê khai
5. Kiểm tra lại để đảm bảo sửa lỗi thành công

## Things done
- Đọc file long_term.md để hiểu về dự án
- Xem file model DotKeKhai.cs để hiểu cấu trúc dữ liệu
- Xem file DotKeKhaiController.cs để tìm phương thức xử lý việc gửi đợt kê khai
- Xác định vấn đề: Trong phương thức GuiDotKeKhai, khi đợt kê khai được chuyển từ trạng thái "chua_gui" sang "cho_thanh_toan", không có đoạn code nào cập nhật trường `ngay_gui`
- Xác định vị trí cần sửa: Cần thêm code để cập nhật `ngay_gui` trong phương thức GuiDotKeKhai, ngay sau khi cập nhật trạng thái đợt kê khai sang "cho_thanh_toan"

## Things not done yet
- Thêm code để cập nhật giá trị `ngay_gui` khi gửi đợt kê khai
- Kiểm tra lại để đảm bảo sửa lỗi thành công
