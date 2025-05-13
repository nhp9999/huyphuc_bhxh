import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { BHYTService, TraCuuThongTinBHYTRequest, TraCuuThongTinBHYTResponse } from '../../services/tra-cuu-thong-tin-bhyt.service';
import { SSMV2Service } from '../../services/ssmv2.service';
import { DiaChiService } from '../../services/dia-chi.service';
import { CaptchaModalComponent } from '../../shared/components/captcha-modal/captcha-modal.component';

@Component({
  selector: 'app-tra-cuu-thong-tin-bhyt',
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
    NzModalModule,
    NzTabsModule,
    CaptchaModalComponent
  ],
  templateUrl: './tra-cuu-thong-tin-bhyt.component.html',
  styleUrls: ['./tra-cuu-thong-tin-bhyt.component.scss']
})
export class TraCuuThongTinBHYTComponent implements OnInit {
  traCuuBHYTForm!: FormGroup;
  isLoading = false;
  daTimKiem = false;
  loiTraCuu = '';
  ketQuaTraCuu: any = null;

  // Additional properties for SSMV2
  isVNPostLoginVisible = false;
  vnpostLoginForm!: FormGroup;
  isLoadingLogin = false;

  // Additional properties for detail modal
  isModalVisible = false;
  chiTietItem: any = null;

  constructor(
    private fb: FormBuilder,
    private bhytService: BHYTService,
    private message: NzMessageService,
    private ssmv2Service: SSMV2Service,
    private diaChiService: DiaChiService
  ) {}

  ngOnInit(): void {
    this.traCuuBHYTForm = this.fb.group({
      maSoBHXH: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });

    this.vnpostLoginForm = this.fb.group({
      userName: ['884000_xa_tli_phuoclt'],
      password: ['123456d@D'],
      text: ['', Validators.required]
    });

    // Kiểm tra và tự động đăng nhập VNPost nếu chưa có token
    if (!this.ssmv2Service.getToken()) {
      setTimeout(() => {
        this.autoLoginVNPost();
      }, 500);
    }
  }

  submitBHYTForm(): void {
    if (this.traCuuBHYTForm.invalid) {
      Object.values(this.traCuuBHYTForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    this.daTimKiem = true;
    this.loiTraCuu = '';
    this.ketQuaTraCuu = null;

    const formData: TraCuuThongTinBHYTRequest = {
      maSoBHXH: this.traCuuBHYTForm.value.maSoBHXH
    };

    this.bhytService.traCuuThongTinBHYT(formData).subscribe({
      next: (response: TraCuuThongTinBHYTResponse) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.ketQuaTraCuu = response.data;

          // Xử lý dữ liệu địa chỉ
          // Xử lý dữ liệu tỉnh
          if (this.ketQuaTraCuu.maTinhLh) {
            this.ketQuaTraCuu.tenTinhLh = this.ketQuaTraCuu.maTinhLh;
            this.getTenTinhFromMaTinh(this.ketQuaTraCuu.maTinhLh);
          }

          // Xử lý dữ liệu huyện
          if (this.ketQuaTraCuu.maHuyenLh) {
            this.ketQuaTraCuu.tenHuyenLh = this.ketQuaTraCuu.maHuyenLh;
            this.getTenHuyenFromMaHuyen(this.ketQuaTraCuu.maHuyenLh);
          }

          // Xử lý dữ liệu xã
          if (this.ketQuaTraCuu.maXaLh) {
            this.ketQuaTraCuu.tenXaLh = this.ketQuaTraCuu.maXaLh;
            this.getTenXaFromMaXa(this.ketQuaTraCuu.maXaLh);
          }

          // Xử lý dữ liệu bệnh viện
          if (this.ketQuaTraCuu.maBenhVien) {
            this.ketQuaTraCuu.tenBenhVienFull = this.getTenBenhVienFromMaBenhVien(this.ketQuaTraCuu.maBenhVien);
          }

          // Xử lý dữ liệu BHXH
          if (this.ketQuaTraCuu.maBhxh) {
            this.ketQuaTraCuu.tenBHXHFull = this.getTenBHXHFromMaBHXH(this.ketQuaTraCuu.maBhxh);
          }

          this.message.success('Tra cứu thông tin BHYT thành công');
        } else {
          if (response.error && response.error.toString().includes('authenticat')) {
            this.isVNPostLoginVisible = true;
          } else {
            this.loiTraCuu = response.message || 'Không tìm thấy thông tin thẻ BHYT';
          }
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error && error.error && error.error.includes('xác thực')) {
          this.isVNPostLoginVisible = true;
        } else {
          this.loiTraCuu = error.error || 'Có lỗi xảy ra khi tra cứu thông tin BHYT';
        }
      }
    });
  }

  resetForm(): void {
    this.traCuuBHYTForm.reset();
    this.daTimKiem = false;
    this.loiTraCuu = '';
    this.ketQuaTraCuu = null;
  }

  formatMaSoBHXH(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    input.value = value;
    this.traCuuBHYTForm.controls['maSoBHXH'].setValue(value);
  }

  xemChiTietBHYT(): void {
    this.chiTietItem = { ...this.ketQuaTraCuu };

    // Đảm bảo thông tin tỉnh được hiển thị đúng trong modal
    if (this.chiTietItem.maTinhLh && !this.chiTietItem.tenTinhLh) {
      this.diaChiService.getDanhMucTinhByMa(this.chiTietItem.maTinhLh).subscribe({
        next: (tinh) => {
          if (tinh && tinh.ten) {
            this.chiTietItem.tenTinhLh = `${this.chiTietItem.maTinhLh} - ${tinh.ten}`;
          }
        }
      });
    }

    // Đảm bảo thông tin huyện được hiển thị đúng trong modal
    if (this.chiTietItem.maHuyenLh && !this.chiTietItem.tenHuyenLh) {
      this.diaChiService.getDanhMucHuyenByMa(this.chiTietItem.maHuyenLh).subscribe({
        next: (huyen) => {
          if (huyen && huyen.ten) {
            this.chiTietItem.tenHuyenLh = `${this.chiTietItem.maHuyenLh} - ${huyen.ten}`;
          }
        }
      });
    }

    // Đảm bảo thông tin xã được hiển thị đúng trong modal
    if (this.chiTietItem.maXaLh && !this.chiTietItem.tenXaLh) {
      this.diaChiService.getDanhMucXaByMa(this.chiTietItem.maXaLh).subscribe({
        next: (xa) => {
          if (xa && xa.ten) {
            this.chiTietItem.tenXaLh = `${this.chiTietItem.maXaLh} - ${xa.ten}`;
          }
        }
      });
    }

    // Đảm bảo thông tin bệnh viện được hiển thị đúng trong modal
    if (this.chiTietItem.maBenhVien && !this.chiTietItem.tenBenhVienFull) {
      this.chiTietItem.tenBenhVienFull = this.getTenBenhVienFromMaBenhVien(this.chiTietItem.maBenhVien);
    }

    // Đảm bảo thông tin BHXH được hiển thị đúng trong modal
    if (this.chiTietItem.maBhxh && !this.chiTietItem.tenBHXHFull) {
      this.chiTietItem.tenBHXHFull = this.getTenBHXHFromMaBHXH(this.chiTietItem.maBhxh);
    }

    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  // Phương thức này không còn cần thiết khi sử dụng component captcha mới

  handleLogin(loginData: any): void {
    this.isLoadingLogin = true;

    console.log('Đang đăng nhập với dữ liệu:', {
      userName: loginData.userName,
      text: loginData.text,
      code: loginData.code.substring(0, 20) + '...' // Chỉ hiển thị một phần mã captcha
    });

    this.ssmv2Service.authenticate(loginData).subscribe({
      next: (data: any) => {
        if (data && data.body && data.body.access_token) {
          localStorage.setItem('ssmv2_token', `Bearer ${data.body.access_token}`);
          this.isLoadingLogin = false;
          this.isVNPostLoginVisible = false;
          this.message.success('Đăng nhập thành công');
          // Retry search after login
          this.submitBHYTForm();
        } else {
          this.isLoadingLogin = false;
          this.message.error('Đăng nhập không thành công');
        }
      },
      error: (err: any) => {
        this.isLoadingLogin = false;
        console.error('Lỗi đăng nhập:', err);

        if (err.error && err.error.error === 'invalid_captcha') {
          this.message.error('Mã xác nhận không chính xác');
        } else if (err.error && err.error.error === 'invalid_login') {
          this.message.error('Tài khoản hoặc mật khẩu không chính xác');
          // Hiển thị thông tin đăng nhập để người dùng biết
          console.log('Thông tin đăng nhập hiện tại:', {
            userName: this.vnpostLoginForm.get('userName')?.value,
            password: '********'
          });
        } else {
          this.message.error('Đăng nhập không thành công: ' + (err.error?.error_description || 'Lỗi không xác định'));
        }
      }
    });
  }

  closeVNPostLogin(): void {
    this.isVNPostLoginVisible = false;
  }

  // Thêm phương thức hiển thị form đăng nhập VNPost
  showVNPostLogin(): void {
    this.isVNPostLoginVisible = true;
  }

  // Phương thức kích hoạt tab
  activateTab(tabId: string): void {
    // Ẩn tất cả các tab và bỏ active
    document.querySelectorAll('.tab-pane').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-header').forEach(header => {
      header.classList.remove('active');
    });

    // Kích hoạt tab được chọn
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }

    // Kích hoạt header tương ứng
    const tabIndex = tabId.replace('tab', '');
    const tabHeaders = document.querySelectorAll('.tab-header');
    if (tabHeaders.length >= parseInt(tabIndex)) {
      tabHeaders[parseInt(tabIndex) - 1].classList.add('active');
    }
  }

  // Phương thức này không còn cần thiết khi sử dụng component captcha mới

  // Helpers for display
  isTheConHan(denNgay: string): boolean {
    if (!denNgay) return false;

    // Xử lý chuỗi dạng yyyy-MM-dd
    if (denNgay.includes('-')) {
      return new Date(denNgay) > new Date();
    }

    // Xử lý chuỗi dạng yyyyMMdd
    if (denNgay.length === 8) {
      const year = parseInt(denNgay.substring(0, 4));
      const month = parseInt(denNgay.substring(4, 6)) - 1;
      const day = parseInt(denNgay.substring(6, 8));
      return new Date(year, month, day) > new Date();
    }

    return false;
  }

  formatTyLeDong(): string {
    const ketQua = this.ketQuaTraCuu;
    if (!ketQua) return 'Không có';

    let tyLe = '';
    if (ketQua.tyLeBhyt > 0) tyLe += `BHYT: ${ketQua.tyLeBhyt}%. `;
    if (ketQua.tyLeNstw > 0) tyLe += `NSTW: ${ketQua.tyLeNstw}%. `;
    if (ketQua.tyLeNsnn > 0) tyLe += `NSNN: ${ketQua.tyLeNsnn}%. `;
    if (ketQua.tyLeNsdp > 0) tyLe += `NSDP: ${ketQua.tyLeNsdp}%. `;
    if (ketQua.tyLeKhac > 0) tyLe += `Khác: ${ketQua.tyLeKhac}%.`;

    return tyLe || 'Không có';
  }

  // Phương thức lấy tên xã từ mã xã
  getTenXaFromMaXa(maXa: string): string {
    if (!maXa) return 'Không có';

    // Kiểm tra nếu maXa đã là tên xã
    if (maXa.startsWith('Xã ') || maXa.startsWith('Phường ') || maXa.startsWith('Thị trấn ')) {
      return maXa;
    }

    // Lưu trữ mã xã để hiển thị
    let displayValue = maXa;

    // Gọi API để lấy thông tin xã
    this.diaChiService.getDanhMucXaByMa(maXa).subscribe({
      next: (xa) => {
        if (xa && xa.ten) {
          // Định dạng hiển thị: "mã - tên"
          displayValue = `${maXa} - ${xa.ten}`;

          // Cập nhật giá trị trong ketQuaTraCuu để hiển thị đúng
          if (this.ketQuaTraCuu) {
            this.ketQuaTraCuu.tenXaLh = displayValue;
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin xã:', err);
      }
    });

    return displayValue;
  }

  // Phương thức lấy tên tỉnh từ mã tỉnh
  getTenTinhFromMaTinh(maTinh: string): string {
    if (!maTinh) return 'Không có';

    // Lưu trữ mã tỉnh để hiển thị
    let displayValue = maTinh;

    // Gọi API để lấy thông tin tỉnh
    this.diaChiService.getDanhMucTinhByMa(maTinh).subscribe({
      next: (tinh) => {
        if (tinh && tinh.ten) {
          // Định dạng hiển thị: "mã - tên"
          displayValue = `${maTinh} - ${tinh.ten}`;

          // Cập nhật giá trị trong ketQuaTraCuu để hiển thị đúng
          if (this.ketQuaTraCuu) {
            this.ketQuaTraCuu.tenTinhLh = displayValue;
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin tỉnh:', err);
      }
    });

    return displayValue;
  }

  // Phương thức lấy tên huyện từ mã huyện
  getTenHuyenFromMaHuyen(maHuyen: string): string {
    if (!maHuyen) return 'Không có';

    // Lưu trữ mã huyện để hiển thị
    let displayValue = maHuyen;

    // Gọi API để lấy thông tin huyện
    this.diaChiService.getDanhMucHuyenByMa(maHuyen).subscribe({
      next: (huyen) => {
        if (huyen && huyen.ten) {
          // Định dạng hiển thị: "mã - tên"
          displayValue = `${maHuyen} - ${huyen.ten}`;

          // Cập nhật giá trị trong ketQuaTraCuu để hiển thị đúng
          if (this.ketQuaTraCuu) {
            this.ketQuaTraCuu.tenHuyenLh = displayValue;
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin huyện:', err);
      }
    });

    return displayValue;
  }

  // Phương thức lấy tên bệnh viện từ mã bệnh viện
  getTenBenhVienFromMaBenhVien(maBenhVien: string): string {
    if (!maBenhVien) return 'Không có';

    // Nếu đã có tên bệnh viện trong kết quả, sử dụng luôn
    if (this.ketQuaTraCuu && this.ketQuaTraCuu.tenBenhVien) {
      return `${maBenhVien} - ${this.ketQuaTraCuu.tenBenhVien}`;
    }

    return maBenhVien;
  }

  // Phương thức lấy tên cơ quan BHXH từ mã BHXH
  getTenBHXHFromMaBHXH(maBHXH: string): string {
    if (!maBHXH) return 'Không có';

    // Nếu đã có tên cơ quan BHXH trong kết quả, sử dụng luôn
    if (this.ketQuaTraCuu && this.ketQuaTraCuu.tenCqbh) {
      return `${maBHXH} - ${this.ketQuaTraCuu.tenCqbh}`;
    }

    return maBHXH;
  }

  // Phương thức này không còn cần thiết khi sử dụng component captcha mới

  // Thêm phương thức tự động đăng nhập VNPost
  autoLoginVNPost(fromSubmit: boolean = false): void {
    // Lấy captcha
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        console.log('Captcha response in autoLogin:', res);
        let captchaCode = '';

        if (res && res.data) {
          captchaCode = res.data.code;
        } else if (res && res.captchaBase64) {
          captchaCode = res.captchaCode;
        } else {
          console.warn('Không nhận được dữ liệu captcha từ API');
          if (fromSubmit) {
            this.isLoading = false;
            this.showVNPostLogin();
          }
          return;
        }

        // Thực hiện đăng nhập tự động với thông tin đăng nhập đúng
        const data = {
          grant_type: 'password',
          userName: '884000_xa_tli_phuoclt', // Sử dụng tài khoản cố định
          password: '123456d@D',             // Sử dụng mật khẩu cố định
          text: captchaCode,                 // Sử dụng mã captcha làm text
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
                  this.submitBHYTForm();
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

            // Ghi log chi tiết hơn về lỗi
            if (err.error) {
              console.log('Chi tiết lỗi đăng nhập:', {
                error: err.error.error,
                description: err.error.error_description,
                type: err.error.type
              });
            }

            if (fromSubmit) {
              this.isLoading = false;
              this.showVNPostLogin(); // Hiển thị form đăng nhập nếu tự động đăng nhập thất bại
            }
          }
        });
      },
      error: (err) => {
        console.error('Lỗi khi lấy captcha:', err);
        if (fromSubmit) {
          this.isLoading = false;
          this.showVNPostLogin();
        }
      }
    });
  }
}