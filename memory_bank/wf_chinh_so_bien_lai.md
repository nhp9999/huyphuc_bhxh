# Workflow: Chỉnh số hiện tại và trạng thái của quyển biên lai điện tử

## Current tasks from user prompt
- Tìm hiểu cách chỉnh số hiện tại của quyển biên lai điện tử
- Triển khai chức năng chỉnh sửa số hiện tại của quyển biên lai điện tử
- Sửa lỗi network khi gửi request chỉnh sửa quyển biên lai
- Thêm chức năng chỉnh sửa trạng thái quyển biên lai

## Plan (simple)
1. Tìm kiếm và phân tích mã nguồn liên quan đến quyển biên lai điện tử
2. Xác định model, controller và service liên quan
3. Tìm các hàm xử lý việc cập nhật số hiện tại
4. Tìm UI liên quan đến chỉnh sửa quyển biên lai
5. Cập nhật UI để có thể chỉnh sửa số hiện tại
6. Cập nhật controller để cho phép giảm số hiện tại xuống thấp hơn trong trường hợp cần thiết
7. Hướng dẫn quy trình chỉnh sửa số hiện tại của quyển biên lai
8. Kiểm tra và sửa lỗi network khi gửi request
9. Thêm chức năng chỉnh sửa trạng thái quyển biên lai

## Steps
1. Tìm kiếm mã nguồn liên quan đến "quyển biên lai"
2. Kiểm tra model Quyển biên lai trong WebApp.Server
3. Tìm controller và service xử lý quyển biên lai
4. Kiểm tra UI component trong WebApp.Client
5. Phân tích code xử lý cập nhật số hiện tại
6. Cập nhật UI để có thể chỉnh sửa số hiện tại
7. Cập nhật controller để xử lý trường hợp giảm số hiện tại
8. Tổng hợp hướng dẫn cách chỉnh số hiện tại
9. Kiểm tra các lỗi network
10. Sửa lỗi trong component gửi request
11. Sửa lỗi LINQ không thể chuyển đổi trong controller
12. Thêm trường chọn trạng thái vào form chỉnh sửa
13. Cập nhật component để xử lý thay đổi trạng thái
14. Thêm xác nhận khi thay đổi thành trạng thái đã sử dụng hết
15. Cập nhật giao diện hiển thị trạng thái với màu sắc phù hợp

## Things done
- Tạo workflow mới để theo dõi task
- Tìm kiếm và phân tích mã nguồn liên quan
- Xác định các thành phần liên quan 
- Cập nhật UI để thêm chức năng chỉnh sửa số hiện tại
- Cập nhật logic kiểm tra số hiện tại hợp lệ
- Cập nhật controller QuyenBienLaiDienTuController để hỗ trợ việc giảm số hiện tại
- Thêm kiểm tra tính khả thi khi giảm số hiện tại (kiểm tra xem đã có biên lai nào được cấp cho số này chưa)
- Bổ sung thông báo lỗi chi tiết và log để dễ theo dõi
- Phát hiện và sửa lỗi trong component khi gửi request chỉnh sửa
- Sửa lỗi Entity Framework không thể dịch int.Parse trong biểu thức LINQ
- Thêm trường chọn trạng thái vào form chỉnh sửa quyển biên lai điện tử
- Thêm cảnh báo khi chọn trạng thái "đã sử dụng hết"
- Thêm hộp thoại xác nhận khi thay đổi sang trạng thái "đã sử dụng hết"
- Cập nhật hiển thị tag trạng thái với các màu sắc tương ứng

## Things not done yet
- Kiểm tra xem cách cập nhật số hiện tại và trạng thái có hoạt động đúng sau khi triển khai và sửa lỗi

## Kết quả triển khai

### Thay đổi đã thực hiện:

1. **Cập nhật UI**:
   - Đã thêm trường "số hiện tại" vào form chỉnh sửa quyển biên lai điện tử
   - Thêm trường "trạng thái" với các tùy chọn: Chưa sử dụng, Đang active, Không active, Đã sử dụng hết
   - Thêm validation để đảm bảo số hiện tại nằm trong khoảng từ số đến số
   - Hiển thị cảnh báo khi chọn trạng thái "đã sử dụng hết"
   - Cập nhật hiển thị tag trạng thái trong bảng với màu sắc tương ứng

2. **Cập nhật controller**:
   - Cho phép giảm số hiện tại xuống thấp hơn giá trị hiện có
   - Kiểm tra xem có biên lai nào đã được cấp với số trong khoảng giảm không
   - Thêm log chi tiết về quá trình cập nhật
   - Trả về thông báo lỗi rõ ràng hơn
   - Sửa lỗi LINQ không thể chuyển đổi bằng cách thay đổi cách kiểm tra biên lai xung đột

3. **Cập nhật component**:
   - Xác nhận trước khi thay đổi sang trạng thái "đã sử dụng hết"
   - Khởi tạo và xử lý giá trị trạng thái trong form
   - Cải thiện UX bằng cách hiển thị trạng thái với màu sắc phù hợp

4. **Sửa lỗi network**:
   - Sửa lỗi "ID không khớp với dữ liệu cập nhật" khi gửi request PUT bằng cách thêm trường id vào dữ liệu form
   - Sửa lỗi 500 Internal Server Error do Entity Framework không thể chuyển đổi int.Parse trong biểu thức LINQ

### Vấn đề đã phát hiện và sửa chữa:
1. Lỗi ID không khớp: Object formData gửi đi không có trường id, dẫn đến việc so sánh id trên server không khớp. Giải pháp là thêm trường id vào formData trước khi gửi request.
2. Lỗi Entity Framework: Expression LINQ sử dụng int.Parse không thể được dịch thành SQL. Giải pháp là lấy toàn bộ danh sách biên lai từ database, sau đó thực hiện lọc biên lai xung đột ở phía ứng dụng thay vì database.

### Hướng dẫn cách chỉnh số hiện tại và trạng thái của quyển biên lai điện tử

#### 1. Cách chỉnh số hiện tại và trạng thái:
1. Đăng nhập vào hệ thống với tài khoản có quyền quản lý quyển biên lai điện tử
2. Vào phần quản lý quyển biên lai điện tử (Mục "Biên lai" -> "Quyển biên lai điện tử")
3. Tìm quyển biên lai cần điều chỉnh 
4. Nhấn nút "Chỉnh sửa" (biểu tượng bút chì) bên cạnh quyển biên lai
5. Trong form chỉnh sửa:
   - Nhập giá trị mới vào trường "Số hiện tại"
   - Chọn trạng thái phù hợp từ dropdown "Trạng thái"
6. Nhấn nút "Cập nhật" để lưu thay đổi
7. Nếu chọn trạng thái "Đã sử dụng hết", sẽ có hộp thoại xác nhận hiện lên

#### 2. Lưu ý khi chỉnh sửa:
- Số hiện tại phải nằm trong khoảng giữa "Từ số" và "Đến số" của quyển biên lai
- Không thể giảm số hiện tại xuống số đã có biên lai được cấp
- Chỉ nên đặt trạng thái "Đã sử dụng hết" khi không còn sử dụng quyển biên lai nữa
- Trạng thái "Đang active" cho phép sử dụng quyển biên lai để cấp biên lai mới
- Trạng thái "Không active" tạm thời ngừng sử dụng quyển biên lai
- Khi tạo biên lai mới, hệ thống sẽ sử dụng quyển có trạng thái "active" và lấy số hiện tại của quyển đó

#### 3. Các trường hợp cần điều chỉnh số hiện tại và trạng thái:
- Khi phát hiện lỗi trong việc cấp số biên lai
- Khi muốn bỏ qua một số biên lai do lỗi kỹ thuật
- Khi cần đồng bộ số biên lai với hệ thống khác
- Khi cần điều chỉnh số biên lai theo yêu cầu từ cơ quan BHXH
- Khi cần chuyển đổi giữa các quyển biên lai (active/inactive)
- Khi quyển biên lai đã hết số và cần đánh dấu "Đã sử dụng hết" 