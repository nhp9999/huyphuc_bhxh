# Long Term Memory - Dự án BHXH

## Mục tiêu dự án
- Xây dựng ứng dụng quản lý bảo hiểm xã hội với các chức năng như kê khai BHXH, quản lý đợt kê khai, thanh toán và quản lý người dùng.
- Hỗ trợ các đại lý thu BHXH quản lý hồ sơ và theo dõi thanh toán.
- Cung cấp giao diện trực quan và dễ sử dụng cho người dùng.

## Công nghệ sử dụng

### Frontend
- Angular 19.1.0
- ng-zorro-antd 19.0.2 (UI framework)
- RxJS 7.8.0
- TypeScript 5.7.2
- Các thư viện bổ sung:
  - @auth0/angular-jwt: Xử lý JWT
  - file-saver: Xuất và tải file
  - xlsx: Xử lý file Excel
  - jspdf & jspdf-autotable: Xuất PDF
  - docxtemplater, pizzip, jszip: Xử lý file Word và nén

### Backend
- ASP.NET Core 9.0 (API)
- Entity Framework Core với Npgsql (PostgreSQL)
- JWT Authentication
- EPPlus: Xử lý Excel
- BCrypt.Net: Mã hóa mật khẩu

### Database
- PostgreSQL (thông qua Npgsql)

## Kiến trúc dự án

### Cấu trúc thư mục
- WebApp.Client: Chứa ứng dụng Angular
- WebApp.Server: Chứa API ASP.NET Core
- database: Chứa scripts và cấu hình database
- memory_bank: Lưu trữ thông tin dự án
- Sreenshots: Ảnh chụp màn hình

### WebApp.Server
- Controllers: Xử lý API endpoints
- Data: ApplicationDbContext và cấu hình
- DTOs: Data Transfer Objects
- Models: Mô hình dữ liệu
- Repositories: Truy xuất dữ liệu
- Services: Logic nghiệp vụ
- Migrations: Quản lý cập nhật database
- Program.cs: Cấu hình ứng dụng

### WebApp.Client (Angular)
- Cấu trúc chuẩn Angular với components, services, models

## Các module chính

### 1. Quản lý đợt kê khai
- Hiển thị danh sách đợt kê khai với thông tin chi tiết
- Lọc theo trạng thái: Chưa gửi, Chờ thanh toán, Hoàn thành, Từ chối
- Thống kê số liệu tổng quan
- Quản lý quy trình xử lý đợt kê khai (từ tạo đến hoàn thành)
- Thanh toán và quản lý hóa đơn

### 2. Kê khai BHXH/BHYT
- Tìm kiếm thông tin BHXH từ hệ thống SSMV2
- Quản lý thông tin cá nhân (họ tên, CCCD, ngày sinh, địa chỉ...)
- Tính toán số tiền phải đóng
- Quản lý biên lai thu tiền
- Xử lý thông tin địa chỉ (tỉnh, huyện, xã)

## Mô hình dữ liệu chính

### Đợt kê khai (DotKeKhai)
- Thông tin cơ bản: id, tên, số đợt, tháng, năm
- Thông tin trạng thái: trạng thái, ghi chú
- Thông tin tham chiếu: đơn vị, đại lý, người tạo
- Thông tin thanh toán: tổng số thẻ, tổng số tiền, URL hóa đơn

### Kê khai BHYT
- Thông tin cá nhân: họ tên, CCCD, ngày sinh, giới tính, địa chỉ
- Thông tin BHXH: số thẻ BHYT, mã số BHXH, phương án đóng
- Thông tin tài chính: số tiền, ngày biên lai, số biên lai
- Thông tin địa chỉ: mã tỉnh, huyện, xã

### Quyển biên lai
- Thông tin biên lai: quyển số, từ số, đến số, số hiện tại
- Thông tin quản lý: nhân viên thu, người cấp, ngày cấp, trạng thái

## Quy trình làm việc

### Quy trình đợt kê khai
1. Tạo đợt kê khai mới
2. Gửi đợt kê khai để xử lý
3. Thanh toán (tạo mã QR, upload hóa đơn)
4. Hoàn thành hoặc từ chối

### Quy trình kê khai BHXH
1. Tìm kiếm thông tin BHXH (có thể yêu cầu đăng nhập SSMV2)
2. Điền thông tin cá nhân và BHXH
3. Tính toán số tiền phải đóng
4. Lưu thông tin kê khai

## Công nghệ thanh toán
- Tạo mã QR thanh toán liên kết với ngân hàng (VietQR API)
- Lưu trữ hình ảnh hóa đơn (Cloudinary)

## Conventions
- Sử dụng chuẩn đặt tên snake_case cho các trường trong database
- Sử dụng camelCase cho các biến và thuộc tính trong code
- Sử dụng PascalCase cho các lớp và components
- Sử dụng JWT cho xác thực API
- Sử dụng ng-zorro-antd cho UI components

## Các điểm cần cải thiện
1. Tối ưu hiệu suất khi tải danh sách địa chỉ lớn
2. Cải thiện UX khi tìm kiếm và điền thông tin BHXH
3. Tăng cường xác thực dữ liệu nhập
4. Thêm tính năng xuất báo cáo 