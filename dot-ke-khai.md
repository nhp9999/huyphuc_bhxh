# Tài liệu tính năng: Quản lý đợt kê khai BHXH

## 1. Tổng quan

Module "Đợt kê khai" là một phần của hệ thống quản lý bảo hiểm xã hội, cho phép người dùng tạo, quản lý và theo dõi các đợt kê khai BHXH/BHYT. Module này cung cấp giao diện trực quan để quản lý toàn bộ quy trình từ tạo đợt kê khai, gửi đợt, thanh toán, đến hoàn thành.

## 2. Các tính năng chính

### 2.1. Quản lý danh sách đợt kê khai

- Hiển thị danh sách tất cả các đợt kê khai với thông tin chi tiết
- Lọc theo trạng thái: Tất cả, Chưa gửi, Chờ thanh toán, Hoàn thành, Từ chối
- Thống kê số liệu tổng quan:
  - Tổng số đợt kê khai
  - Số đợt hoàn thành
  - Số đợt từ chối
  - Tổng số tiền
- Chức năng tìm kiếm và lọc dữ liệu

### 2.2. Thêm mới đợt kê khai

- Tạo đợt kê khai mới với các thông tin cơ bản:
  - Đơn vị (bắt buộc)
  - Đại lý (bắt buộc)
  - Ghi chú
  - Mã hồ sơ
- Tự động sinh tên đợt kê khai theo định dạng: "Đợt {số_đợt} Tháng {tháng} năm {năm}"

### 2.3. Chỉnh sửa đợt kê khai

- Cập nhật thông tin đợt kê khai đã tạo
- Các trường có thể chỉnh sửa tùy thuộc vào trạng thái của đợt kê khai

### 2.4. Quy trình xử lý đợt kê khai

Đợt kê khai có các trạng thái sau:
- **Chưa gửi**: Trạng thái ban đầu khi tạo đợt kê khai
- **Đã gửi**: Sau khi gửi đợt kê khai
- **Đang xử lý**: Đợt kê khai đang được xử lý
- **Chờ thanh toán**: Đợt kê khai đã được duyệt và đang chờ thanh toán
- **Hoàn thành**: Đợt kê khai đã thanh toán và hoàn tất
- **Từ chối**: Đợt kê khai bị từ chối

### 2.5. Thanh toán đợt kê khai

- Tạo mã QR thanh toán liên kết với ngân hàng
- Hiển thị thông tin thanh toán:
  - Tên đợt kê khai
  - Ngân hàng (AGRIBANK)
  - Số tài khoản
  - Tên tài khoản
  - Số tiền
  - Nội dung chuyển khoản
- Tải mã QR để thanh toán
- Xác nhận thanh toán và upload hóa đơn/bill

### 2.6. Upload hóa đơn thanh toán

- Tải lên hình ảnh hóa đơn/bill sau khi thanh toán
- Hỗ trợ định dạng JPG, PNG
- Giới hạn dung lượng file (5MB)
- Lưu trữ hóa đơn trên Cloudinary
- Tự động cập nhật trạng thái đợt kê khai thành "đang xử lý"

### 2.7. Xem hóa đơn thanh toán

- Hiển thị hình ảnh hóa đơn đã upload
- Các tính năng thao tác với hình ảnh:
  - Phóng to/Thu nhỏ
  - Xoay trái/phải
  - Tải về

### 2.8. Xuất dữ liệu

- Xuất dữ liệu đợt kê khai ra file Excel
- Tải tất cả hóa đơn của các đợt kê khai đã chọn

## 3. Cấu trúc dữ liệu

### 3.1. Đợt kê khai (DotKeKhai)

- id: Mã đợt kê khai
- ten_dot: Tên đợt kê khai
- so_dot: Số đợt
- thang: Tháng
- nam: Năm
- ghi_chu: Ghi chú
- trang_thai: Trạng thái
- nguoi_tao: Người tạo
- don_vi_id: Mã đơn vị
- ma_ho_so: Mã hồ sơ
- dai_ly_id: Mã đại lý
- tong_so_the: Tổng số thẻ
- tong_so_tien: Tổng số tiền
- url_bill: URL hóa đơn
- DonVi: Thông tin đơn vị

### 3.2. Kê khai BHYT (KeKhaiBHYT)

- ho_ten: Họ tên
- cccd: Căn cước công dân
- ngay_sinh: Ngày sinh
- gioi_tinh: Giới tính
- dia_chi: Địa chỉ
- so_dien_thoai: Số điện thoại
- email: Email
- so_tien: Số tiền
- ghi_chu: Ghi chú
- so_the_bhyt: Số thẻ BHYT
- ma_so_bhxh: Mã số BHXH
- nguoi_thu: Người thu
- phuong_an_dong: Phương án đóng
- ngay_bien_lai: Ngày biên lai
- ma_tinh_nkq: Mã tỉnh nơi khai quê
- ma_huyen_nkq: Mã huyện nơi khai quê
- ma_xa_nkq: Mã xã nơi khai quê
- dia_chi_nkq: Địa chỉ nơi khai quê
- so_thang_dong: Số tháng đóng
- ma_benh_vien: Mã bệnh viện
- ma_hgd: Mã hộ gia đình
- quoc_tich: Quốc tịch
- ma_tinh_ks: Mã tỉnh khai sinh
- ma_huyen_ks: Mã huyện khai sinh
- ma_xa_ks: Mã xã khai sinh
- so_bien_lai: Số biên lai
- han_the_moi_tu: Hạn thẻ mới từ
- is_urgent: Khẩn cấp
- ma_nhan_vien: Mã nhân viên
- QuyenBienLai: Thông tin quyển biên lai

### 3.3. Quyển biên lai (QuyenBienLai)

- id: Mã quyển biên lai
- quyen_so: Quyển số
- tu_so: Từ số
- den_so: Đến số
- so_hien_tai: Số hiện tại
- nhan_vien_thu: Nhân viên thu
- nguoi_cap: Người cấp
- ngay_cap: Ngày cấp
- trang_thai: Trạng thái

## 4. Các thành phần giao diện

### 4.1. Giao diện chính (dot-ke-khai.component)

- Hiển thị thống kê số liệu
- Hiển thị danh sách đợt kê khai
- Bảng dữ liệu với các cột:
  - Tên đợt
  - Đơn vị
  - Dịch vụ
  - Tổng số thẻ
  - Tổng số tiền
  - Trạng thái
  - Ghi chú
  - Mã hồ sơ
  - Hóa đơn
  - Thao tác

### 4.2. Modal thêm mới/cập nhật đợt kê khai

- Form nhập liệu với các trường:
  - Đơn vị
  - Đại lý
  - Ghi chú
  - Mã hồ sơ

### 4.3. Modal thanh toán (thanh-toan-modal.component)

- Hiển thị mã QR thanh toán
- Thông tin thanh toán
- Nút tải mã QR
- Nút xác nhận thanh toán

### 4.4. Modal upload hóa đơn (upload-bill-modal.component)

- Vùng kéo thả file hoặc nút chọn file
- Danh sách file đã chọn
- Thông tin hướng dẫn upload

## 5. Quy trình sử dụng

1. **Tạo đợt kê khai mới**:
   - Nhấn nút "Thêm mới"
   - Điền thông tin đợt kê khai
   - Nhấn "Thêm mới" để lưu

2. **Gửi đợt kê khai**:
   - Từ danh sách, chọn đợt kê khai có trạng thái "Chưa gửi"
   - Nhấn nút "Gửi đợt kê khai" (biểu tượng gửi)

3. **Thanh toán đợt kê khai**:
   - Từ danh sách, chọn đợt kê khai có trạng thái "Chờ thanh toán"
   - Nhấn "Thanh toán"
   - Quét mã QR và thực hiện thanh toán qua ngân hàng
   - Nhấn "Xác nhận thanh toán"
   - Upload hóa đơn/bill

4. **Xuất dữ liệu**:
   - Từ danh sách, chọn đợt kê khai
   - Nhấn nút "Xuất Excel" (biểu tượng xuất)

5. **Tải hóa đơn**:
   - Chọn các đợt kê khai bằng checkbox
   - Nhấn nút "Tải tất cả hóa đơn"

## 6. Công nghệ sử dụng

- **Frontend**: Angular, ng-zorro-antd
- **Lưu trữ hình ảnh**: Cloudinary
- **Tạo mã QR thanh toán**: VietQR API
- **Xuất dữ liệu**: XLSX
- **Nén file**: JSZip, file-saver 