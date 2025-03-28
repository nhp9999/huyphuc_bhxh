# Tài liệu về tính năng Kê khai Bảo hiểm Y tế

## Giới thiệu

Tính năng "Kê khai Bảo hiểm Y tế" (BHYT) là một phần của hệ thống quản lý bảo hiểm y tế, cho phép người dùng kê khai thông tin đóng bảo hiểm y tế cho cá nhân hoặc hộ gia đình.

## Chức năng chính

### 1. Quản lý thông tin kê khai BHYT

- **Thêm mới thông tin kê khai BHYT**: Cho phép tạo thông tin kê khai BHYT mới cho một cá nhân hoặc nhiều người cùng lúc.
- **Chỉnh sửa thông tin kê khai**: Cho phép sửa đổi thông tin của một kê khai BHYT đã tạo.
- **Xóa thông tin kê khai**: Cho phép xóa một hoặc nhiều bản kê khai đã lựa chọn.
- **Lọc dữ liệu**: Cho phép lọc danh sách kê khai theo người thứ và số tháng đóng.

### 2. Tìm kiếm thông tin BHYT

- **Tìm kiếm theo mã số BHXH**: Cho phép tìm kiếm thông tin BHYT bằng cách nhập mã số BHXH của cá nhân.
- **Tìm kiếm nhiều mã số cùng lúc**: Hỗ trợ tìm kiếm hàng loạt thông tin BHYT bằng cách nhập danh sách mã số BHXH.
- **Tra cứu mã số BHXH**: Cho phép tra cứu mã số BHXH trên hệ thống VNPost.

### 3. Quét và xử lý thông tin từ CCCD

- **Quét CCCD**: Cho phép quét thông tin từ Căn cước công dân để lấy thông tin cá nhân.
- **Áp dụng thông tin từ CCCD**: Tự động điền thông tin từ CCCD vào form kê khai BHYT.
- **Xử lý nhiều CCCD cùng lúc**: Hỗ trợ quét và xử lý nhiều CCCD để tạo kê khai hàng loạt.

### 4. Quản lý đợt kê khai

- **Xem thông tin đợt kê khai**: Hiển thị thông tin về đợt kê khai hiện tại.
- **Gửi đợt kê khai**: Cho phép gửi đợt kê khai đã hoàn thành đến hệ thống.

### 5. Thống kê và báo cáo

- **Thống kê tổng số thẻ**: Hiển thị tổng số thẻ BHYT trong đợt kê khai.
- **Thống kê theo phương án đóng**: Hiển thị số lượng thẻ theo từng phương án đóng (đáo hạn, tăng mới, dừng đóng).
- **Tổng hợp số tiền**: Hiển thị tổng số tiền cần đóng của tất cả thẻ BHYT.
- **Xuất mẫu TK1**: Cho phép xuất dữ liệu ra mẫu TK1 theo quy định.

### 6. Tính năng tiện ích

- **Sao chép thông tin**: Cho phép sao chép thông tin, mã số BHXH đã chọn.
- **Nhập nhanh**: Cho phép nhập nhanh thông tin kê khai từ văn bản.
- **In biên lai**: Cho phép in biên lai cho kê khai BHYT.
- **Tự động tính toán**: Tự động tính số tiền cần đóng, hạn thẻ mới dựa trên các thông tin đã nhập.

## Chi tiết các trường thông tin

### Thông tin cá nhân
- **Mã số BHXH**: Mã số bảo hiểm xã hội của người tham gia BHYT (bắt buộc)
- **CCCD**: Căn cước công dân của người tham gia (bắt buộc)
- **Họ tên**: Họ và tên người tham gia (bắt buộc)
- **Ngày sinh**: Ngày tháng năm sinh (định dạng dd/MM/yyyy) (bắt buộc)
- **Giới tính**: Nam hoặc Nữ (bắt buộc)
- **Số điện thoại**: Số điện thoại liên hệ (không bắt buộc)

### Thông tin đóng BHYT
- **Người thứ**: Vị trí thành viên trong gia đình (Người thứ 1, 2, 3, 4, 5 trở đi) (bắt buộc)
- **Số tháng đóng**: Kỳ hạn đóng BHYT (3, 6, 12 tháng) (bắt buộc)
- **Phương án đóng**: Loại hình đóng BHYT (Tăng mới, Đáo hạn, Dừng đóng) (bắt buộc)
- **Hạn thẻ cũ**: Ngày hết hạn của thẻ BHYT cũ (nếu có)
- **Hạn thẻ mới từ**: Ngày bắt đầu hiệu lực của thẻ BHYT mới (bắt buộc)
- **Hạn thẻ mới đến**: Ngày kết thúc hiệu lực của thẻ BHYT mới (bắt buộc)

### Thông tin nơi khám chữa bệnh
- **Tỉnh NKQ**: Tỉnh/thành phố nơi khám chữa bệnh (bắt buộc)
- **Huyện NKQ**: Quận/huyện nơi khám chữa bệnh (bắt buộc)
- **Xã NKQ**: Phường/xã nơi khám chữa bệnh (bắt buộc)
- **Địa chỉ NKQ**: Địa chỉ chi tiết nơi khám chữa bệnh (bắt buộc)
- **Bệnh viện (KCB ban đầu)**: Cơ sở khám chữa bệnh ban đầu (bắt buộc)

## Quy trình sử dụng cơ bản

1. **Tạo kê khai BHYT mới**:
   - Nhập các thông tin cá nhân, thông tin đóng BHYT, và thông tin nơi khám chữa bệnh.
   - Hệ thống sẽ tự động tính toán số tiền cần đóng và hạn thẻ mới.
   - Nhấn nút "Lưu" để lưu thông tin kê khai.

2. **Tìm kiếm và chỉnh sửa kê khai**:
   - Nhập mã số BHXH và nhấn nút tìm kiếm để lấy thông tin.
   - Hệ thống sẽ hiển thị thông tin người tham gia nếu tìm thấy.
   - Điều chỉnh thông tin cần thiết và nhấn "Lưu" để cập nhật.

3. **Kê khai hàng loạt**:
   - Sử dụng chức năng "Tìm nhiều mã số" để nhập danh sách mã số BHXH.
   - Chọn thông tin chung như số tháng đóng, bệnh viện KCB.
   - Nhấn "Tìm kiếm" để hệ thống tự động tạo kê khai cho các mã số.

4. **Quản lý danh sách kê khai**:
   - Xem danh sách các kê khai đã tạo trong bảng.
   - Chọn một hoặc nhiều kê khai để xóa, sao chép thông tin.
   - Sử dụng bộ lọc để hiển thị kê khai theo nhu cầu.

5. **Hoàn thành đợt kê khai**:
   - Khi đã kê khai xong, nhấn nút "Gửi" để hoàn thành đợt kê khai.
   - Hệ thống sẽ xử lý đợt kê khai và chuyển sang trạng thái chờ thanh toán.

## Quy định về đóng BHYT

### Số tiền đóng BHYT theo người thứ
- **Người thứ 1**: 4.5% mức lương cơ sở x số tháng
- **Người thứ 2**: 70% của người thứ 1
- **Người thứ 3**: 60% của người thứ 1
- **Người thứ 4**: 50% của người thứ 1
- **Người thứ 5 trở đi**: 40% của người thứ 1

### Phương án đóng
- **Tăng mới**: Đăng ký BHYT lần đầu hoặc đã dừng đóng
- **Đáo hạn**: Gia hạn thẻ BHYT đang còn hiệu lực
- **Dừng đóng**: Ngừng tham gia BHYT

## Lưu ý quan trọng

- BHYT là bảo hiểm bắt buộc theo quy định của pháp luật.
- Đóng BHYT liên tục 5 năm trở lên sẽ được hưởng quyền lợi cao hơn khi khám chữa bệnh.
- Khi đóng theo hộ gia đình, cần đóng cho các thành viên có quan hệ huyết thống hoặc nuôi dưỡng.
- Đợt kê khai khi đã gửi không thể chỉnh sửa, chỉ có thể tạo đợt kê khai mới. 