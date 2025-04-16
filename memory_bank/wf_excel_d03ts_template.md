# Workflow: Excel D03TS Template

## Current tasks
- Xuất Excel theo template D03-TS
- Thêm thông tin cột J (số biên lai) và cột P (mã nhân viên)
- Thêm số tiền cần đóng vào cột K
- Thêm từ tháng vào cột N
- Thêm số tháng đóng vào cột O
- Đặt cột L và M là 0
- Tính tổng số tiền và hiển thị ở dòng "Cộng tăng"

## Plan
Sử dụng thư viện ExcelJS để xuất dữ liệu từ ứng dụng sang file Excel mẫu D03-TS, đảm bảo giữ nguyên định dạng và bố cục của file mẫu.

1. Cập nhật interface D03TSData để thêm các trường mới: ngày biên lai, số biên lai, số tiền, từ tháng, số tháng đóng, mã nhân viên
2. Cập nhật D03Controller.cs để thêm các thông tin này vào dữ liệu trả về từ API
3. Sửa phương thức xuatExcelMauD03TS để ghi dữ liệu vào đúng cột
4. Bổ sung logic tính tổng số tiền và hiển thị ở dòng "Cộng tăng"
5. Đảm bảo định dạng hiển thị phù hợp: số tiền có dấu phẩy phân cách hàng nghìn, ngày tháng đúng định dạng dd/mm/yyyy...

## Steps
1. Cập nhật model D03TSData trong C# để thêm trường mới
2. Cập nhật phương thức GetD03Data để lấy thêm thông tin từ database
3. Cập nhật interface D03TSData trong TypeScript
4. Sửa phương thức xuatExcelMauD03TS để:
   - Đọc file mẫu FileMau_D03_TS.xlsx
   - Thêm dữ liệu từ dòng 15
   - Sử dụng helper function setValueWithFont để giữ font Times New Roman
   - Hiển thị thông tin vào từng cột:
     - Cột I: Ngày biên lai (dd/mm/yyyy)
     - Cột J: Số biên lai
     - Cột K: Số tiền cần đóng
     - Cột L và M: Giá trị 0
     - Cột N: Từ tháng (dd/mm/yyyy)
     - Cột O: Số tháng đóng
     - Cột P: Mã nhân viên
     - Cột Q: Ghi chú
   - Tìm dòng "Cộng tăng" và hiển thị tổng số tiền ở cột K
5. Kiểm tra và sửa định dạng hiển thị cho mỗi cột

## Things done
- Cập nhật model D03TSData và phương thức GetD03Data trong backend
- Cập nhật interface D03TSData trong frontend
- Sửa phương thức xuatExcelMauD03TS để hiển thị dữ liệu đúng cột
- Hiển thị số biên lai ở cột J và mã nhân viên ở cột P
- Hiển thị số tiền cần đóng ở cột K với định dạng số có dấu phẩy phân cách
- Đặt cột L và M là 0
- Hiển thị từ tháng ở cột N với định dạng dd/mm/yyyy (01/MM/YYYY)
- Hiển thị số tháng đóng ở cột O
- Chuyển ghi chú sang cột Q
- Tính tổng số tiền và hiển thị ở dòng "Cộng tăng"
- Cải thiện tìm kiếm dòng "Cộng tăng" bằng cách:
  - Sử dụng toLowerCase() để tìm kiếm không phân biệt chữ hoa/thường
  - Tìm kiếm cả "cộng tăng" và "cong tang" (không dấu)
  - Thêm dòng "Cộng tăng" mới nếu không tìm thấy trong template

## Things not done yet
- Kiểm tra hiển thị trên file Excel đã xuất
- Xác nhận toàn bộ định dạng đã đúng (font chữ, tiêu đề, chiều cao các dòng...)
- Kiểm tra các bug còn lại nếu có
