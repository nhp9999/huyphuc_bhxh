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
import { BHXHService, TraCuuVNPostRequest } from '../../services/bhxh.service';
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
  activeTab = 0;

  danhSachTinh: TinhThanh[] = [];
  danhSachHuyen: QuanHuyen[] = [];
  danhSachXa: XaPhuong[] = [];

  huyenTheoTinh: QuanHuyen[] = [];
  xaTheoHuyen: XaPhuong[] = [];

  // Thêm các biến cho đăng nhập VNPost
  isVNPostLoginVisible = false;
  vnpostLoginForm!: FormGroup;
  captchaData: any = null;
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
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      captchaText: [null, [Validators.required]]
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
      const token = localStorage.getItem('ssmv2_token');
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
            
            // Xử lý response thành công
            if (res && res.success) {
              this.ketQuaTraCuu = this.mapVNPostResponseToData(res.data);
              this.message.success('Tra cứu thành công');
            } else {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = res.message || 'Không tìm thấy thông tin phù hợp';
              this.message.error(this.loiTraCuu);
            }
          },
          error: (err: any) => {
            this.isLoading = false;
            this.ketQuaTraCuu = null;
            
            // Log error để debug
            console.error('Lỗi khi gọi API VNPost:', err);
            
            // Kiểm tra chi tiết lỗi
            if (err.status === 401) {
              this.loiTraCuu = 'Lỗi xác thực: Phiên đăng nhập đã hết hạn';
              this.message.error(this.loiTraCuu);
              this.message.warning('Vui lòng đăng nhập lại để tiếp tục');
              this.showVNPostLogin();
              return;
            }
            
            // Kiểm tra nếu lỗi là do token hết hạn hoặc không hợp lệ
            if (err.error && (
                err.error.error === 'Lỗi xác thực' || 
                (err.error.error_description && err.error.error_description.includes('phiên đăng nhập')))) {
              this.loiTraCuu = 'Lỗi xác thực: ' + (err.error.error_description || 'Không tìm thấy thông tin phiên đăng nhập');
              this.message.error(this.loiTraCuu);
              this.message.warning('Vui lòng đăng nhập lại để tiếp tục');
              this.showVNPostLogin();
            } else {
              // Xử lý các lỗi khác
              this.loiTraCuu = 'Đã xảy ra lỗi khi tra cứu: ' + (err.error?.message || err.message || 'Vui lòng thử lại sau');
              this.message.error(this.loiTraCuu);
            }
          }
        });
    } else {
      Object.values(this.traCuuVNPostForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.warning('Vui lòng nhập đầy đủ thông tin bắt buộc');
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

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
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
    this.vnpostLoginForm.reset();
    this.loadCaptcha();
  }
  
  // Đóng form đăng nhập VNPost
  closeVNPostLogin(): void {
    this.isVNPostLoginVisible = false;
  }
  
  // Tải captcha
  loadCaptcha(): void {
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.captchaData = res.data;
        } else {
          this.message.error('Không thể tải captcha');
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải captcha:', err);
        this.message.error('Không thể tải captcha');
      }
    });
  }
  
  // Đăng nhập VNPost
  submitVNPostLogin(): void {
    if (this.vnpostLoginForm.valid) {
      this.isLoadingLogin = true;
      
      const loginData = {
        grant_type: 'password',
        userName: this.vnpostLoginForm.value.userName,
        password: this.vnpostLoginForm.value.password,
        text: this.vnpostLoginForm.value.captchaText,
        code: this.captchaData.code,
        clientId: 'ZjRiYmI5ZTgtZDcyOC00ODRkLTkyOTYtMDNjYmUzM2U4Yjc5',
        isWeb: true
      };
      
      // Log dữ liệu đăng nhập (không bao gồm mật khẩu)
      console.log('Đăng nhập VNPost với username:', loginData.userName);
      
      this.ssmv2Service.authenticate(loginData).subscribe({
        next: (res: any) => {
          this.isLoadingLogin = false;
          
          // Log response đăng nhập
          console.log('Response đăng nhập VNPost:', res);
          
          if (res && res.body && res.body.access_token) {
            // Lưu token VNPost vào localStorage
            localStorage.setItem('ssmv2_token', res.body.access_token);
            
            // Kiểm tra token đã lưu
            const savedToken = localStorage.getItem('ssmv2_token');
            console.log('Token đã lưu:', savedToken ? 'Có' : 'Không');
            
            this.message.success('Đăng nhập VNPost thành công');
            this.closeVNPostLogin();
            
            // Tiếp tục tra cứu sau khi đăng nhập thành công
            setTimeout(() => {
              this.submitVNPostForm();
            }, 500);
          } else {
            this.message.error('Đăng nhập không thành công: Không nhận được token');
            this.loadCaptcha();
          }
        },
        error: (err: any) => {
          this.isLoadingLogin = false;
          console.error('Lỗi khi đăng nhập VNPost:', err);
          
          let errorMessage = 'Đăng nhập không thành công';
          
          // Xử lý các loại lỗi cụ thể
          if (err.error) {
            if (err.error.error === 'invalid_grant') {
              errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
            } else if (err.error.error === 'invalid_captcha') {
              errorMessage = 'Mã xác nhận không chính xác';
            } else if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error_description) {
              errorMessage = err.error.error_description;
            }
          }
          
          this.message.error(errorMessage);
          this.loadCaptcha();
        }
      });
    } else {
      Object.values(this.vnpostLoginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập VNPost
  isVNPostLoggedIn(): boolean {
    return !!this.ssmv2Service.getToken();
  }
} 