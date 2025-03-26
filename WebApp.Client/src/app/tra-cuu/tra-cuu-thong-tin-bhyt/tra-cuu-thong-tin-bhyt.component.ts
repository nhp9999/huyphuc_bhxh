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
import { BHYTService, TraCuuThongTinBHYTRequest } from '../../services/tra-cuu-thong-tin-bhyt.service';
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
    NzModalModule
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

  // Thêm thuộc tính SSMV2
  isVNPostLoginVisible = false;
  captchaImage = '';
  captchaCode = '';
  vnpostLoginForm!: FormGroup;
  isLoadingLogin = false;

  // Thêm thuộc tính cho modal chi tiết
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

  submitBHYTForm(): void {
    if (this.traCuuBHYTForm.valid) {
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
      const formData: TraCuuThongTinBHYTRequest = {
        maSoBHXH: this.traCuuBHYTForm.value.maSoBHXH
      };
      
      console.log('Dữ liệu gửi đi:', formData);
      
      // Gọi API tra cứu thông tin BHYT
      this.bhytService.traCuuThongTinBHYT(formData)
        .subscribe({
          next: (res: any) => {
            console.log('Response từ API BHYT:', res);
            
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
            
            // Xử lý dữ liệu trả về
            if (res && res.success && res.data) {
              this.ketQuaTraCuu = this.formatThongTinBHYT(res.data);
              this.isLoading = false;
              this.message.success('Tra cứu thành công thông tin BHYT');
            } else {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = 'Không tìm thấy thông tin BHYT';
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
      Object.values(this.traCuuBHYTForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  // Xử lý định dạng dữ liệu thông tin BHYT
  private formatThongTinBHYT(data: any): any {
    return {
      soTheBHYT: data.soTheBHYT || '',
      maSoBHXH: data.maSoBHXH || '',
      hoTen: data.hoTen || '',
      ngaySinh: data.ngaySinh ? this.parseNgaySinhFromNumber(data.ngaySinh) : null,
      gioiTinh: data.gioiTinh === 1 ? 'Nam' : 'Nữ',
      noiDangKyKCB: data.noiDangKyKCB || '',
      hanSuDung: {
        tuNgay: data.tuNgay ? this.parseNgaySinhFromNumber(data.tuNgay) : null,
        denNgay: data.denNgay ? this.parseNgaySinhFromNumber(data.denNgay) : null
      },
      tyLeDongBHYT: data.tyLeDongBHYT || '',
      phamViMienTB: data.phamViMienTB || '',
      quyenLoi: data.quyenLoi || '',
      nguonDong: data.nguonDong || '',
      raw: data // Lưu lại dữ liệu gốc
    };
  }

  resetForm(): void {
    this.traCuuBHYTForm.reset();
    this.ketQuaTraCuu = null;
    this.daTimKiem = false;
    this.loiTraCuu = '';
  }

  // Hiển thị form đăng nhập VNPost
  showVNPostLogin(): void {
    this.isVNPostLoginVisible = true;
    this.getCaptcha();
  }
  
  // Đóng form đăng nhập VNPost
  closeVNPostLogin(): void {
    this.isVNPostLoginVisible = false;
  }
  
  // Tải captcha
  getCaptcha(): void {
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        console.log('Captcha response:', res);
        if (res && res.data) {
          this.captchaImage = res.data.image;
          this.captchaCode = res.data.code;
        } else {
          this.message.error('Không nhận được dữ liệu captcha');
        }
      },
      error: (err) => {
        console.error('Captcha error:', err);
        this.message.error('Lỗi khi lấy captcha: ' + err.message);
      }
    });
  }
  
  // Đăng nhập VNPost
  handleLogin(): void {
    if (this.vnpostLoginForm.valid) {
      this.isLoadingLogin = true;
      
      const data = {
        grant_type: 'password',
        userName: this.vnpostLoginForm.get('userName')?.value,
        password: this.vnpostLoginForm.get('password')?.value,
        text: this.vnpostLoginForm.get('text')?.value,
        code: this.captchaCode,
        clientId: 'ZjRiYmI5ZTgtZDcyOC00ODRkLTkyOTYtMDNjYmUzM2U4Yjc5',
        isWeb: true
      };

      console.log('Gửi request đăng nhập với data:', { ...data, password: '***' });

      this.ssmv2Service.authenticate(data).subscribe({
        next: (response) => {
          this.isLoadingLogin = false;
          
          if (response.body?.access_token) {
            console.log('Xác thực thành công, token hết hạn sau:', response.body.expires_in, 'giây');
            this.message.success('Xác thực thành công');
            this.isVNPostLoginVisible = false;
            
            // Đảm bảo token đã được lưu trước khi tìm kiếm
            setTimeout(() => {
              this.submitBHYTForm();
            }, 1000);
          } else {
            this.message.error('Không nhận được token');
            this.getCaptcha();
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          this.isLoadingLogin = false;
          this.vnpostLoginForm.patchValue({ text: '' });

          if (err.error?.error === 'invalid_captcha') {
            this.message.error('Mã xác thực sai');
          } else if (err.error?.error_description?.includes('xác thực')) {
            this.message.error('Mã xác thực sai');
          } else if (err.error?.message) {
            this.message.error(err.error.message);
          } else {
            this.message.error('Xác thực thất bại, vui lòng thử lại');
          }

          setTimeout(() => {
            this.getCaptcha();
          }, 100);
        }
      });
    } else {
      Object.values(this.vnpostLoginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    }
  }

  // Chuyển đổi chữ thành chữ hoa
  convertToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.vnpostLoginForm.get('text')?.setValue(input.value);
  }

  // Kiểm tra trạng thái đăng nhập VNPost
  isVNPostLoggedIn(): boolean {
    return !!this.ssmv2Service.getToken();
  }

  // Xem chi tiết BHYT
  xemChiTietBHYT(): void {
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

  // Kiểm tra và định dạng số BHXH
  formatMaSoBHXH(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Chỉ giữ lại các chữ số
    
    if (value.length > 10) {
      value = value.substring(0, 10); // Giới hạn 10 chữ số
    }
    
    input.value = value;
    this.traCuuBHYTForm.get('maSoBHXH')?.setValue(value);
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
  
  // Phân tích chuỗi ngày sinh dạng yyyyMMdd
  private parseNgaySinhFromNumber(dateNumber: string): Date | null {
    if (!dateNumber || dateNumber.length !== 8) return null;
    
    const year = parseInt(dateNumber.substring(0, 4), 10);
    const month = parseInt(dateNumber.substring(4, 6), 10) - 1;
    const day = parseInt(dateNumber.substring(6, 8), 10);
    
    return new Date(year, month, day);
  }
} 