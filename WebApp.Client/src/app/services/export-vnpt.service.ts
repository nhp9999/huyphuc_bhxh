import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { DotKeKhai } from './dot-ke-khai.service';
import { DotKeKhaiService } from './dot-ke-khai.service';
import { UserService } from './user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExportVnptService {

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private userService: UserService,
    private message: NzMessageService
  ) { }

  // Hàm chuyển đổi giới tính
  getGioiTinhValue(gioiTinh: string): string {
    return gioiTinh?.toLowerCase() === 'nam' ? '1' : '0';
  }

  // Hàm kiểm tra tuổi
  isUnder18(ngaySinh: string | Date | null | undefined): boolean {
    if (!ngaySinh) return false;

    const birthDate = new Date(ngaySinh);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Nếu chưa tới tháng sinh nhật hoặc tới tháng sinh nhật nhưng chưa tới ngày sinh nhật
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 18;
  }

  // Lấy text cho phương án đóng BHYT
  getPhuongAnDongText(phuongAnDong: string): string {
    const phuongAnDongMap: Record<string, string> = {
      'dao_han': 'ON',
      'tang_moi': 'TM',
      'dung_dong': 'GH'
    };
    return phuongAnDongMap[phuongAnDong] || '';
  }

  // Xuất file VNPT cho nhiều đợt kê khai
  xuatVNPTNhieuDot(dotKeKhaiList: DotKeKhai[]): Observable<boolean> {
    if (!dotKeKhaiList || dotKeKhaiList.length === 0) {
      this.message.warning('Không có dữ liệu để xuất');
      return of(false);
    }

    // Chỉ chọn các đợt kê khai BHYT
    const dotKeKhaiBHYTList = dotKeKhaiList.filter(d => d.dich_vu === 'BHYT');

    if (dotKeKhaiBHYTList.length === 0) {
      this.message.warning('Không có dữ liệu BHYT để xuất');
      return of(false);
    }

    // Lấy thông tin user từ service
    return this.userService.getCurrentUserInfo().pipe(
      switchMap((user) => {
        console.log('Thông tin người dùng hiện tại:', user);
        // Lấy mã nhân viên từ user hiện tại, sẽ được sử dụng nếu đợt kê khai không có mã
        const maNhanVienFromCurrentUser = user?.ma_nhan_vien || '';
        console.log('Mã nhân viên từ người dùng hiện tại:', maNhanVienFromCurrentUser);

        // Tạo mảng Observables cho mỗi đợt kê khai
        const observables = dotKeKhaiBHYTList
          .filter(dotKeKhai => dotKeKhai.id !== undefined) // Lọc bỏ các đợt kê khai không có id
          .map(dotKeKhai => {
            // Lấy mã nhân viên từ đợt kê khai hiện tại
            const maNhanVienFromDotKeKhai = dotKeKhai.nguoi_tao || '';
            console.log(`Đợt kê khai ${dotKeKhai.ten_dot} - Mã nhân viên: ${maNhanVienFromDotKeKhai}`);

            return this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(dotKeKhai.id!).pipe(
              map((keKhaiBHYTs: any[]) => {
                // Sắp xếp dữ liệu theo số biên lai tăng dần
                keKhaiBHYTs.sort((a, b) => {
                  // Nếu một trong hai bản ghi không có số biên lai, đặt nó ở cuối
                  if (!a.so_bien_lai && !b.so_bien_lai) return 0;
                  if (!a.so_bien_lai) return 1;
                  if (!b.so_bien_lai) return -1;

                  // Nếu cùng quyển biên lai, so sánh số biên lai
                  if (a.QuyenBienLai?.quyen_so === b.QuyenBienLai?.quyen_so) {
                    const soBienLaiA = parseInt(a.so_bien_lai || '0');
                    const soBienLaiB = parseInt(b.so_bien_lai || '0');
                    return soBienLaiA - soBienLaiB;
                  }

                  // Nếu khác quyển biên lai, so sánh quyển biên lai
                  return (a.QuyenBienLai?.quyen_so || '').localeCompare(b.QuyenBienLai?.quyen_so || '');
                });

                // Cập nhật lại STT sau khi sắp xếp và thêm mã nhân viên
                keKhaiBHYTs = keKhaiBHYTs.map((item, index) => {
                  // Ưu tiên lấy mã nhân viên theo thứ tự:
                  // 1. Từ item.nguoi_tao (nếu có)
                  // 2. Từ đợt kê khai (nguoi_tao)
                  // 3. Từ user hiện tại
                  const maNhanVienThu = item.nguoi_tao || maNhanVienFromDotKeKhai || maNhanVienFromCurrentUser || '';

                  console.log(`Người tham gia ${item.ho_ten} - Mã nhân viên: ${maNhanVienThu}`);

                  return {
                    ...item,
                    stt: index + 1,
                    tenDotKeKhai: dotKeKhai.ten_dot, // Thêm tên đợt kê khai vào mỗi bản ghi
                    maNhanVienThu: maNhanVienThu // Gán mã nhân viên thu
                  };
                });

                return {
                  dotKeKhai,
                  keKhaiBHYTs
                };
              }),
              catchError(error => {
                console.error(`Lỗi khi lấy dữ liệu cho đợt kê khai ${dotKeKhai.ten_dot}:`, error);
                return of({
                  dotKeKhai,
                  keKhaiBHYTs: []
                });
              })
            );
          });

        // Kết hợp tất cả kết quả
        return observables.length > 0 ?
          forkJoin(observables) :
          of([]);
      }),
      map((results: any[]) => {
        // Ghép tất cả dữ liệu từ nhiều đợt kê khai
        let allData: any[] = [];
        let stt = 1;

        results.forEach(result => {
          if (result && result.keKhaiBHYTs && result.keKhaiBHYTs.length > 0) {
            // Cập nhật lại STT cho toàn bộ dữ liệu
            const updatedItems = result.keKhaiBHYTs.map((item: any) => ({
              ...item,
              stt: stt++
            }));

            allData = [...allData, ...updatedItems];
          }
        });

        if (allData.length === 0) {
          this.message.warning('Không có dữ liệu chi tiết để xuất');
          return false;
        }

        // Tạo workbook
        const wb = XLSX.utils.book_new();

        // Thêm 2 dòng trống
        const emptyRows = [
          Array(13).fill(''),  // Dòng 1 trống với 13 cột
          Array(13).fill('')   // Dòng 2 trống với 13 cột
        ];

        // Chuẩn bị dữ liệu cho sheet
        const keKhaiHeaders = [
          'STT', // Cột A - Số thứ tự
          'HoTen', // Cột B - Họ tên người tham gia
          'MasoBHXH', // Cột C - Mã số BHXH
          'MaPhongBan', // Cột D - Mã phòng ban (để trống)
          'Loai', // Cột E - Loại (mặc định là 1)
          'PA', // Cột F - Phương án đóng (ON/TM/GH)
          'TyleNSDP', // Cột G - Tỷ lệ NSDP (để trống)
          'NgayBienLai', // Cột H - Ngày biên lai
          'SoBienLai', // Cột I - Số biên lai (để trống)
          'NguoiThamGiaThu', // Cột J - Người thu
          'Tiendong', // Cột K - Tiền đóng (mặc định 2,340,000)
          'TienDongThucTe', // Cột L - Tiền đóng thực tế (để trống)
          'MucHuong', // Cột M - Mức hưởng (mặc định là 4)
          'TuNgay', // Cột N - Từ ngày (để trống)
          'NgayChet', // Cột O - Ngày chết (để trống)
          'HotroKhac', // Cột P - Hỗ trợ khác (để trống)
          'TenTinhDangSS', // Cột Q - Tên tỉnh đăng ký (để trống)
          'Matinh_DangSS', // Cột R - Mã tỉnh đăng ký
          'Tenhuyen_DangSS', // Cột S - Tên huyện đăng ký
          'Mahuyen_DangSS', // Cột T - Mã huyện đăng ký
          'TenxaDangSS', // Cột U - Tên xã đăng ký
          'Maxa_DangSS', // Cột V - Mã xã đăng ký
          'Diachi_DangSS', // Cột W - Địa chỉ đăng ký
          'Sothang', // Cột X - Số tháng đóng
          'Ghichu', // Cột Y - Ghi chú (để trống)
          'NgaySinh', // Cột Z - Ngày sinh
          'GioiTinh', // Cột AA - Giới tính
          'TenTinhBenhVien', // Cột AB - Tên tỉnh bệnh viện (để trống)
          'MaTinhBenhVien', // Cột AC - Mã tỉnh nơi khám quyết định
          'TenBenhVien', // Cột AD - Tên bệnh viện (để trống)
          'MaBenhVien', // Cột AE - Mã bệnh viện
          'MavungSS', // Cột AF - Mã vùng (để trống)
          'Tk1_Save', // Cột AG - TK1 Save (để trống)
          'CMND', // Cột AH - CCCD
          'Maho_Giadinh', // Cột AI - Mã hộ gia đình
          'TenDotKeKhai', // Cột AJ - Tên đợt kê khai
          'QuocTich', // Cột AK - Quốc tịch
          '', // Cột AL - Để trống
          '', // Cột AM - Để trống
          'TenTinhKS', // Cột AN - Tên tỉnh khai sinh (để trống)
          'MaTinh_KS', // Cột AO - Mã tỉnh khai sinh
          'TenHuyenKS', // Cột AP - Tên huyện khai sinh (để trống)
          'MaHuyen_KS', // Cột AQ - Mã huyện khai sinh
          'TenXaKS', // Cột AR - Tên xã khai sinh (để trống)
          'MaXa_KS', // Cột AS - Mã xã khai sinh
          'TenTinhNN', // Cột AT - Tên tỉnh nơi khám (để trống)
          'Matinh_NN', // Cột AU - Mã tỉnh nơi khám quyết định
          'TenHuyenNN', // Cột AV - Tên huyện nơi khám (để trống)
          'Mahuyen_NN', // Cột AW - Mã huyện nơi khám quyết định
          'TenXaNN', // Cột AX - Tên xã nơi khám (để trống)
          'Maxa_NN', // Cột AY - Mã xã nơi khám quyết định
          'Diachi_NN', // Cột AZ - Địa chỉ nơi khám quyết định
          '', // Cột BA - Để trống
          '', // Cột BB - Để trống
          '', // Cột BC - Để trống
          '', // Cột BD - Để trống
          '', // Cột BE - Để trống
          '', // Cột BF - Để trống
          '', // Cột BG - Để trống
          '', // Cột BH - Để trống
          'SoCCCD', // Cột BI - Số CCCD
          'SoBienLai', // Cột BJ - Số biên lai
          'NgayBienLai', // Cột BK - Ngày biên lai
          'MaNhanvienThu', // Cột BL - Mã nhân viên thu
        ];

        const keKhaiData = allData.map((item: any) => {
          // Sử dụng mã nhân viên đã được gán trong bước xử lý dữ liệu
          const maNhanVienThu = item.maNhanVienThu || '';
          console.log(`Xuất Excel: ${item.ho_ten} - Mã nhân viên: ${maNhanVienThu}`);

          return [
            item.stt, // Sử dụng STT từ API
            item.ho_ten,
            item.ma_so_bhxh || '',
            '', // Để trống cột D (MaPhongBan)
            '1', // Cột E giá trị mặc định là 1
            this.getPhuongAnDongText(item.phuong_an_dong || ''),
            '', // Cột G trống
            item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '',
            item.so_bien_lai ? (item.QuyenBienLai ?
              `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
              item.so_bien_lai
            ) : '',
            typeof item.nguoi_thu !== 'undefined' ? item.nguoi_thu.toString() : '',
            '2340000', // Cột K - Tiendong - giá trị mặc định không có dấu phẩy
            '0', // Cột L - giá trị mặc định là 0
            '4', // Cột M giá trị mặc định là 4
            item.han_the_moi_tu ? new Date(item.han_the_moi_tu).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '', // Cột N hiển thị Hạn thẻ mới từ
            '', // Cột O trống
            '', // Cột P trống
            '', // Cột Q trống
            item.ma_tinh_nkq || '', // Cột R - Mã tỉnh
            '', // Cột S - Tên huyện (trống)
            item.ma_huyen_nkq || '', // Cột T - Mã huyện
            '', // Cột U - Tên xã (trống)
            item.ma_xa_nkq || '', // Cột V - Mã xã
            item.dia_chi_nkq || '', // Cột W - Địa chỉ
            item.so_thang_dong?.toString() || '', // Cột X hiển thị số tháng đóng
            // Cột Y - Thêm "nghỉ học" nếu người tham gia có tuổi nhỏ hơn 18
            this.isUnder18(item.ngay_sinh) ? 'Nghỉ học' : (item.is_urgent ? 'Thẻ Gấp' : ''),
            item.ngay_sinh ? new Date(item.ngay_sinh).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '', // Cột Z hiển thị ngày sinh
            this.getGioiTinhValue(item.gioi_tinh), // Cột AA hiển thị giới tính
            '', // Cột AB trống
            item.ma_tinh_nkq || '', // Cột AC hiển thị mã tỉnh nơi khám quyết định
            '', // Cột AD trống
            item.ma_benh_vien || '', // Cột AE hiển thị mã bệnh viện
            '', // Cột AF trống
            'x', // Cột AG giá trị mặc định là x
            item.cccd || '', // Cột AH hiển thị CCCD
            item.ma_hgd || '', // Cột AI hiển thị mã hộ gia đình
            item.tenDotKeKhai || '', // Cột AJ hiển thị tên đợt kê khai
            item.quoc_tich || 'VN', // Cột AK hiển thị quốc tịch, mặc định là VN
            '', // Cột AL trống
            '', // Cột AM trống
            '', // Cột AN trống
            item.ma_tinh_ks || '', // Cột AO hiển thị mã tỉnh khai sinh
            '', // Cột AP trống
            item.ma_huyen_ks || '', // Cột AQ hiển thị mã huyện khai sinh
            '', // Cột AR trống
            item.ma_xa_ks || '', // Cột AS hiển thị mã xã khai sinh
            '', // Cột AT trống
            item.ma_tinh_nkq || '', // Cột AU hiển thị mã tỉnh nơi khám quyết định
            '', // Cột AV trống
            item.ma_huyen_nkq || '', // Cột AW hiển thị mã huyện nơi khám quyết định
            '', // Cột AX trống
            item.ma_xa_nkq || '', // Cột AY hiển thị mã xã nơi khám quyết định
            item.dia_chi_nkq || '', // Cột AZ hiển thị địa chỉ nơi khám quyết định
            '', // Cột BA trống
            '', // Cột BB trống
            '', // Cột BC trống
            '', // Cột BD trống
            '', // Cột BE trống
            '', // Cột BF trống
            '', // Cột BG trống
            '', // Cột BH trống
            item.cccd || '', // Cột BI hiển thị CCCD
            item.so_bien_lai ? (item.QuyenBienLai ?
              `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
              item.so_bien_lai
            ) : '', // Cột BJ - Số biên lai
            item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '', // Cột BK - Ngày biên lai
            maNhanVienThu, // Cột BL - Mã nhân viên thu
          ];
        });

        // Tạo worksheet từ dữ liệu
        const ws = XLSX.utils.aoa_to_sheet([...emptyRows, keKhaiHeaders, ...keKhaiData]);

        // Thiết lập độ rộng cột
        const maxWidth = 120;
        const colWidths = Array(keKhaiHeaders.length).fill({ wch: 15 });

        // Cột STT hẹp hơn
        colWidths[0] = { wch: 5 };

        // Cột họ tên rộng hơn
        colWidths[1] = { wch: 30 };

        // Cột địa chỉ rộng hơn
        colWidths[22] = { wch: 40 };
        colWidths[38] = { wch: 40 };

        ws['!cols'] = colWidths;

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu');

        // Tạo tên file với timestamp
        const now = new Date();
        const fileName = `VNPT_BHYT_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.xlsx`;

        // Xuất file Excel
        XLSX.writeFile(wb, fileName);

        this.message.success(`Xuất dữ liệu thành công! Đã xuất ${allData.length} bản ghi từ ${results.length} đợt kê khai.`);
        return true;
      }),
      catchError(error => {
        console.error('Lỗi khi xuất dữ liệu VNPT:', error);
        this.message.error('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.');
        return of(false);
      })
    );
  }

  // Xuất Excel cho một đợt kê khai
  xuatExcelDotKeKhai(dotKeKhai: DotKeKhai): Observable<boolean> {
    if (!dotKeKhai || !dotKeKhai.id) {
      this.message.warning('Không tìm thấy thông tin đợt kê khai');
      return of(false);
    }

    if (dotKeKhai.dich_vu !== 'BHYT') {
      this.message.warning('Chỉ hỗ trợ xuất dữ liệu kê khai BHYT');
      return of(false);
    }

    const dotKeKhaiId = dotKeKhai.id;

    // Lấy thông tin user từ service
    return this.userService.getCurrentUserInfo().pipe(
      switchMap((user) => {
        const maNhanVien = user.maNhanVien || '';

        // Gọi service để lấy dữ liệu kê khai
        return this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(dotKeKhaiId).pipe(
          map((keKhaiBHYTs: any[]) => {
            // Sắp xếp dữ liệu theo số biên lai tăng dần
            keKhaiBHYTs.sort((a, b) => {
              // Nếu một trong hai bản ghi không có số biên lai, đặt nó ở cuối
              if (!a.so_bien_lai && !b.so_bien_lai) return 0;
              if (!a.so_bien_lai) return 1;
              if (!b.so_bien_lai) return -1;

              // Nếu cùng quyển biên lai, so sánh số biên lai
              if (a.QuyenBienLai?.quyen_so === b.QuyenBienLai?.quyen_so) {
                return parseInt(a.so_bien_lai) - parseInt(b.so_bien_lai);
              }

              // Nếu khác quyển biên lai, so sánh quyển biên lai
              return (a.QuyenBienLai?.quyen_so || '').localeCompare(b.QuyenBienLai?.quyen_so || '');
            });

            // Cập nhật lại STT sau khi sắp xếp
            keKhaiBHYTs = keKhaiBHYTs.map((item, index) => ({
              ...item,
              stt: index + 1
            }));

            // Chuẩn bị dữ liệu cho sheet danh sách kê khai
            const keKhaiHeaders = [
              'STT', // Cột A - Số thứ tự
              'HoTen', // Cột B - Họ tên người tham gia
              'MasoBHXH', // Cột C - Mã số BHXH
              'MaPhongBan', // Cột D - Mã phòng ban (để trống)
              'Loai', // Cột E - Loại (mặc định là 1)
              'PA', // Cột F - Phương án đóng (ON/TM/GH)
              'TyleNSDP', // Cột G - Tỷ lệ NSDP (để trống)
              'NgayBienLai', // Cột H - Ngày biên lai
              'SoBienLai', // Cột I - Số biên lai (để trống)
              'NguoiThamGiaThu', // Cột J - Người thu
              'Tiendong', // Cột K - Tiền đóng (mặc định 2,340,000)
              'TienDongThucTe', // Cột L - Tiền đóng thực tế (để trống)
              'MucHuong', // Cột M - Mức hưởng (mặc định là 4)
              'TuNgay', // Cột N - Từ ngày (để trống)
              'NgayChet', // Cột O - Ngày chết (để trống)
              'HotroKhac', // Cột P - Hỗ trợ khác (để trống)
              'TenTinhDangSS', // Cột Q - Tên tỉnh đăng ký (để trống)
              'Matinh_DangSS', // Cột R - Mã tỉnh đăng ký
              'Tenhuyen_DangSS', // Cột S - Tên huyện đăng ký
              'Mahuyen_DangSS', // Cột T - Mã huyện đăng ký
              'TenxaDangSS', // Cột U - Tên xã đăng ký
              'Maxa_DangSS', // Cột V - Mã xã đăng ký
              'Diachi_DangSS', // Cột W - Địa chỉ đăng ký
              'Sothang', // Cột X - Số tháng đóng
              'Ghichu', // Cột Y - Ghi chú (để trống)
              'NgaySinh', // Cột Z - Ngày sinh
              'GioiTinh', // Cột AA - Giới tính
              'TenTinhBenhVien', // Cột AB - Tên tỉnh bệnh viện (để trống)
              'MaTinhBenhVien', // Cột AC - Mã tỉnh nơi khám quyết định
              'TenBenhVien', // Cột AD - Tên bệnh viện (để trống)
              'MaBenhVien', // Cột AE - Mã bệnh viện
              'MavungSS', // Cột AF - Mã vùng (để trống)
              'Tk1_Save', // Cột AG - TK1 Save (để trống)
              'CMND', // Cột AH - CCCD
              'Maho_Giadinh', // Cột AI - Mã hộ gia đình
              '', // Cột AJ - Để trống
              'QuocTich', // Cột AK - Quốc tịch
              '', // Cột AL - Để trống
              '', // Cột AM - Để trống
              'TenTinhKS', // Cột AN - Tên tỉnh khai sinh (để trống)
              'MaTinh_KS', // Cột AO - Mã tỉnh khai sinh
              'TenHuyenKS', // Cột AP - Tên huyện khai sinh (để trống)
              'MaHuyen_KS', // Cột AQ - Mã huyện khai sinh
              'TenXaKS', // Cột AR - Tên xã khai sinh (để trống)
              'MaXa_KS', // Cột AS - Mã xã khai sinh
              'TenTinhNN', // Cột AT - Tên tỉnh nơi khám (để trống)
              'Matinh_NN', // Cột AU - Mã tỉnh nơi khám quyết định
              'TenHuyenNN', // Cột AV - Tên huyện nơi khám (để trống)
              'Mahuyen_NN', // Cột AW - Mã huyện nơi khám quyết định
              'TenXaNN', // Cột AX - Tên xã nơi khám (để trống)
              'Maxa_NN', // Cột AY - Mã xã nơi khám quyết định
              'Diachi_NN', // Cột AZ - Địa chỉ nơi khám quyết định
              '', // Cột BA - Để trống
              '', // Cột BB - Để trống
              '', // Cột BC - Để trống
              '', // Cột BD - Để trống
              '', // Cột BE - Để trống
              '', // Cột BF - Để trống
              '', // Cột BG - Để trống
              '', // Cột BH - Để trống
              'SoCCCD', // Cột BI - Số CCCD
              'SoBienLai', // Cột BJ - Số biên lai
              'NgayBienLai', // Cột BK - Ngày biên lai
              'MaNhanvienThu', // Cột BL - Mã nhân viên thu
            ];

            // Thêm 2 dòng trống trước header
            const emptyRows = [
              Array(13).fill(''),  // Dòng 1 trống với 13 cột
              Array(13).fill('')   // Dòng 2 trống với 13 cột
            ];

            const keKhaiData = keKhaiBHYTs.map((item: any) => {
              // Lấy mã nhân viên từ người tạo đợt kê khai
              const maNhanVienThu = dotKeKhai.nguoi_tao || maNhanVien || '12345';

              return [
                item.stt, // Sử dụng STT từ API
                item.ho_ten,
                item.ma_so_bhxh || '',
                '', // Để trống cột D (MaPhongBan)
                '1', // Cột E giá trị mặc định là 1
                this.getPhuongAnDongText(item.phuong_an_dong || ''),
                '', // Cột G trống
                item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '',
                item.so_bien_lai ? (item.QuyenBienLai ?
                  `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
                  item.so_bien_lai
                ) : '',
                typeof item.nguoi_thu !== 'undefined' ? item.nguoi_thu.toString() : '',
                '2340000', // Cột K - Tiendong - giá trị mặc định không có dấu phẩy
                '0', // Cột L - giá trị mặc định là 0
                '4', // Cột M giá trị mặc định là 4
                item.han_the_moi_tu ? new Date(item.han_the_moi_tu).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '', // Cột N hiển thị Hạn thẻ mới từ
                '', // Cột O trống
                '', // Cột P trống
                '', // Cột Q trống
                item.ma_tinh_nkq || '', // Cột R - Mã tỉnh
                '', // Cột S - Tên huyện (trống)
                item.ma_huyen_nkq || '', // Cột T - Mã huyện
                '', // Cột U - Tên xã (trống)
                item.ma_xa_nkq || '', // Cột V - Mã xã
                item.dia_chi_nkq || '', // Cột W - Địa chỉ
                item.so_thang_dong?.toString() || '', // Cột X hiển thị số tháng đóng
                // Cột Y - Thêm "nghỉ học" nếu người tham gia có tuổi nhỏ hơn 18
                this.isUnder18(item.ngay_sinh) ? 'Nghỉ học' : (item.is_urgent ? 'Thẻ Gấp' : ''),
                item.ngay_sinh ? new Date(item.ngay_sinh).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '', // Cột Z hiển thị ngày sinh
                this.getGioiTinhValue(item.gioi_tinh), // Cột AA hiển thị giới tính
                '', // Cột AB trống
                item.ma_tinh_nkq || '', // Cột AC hiển thị mã tỉnh nơi khám quyết định
                '', // Cột AD trống
                item.ma_benh_vien || '', // Cột AE hiển thị mã bệnh viện
                '', // Cột AF trống
                'x', // Cột AG giá trị mặc định là x
                item.cccd || '', // Cột AH hiển thị CCCD
                item.ma_hgd || '', // Cột AI hiển thị mã hộ gia đình
                '', // Cột AJ trống
                item.quoc_tich || 'VN', // Cột AK hiển thị quốc tịch, mặc định là VN
                '', // Cột AL trống
                '', // Cột AM trống
                '', // Cột AN trống
                item.ma_tinh_ks || '', // Cột AO hiển thị mã tỉnh khai sinh
                '', // Cột AP trống
                item.ma_huyen_ks || '', // Cột AQ hiển thị mã huyện khai sinh
                '', // Cột AR trống
                item.ma_xa_ks || '', // Cột AS hiển thị mã xã khai sinh
                '', // Cột AT trống
                item.ma_tinh_nkq || '', // Cột AU hiển thị mã tỉnh nơi khám quyết định
                '', // Cột AV trống
                item.ma_huyen_nkq || '', // Cột AW hiển thị mã huyện nơi khám quyết định
                '', // Cột AX trống
                item.ma_xa_nkq || '', // Cột AY hiển thị mã xã nơi khám quyết định
                item.dia_chi_nkq || '', // Cột AZ hiển thị địa chỉ nơi khám quyết định
                '', // Cột BA trống
                '', // Cột BB trống
                '', // Cột BC trống
                '', // Cột BD trống
                '', // Cột BE trống
                '', // Cột BF trống
                '', // Cột BG trống
                '', // Cột BH trống
                item.cccd || '', // Cột BI hiển thị CCCD
                item.so_bien_lai ? (item.QuyenBienLai ?
                  `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
                  item.so_bien_lai
                ) : '', // Cột BJ - Số biên lai
                item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '', // Cột BK - Ngày biên lai
                maNhanVienThu, // Cột BL - Mã nhân viên thu
              ];
            });

            // Tạo workbook và thêm sheet danh sách kê khai
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([...emptyRows, keKhaiHeaders, ...keKhaiData]);
            XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu');

            // Tạo style cho sheet
            ws['!cols'] = [
              { wch: 8 },  // STT
              { wch: 30 }, // HoTen
              { wch: 15 }, // Mã số BHXH
              { wch: 10 }, // Cột D trống
              { wch: 10 }, // Cột E trống
              { wch: 15 }, // Phương án đóng
              { wch: 10 }, // Cột G trống
              { wch: 15 }, // Ngày biên lai
              { wch: 10 }, // Cột I trống
              { wch: 15 }, // Người thứ
              { wch: 15 }, // Cột K
              { wch: 10 }, // Cột L
              { wch: 10 }, // Cột M
              { wch: 10 }, // Cột N trống
              { wch: 10 }, // Cột O trống
              { wch: 10 }, // Cột P trống
              { wch: 10 }, // Cột Q trống
              { wch: 15 }, // Cột R trống
              { wch: 10 }, // Cột S trống
              { wch: 15 }, // Cột T trống
              { wch: 10 }, // Cột U trống
              { wch: 50 }, // Cột V Diachi_DangSS
              { wch: 10 }, // Cột W trống
              { wch: 15 }, // Cột X Sothang
              { wch: 10 }, // Cột Y trống
              { wch: 15 }, // Cột Z NgaySinh
              { wch: 10 }, // Cột AA GioiTinh
              { wch: 10 }, // Cột AB trống
              { wch: 15 }, // Cột AC trống
              { wch: 10 }, // Cột AD trống
              { wch: 15 }, // Cột AE trống
              { wch: 10 }, // Cột AF trống
              { wch: 10 }, // Cột AG trống
              { wch: 15 }, // Cột AH trống
              { wch: 15 }, // Cột AI trống
              { wch: 15 }, // Cột AK trống
              { wch: 10 }, // Cột AL trống
              { wch: 10 }, // Cột AM trống
              { wch: 10 }, // Cột AN trống
              { wch: 15 }, // Cột AO trống
              { wch: 10 }, // Cột AP trống
              { wch: 15 }, // Cột AQ trống
              { wch: 10 }, // Cột AR trống
              { wch: 15 }, // Cột AS trống
              { wch: 10 }, // Cột AT trống
              { wch: 15 }, // Cột AU trống
              { wch: 10 }, // Cột AV trống
              { wch: 15 }, // Cột AW trống
              { wch: 10 }, // Cột AX trống
              { wch: 15 }, // Cột AY trống
              { wch: 50 }, // Cột AZ DiaChi_DangSS
              { wch: 10 }, // Cột BA trống
              { wch: 10 }, // Cột BB trống
              { wch: 10 }, // Cột BC trống
              { wch: 10 }, // Cột BD trống
              { wch: 10 }, // Cột BE trống
              { wch: 10 }, // Cột BF trống
              { wch: 10 }, // Cột BG trống
              { wch: 10 }, // Cột BH trống
              { wch: 15 }, // Cột BI trống
              { wch: 15 }, // Cột BJ trống
              { wch: 15 }, // Cột BK trống
              { wch: 15 }, // Cột BL - MaNhanvienThu
            ];

            // Xuất file Excel
            XLSX.writeFile(wb, `ke-khai-bhyt-${dotKeKhai.ten_dot.toLowerCase().replace(/\s+/g, '-')}.xlsx`);

            this.message.success('Xuất dữ liệu kê khai BHYT thành công');
            return true;
          })
        );
      }),
      catchError((error) => {
        console.error('Lỗi khi xuất Excel:', error);
        if (error.status === 404) {
          this.message.error(`Không tìm thấy đợt kê khai có ID: ${dotKeKhai.id}`);
        } else {
          this.message.error('Có lỗi xảy ra khi xuất dữ liệu kê khai BHYT');
        }
        return of(false);
      })
    );
  }

  // Xuất Excel cho nhiều đợt kê khai
  xuatExcelNhieuDotKeKhai(dotKeKhaiList: DotKeKhai[]): boolean {
    if (dotKeKhaiList.length === 0) {
      this.message.warning('Không có dữ liệu để xuất');
      return false;
    }

    // Chuẩn bị dữ liệu
    const headers = [
      'STT',
      'Tên đợt kê khai',
      'Loại dịch vụ',
      'Đơn vị',
      'Số thẻ',
      'Tổng tiền',
      'Ngày tạo',
      'Ngày gửi',
      'Trạng thái',
      'Người tạo',
      'Mã hồ sơ'
    ];

    const data = dotKeKhaiList.map((item, index) => [
      index + 1,
      item.ten_dot,
      item.dich_vu,
      this.getDonViName(item),
      item.tong_so_the || 0,
      item.tong_so_tien ? item.tong_so_tien.toLocaleString('vi-VN') + ' đ' : '0 đ',
      item.ngay_tao ? new Date(item.ngay_tao).toLocaleDateString('vi-VN') : '',
      item.ngay_gui ? new Date(item.ngay_gui).toLocaleDateString('vi-VN') : '',
      this.getTrangThaiText(item.trang_thai),
      item.nguoi_tao || '',
      item.ma_ho_so || ''
    ]);

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Thiết lập độ rộng cột
    ws['!cols'] = [
      { wch: 5 },   // STT
      { wch: 40 },  // Tên đợt kê khai
      { wch: 15 },  // Loại dịch vụ
      { wch: 30 },  // Đơn vị
      { wch: 10 },  // Số thẻ
      { wch: 15 },  // Tổng tiền
      { wch: 15 },  // Ngày tạo
      { wch: 15 },  // Ngày gửi
      { wch: 15 },  // Trạng thái
      { wch: 15 },  // Người tạo
      { wch: 15 }   // Mã hồ sơ
    ];

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách kê khai');

    // Tên file và xuất Excel
    const fileName = `danh-sach-ke-khai-${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    this.message.success('Xuất Excel thành công');
    return true;
  }

  // Phương thức hỗ trợ - lấy tên đơn vị
  getDonViName(data: DotKeKhai): string {
    if (!data) {
      return 'Không có';
    }

    // Kiểm tra DonVi với tên khác nhau
    if (data.DonVi?.tenDonVi) {
      return data.DonVi.tenDonVi;
    }

    if (data.donVi?.tenDonVi) {
      return data.donVi.tenDonVi;
    }

    if (data.don_vi?.tenDonVi) {
      return data.don_vi.tenDonVi;
    }

    // Kiểm tra thông qua cách tiếp cận any
    const anyData = data as any;

    if (anyData.DonVi?.ten_don_vi) {
      return anyData.DonVi.ten_don_vi;
    }

    // Kiểm tra các trường hợp khác nhau
    if (anyData['don_vi']?.tenDonVi) {
      return anyData['don_vi'].tenDonVi;
    }

    if (anyData['don_vi']?.ten_don_vi) {
      return anyData['don_vi'].ten_don_vi;
    }

    if (anyData['DonVi']?.tenDonVi) {
      return anyData['DonVi'].tenDonVi;
    }

    if (anyData['donvi']?.tenDonVi) {
      return anyData['donvi'].tenDonVi;
    }

    // Hiển thị đơn vị ID nếu có
    if (data.don_vi_id) {
      return `ID: ${data.don_vi_id}`;
    }

    // Khi không có thông tin đơn vị
    return 'Không có';
  }

  // Phương thức hỗ trợ - lấy trạng thái text
  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'chua_gui':
        return 'Chưa gửi';
      case 'da_gui':
        return 'Đã gửi';
      case 'da_duyet':
        return 'Đã duyệt';
      case 'da_tu_choi':
        return 'Đã từ chối';
      case 'cho_thanh_toan':
        return 'Chờ thanh toán';
      case 'cho_xu_ly':
        return 'Chờ xử lý';
      case 'hoan_thanh':
        return 'Hoàn thành';
      case 'tu_choi':
        return 'Từ chối';
      case 'dang_xu_ly':
        return 'Đang xử lý';
      default:
        return 'Không xác định';
    }
  }

  // Xuất file VNPT với mã nhân viên được chỉ định từ ngoài
  xuatVNPTNhieuDotVoiMaNhanVien(dotKeKhaiList: DotKeKhai[], maNhanVienThuFromUser: string): Observable<boolean> {
    if (!dotKeKhaiList || dotKeKhaiList.length === 0) {
      this.message.warning('Không có dữ liệu để xuất');
      return of(false);
    }

    // Chỉ chọn các đợt kê khai BHYT
    const dotKeKhaiBHYTList = dotKeKhaiList.filter(d => d.dich_vu === 'BHYT');

    if (dotKeKhaiBHYTList.length === 0) {
      this.message.warning('Không có dữ liệu BHYT để xuất');
      return of(false);
    }

    console.log('Sử dụng mã nhân viên từ người dùng:', maNhanVienThuFromUser);

    // Lấy thông tin user từ service
    return this.userService.getCurrentUserInfo().pipe(
      switchMap((user) => {
        // Tạo mảng Observables cho mỗi đợt kê khai
        const observables = dotKeKhaiBHYTList
          .filter(dotKeKhai => dotKeKhai.id !== undefined) // Lọc bỏ các đợt kê khai không có id
          .map(dotKeKhai => {
            return this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(dotKeKhai.id!).pipe(
              map((keKhaiBHYTs: any[]) => {
                // Sắp xếp dữ liệu theo số biên lai tăng dần
                keKhaiBHYTs.sort((a, b) => {
                  // Nếu một trong hai bản ghi không có số biên lai, đặt nó ở cuối
                  if (!a.so_bien_lai && !b.so_bien_lai) return 0;
                  if (!a.so_bien_lai) return 1;
                  if (!b.so_bien_lai) return -1;

                  // Nếu cùng quyển biên lai, so sánh số biên lai
                  if (a.QuyenBienLai?.quyen_so === b.QuyenBienLai?.quyen_so) {
                    const soBienLaiA = parseInt(a.so_bien_lai || '0');
                    const soBienLaiB = parseInt(b.so_bien_lai || '0');
                    return soBienLaiA - soBienLaiB;
                  }

                  // Nếu khác quyển biên lai, so sánh quyển biên lai
                  return (a.QuyenBienLai?.quyen_so || '').localeCompare(b.QuyenBienLai?.quyen_so || '');
                });

                // Cập nhật lại STT sau khi sắp xếp
                keKhaiBHYTs = keKhaiBHYTs.map((item, index) => ({
                  ...item,
                  stt: index + 1,
                  tenDotKeKhai: dotKeKhai.ten_dot, // Thêm tên đợt kê khai vào mỗi bản ghi
                  maNhanVienThu: maNhanVienThuFromUser // Thêm mã nhân viên thu từ người dùng
                }));

                return {
                  dotKeKhai,
                  keKhaiBHYTs
                };
              }),
              catchError(error => {
                console.error(`Lỗi khi lấy dữ liệu cho đợt kê khai ${dotKeKhai.ten_dot}:`, error);
                return of({
                  dotKeKhai,
                  keKhaiBHYTs: []
                });
              })
            );
          });

        // Kết hợp tất cả kết quả
        return observables.length > 0 ?
          forkJoin(observables) :
          of([]);
      }),
      map((results: any[]) => {
        // Ghép tất cả dữ liệu từ nhiều đợt kê khai
        let allData: any[] = [];
        let stt = 1;

        results.forEach(result => {
          if (result && result.keKhaiBHYTs && result.keKhaiBHYTs.length > 0) {
            // Cập nhật lại STT cho toàn bộ dữ liệu
            const updatedItems = result.keKhaiBHYTs.map((item: any) => ({
              ...item,
              stt: stt++
            }));

            allData = [...allData, ...updatedItems];
          }
        });

        if (allData.length === 0) {
          this.message.warning('Không có dữ liệu chi tiết để xuất');
          return false;
        }

        // Tạo workbook
        const wb = XLSX.utils.book_new();

        // Thêm 2 dòng trống
        const emptyRows = [
          Array(13).fill(''),  // Dòng 1 trống với 13 cột
          Array(13).fill('')   // Dòng 2 trống với 13 cột
        ];

        // Chuẩn bị dữ liệu cho sheet
        const keKhaiHeaders = [
          'STT', // Cột A - Số thứ tự
          'HoTen', // Cột B - Họ tên người tham gia
          'MasoBHXH', // Cột C - Mã số BHXH
          'MaPhongBan', // Cột D - Mã phòng ban (để trống)
          'Loai', // Cột E - Loại (mặc định là 1)
          'PA', // Cột F - Phương án đóng (ON/TM/GH)
          'TyleNSDP', // Cột G - Tỷ lệ NSDP (để trống)
          'NgayBienLai', // Cột H - Ngày biên lai
          'SoBienLai', // Cột I - Số biên lai (để trống)
          'NguoiThamGiaThu', // Cột J - Người thu
          'Tiendong', // Cột K - Tiền đóng (mặc định 2,340,000)
          'TienDongThucTe', // Cột L - Tiền đóng thực tế (để trống)
          'MucHuong', // Cột M - Mức hưởng (mặc định là 4)
          'TuNgay', // Cột N - Từ ngày (để trống)
          'NgayChet', // Cột O - Ngày chết (để trống)
          'HotroKhac', // Cột P - Hỗ trợ khác (để trống)
          'TenTinhDangSS', // Cột Q - Tên tỉnh đăng ký (để trống)
          'Matinh_DangSS', // Cột R - Mã tỉnh đăng ký
          'Tenhuyen_DangSS', // Cột S - Tên huyện đăng ký
          'Mahuyen_DangSS', // Cột T - Mã huyện đăng ký
          'TenxaDangSS', // Cột U - Tên xã đăng ký
          'Maxa_DangSS', // Cột V - Mã xã đăng ký
          'Diachi_DangSS', // Cột W - Địa chỉ đăng ký
          'Sothang', // Cột X - Số tháng đóng
          'Ghichu', // Cột Y - Ghi chú (để trống)
          'NgaySinh', // Cột Z - Ngày sinh
          'GioiTinh', // Cột AA - Giới tính
          'TenTinhBenhVien', // Cột AB - Tên tỉnh bệnh viện (để trống)
          'MaTinhBenhVien', // Cột AC - Mã tỉnh nơi khám quyết định
          'TenBenhVien', // Cột AD - Tên bệnh viện (để trống)
          'MaBenhVien', // Cột AE - Mã bệnh viện
          'MavungSS', // Cột AF - Mã vùng (để trống)
          'Tk1_Save', // Cột AG - TK1 Save (để trống)
          'CMND', // Cột AH - CCCD
          'Maho_Giadinh', // Cột AI - Mã hộ gia đình
          'TenDotKeKhai', // Cột AJ - Tên đợt kê khai
          'QuocTich', // Cột AK - Quốc tịch
          '', // Cột AL - Để trống
          '', // Cột AM - Để trống
          'TenTinhKS', // Cột AN - Tên tỉnh khai sinh (để trống)
          'MaTinh_KS', // Cột AO - Mã tỉnh khai sinh
          'TenHuyenKS', // Cột AP - Tên huyện khai sinh (để trống)
          'MaHuyen_KS', // Cột AQ - Mã huyện khai sinh
          'TenXaKS', // Cột AR - Tên xã khai sinh (để trống)
          'MaXa_KS', // Cột AS - Mã xã khai sinh
          'TenTinhNN', // Cột AT - Tên tỉnh nơi khám (để trống)
          'Matinh_NN', // Cột AU - Mã tỉnh nơi khám quyết định
          'TenHuyenNN', // Cột AV - Tên huyện nơi khám (để trống)
          'Mahuyen_NN', // Cột AW - Mã huyện nơi khám quyết định
          'TenXaNN', // Cột AX - Tên xã nơi khám (để trống)
          'Maxa_NN', // Cột AY - Mã xã nơi khám quyết định
          'Diachi_NN', // Cột AZ - Địa chỉ nơi khám quyết định
          '', // Cột BA - Để trống
          '', // Cột BB - Để trống
          '', // Cột BC - Để trống
          '', // Cột BD - Để trống
          '', // Cột BE - Để trống
          '', // Cột BF - Để trống
          '', // Cột BG - Để trống
          '', // Cột BH - Để trống
          'SoCCCD', // Cột BI - Số CCCD
          'SoBienLai', // Cột BJ - Số biên lai
          'NgayBienLai', // Cột BK - Ngày biên lai
          'MaNhanvienThu', // Cột BL - Mã nhân viên thu
        ];

        const keKhaiData = allData.map((item: any) => {
          // Sử dụng mã nhân viên từ người dùng
          const maNhanVienThu = item.maNhanVienThu || maNhanVienThuFromUser;
          console.log(`Sử dụng mã nhân viên cho ${item.ho_ten}: ${maNhanVienThu}`);

          return [
            item.stt, // Sử dụng STT từ API
            item.ho_ten,
            item.ma_so_bhxh || '',
            '', // Để trống cột D (MaPhongBan)
            '1', // Cột E giá trị mặc định là 1
            this.getPhuongAnDongText(item.phuong_an_dong || ''),
            '', // Cột G trống
            item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '',
            item.so_bien_lai ? (item.QuyenBienLai ?
              `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
              item.so_bien_lai
            ) : '',
            typeof item.nguoi_thu !== 'undefined' ? item.nguoi_thu.toString() : '',
            '2340000', // Cột K - Tiendong - giá trị mặc định không có dấu phẩy
            '0', // Cột L - giá trị mặc định là 0
            '4', // Cột M giá trị mặc định là 4
            item.han_the_moi_tu ? new Date(item.han_the_moi_tu).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '', // Cột N hiển thị Hạn thẻ mới từ
            '', // Cột O trống
            '', // Cột P trống
            '', // Cột Q trống
            item.ma_tinh_nkq || '', // Cột R - Mã tỉnh
            '', // Cột S - Tên huyện (trống)
            item.ma_huyen_nkq || '', // Cột T - Mã huyện
            '', // Cột U - Tên xã (trống)
            item.ma_xa_nkq || '', // Cột V - Mã xã
            item.dia_chi_nkq || '', // Cột W - Địa chỉ
            item.so_thang_dong?.toString() || '', // Cột X hiển thị số tháng đóng
            // Cột Y - Thêm "nghỉ học" nếu người tham gia có tuổi nhỏ hơn 18
            this.isUnder18(item.ngay_sinh) ? 'Nghỉ học' : (item.is_urgent ? 'Thẻ Gấp' : ''),
            item.ngay_sinh ? new Date(item.ngay_sinh).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '', // Cột Z hiển thị ngày sinh
            this.getGioiTinhValue(item.gioi_tinh), // Cột AA hiển thị giới tính
            '', // Cột AB trống
            item.ma_tinh_nkq || '', // Cột AC hiển thị mã tỉnh nơi khám quyết định
            '', // Cột AD trống
            item.ma_benh_vien || '', // Cột AE hiển thị mã bệnh viện
            '', // Cột AF trống
            'x', // Cột AG giá trị mặc định là x
            item.cccd || '', // Cột AH hiển thị CCCD
            item.ma_hgd || '', // Cột AI hiển thị mã hộ gia đình
            '', // Cột AJ trống
            item.quoc_tich || 'VN', // Cột AK hiển thị quốc tịch, mặc định là VN
            '', // Cột AL trống
            '', // Cột AM trống
            '', // Cột AN trống
            item.ma_tinh_ks || '', // Cột AO hiển thị mã tỉnh khai sinh
            '', // Cột AP trống
            item.ma_huyen_ks || '', // Cột AQ hiển thị mã huyện khai sinh
            '', // Cột AR trống
            item.ma_xa_ks || '', // Cột AS hiển thị mã xã khai sinh
            '', // Cột AT trống
            item.ma_tinh_nkq || '', // Cột AU hiển thị mã tỉnh nơi khám quyết định
            '', // Cột AV trống
            item.ma_huyen_nkq || '', // Cột AW hiển thị mã huyện nơi khám quyết định
            '', // Cột AX trống
            item.ma_xa_nkq || '', // Cột AY hiển thị mã xã nơi khám quyết định
            item.dia_chi_nkq || '', // Cột AZ hiển thị địa chỉ nơi khám quyết định
            '', // Cột BA trống
            '', // Cột BB trống
            '', // Cột BC trống
            '', // Cột BD trống
            '', // Cột BE trống
            '', // Cột BF trống
            '', // Cột BG trống
            '', // Cột BH trống
            item.cccd || '', // Cột BI hiển thị CCCD
            item.so_bien_lai ? (item.QuyenBienLai ?
              `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
              item.so_bien_lai
            ) : '', // Cột BJ - Số biên lai
            item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '', // Cột BK - Ngày biên lai
            maNhanVienThu, // Cột BL - Mã nhân viên thu - sử dụng mã được chỉ định từ ngoài
          ];
        });

        // Tạo worksheet từ dữ liệu
        const ws = XLSX.utils.aoa_to_sheet([...emptyRows, keKhaiHeaders, ...keKhaiData]);

        // Thiết lập độ rộng cột
        const maxWidth = 120;
        const colWidths = Array(keKhaiHeaders.length).fill({ wch: 15 });

        // Cột STT hẹp hơn
        colWidths[0] = { wch: 5 };

        // Cột họ tên rộng hơn
        colWidths[1] = { wch: 30 };

        // Cột địa chỉ rộng hơn
        colWidths[22] = { wch: 40 };
        colWidths[38] = { wch: 40 };

        ws['!cols'] = colWidths;

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu');

        // Tạo tên file với timestamp
        const now = new Date();
        const fileName = `VNPT_BHYT_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.xlsx`;

        // Xuất file Excel
        XLSX.writeFile(wb, fileName);

        this.message.success(`Xuất dữ liệu thành công! Đã xuất ${allData.length} bản ghi từ ${results.length} đợt kê khai.`);
        return true;
      }),
      catchError(error => {
        console.error('Lỗi khi xuất dữ liệu VNPT:', error);
        this.message.error('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.');
        return of(false);
      })
    );
  }
}