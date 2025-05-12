# Workflow: Increase Input Field Size

## Current tasks from user prompt
- Tăng kích thước các ô nhập liệu trong form kê khai BHXH để cải thiện trải nghiệm người dùng
- Giảm khoảng trắng để tối ưu không gian hiển thị
- Loại bỏ hoàn toàn bo tròn góc cho tất cả các thành phần
- Xóa nền xanh nhạt của container chính
- Loại bỏ khoảng trắng dưới card
- Phân loại các ô input thành 2 card riêng biệt
- Loại bỏ tiêu đề card
- Giảm kích thước input và button
- Sửa lỗi nội dung bị lệch trong các ô nhập liệu

## Plan (simple)
1. Tìm và phân tích file CSS/SCSS của form kê khai BHXH
2. Tìm các style liên quan đến input, select, date-picker và các trường nhập liệu khác
3. Cập nhật kích thước (height, padding) của các trường nhập liệu
4. Đảm bảo sự nhất quán giữa các loại trường nhập liệu
5. Kiểm tra tương thích với responsive design
6. Giảm khoảng trắng (padding) giữa các thành phần để tối ưu không gian
7. Loại bỏ border-radius cho tất cả các component
8. Xóa background xanh nhạt và thay bằng màu trắng
9. Loại bỏ padding container và margin card
10. Chia form thành hai card riêng biệt để phân loại ô input hợp lý
11. Xóa tiêu đề card để giao diện đơn giản hơn
12. Điều chỉnh kích thước input và button để phù hợp với yêu cầu
13. Căn chỉnh nội dung bên trong các ô nhập liệu

## Steps
1. Xác định vị trí của component form kê khai BHXH
2. Phân tích file SCSS/CSS hiện tại
3. Xác định các selector CSS cần được cập nhật
4. Cập nhật kích thước cho input, select và các control khác
5. Kiểm tra tương thích trên các breakpoint khác nhau (responsive)
6. Giảm padding và margins của container và các thành phần con
7. Thiết lập border-radius: 0 cho tất cả component
8. Thay đổi background-color và loại bỏ background-image của container
9. Loại bỏ hết khoảng trắng bên ngoài card
10. Phân loại các ô input vào 2 card riêng biệt dựa trên tính chất
11. Loại bỏ thuộc tính nzTitle của các card
12. Giảm kích thước input, button để tối ưu không gian
13. Điều chỉnh CSS để căn chỉnh nội dung bên trong các ô nhập liệu

## Things done
- Xác định được vị trí component form kê khai BHXH
- Phân tích file SCSS của component
- Đã cập nhật các style cho input, select, date-picker và các control khác:
  - Điều chỉnh height từ 40px xuống 32px
  - Giảm padding từ 8px 12px xuống 4px 8px
  - Giảm font-size từ 15px xuống 13px
  - Điều chỉnh line-height cho các select components
  - Đảm bảo các ô input có kích thước nhất quán
- Đã loại bỏ hoàn toàn bo tròn góc cho tất cả các component:
  - Input, select, date-picker và các trường nhập liệu
  - Buttons và các control tương tác
  - Cards, modals và các container
  - Tables, tags và các thành phần khác
- Đã xóa nền xanh nhạt bằng cách:
  - Thay đổi background-color của container thành #ffffff (màu trắng)
  - Loại bỏ background-image gradient cho các nút và thành phần UI
- Đã loại bỏ khoảng trắng bên ngoài card:
  - Đặt padding container thành 0
  - Đặt margin-bottom card thành 0
  - Giảm padding của card-body từ 16px xuống 12px
  - Giảm padding của card-head từ 16px 24px xuống 12px 20px
- Đã phân chia form thành 2 card riêng biệt trong HTML:
  - Card 1 chứa thông tin cá nhân và địa chỉ
  - Card 2 chứa thông tin tài chính, đóng phí
- Đã sửa lỗi nội dung bị lệch trong các ô nhập liệu:
  - Sử dụng display: flex và align-items: center cho tất cả input
  - Loại bỏ line-height cố định và thay bằng căn giữa bằng flexbox
  - Đảm bảo nội dung hiển thị đúng vị trí trong tất cả loại input (text, number, select, date)
- Các cải tiến bổ sung:
  - Giảm gap giữa các thành phần từ 16px xuống 12px hoặc 10px
  - Loại bỏ các hiệu ứng transform translateY và box-shadow khi hover
  - Đơn giản hóa background của các button từ gradient xuống solid color
  - Loại bỏ animation và hiệu ứng không cần thiết (pulse, transform)
  - Giảm kích thước của các phần thông tin từ 16px xuống 14px
  - Giảm khoảng trắng trong phiên bản mobile (responsive styles)

## Things not done yet
- Kiểm tra tương thích responsive trên các màn hình nhỏ
- Có thể cần cập nhật thêm một số control đặc biệt nếu phát hiện sau này

## Đánh giá kết quả
- Giao diện form đã trở nên gọn gàng và chuyên nghiệp hơn
- Loại bỏ các góc bo tròn tạo cảm giác thống nhất và hiện đại
- Giảm kích thước input và khoảng cách giúp hiển thị nhiều thông tin hơn
- Căn chỉnh nội dung trong input đã khắc phục lỗi hiển thị bị lệch
- Đơn giản hóa các hiệu ứng giúp trang tải nhanh hơn và tập trung vào nội dung chính 