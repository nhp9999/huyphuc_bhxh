# Workflow: Tích hợp biên lai điện tử

## Current tasks
- Tích hợp biên lai điện tử với ký hiệu BH25-AG/08907/E
- Số biên lai gồm 7 chữ số, bắt đầu từ 0000001 và tăng dần
- Thêm trường mã cơ quan bhxh khi thêm quyển biên lai điện tử
- Tự động lấy thông tin người cấp từ tài khoản đăng nhập hiện tại

## Plan (simple)
1. Phân tích yêu cầu và hiểu cấu trúc dữ liệu hiện tại
2. Mở rộng model để hỗ trợ biên lai điện tử
3. Cập nhật backend API để quản lý biên lai điện tử
4. Cập nhật giao diện người dùng để sử dụng biên lai điện tử

## Steps
1. Phân tích cấu trúc dữ liệu hiện tại liên quan đến biên lai
2. Tìm hiểu model Quyển biên lai hiện tại
3. Mở rộng model để thêm thuộc tính cho biên lai điện tử (ký hiệu, loại biên lai)
4. Cập nhật API để quản lý biên lai điện tử
5. Cập nhật giao diện để hiển thị và quản lý biên lai điện tử
6. Kiểm tra chức năng tăng số biên lai tự động
7. Thêm trường mã cơ quan BHXH vào quyển biên lai điện tử
8. Tự động lấy thông tin người cấp từ tài khoản đăng nhập

## Things done
- Tạo file workflow cho tích hợp biên lai điện tử
- Phân tích cấu trúc dữ liệu hiện tại liên quan đến biên lai
- Tạo model QuyenBienLaiDienTu với ký hiệu BH25-AG/08907/E và số biên lai bắt đầu từ 0000001
- Tạo model BienLaiDienTu
- Cập nhật ApplicationDbContext để thêm DbSet cho biên lai điện tử
- Tạo API Controller QuyenBienLaiDienTuController để quản lý quyển biên lai điện tử
- Tạo API Controller BienLaiDienTuController để quản lý biên lai điện tử với số biên lai tự động tăng
- Đảm bảo ký hiệu biên lai luôn là BH25-AG/08907/E
- Đảm bảo số biên lai có 7 chữ số, bắt đầu từ 0000001 và tăng dần
- Tạo script SQL để thêm bảng biên lai điện tử vào database
- Tạo migration để cập nhật database
- Tạo model TypeScript cho biên lai điện tử trong Angular
- Tạo service để tương tác với API biên lai điện tử
- Tạo component QuyenBienLaiDienTuComponent để quản lý quyển biên lai điện tử
- Tạo component QuanLyBienLaiDienTuComponent để quản lý biên lai điện tử
- Sửa lỗi nzOkType trong component QuyenBienLaiDienTuComponent
- Tạo module BienLaiDienTuModule khai báo các component liên quan
- Cập nhật hệ thống routing để thêm các component vào router
- Cập nhật menu sidebar để thêm liên kết đến chức năng biên lai điện tử
- Tạo service để lấy danh sách người dùng cho dropdown người thu
- Kết nối component với service người dùng
- Sửa lỗi BienLaiDienTuModule - chuyển các component thành standalone
- Sửa lỗi kiểu dữ liệu trong các component để hỗ trợ TypeScript nghiêm ngặt
- Thêm imports cần thiết cho các component standalone
- Di chuyển hàm formatterVND từ thẻ script HTML sang component class
- Sửa lỗi TypeScript cho kiểu dữ liệu undefined trong các phương thức xử lý trạng thái
- Sửa lỗi URL API bị trùng `/api/` trong service BienLaiDienTuService
- Sửa lỗi URL API bị trùng `/api/` trong service UsersService
- Khảo sát và xác định lỗi 500 từ backend do chưa có bảng biên lai điện tử trên database
- Cập nhật CSS để sửa lỗi hiển thị modal không hiển thị đúng các trường nhập liệu
- Sửa lỗi hiển thị modal bằng cách thêm thuộc tính nzBodyStyle và cấu trúc nzModalContent
- Cải thiện xử lý lỗi với catchError và nâng cao trải nghiệm người dùng trong trường hợp có lỗi
- Xóa dữ liệu mẫu tạm thời để sử dụng API thực tế sau khi database được cập nhật
- Sửa tên bảng tham chiếu trong FOREIGN KEY từ 'users' sang 'nguoi_dung' trong script SQL
- Sửa API endpoint trong UsersService từ '/users' sang '/nguoi-dung' để tương thích với API thực tế
- Sửa lỗi hiển thị danh sách người thu bằng cách cập nhật interface NguoiDung và sửa cách dùng thuộc tính từ API
- Thêm trường ma_co_quan_bhxh vào model QuyenBienLaiDienTu trong C#
- Tạo migration cho việc thêm trường ma_co_quan_bhxh
- Tạo script SQL để cập nhật database với trường ma_co_quan_bhxh
- Cập nhật QuyenBienLaiDienTuController để xử lý trường ma_co_quan_bhxh khi tạo và cập nhật quyển biên lai điện tử
- Cập nhật model TypeScript cho QuyenBienLaiDienTu để thêm trường ma_co_quan_bhxh
- Cập nhật giao diện form thêm mới và chỉnh sửa quyển biên lai điện tử để thêm trường nhập mã cơ quan BHXH
- Cập nhật bảng hiển thị để hiển thị trường ma_co_quan_bhxh
- Cập nhật QuyenBienLaiDienTuController để tự động lấy thông tin người cấp từ người dùng đăng nhập hiện tại
- Cập nhật form trong QuyenBienLaiDienTuComponent để ẩn trường người cấp và hiển thị thông báo về việc tự động lấy từ người đăng nhập
- Cập nhật xử lý dữ liệu trong TypeScript để gửi giá trị rỗng cho trường người cấp
- Hiển thị người cấp trong bảng danh sách và trong form chỉnh sửa (chỉ đọc)

## Things not done yet
- Cập nhật database trên máy chủ với các bảng mới bằng cách chạy script SQL trong thư mục Migrations/Scripts
- Chạy script AddMaCoQuanBHXHToQuyenBienLaiDienTu.sql để thêm trường ma_co_quan_bhxh vào bảng quyen_bien_lai_dien_tu
- Thêm chức năng xuất biên lai điện tử ra PDF/Word
- Tích hợp chức năng biên lai điện tử vào quy trình kê khai BHXH/BHYT hiện tại
- Kiểm thử chức năng biên lai điện tử