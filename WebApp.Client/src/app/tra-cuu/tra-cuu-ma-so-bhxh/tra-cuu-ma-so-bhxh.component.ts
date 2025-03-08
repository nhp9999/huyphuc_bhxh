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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { BHXHService, TraCuuVNPostRequest } from '../../services/tra-cuu-ma-so-bhxh.service';
import { LocationService, Province, District, Commune } from '../../services/location.service';
import { finalize } from 'rxjs/operators';
import { SSMV2Service } from '../../services/ssmv2.service';

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
  selector: 'app-tra-cuu-ma-so-bhxh',
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
    NzDatePickerModule,
    NzTabsModule,
    NzCheckboxModule,
    NzModalModule
  ],
  templateUrl: './tra-cuu-ma-so-bhxh.component.html',
  styleUrls: ['./tra-cuu-ma-so-bhxh.component.scss']
})
export class TraCuuMaSoBhxhComponent implements OnInit {
  traCuuVNPostForm!: FormGroup;
  isLoading = false;
  isLoadingData = false;
  ketQuaTraCuu: any = null;
  daTimKiem = false;
  loiTraCuu = '';

  danhSachTinh: TinhThanh[] = [];
  danhSachHuyen: QuanHuyen[] = [];
  danhSachXa: XaPhuong[] = [];

  huyenTheoTinh: QuanHuyen[] = [];
  xaTheoHuyen: XaPhuong[] = [];

  // Thêm các thuộc tính SSMV2
  isVNPostLoginVisible = false;
  captchaImage = '';
  captchaCode = '';
  vnpostLoginForm!: FormGroup;
  isLoadingLogin = false;

  constructor(
    private fb: FormBuilder,
    private bhxhService: BHXHService,
    private locationService: LocationService,
    private message: NzMessageService,
    private ssmv2Service: SSMV2Service
  ) {}

  ngOnInit(): void {
    this.traCuuVNPostForm = this.fb.group({
      maTinh: [null, [Validators.required]],
      maHuyen: [null, [Validators.required]],
      maXa: [null],
      hoTen: [null, [Validators.required]],
      ngaySinh: [null, [Validators.required]],
      soCMND: [null, [Validators.required]],
      isCoDau: [true]
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
      this.traCuuVNPostForm.patchValue({ maHuyen: null, maXa: null });
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
          this.traCuuVNPostForm.patchValue({ maHuyen: null, maXa: null });
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
      this.traCuuVNPostForm.patchValue({ maXa: null });
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
          this.traCuuVNPostForm.patchValue({ maXa: null });
        },
        error: (err) => {
          console.error(`Lỗi khi lấy danh sách xã/phường cho huyện ${maHuyen}:`, err);
          this.message.error('Không thể tải danh sách xã/phường. Vui lòng thử lại sau.');
          this.xaTheoHuyen = [];
        }
      });
  }

  submitVNPostForm(): void {
    if (this.traCuuVNPostForm.valid) {
      this.isLoading = true;
      this.daTimKiem = true;
      this.loiTraCuu = '';
      
      // Kiểm tra token VNPost
      const token = this.ssmv2Service.getToken();
      if (!token) {
        this.isLoading = false;
        this.message.warning('Bạn cần đăng nhập VNPost để sử dụng chức năng này');
        this.showVNPostLogin();
        return;
      }
      
      // Lấy dữ liệu từ form
      const formData: TraCuuVNPostRequest = {
        ...this.traCuuVNPostForm.value,
        ngaySinh: this.formatDate(this.traCuuVNPostForm.value.ngaySinh),
        maXa: this.traCuuVNPostForm.value.maXa || ''
      };
      
      console.log('Dữ liệu gửi đi:', formData);
      console.log('Ngày sinh gốc:', this.traCuuVNPostForm.value.ngaySinh);
      console.log('Ngày sinh đã format:', formData.ngaySinh);
      
      // Gọi API tra cứu VNPost
      this.bhxhService.traCuuMaSoBHXHVNPost(formData)
        .subscribe({
          next: (res: any) => {
            this.isLoading = false;
            
            // Log response để debug
            console.log('Response từ API VNPost:', res);
            
            // Kiểm tra nếu response có chứa thông báo lỗi xác thực
            if (res && res.error === 'Lỗi xác thực') {
              this.ketQuaTraCuu = null;
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
              this.ketQuaTraCuu = null;
              this.loiTraCuu = res.message || 'Có lỗi xảy ra khi tra cứu';
              this.message.error(this.loiTraCuu);
              return;
            }
            
            // Xử lý dữ liệu trả về
            if (res && res.success && res.data && res.data.length > 0) {
              // Lấy dữ liệu từ phần tử đầu tiên trong mảng data
              const data = res.data[0];
              
              // Chuyển đổi dữ liệu để hiển thị
              this.ketQuaTraCuu = {
                maSoBHXH: data.maSoBhxh,
                hoTen: data.hoTen,
                ngaySinh: this.parseNgaySinh(data.ngaySinh, data.ngaySinhDt),
                gioiTinh: data.gioiTinh,
                soCCCD: data.soCmnd,
                diaChi: data.diaChi,
                trangThai: data.trangThai,
                maHo: data.maHo
              };
              
              this.message.success('Tra cứu thành công');
            } else {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = 'Không tìm thấy thông tin mã số BHXH';
              this.message.warning(this.loiTraCuu);
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
      Object.values(this.traCuuVNPostForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  resetForm(): void {
    this.traCuuVNPostForm.reset();
    this.traCuuVNPostForm.patchValue({ isCoDau: true });
    this.huyenTheoTinh = [];
    this.xaTheoHuyen = [];
    this.ketQuaTraCuu = null;
    this.daTimKiem = false;
    this.loiTraCuu = '';
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    
    // Nếu là chuỗi có định dạng dd/MM/yyyy
    if (typeof date === 'string' && date.includes('/')) {
      // Chuyển đổi từ dd/MM/yyyy sang yyyy-MM-dd
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = date.match(datePattern);
      if (match) {
        const [_, day, month, year] = match;
        return `${year}-${month}-${day}`;
      }
    }
    
    // Nếu là đối tượng Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    // Trả về định dạng yyyy-MM-dd
    return `${year}-${month}-${day}`;
  }

  private mapVNPostResponseToData(data: any): any {
    if (!data) return null;
    
    // Ánh xạ dữ liệu từ API VNPost sang định dạng dữ liệu của ứng dụng
    return {
      maSoBHXH: data.maSoBHXH || '',
      hoTen: data.hoTen || '',
      ngaySinh: data.ngaySinh || '',
      gioiTinh: data.gioiTinh || '',
      soCCCD: data.soCMND || '',
      diaChi: data.diaChi || '',
      trangThai: data.trangThai || 'active',
      ngayCap: data.ngayCap || new Date().toISOString()
    };
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
              this.submitVNPostForm();
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

  // Thêm phương thức để xử lý ngày sinh
  private parseNgaySinh(ngaySinhStr: string, ngaySinhDt: string): Date {
    if (ngaySinhDt) {
      return new Date(ngaySinhDt);
    }
    
    if (ngaySinhStr) {
      // Chuyển đổi chuỗi ngày sinh dạng 'YYYYMMDD' thành Date
      const year = parseInt(ngaySinhStr.substring(0, 4));
      const month = parseInt(ngaySinhStr.substring(4, 6)) - 1; // Tháng trong JS bắt đầu từ 0
      const day = parseInt(ngaySinhStr.substring(6, 8));
      return new Date(year, month, day);
    }
    
    return new Date();
  }

  // Kiểm tra trạng thái đăng nhập VNPost
  isVNPostLoggedIn(): boolean {
    return !!this.ssmv2Service.getToken();
  }

  // Xử lý nhập ngày sinh trực tiếp
  onDateInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Nếu người dùng đang nhập, không làm gì cả
    if (value.length < 10) return;
    
    // Kiểm tra định dạng dd/MM/yyyy
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(datePattern);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Tháng trong JS bắt đầu từ 0
      const year = parseInt(match[3], 10);
      
      const date = new Date(year, month, day);
      
      // Kiểm tra tính hợp lệ của ngày
      if (
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      ) {
        // Ngày hợp lệ, cập nhật giá trị form
        this.traCuuVNPostForm.patchValue({ ngaySinh: date });
      } else {
        // Ngày không hợp lệ
        this.message.warning('Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng dd/MM/yyyy');
      }
    } else {
      // Định dạng không đúng
      this.message.warning('Vui lòng nhập ngày sinh theo định dạng dd/MM/yyyy');
    }
  }
} 