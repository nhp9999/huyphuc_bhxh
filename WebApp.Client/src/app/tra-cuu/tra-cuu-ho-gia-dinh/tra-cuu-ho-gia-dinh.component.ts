import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule, NzSelectItemInterface } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BHXHService, TraCuuHoGiaDinhRequest } from '../../services/tra-cuu-ma-so-bhxh.service';
import { LocationService } from '../../services/location.service';
import { finalize } from 'rxjs/operators';
import { SSMV2Service } from '../../services/ssmv2.service';
import { CaptchaModalComponent } from '../../shared/components/captcha-modal/captcha-modal.component';

interface TinhThanh {
  ma: string;
  ten: string;
}

interface QuanHuyen {
  ma: string;
  ten: string;
  maTinh: string;
}

interface XaPhuong {
  ma: string;
  ten: string;
  maHuyen: string;
}

@Component({
  selector: 'app-tra-cuu-ho-gia-dinh',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzSpinModule,
    NzAlertModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzIconModule,
    NzTagModule,
    NzSelectModule,
    NzTabsModule,
    NzModalModule,
    NzTableModule,
    CaptchaModalComponent
  ],
  templateUrl: './tra-cuu-ho-gia-dinh.component.html',
  styleUrls: ['./tra-cuu-ho-gia-dinh.component.scss']
})
export class TraCuuHoGiaDinhComponent implements OnInit {
  traCuuHoGiaDinhForm!: FormGroup;
  isLoading = false;
  isLoadingData = false;
  ketQuaTraCuu: any[] = [];
  daTimKiem = false;
  loiTraCuu = '';

  danhSachTinh: TinhThanh[] = [];
  danhSachHuyen: QuanHuyen[] = [];
  danhSachXa: XaPhuong[] = [];

  huyenTheoTinh: QuanHuyen[] = [];
  xaTheoHuyen: XaPhuong[] = [];

  // Thêm thuộc tính SSMV2
  isVNPostLoginVisible = false;
  vnpostLoginForm!: FormGroup;
  isLoadingLogin = false;

  // Thêm thuộc tính cho modal chi tiết
  isModalVisible = false;
  chiTietItem: any = null;
  thanhVienHo: any[] = [];

  // Thêm thuộc tính cho modal chi tiết thành viên
  isModalThanhVienVisible = false;
  chiTietThanhVien: any = null;

  constructor(
    private fb: FormBuilder,
    private bhxhService: BHXHService,
    private locationService: LocationService,
    private message: NzMessageService,
    private ssmv2Service: SSMV2Service
  ) {}

  ngOnInit(): void {
    this.traCuuHoGiaDinhForm = this.fb.group({
      maTinh: [null, [Validators.required]],
      maHuyen: [null, [Validators.required]],
      maXa: [null],
      maHo: [null],
      tenChuHo: [null]
    });

    this.loadDanhSachTinh();

    // Khởi tạo form đăng nhập VNPost
    this.vnpostLoginForm = this.fb.group({
      userName: ['884000_xa_tli_phuoclt', [Validators.required]],
      password: ['123456d@D', [Validators.required]],
      text: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]]
    });

    // Kiểm tra và tự động đăng nhập VNPost nếu chưa có token
    if (!this.ssmv2Service.getToken()) {
      setTimeout(() => {
        this.autoLoginVNPost();
      }, 500);
    }
  }

  loadDanhSachTinh(): void {
    this.isLoadingData = true;
    this.locationService.getProvinces()
      .pipe(finalize(() => this.isLoadingData = false))
      .subscribe({
        next: (provinces) => {
          this.danhSachTinh = provinces.map(province => ({
            ma: province.ma,
            ten: province.ten
          }));
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', err);
          this.message.error('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.');
        }
      });
  }

  onTinhChange(maTinh: string): void {
    if (!maTinh) {
      this.huyenTheoTinh = [];
      this.traCuuHoGiaDinhForm.patchValue({ maHuyen: null, maXa: null });
      this.xaTheoHuyen = [];
      return;
    }

    this.isLoadingData = true;
    this.locationService.getDistricts(maTinh)
      .pipe(finalize(() => this.isLoadingData = false))
      .subscribe({
        next: (districts) => {
          this.danhSachHuyen = districts.map(district => ({
            ma: district.ma,
            ten: district.ten,
            maTinh: district.ma_tinh
          }));
          this.huyenTheoTinh = this.danhSachHuyen;
          this.traCuuHoGiaDinhForm.patchValue({ maHuyen: null, maXa: null });
          this.xaTheoHuyen = [];
        },
        error: (err) => {
          console.error(`Lỗi khi lấy danh sách quận/huyện cho tỉnh ${maTinh}:`, err);
          this.message.error('Không thể tải danh sách quận/huyện. Vui lòng thử lại sau.');
          this.huyenTheoTinh = [];
        }
      });
  }

  onHuyenChange(maHuyen: string): void {
    if (!maHuyen) {
      this.xaTheoHuyen = [];
      this.traCuuHoGiaDinhForm.patchValue({ maXa: null });
      return;
    }

    this.isLoadingData = true;
    this.locationService.getCommunes(maHuyen)
      .pipe(finalize(() => this.isLoadingData = false))
      .subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.danhSachXa = response.data.map(commune => ({
              ma: commune.ma,
              ten: commune.ten,
              maHuyen: commune.ma_huyen
            }));
            this.xaTheoHuyen = this.danhSachXa;
          } else {
            this.xaTheoHuyen = [];
          }
          this.traCuuHoGiaDinhForm.patchValue({ maXa: null });
        },
        error: (err) => {
          console.error(`Lỗi khi lấy danh sách xã/phường cho huyện ${maHuyen}:`, err);
          this.message.error('Không thể tải danh sách xã/phường. Vui lòng thử lại sau.');
          this.xaTheoHuyen = [];
        }
      });
  }

  submitHoGiaDinhForm(): void {
    if (this.traCuuHoGiaDinhForm.valid) {
      this.isLoading = true;
      this.daTimKiem = true;
      this.loiTraCuu = '';

      // Kiểm tra token VNPost
      const token = this.ssmv2Service.getToken();
      if (!token) {
        // Tự động đăng nhập VNPost
        this.autoLoginVNPost(true);
        return;
      }

      // Lấy dữ liệu từ form
      const formData: TraCuuHoGiaDinhRequest = {
        maTinh: this.traCuuHoGiaDinhForm.value.maTinh,
        maHuyen: this.traCuuHoGiaDinhForm.value.maHuyen,
        maXa: this.traCuuHoGiaDinhForm.value.maXa || '',
        maHo: this.traCuuHoGiaDinhForm.value.maHo || '',
        tenChuHo: this.traCuuHoGiaDinhForm.value.tenChuHo || ''
      };

      console.log('Dữ liệu gửi đi:', formData);

      // Gọi API tra cứu hộ gia đình
      this.bhxhService.traCuuHoGiaDinh(formData)
        .subscribe({
          next: (res: any) => {
            this.isLoading = false;

            // Log response để debug
            console.log('Response từ API Hộ Gia Đình:', res);

            // Kiểm tra nếu response có chứa thông báo lỗi xác thực
            if (res && res.error === 'Lỗi xác thực') {
              this.ketQuaTraCuu = [];
              this.loiTraCuu = 'Lỗi xác thực: ' + (res.error_description || 'Không tìm thấy thông tin phiên đăng nhập');
              this.message.error(this.loiTraCuu);

              // Hiển thị form đăng nhập lại
              this.ssmv2Service.clearToken();
              this.message.warning('Vui lòng đăng nhập lại để tiếp tục');
              this.showVNPostLogin();
              return;
            }

            // Kiểm tra nếu response có status khác 200
            if (res && res.status && res.status !== 200) {
              this.ketQuaTraCuu = [];
              this.loiTraCuu = res.message || 'Có lỗi xảy ra khi tra cứu';
              this.message.error(this.loiTraCuu);
              return;
            }

            // Xử lý dữ liệu trả về
            if (res && res.success && res.data && res.data.length > 0) {
              // Xử lý tất cả kết quả
              this.ketQuaTraCuu = res.data.map((data: any) => ({
                maHo: data.maHo,
                tenChuHo: data.tenChuHo,
                diaChi: data.diaChi,
                soSoHoKhau: data.soSoHoKhau,
                loaiGiayTo: data.loaiGiayTo,
                dienThoai: data.dienThoai,
                trangThai: data.trangThai,
                ngayKeKhai: this.parseDate(data.ngayKeKhai, data.ngayKeKhaiDt),
                soLuongThanhVien: data.dsThanhVien ? data.dsThanhVien.length : 0,
                danhSachThanhVien: data.dsThanhVien ? data.dsThanhVien.map((tv: any) => ({
                  maSoBhxh: tv.soSoBhxh,
                  hoTen: tv.hoTen,
                  ngaySinh: tv.ngaySinhHienThi ? this.parseDateDisplay(tv.ngaySinhHienThi) : this.parseNgaySinh(tv.ngaySinh),
                  gioiTinh: tv.gioiTinhHienThi || (tv.gioiTinh === '1' ? 'Nam' : 'Nữ'),
                  soCCCD: tv.soCmnd || 'Không có',
                  mqhChuHo: tv.mqhChuHo || 'Không có',
                  quanHeVoiChuHo: tv.mqhChuHo || 'Không có',
                  noiSinh: `${tv.tenXaKs || ''}, ${tv.tenHuyenKs || ''}, ${tv.tenTinhKs || ''}`,
                  danToc: tv.danToc,
                  quocTich: tv.quocTich,
                  diaChi: tv.diaChiLh || 'Không có',
                  dienThoai: tv.soDienThoai || 'Không có'
                })) : []
              }));

              this.message.success(`Tra cứu thành công: Tìm thấy ${this.ketQuaTraCuu.length} hộ gia đình`);
            } else {
              this.ketQuaTraCuu = [];
              this.loiTraCuu = 'Không tìm thấy thông tin hộ gia đình';
              this.message.warning(this.loiTraCuu);
            }
          },
          error: (err: any) => {
            this.isLoading = false;
            this.ketQuaTraCuu = [];

            console.error('Lỗi khi tra cứu:', err);

            if (err.error === 'Lỗi xác thực') {
              this.loiTraCuu = 'Lỗi xác thực: ' + (err.error_description || 'Phiên làm việc đã hết hạn');
              this.message.error(this.loiTraCuu);
              this.ssmv2Service.clearToken();
              this.showVNPostLogin();
            } else {
              this.loiTraCuu = 'Đã xảy ra lỗi khi tra cứu: ' + (err.error?.message || err.message || 'Vui lòng thử lại sau');
              this.message.error(this.loiTraCuu);
            }
          }
        });
    } else {
      Object.values(this.traCuuHoGiaDinhForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  resetForm(): void {
    this.traCuuHoGiaDinhForm.reset();
    this.huyenTheoTinh = [];
    this.xaTheoHuyen = [];
    this.ketQuaTraCuu = [];
    this.daTimKiem = false;
    this.loiTraCuu = '';
  }

  filterOption = (input: string, option: NzSelectItemInterface): boolean => {
    const label = (option.nzLabel?.toString() || '').toLowerCase();
    const searchText = input.toLowerCase();
    return (
      label.includes(searchText) ||
      this.removeVietnameseTones(label).includes(this.removeVietnameseTones(searchText))
    );
  };

  private removeVietnameseTones(str: string): string {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    return str;
  }

  // Hiển thị form đăng nhập VNPost
  showVNPostLogin(): void {
    this.isVNPostLoginVisible = true;
  }

  // Đóng form đăng nhập VNPost
  closeVNPostLogin(): void {
    this.isVNPostLoginVisible = false;
  }

  // Phương thức này không còn cần thiết khi sử dụng component captcha mới

  // Đăng nhập VNPost
  handleLogin(loginData: any): void {
    this.isLoadingLogin = true;

    console.log('Gửi request đăng nhập với data:', { ...loginData, password: '***' });

    this.ssmv2Service.authenticate(loginData).subscribe({
      next: (response) => {
        this.isLoadingLogin = false;

        if (response.body?.access_token) {
          console.log('Xác thực thành công, token hết hạn sau:', response.body.expires_in, 'giây');
          this.message.success('Xác thực thành công');
          this.isVNPostLoginVisible = false;

          // Đảm bảo token đã được lưu trước khi tìm kiếm
          setTimeout(() => {
            this.submitHoGiaDinhForm();
          }, 1000);
        } else {
          this.message.error('Không nhận được token');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoadingLogin = false;

        if (err.error?.error === 'invalid_captcha') {
          this.message.error('Mã xác thực sai');
        } else if (err.error?.error_description?.includes('xác thực')) {
          this.message.error('Mã xác thực sai');
        } else if (err.error?.message) {
          this.message.error(err.error.message);
        } else {
          this.message.error('Xác thực thất bại, vui lòng thử lại');
        }
      }
    });
  }

  // Phương thức này không còn cần thiết khi sử dụng component captcha mới

  // Kiểm tra trạng thái đăng nhập VNPost
  isVNPostLoggedIn(): boolean {
    return !!this.ssmv2Service.getToken();
  }

  // Xem chi tiết hộ gia đình
  xemChiTiet(item: any): void {
    this.chiTietItem = item;
    this.thanhVienHo = item.danhSachThanhVien || [];
    this.isModalVisible = true;
  }

  // Đóng modal chi tiết
  closeModal(): void {
    this.isModalVisible = false;
  }

  // Thêm phương thức tự động đăng nhập VNPost
  autoLoginVNPost(fromSubmit: boolean = false): void {
    // Lấy captcha
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        if (res && res.data) {
          const captchaCode = res.data.code;

          // Thực hiện đăng nhập tự động
          const data = {
            grant_type: 'password',
            userName: this.vnpostLoginForm.get('userName')?.value,
            password: this.vnpostLoginForm.get('password')?.value,
            text: captchaCode, // Sử dụng mã captcha làm text
            code: captchaCode,
            clientId: 'ZjRiYmI5ZTgtZDcyOC00ODRkLTkyOTYtMDNjYmUzM2U4Yjc5',
            isWeb: true
          };

          this.ssmv2Service.authenticate(data).subscribe({
            next: (response) => {
              if (response.body?.access_token) {
                console.log('Tự động xác thực thành công');

                // Chỉ thực hiện tìm kiếm nếu đăng nhập từ quá trình submit form
                if (fromSubmit) {
                  setTimeout(() => {
                    this.submitHoGiaDinhForm();
                  }, 1000);
                }
              } else {
                if (fromSubmit) {
                  this.isLoading = false;
                }
              }
            },
            error: (err) => {
              console.error('Lỗi tự động đăng nhập:', err);
              if (fromSubmit) {
                this.isLoading = false;
                this.showVNPostLogin(); // Hiển thị form đăng nhập nếu tự động đăng nhập thất bại
              }
            }
          });
        } else {
          if (fromSubmit) {
            this.isLoading = false;
            this.showVNPostLogin();
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy captcha:', err);
        if (fromSubmit) {
          this.isLoading = false;
          this.showVNPostLogin(); // Hiển thị form đăng nhập nếu không lấy được captcha
        }
      }
    });
  }

  // Thêm phương thức để xử lý ngày tháng
  private parseDate(dateStr: string, dateDt: string): Date {
    if (dateDt) {
      return new Date(dateDt);
    }

    if (dateStr && dateStr.length === 8) {
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Tháng trong JS bắt đầu từ 0
      const day = parseInt(dateStr.substring(6, 8), 10);
      return new Date(year, month, day);
    }

    return new Date();
  }

  // Thêm phương thức để xử lý ngày tháng hiển thị
  private parseDateDisplay(dateDisplayStr: string): Date {
    if (!dateDisplayStr) return new Date();

    const parts = dateDisplayStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    return new Date();
  }

  // Thêm phương thức để xử lý ngày sinh từ định dạng YYYYMMDD
  private parseNgaySinh(ngaySinhStr: string): Date {
    if (ngaySinhStr && ngaySinhStr.length === 8) {
      const year = parseInt(ngaySinhStr.substring(0, 4), 10);
      const month = parseInt(ngaySinhStr.substring(4, 6), 10) - 1; // Tháng trong JS bắt đầu từ 0
      const day = parseInt(ngaySinhStr.substring(6, 8), 10);
      return new Date(year, month, day);
    }

    return new Date();
  }

  // Xem chi tiết thành viên
  xemChiTietThanhVien(thanhVien: any): void {
    this.chiTietThanhVien = thanhVien;
    this.isModalThanhVienVisible = true;
  }

  // Đóng modal chi tiết thành viên
  closeModalThanhVien(): void {
    this.isModalThanhVienVisible = false;
  }
}
