# Loại bỏ trường người thu khi Thêm quyển biên lai điện tử

## Nhiệm vụ
- Chỉnh sửa model để trường người thu (nhan_vien_thu) không còn bắt buộc
- Cập nhật giao diện để không yêu cầu chọn người thu khi thêm quyển biên lai điện tử
- Đảm bảo các phần còn lại của ứng dụng vẫn hoạt động đúng

## Kế hoạch
1. Sửa đổi model QuyenBienLaiDienTu để trường nhan_vien_thu nullable
2. Cập nhật giao diện form thêm/sửa quyển biên lai để loại bỏ trường người thu
3. Cập nhật controller để không yêu cầu trường người thu
4. Cập nhật phương thức hiển thị để xử lý giá trị null
5. Kiểm tra logic nghiệp vụ liên quan đến việc sử dụng quyển biên lai

## Các bước
1. Sửa model QuyenBienLaiDienTu.cs để trường nhan_vien_thu nullable
2. Cập nhật giao diện HTML để loại bỏ trường người thu
3. Cập nhật component TypeScript để loại bỏ validation và xử lý form
4. Cập nhật interface trong TypeScript để nhan_vien_thu có thể nhận giá trị null
5. Chỉnh sửa phương thức getUserName để xử lý giá trị null
6. Chỉnh sửa QuyenBienLaiDienTuController để không kiểm tra người thu
7. Đảm bảo rằng khi lưu quyển biên lai, trường nhan_vien_thu luôn được gán giá trị null

## Đã hoàn thành
1. Đã sửa model QuyenBienLaiDienTu.cs để trường nhan_vien_thu nullable (loại bỏ [Required])
2. Đã loại bỏ trường người thu khỏi form trong quyen-bien-lai-dien-tu.component.html
3. Đã cập nhật form validation trong .ts component (loại bỏ nhan_vien_thu khỏi form validation)
4. Đã sửa interface TypeScript để nhan_vien_thu có thể null
5. Đã cập nhật phương thức getUserName để xử lý giá trị null
6. Đã cập nhật controller để bỏ kiểm tra người thu
7. Đã thêm code gán nhan_vien_thu = null khi submit form

## Chưa hoàn thành
Tất cả các nhiệm vụ đã hoàn thành. 