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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BHXHService, TraCuuThongTinBHXHRequest } from '../../services/tra-cuu-ma-so-bhxh.service';
import { finalize } from 'rxjs/operators';
import { SSMV2Service } from '../../services/ssmv2.service';
import { CaptchaModalComponent } from '../../shared/components/captcha-modal/captcha-modal.component';

@Component({
  selector: 'app-tra-cuu-thong-tin-bhxh',
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
  templateUrl: './tra-cuu-thong-tin-bhxh.component.html',
  styleUrls: ['./tra-cuu-thong-tin-bhxh.component.scss']
})
export class TraCuuThongTinBHXHComponent implements OnInit {
  traCuuBHXHForm!: FormGroup;
  isLoading = false;
  daTimKiem = false;
  loiTraCuu = '';
  ketQuaTraCuu: any = null; // Kết quả tra cứu sẽ là một đối tượng
  today: Date = new Date(); // Ngày hiện tại

  // Thêm thuộc tính SSMV2
  isVNPostLoginVisible = false;
  vnpostLoginForm!: FormGroup;
  isLoadingLogin = false;

  // Thêm thuộc tính cho modal chi tiết
  isModalVisible = false;
  chiTietItem: any = null;

  constructor(
    private fb: FormBuilder,
    private bhxhService: BHXHService,
    private message: NzMessageService,
    private ssmv2Service: SSMV2Service
  ) {}

  ngOnInit(): void {
    this.traCuuBHXHForm = this.fb.group({
      maSoBHXH: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });

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

  submitBHXHForm(): void {
    if (this.traCuuBHXHForm.valid) {
      this.isLoading = true;
      this.daTimKiem = true;
      this.loiTraCuu = '';
      this.ketQuaTraCuu = null;

      // Kiểm tra token VNPost
      const token = this.ssmv2Service.getToken();
      if (!token) {
        // Tự động đăng nhập VNPost
        this.autoLoginVNPost(true);
        return;
      }

      // Lấy dữ liệu từ form
      const formData: TraCuuThongTinBHXHRequest = {
        maSoBHXH: this.traCuuBHXHForm.value.maSoBHXH
      };

      console.log('Dữ liệu gửi đi:', formData);

      // Gọi API tra cứu thông tin BHXH
      this.bhxhService.traCuuThongTinBHXH(formData)
        .subscribe({
          next: (res: any) => {
            console.log('Response từ API BHXH:', res);

            // Kiểm tra nếu response có chứa thông báo lỗi xác thực
            if (res && res.error === 'Lỗi xác thực') {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = 'Lỗi xác thực: ' + (res.error_description || 'Không tìm thấy thông tin phiên đăng nhập');
              this.message.error(this.loiTraCuu);

              // Hiển thị form đăng nhập lại
              this.ssmv2Service.clearToken();
              this.message.warning('Vui lòng đăng nhập lại để tiếp tục');
              this.showVNPostLogin();
              this.isLoading = false;
              return;
            }

            // Kiểm tra nếu response có status khác 200
            if (res && res.status && res.status !== 200) {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = res.message || 'Có lỗi xảy ra khi tra cứu';
              this.message.error(this.loiTraCuu);
              this.isLoading = false;
              return;
            }

            // Xử lý dữ liệu trả về
            if (res && res.success && res.data) {
              this.ketQuaTraCuu = this.formatThongTinBHXH(res.data);
              // Không gọi API thông tin thẻ nữa
              this.isLoading = false;
              this.message.success('Tra cứu thành công thông tin BHXH');
            } else {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = 'Không tìm thấy thông tin BHXH';
              this.message.warning(this.loiTraCuu);
              this.isLoading = false;
            }
          },
          error: (err: any) => {
            this.isLoading = false;
            this.ketQuaTraCuu = null;

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
      Object.values(this.traCuuBHXHForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  // Xử lý định dạng dữ liệu thông tin BHXH
  private formatThongTinBHXH(data: any): any {
    return {
      maSoBHXH: data.maSoBhxh || data.maSoBHXH || '',
      hoTen: data.hoTen || '',
      ngaySinh: data.ngaySinhHienThi ? this.parseNgaySinhFromString(data.ngaySinhHienThi) : (data.ngaySinh ? this.parseNgaySinhFromNumber(data.ngaySinh) : null),
      gioiTinh: data.gioiTinhHienThi || (data.gioiTinh === 1 ? 'Nam' : (data.gioiTinh === 0 ? 'Nữ' : '')),
      soCCCD: data.cmnd || '',
      noiDangKyKhaiSinh: this.formatDiaChi(data.tenXaKs, data.tenHuyenKs, data.tenTinhKs),
      noiCuTru: this.formatDiaChi(data.tenXaNkq, data.tenHuyenNkq, data.tenTinhNkq),
      danToc: data.danTocHienThi || data.danToc || '',
      quocTich: data.quocTichHienThi || data.quocTich || 'Việt Nam',
      dienThoai: data.soDienThoai || '',
      trangThai: data.trangThai || '',
      maHo: data.maHoGiaDinh || '',
      noiLamViec: data.noiLamViec || '',
      chucVu: data.chucVu || '',

      // Thông tin đăng ký BHXH tự nguyện
      thangBatDau: data.thangBatDau || data.thangBd || '',
      ngayDangKy: data.ngayDk || (data.ngayDangKyDt ? this.formatDate(new Date(data.ngayDangKyDt)) : ''),
      phuongThucDong: data.phuongThucDong || '',
      phuongAn: data.phuongAn || '',
      mucDong: data.mucDong ? this.formatCurrency(data.mucDong) : '',
      soPhaiThu: data.soPhaiThu ? this.formatCurrency(data.soPhaiThu) : '',
      tienNLDPhaiNop: data.tienNldPhaiNop ? this.formatCurrency(data.tienNldPhaiNop) : '',
      tienNSNNHoTro: data.tienNsnnHoTro ? this.formatCurrency(data.tienNsnnHoTro) : '',
      tienLai: data.tienLai ? this.formatCurrency(data.tienLai) : '',
      tienThua: data.tienThua ? this.formatCurrency(data.tienThua) : '',
      tienNop: data.tienNop ? this.formatCurrency(data.tienNop) : '',
      loaiTien: data.loaiTien || 'VND',
      taiTuc: data.taiTuc === 'true' || data.taiTuc === true ? 'Có' : 'Không',

      // Thông tin đơn vị BHXH
      maDonViBHXH: data.maDmBhxh || '',
      tenDonViBHXH: data.tenDmBhxh || '',

      // Thông tin đơn vị thu
      maDonViThu: data.maDonVi || '',
      tenDonViThu: data.tenDonVi || '',

      // Thông tin tham gia BHXH bắt buộc
      isThamGiaBB: data.isThamGiaBB || false,
      thamGiaBB: data.thamGiaBB || 'Không',

      // Dữ liệu gốc
      raw: data
    };
  }

  // Tạo chuỗi địa chỉ từ xã, huyện, tỉnh
  private formatDiaChi(xa?: string, huyen?: string, tinh?: string): string {
    const parts = [xa, huyen, tinh].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Không có';
  }

  resetForm(): void {
    this.traCuuBHXHForm.reset();
    this.ketQuaTraCuu = null;
    this.daTimKiem = false;
    this.loiTraCuu = '';
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
  getCaptcha(): void {
    // Để trống vì đã được xử lý trong component captcha
  }

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
            this.submitBHXHForm();
          }, 1000);
        } else {
          this.message.error('Không nhận được token');
        }
      },
      error: (err: any) => {
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

  // Xem chi tiết BHXH
  xemChiTietBHXH(): void {
    this.chiTietItem = this.ketQuaTraCuu;
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
                    this.submitBHXHForm();
                  }, 1000);
                }
              } else {
                if (fromSubmit) {
                  this.isLoading = false;
                }
              }
            },
            error: (err: any) => {
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
          }
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy captcha:', err);
        if (fromSubmit) {
          this.isLoading = false;
          this.showVNPostLogin(); // Hiển thị form đăng nhập nếu không lấy được captcha
        }
      }
    });
  }

  // Kiểm tra và định dạng số BHXH
  formatMaSoBHXH(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Chỉ giữ lại các chữ số

    if (value.length > 10) {
      value = value.substring(0, 10); // Giới hạn 10 chữ số
    }

    input.value = value;
    this.traCuuBHXHForm.get('maSoBHXH')?.setValue(value);
  }

  // Kiểm tra thẻ còn hạn hay không
  isTheConHan(denNgay: Date | null | undefined): boolean {
    if (!denNgay) return false;

    try {
      // Chuyển về cùng định dạng để so sánh
      const expireDate = new Date(denNgay);
      const today = new Date();

      // Reset giờ, phút, giây để chỉ so sánh ngày
      expireDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return expireDate > today;
    } catch (error) {
      return false;
    }
  }

  // Phân tích chuỗi ngày sinh dạng dd/MM/yyyy
  private parseNgaySinhFromString(dateString: string): Date | null {
    if (!dateString) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
  }

  // Phân tích chuỗi ngày sinh dạng yyyyMMdd
  private parseNgaySinhFromNumber(dateNumber: string): Date | null {
    if (!dateNumber || dateNumber.length !== 8) return null;

    const year = parseInt(dateNumber.substring(0, 4), 10);
    const month = parseInt(dateNumber.substring(4, 6), 10) - 1;
    const day = parseInt(dateNumber.substring(6, 8), 10);

    return new Date(year, month, day);
  }

  // Định dạng số tiền
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Định dạng ngày tháng
  private formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}