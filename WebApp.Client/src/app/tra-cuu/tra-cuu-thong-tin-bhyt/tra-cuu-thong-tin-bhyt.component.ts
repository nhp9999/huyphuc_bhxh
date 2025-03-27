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
    NzTabsModule
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
  captchaImage = '';
  captchaCode = '';
  vnpostLoginForm!: FormGroup;
  isLoadingLogin = false;

  // Additional properties for detail modal
  isModalVisible = false;
  chiTietItem: any = null;

  constructor(
    private fb: FormBuilder,
    private bhytService: BHYTService,
    private message: NzMessageService,
    private ssmv2Service: SSMV2Service
  ) {}

  ngOnInit(): void {
    this.traCuuBHYTForm = this.fb.group({
      maSoBHXH: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });

    this.vnpostLoginForm = this.fb.group({
      userName: ['ssmv2'],
      password: ['ssmv2@123'],
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
          this.message.success('Tra cứu thông tin BHYT thành công');
        } else {
          if (response.error && response.error.toString().includes('authenticat')) {
            this.getCaptcha();
            this.isVNPostLoginVisible = true;
          } else {
            this.loiTraCuu = response.message || 'Không tìm thấy thông tin thẻ BHYT';
          }
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error && error.error && error.error.includes('xác thực')) {
          this.getCaptcha();
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
    this.chiTietItem = this.ketQuaTraCuu;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  // SSMV2 login handlers
  getCaptcha(): void {
    this.ssmv2Service.getCaptcha().subscribe({
      next: (data: any) => {
        this.captchaImage = data.captchaBase64;
        this.captchaCode = data.captchaCode;
        this.vnpostLoginForm.get('text')?.setValue('');
      },
      error: (err: any) => {
        this.message.error('Không thể tải mã xác nhận');
      }
    });
  }

  handleLogin(): void {
    if (this.vnpostLoginForm.invalid) {
      Object.values(this.vnpostLoginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoadingLogin = true;
    this.ssmv2Service.authenticate(this.vnpostLoginForm.value).subscribe({
      next: (data: any) => {
        if (data && data.access_token) {
          localStorage.setItem('ssmv2_token', `Bearer ${data.access_token}`);
          this.isLoadingLogin = false;
          this.isVNPostLoginVisible = false;
          this.message.success('Đăng nhập thành công');
          // Retry search after login
          this.submitBHYTForm();
        } else {
          this.isLoadingLogin = false;
          this.message.error('Đăng nhập không thành công');
          this.getCaptcha();
        }
      },
      error: (err: any) => {
        this.isLoadingLogin = false;
        this.message.error('Đăng nhập không thành công');
        this.getCaptcha();
      }
    });
  }

  closeVNPostLogin(): void {
    this.isVNPostLoginVisible = false;
  }

  // Thêm phương thức hiển thị form đăng nhập VNPost
  showVNPostLogin(): void {
    this.isVNPostLoginVisible = true;
    this.getCaptcha();
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

  convertToUpperCase(event: any): void {
    const value = event.target.value;
    this.vnpostLoginForm.get('text')?.setValue(value.toUpperCase());
  }

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

  // Thêm phương thức tự động đăng nhập VNPost
  autoLoginVNPost(fromSubmit: boolean = false): void {
    // Lấy captcha
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.captchaImage = res.data.image;
          this.captchaCode = res.data.code;
          
          // Thực hiện đăng nhập tự động
          const data = {
            grant_type: 'password',
            userName: this.vnpostLoginForm.get('userName')?.value,
            password: this.vnpostLoginForm.get('password')?.value,
            text: this.captchaCode, // Sử dụng mã captcha làm text
            code: this.captchaCode,
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
      error: (err) => {
        console.error('Lỗi khi lấy captcha:', err);
        if (fromSubmit) {
          this.isLoading = false;
          this.showVNPostLogin(); // Hiển thị form đăng nhập nếu không lấy được captcha
        }
      }
    });
  }
} 