import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface D03TSData {
  stt?: number;
  hoTen: string;
  maSoBHXH: string;
  cccd: string;
  ngaySinh: Date | string;
  gioiTinh: string;
  diaChi: string;
  noiDangKyKCBBD: string;
  ngayBienLai?: Date | string;
  soBienLai?: string;
  ngayHieuLuc?: string | Date;
  soTheBHYT?: string;
  tiLeDongBHYT?: number;
  soTien?: number;
  tuThang?: Date | string;
  soThangDong?: number;
  maNhanVien?: string;
  thoiHan?: string;
  ghiChu?: string;
}

export interface D03TSOptions {
  tenCongTy?: string;
  maDonVi?: string;
  diaChi?: string;
  soDienThoai?: string;
  email?: string;
  nguoiLap?: string;
  ngayLap?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class D03Service {
  private apiUrl = `${environment.apiUrl}/d03`;

  constructor(
    private http: HttpClient,
    private message: NzMessageService
  ) { }

  getD03Data(dotKeKhaiId: number): Observable<D03TSData[]> {
    return this.http.get<D03TSData[]>(`${this.apiUrl}/data/${dotKeKhaiId}`);
  }

  getD03DataForRecord(keKhaiId: number, loaiKeKhai: 'bhyt' | 'bhxh'): Observable<D03TSData> {
    return this.http.get<D03TSData>(`${this.apiUrl}/record/${loaiKeKhai}/${keKhaiId}`);
  }

  getD03DataByMaSoBHXH(maSoBHXH: string): Observable<D03TSData> {
    return this.http.get<D03TSData>(`${this.apiUrl}/ma-so-bhxh/${maSoBHXH}`);
  }

  xuatExcelMauD03TS(data: D03TSData[], options: D03TSOptions = {}): void {
    console.log('Bắt đầu xuất Excel từ template...');
    const templatePath = '/assets/templates/FileMau_D03_TS.xlsx';

    console.log('Đang tải template từ đường dẫn:', templatePath);
    this.http.get(templatePath, { responseType: 'arraybuffer' })
      .subscribe({
        next: async (template: ArrayBuffer) => {
          console.log('Đã tải template thành công, kích thước:', template.byteLength, 'bytes');
          try {
            // Sử dụng ExcelJS thay vì XLSX để giữ nguyên định dạng
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(template);

            // Lấy worksheet đầu tiên
            const worksheet = workbook.getWorksheet(1);

            if (!worksheet) {
              throw new Error('Không tìm thấy worksheet trong file mẫu');
            }

            // Xác định dòng bắt đầu
            const startRow = 15;

            // Hàm để set giá trị và font Times New Roman
            const setValueWithFont = (cell: ExcelJS.Cell, value: any) => {
              cell.value = value;
              if (!cell.style.font) {
                cell.style.font = {};
              }
              cell.style.font.name = 'Times New Roman';
              cell.style.font.italic = false; // Không in nghiêng
            };

            // Hàm sao chép định dạng từ hàng mẫu cho hàng mới
            const copyRowStyle = (worksheet: ExcelJS.Worksheet, sourceRow: number, targetRow: number) => {
              // Lấy các ô từ hàng nguồn
              const sourceRowObj = worksheet.getRow(sourceRow);
              const targetRowObj = worksheet.getRow(targetRow);

              // Đặt chiều cao hàng là 90
              targetRowObj.height = 90;

              // Duyệt qua các ô trong hàng nguồn để sao chép định dạng
              sourceRowObj.eachCell({ includeEmpty: true }, (sourceCell, colNumber) => {
                const targetCell = targetRowObj.getCell(colNumber);

                // Sao chép định dạng của ô
                targetCell.style = JSON.parse(JSON.stringify(sourceCell.style));
                targetCell.numFmt = sourceCell.numFmt;

                // Áp dụng font Times New Roman
                if (!targetCell.style.font) {
                  targetCell.style.font = {};
                }
                targetCell.style.font.name = 'Times New Roman';

                // Giữ nguyên định dạng nhưng không sao chép giá trị
              });
            };

            // Thêm dòng mới cho mỗi bản ghi
            data.forEach((item, index) => {
              // Xác định vị trí dòng mới
              const row = startRow + index;

              // Nếu không phải dòng đầu tiên, thêm dòng mới
              if (index > 0) {
                // Chèn dòng mới
                worksheet.insertRow(row, []);

                // Sao chép định dạng từ dòng mẫu (dòng startRow)
                copyRowStyle(worksheet, startRow, row);
              }

              // Đặt chiều cao hàng là 90 cho cả dòng đầu tiên
              worksheet.getRow(row).height = 90;

              // Điền dữ liệu vào dòng

              setValueWithFont(worksheet.getCell(`A${row}`), index + 1);
              setValueWithFont(worksheet.getCell(`B${row}`), item.hoTen);
              setValueWithFont(worksheet.getCell(`C${row}`), item.maSoBHXH);
              setValueWithFont(worksheet.getCell(`D${row}`), item.cccd);

              // Xử lý ngày sinh với định dạng dd/mm/yyyy
              let ngaySinh = item.ngaySinh;
              if (typeof ngaySinh === 'string') {
                // Nếu ngày sinh đã là chuỗi, kiểm tra xem nó có phải là định dạng dd/mm/yyyy không
                const dateRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
                if (dateRegex.test(ngaySinh)) {
                  // Nếu đã đúng định dạng dd/mm/yyyy, sử dụng trực tiếp
                  setValueWithFont(worksheet.getCell(`E${row}`), ngaySinh);
                } else {
                  // Thử chuyển đổi sang định dạng dd/mm/yyyy
                  try {
                    const dateObj = new Date(ngaySinh);
                    if (!isNaN(dateObj.getTime())) {
                      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
                      setValueWithFont(worksheet.getCell(`E${row}`), formattedDate);
                    } else {
                      setValueWithFont(worksheet.getCell(`E${row}`), ngaySinh);
                    }
                  } catch (e) {
                    setValueWithFont(worksheet.getCell(`E${row}`), ngaySinh || '');
                  }
                }
              } else if (ngaySinh instanceof Date) {
                // Nếu là Date, định dạng thành dd/mm/yyyy
                const formattedDate = `${ngaySinh.getDate().toString().padStart(2, '0')}/${(ngaySinh.getMonth() + 1).toString().padStart(2, '0')}/${ngaySinh.getFullYear()}`;
                setValueWithFont(worksheet.getCell(`E${row}`), formattedDate);
              } else {
                // Trường hợp khác, giữ nguyên giá trị
                setValueWithFont(worksheet.getCell(`E${row}`), ngaySinh || '');
              }

              setValueWithFont(worksheet.getCell(`F${row}`), item.gioiTinh);
              setValueWithFont(worksheet.getCell(`G${row}`), item.diaChi);
              setValueWithFont(worksheet.getCell(`H${row}`), item.noiDangKyKCBBD);

              // Xử lý ngày biên lai
              if (item.ngayBienLai instanceof Date) {
                const ngayBienLaiStr = `${item.ngayBienLai.getDate().toString().padStart(2, '0')}/${(item.ngayBienLai.getMonth() + 1).toString().padStart(2, '0')}/${item.ngayBienLai.getFullYear()}`;
                setValueWithFont(worksheet.getCell(`I${row}`), ngayBienLaiStr);
              } else if (item.ngayBienLai) {
                try {
                  const ngayBienLai = new Date(item.ngayBienLai);
                  const ngayBienLaiStr = `${ngayBienLai.getDate().toString().padStart(2, '0')}/${(ngayBienLai.getMonth() + 1).toString().padStart(2, '0')}/${ngayBienLai.getFullYear()}`;
                  setValueWithFont(worksheet.getCell(`I${row}`), ngayBienLaiStr);
                } catch (e) {
                  setValueWithFont(worksheet.getCell(`I${row}`), item.ngayBienLai || '');
                }
              } else {
                setValueWithFont(worksheet.getCell(`I${row}`), '');
              }

              // Số biên lai vào cột J
              setValueWithFont(worksheet.getCell(`J${row}`), item.soBienLai || '');

              // Số tiền cần đóng vào cột K
              if (item.soTien) {
                // Định dạng số tiền có dấu phân cách hàng nghìn là dấu phẩy (,)
                const soTienStr = item.soTien.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                setValueWithFont(worksheet.getCell(`K${row}`), soTienStr);
              }

              // Đặt cột L là 0
              setValueWithFont(worksheet.getCell(`L${row}`), 0);

              // Đặt cột M là 0
              setValueWithFont(worksheet.getCell(`M${row}`), 0);

              // Từ tháng vào cột N - lấy ngày tháng năm thật từ hạn thẻ mới từ
              if (item.tuThang instanceof Date) {
                const tuThangStr = `${item.tuThang.getDate().toString().padStart(2, '0')}/${(item.tuThang.getMonth() + 1).toString().padStart(2, '0')}/${item.tuThang.getFullYear()}`;
                setValueWithFont(worksheet.getCell(`N${row}`), tuThangStr);
              } else if (item.tuThang) {
                try {
                  const tuThang = new Date(item.tuThang);
                  const tuThangStr = `${tuThang.getDate().toString().padStart(2, '0')}/${(tuThang.getMonth() + 1).toString().padStart(2, '0')}/${tuThang.getFullYear()}`;
                  setValueWithFont(worksheet.getCell(`N${row}`), tuThangStr);
                } catch (e) {
                  setValueWithFont(worksheet.getCell(`N${row}`), item.tuThang || '');
                }
              }

              // Số tháng đóng vào cột O
              setValueWithFont(worksheet.getCell(`O${row}`), item.soThangDong || 0);
              // Đặt định dạng số nguyên cho cột số tháng đóng
              worksheet.getCell(`O${row}`).numFmt = '0';

              // Ghi chú vào cột Q
              setValueWithFont(worksheet.getCell(`Q${row}`), item.ghiChu || '');

              // Mã nhân viên vào cột P
              setValueWithFont(worksheet.getCell(`P${row}`), item.maNhanVien || '');
            });

            // Tính tổng số tiền cần đóng
            let tongSoTien = 0;
            data.forEach(item => {
              if (item.soTien) {
                tongSoTien += Number(item.soTien);
              }
            });

            console.log('Tổng số tiền:', tongSoTien);

            // Tìm dòng "Cộng tăng" trong toàn bộ worksheet
            let tongFound = false;

            // Đối với số lượng bản ghi lớn, dòng tổng cộng sẽ nằm sau dòng dữ liệu cuối cùng
            // Tính dòng dữ liệu cuối cùng
            const lastDataRow = startRow + data.length - 1;

            // Kiểm tra từ dòng cuối dữ liệu đến dòng cuối dữ liệu + 10
            for (let i = lastDataRow + 1; i <= lastDataRow + 10; i++) {
              // Kiểm tra cả cột A và cột B
              let cellA = worksheet.getCell(`A${i}`);
              let cellB = worksheet.getCell(`B${i}`);

              let foundText = '';
              if (cellA.value && typeof cellA.value === 'string') {
                foundText = cellA.value.toLowerCase();
              } else if (cellB.value && typeof cellB.value === 'string') {
                foundText = cellB.value.toLowerCase();
              }

              // Nếu tìm thấy "cộng", "tăng", "tang", "cong", "tong"
              if (foundText.includes('cộng') ||
                  foundText.includes('tăng') ||
                  foundText.includes('tang') ||
                  foundText.includes('tổng') ||
                  foundText.includes('cong') ||
                  foundText.includes('tong')) {

                console.log('Tìm thấy dòng Cộng tăng tại dòng ' + i);

                // Định dạng tổng số tiền
                const tongSoTienStr = tongSoTien.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

                // Gán giá trị vào cột K
                setValueWithFont(worksheet.getCell(`K${i}`), tongSoTienStr);

                tongFound = true;
                break;
              }
            }

            // Nếu không tìm thấy, kiểm tra toàn bộ worksheet
            if (!tongFound) {
              // Kiểm tra từ dòng 1 đến dòng cuối của worksheet
              for (let i = 1; i <= worksheet.rowCount; i++) {
                for (let j = 1; j <= 20; j++) {
                  const colLetter = String.fromCharCode(64 + j);
                  const cell = worksheet.getCell(`${colLetter}${i}`);

                  if (cell.value && typeof cell.value === 'string') {
                    const cellText = cell.value.toLowerCase();

                    // Tìm ô có text "tổng cộng" hoặc "tổng số tiền"
                    if ((cellText.includes('tổng cộng') || cellText.includes('tổng số tiền')) &&
                        j < 20) {

                      console.log('Tìm thấy ô tổng cộng tại ô ' + colLetter + i);

                      // Điền tổng số tiền vào cột K của dòng đó
                      const tongSoTienStr = tongSoTien.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                      setValueWithFont(worksheet.getCell(`K${i}`), tongSoTienStr);

                      tongFound = true;
                      break;
                    }
                  }
                }
                if (tongFound) break;
              }
            }

            // Nếu vẫn không tìm thấy, thêm dòng tổng cộng mới vào cuối
            if (!tongFound) {
              const totalRow = lastDataRow + 2;

              // Chèn dòng mới
              worksheet.insertRow(totalRow, []);

              // Đặt giá trị "Tổng cộng" vào cột B
              setValueWithFont(worksheet.getCell(`B${totalRow}`), 'Tổng cộng');
              worksheet.getCell(`B${totalRow}`).font = {
                name: 'Times New Roman',
                size: 11,
                bold: true
              };

              // Đặt tổng số tiền vào cột K
              const tongSoTienStr = tongSoTien.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              setValueWithFont(worksheet.getCell(`K${totalRow}`), tongSoTienStr);
              worksheet.getCell(`K${totalRow}`).font = {
                name: 'Times New Roman',
                size: 11,
                bold: true
              };
            }

            // Tìm và thay thế ngày tháng năm thành ngày hiện tại
            const now = new Date();
            const ngay = now.getDate();
            const thang = now.getMonth() + 1;
            const nam = now.getFullYear();
            const ngayThangNamStr = `An Giang, ngày ${ngay} tháng ${thang} năm ${nam}`;

            // Tìm kiếm và thay thế ngày tháng trong file
            for (let i = 1; i <= worksheet.rowCount; i++) {
              for (let col = 1; col <= 20; col++) {
                const colLetter = String.fromCharCode(64 + col); // Chuyển số cột thành chữ cái (1 -> A, 2 -> B, ...)
                const cell = worksheet.getCell(`${colLetter}${i}`);

                if (cell.value && typeof cell.value === 'string') {
                  const cellText = cell.value.toLowerCase();

                  // Tìm kiếm mẫu "an giang, ngày" hoặc "ngày tháng năm"
                  if (cellText.includes('an giang') && cellText.includes('ngày') &&
                      (cellText.includes('tháng') || cellText.includes('năm'))) {

                    console.log('Tìm thấy ô ngày tháng năm tại ô ' + colLetter + i);
                    // Thay thế bằng ngày tháng năm hiện tại
                    setValueWithFont(worksheet.getCell(`${colLetter}${i}`), ngayThangNamStr);
                  }
                }
              }
            }

            // Xuất file
            const fileName = `D03-TS_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.xlsx`;

            // Tạo buffer và tải xuống
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, fileName);

          } catch (error: any) {
            console.error('Lỗi khi xử lý template Excel:', error);
            this.message.error('Có lỗi xảy ra khi xử lý template Excel mẫu D03-TS');
            console.error('Chi tiết lỗi:', error);
          }
        },
        error: (err: any) => {
          console.error('Lỗi khi tải template Excel:', err);
          this.message.error('Không thể tải template Excel mẫu D03-TS');
          console.error('Đường dẫn template:', window.location.origin + templatePath);
        }
      });
  }

  xuatExcelMauD03TSTuDotKeKhai(dotKeKhaiId: number, options: D03TSOptions = {}): void {
    this.getD03Data(dotKeKhaiId).subscribe({
      next: (data) => {
        this.xuatExcelMauD03TS(data, options);
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy dữ liệu D03-TS:', err);
        this.message.error('Không thể lấy dữ liệu cho mẫu D03-TS');
      }
    });
  }

  xuatExcelMauD03TSTuBangGhi(keKhaiId: number, loaiKeKhai: 'bhyt' | 'bhxh', options: D03TSOptions = {}): void {
    this.getD03DataForRecord(keKhaiId, loaiKeKhai).subscribe({
      next: (data) => {
        // Chuyển đổi dữ liệu đơn lẻ thành mảng để sử dụng lại phương thức xuatExcelMauD03TS
        this.xuatExcelMauD03TS([data], options);
      },
      error: (err: any) => {
        console.error(`Lỗi khi lấy dữ liệu D03-TS cho bảng ghi ${loaiKeKhai}:`, err);
        this.message.error(`Không thể lấy dữ liệu cho mẫu D03-TS từ bảng ghi ${loaiKeKhai}`);
      }
    });
  }

  xuatExcelMauD03TSTuMaSoBHXH(maSoBHXH: string, options: D03TSOptions = {}): void {
    this.getD03DataByMaSoBHXH(maSoBHXH).subscribe({
      next: (data) => {
        // Chuyển đổi dữ liệu đơn lẻ thành mảng để sử dụng lại phương thức xuatExcelMauD03TS
        this.xuatExcelMauD03TS([data], options);
      },
      error: (err: any) => {
        console.error(`Lỗi khi lấy dữ liệu D03-TS cho mã số BHXH ${maSoBHXH}:`, err);
        this.message.error(`Không thể lấy dữ liệu cho mẫu D03-TS từ mã số BHXH ${maSoBHXH}`);
      }
    });
  }
}
