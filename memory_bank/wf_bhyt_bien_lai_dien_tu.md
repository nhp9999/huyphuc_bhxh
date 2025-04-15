## Current tasks from user prompt
- Tìm hiểu cách xác định đợt kê khai BHYT có sử dụng biên lai điện tử hay không khi bấm nút gửi
- Chỉnh sửa để chỉ kiểm tra thuộc tính is_bien_lai_dien_tu thay vì cả is_bien_lai_dien_tu và bien_lai_dien_tu
- Tạo SQL xóa cột bien_lai_dien_tu khỏi bảng dot_ke_khai
- Cập nhật chức năng thêm mới đợt kê khai để sử dụng is_bien_lai_dien_tu

## Plan (simple)
1. Nghiên cứu component kê khai BHYT để hiểu quy trình gửi kê khai
2. Tìm hiểu về cấu trúc dữ liệu của đợt kê khai và biên lai
3. Xác định cách hệ thống quyết định sử dụng biên lai điện tử
4. Tìm kiếm các thông số hoặc cờ đánh dấu liên quan đến biên lai điện tử
5. Chỉnh sửa code để chỉ kiểm tra thuộc tính is_bien_lai_dien_tu
6. Triển khai thay đổi vào code thực tế
7. Tạo SQL để xóa cột bien_lai_dien_tu không cần thiết
8. Cập nhật chức năng thêm mới đợt kê khai để sử dụng is_bien_lai_dien_tu

## Steps
1. Kiểm tra file ke-khai-bhyt.component.ts để hiểu quy trình gửi kê khai
2. Tìm kiếm các phương thức liên quan đến việc gửi kê khai và xử lý biên lai
3. Kiểm tra các model và service liên quan đến biên lai và đợt kê khai
4. Xác định logic xử lý biên lai điện tử trong hệ thống
5. Hướng dẫn chỉnh sửa phương thức loadDotKeKhai() để chỉ kiểm tra is_bien_lai_dien_tu
6. Triển khai thay đổi bằng cách sử dụng PowerShell để chỉnh sửa file
7. Tìm kiếm thông tin về bảng dot_ke_khai và cột bien_lai_dien_tu
8. Tạo SQL để xóa cột bien_lai_dien_tu
9. Tìm kiếm và cập nhật interface CreateDotKeKhai để sử dụng is_bien_lai_dien_tu
10. Cập nhật component DotKeKhaiComponent để sử dụng is_bien_lai_dien_tu trong form và phương thức submitForm

## Things done
- Đọc file long_term.md để hiểu về dự án
- Phân tích component kê khai BHYT
- Tìm hiểu về cách xác định biên lai điện tử
- Tìm ra cách kiểm tra đợt kê khai có sử dụng biên lai điện tử hay không
- Hướng dẫn chỉnh sửa code để chỉ kiểm tra thuộc tính is_bien_lai_dien_tu
- Triển khai thay đổi vào code thực tế bằng PowerShell
- Kiểm tra lại để đảm bảo thay đổi đã được áp dụng đúng
- Tìm kiếm thông tin về bảng dot_ke_khai trong model DotKeKhai.cs
- Tạo file SQL (database/remove_bien_lai_dien_tu.sql) để xóa cột bien_lai_dien_tu
- Cập nhật interface CreateDotKeKhai để sử dụng is_bien_lai_dien_tu
- Cập nhật component DotKeKhaiComponent để sử dụng is_bien_lai_dien_tu trong form và phương thức submitForm

## Things not done yet
- Không còn tác vụ nào chưa hoàn thành
