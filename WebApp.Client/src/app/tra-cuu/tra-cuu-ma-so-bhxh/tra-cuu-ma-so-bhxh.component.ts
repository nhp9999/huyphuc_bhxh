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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { BHXHService, TraCuuBHXHRequest, TraCuuVNPostRequest } from '../../services/bhxh.service';
import { LocationService, Province, District, Commune } from '../../services/location.service';
import { finalize } from 'rxjs/operators';

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
    NzCheckboxModule
  ],
  templateUrl: './tra-cuu-ma-so-bhxh.component.html',
  styleUrls: ['./tra-cuu-ma-so-bhxh.component.scss']
})
export class TraCuuMaSoBhxhComponent implements OnInit {
  traCuuForm!: FormGroup;
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

  constructor(
    private fb: FormBuilder,
    private bhxhService: BHXHService,
    private locationService: LocationService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.traCuuForm = this.fb.group({
      maSoBHXH: [null, [Validators.required]],
      hoTen: [null],
      soCCCD: [null]
    });

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

  submitForm(): void {
    if (this.traCuuForm.valid) {
      this.isLoading = true;
      this.daTimKiem = true;
      this.loiTraCuu = '';
      
      // Lấy dữ liệu từ form
      const formData: TraCuuBHXHRequest = this.traCuuForm.value;
      
      // Gọi API tra cứu thông qua service
      this.bhxhService.traCuuMaSoBHXH(formData)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res && res.success) {
              this.ketQuaTraCuu = res.data;
              this.message.success('Tra cứu thành công');
            } else {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = res.message || 'Không tìm thấy thông tin phù hợp';
              this.message.error(this.loiTraCuu);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.ketQuaTraCuu = null;
            this.loiTraCuu = 'Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại sau.';
            this.message.error(this.loiTraCuu);
            console.error('Lỗi khi tra cứu:', err);
          }
        });
    } else {
      Object.values(this.traCuuForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.warning('Vui lòng nhập đầy đủ thông tin bắt buộc');
    }
  }

  submitVNPostForm(): void {
    if (this.traCuuVNPostForm.valid) {
      this.isLoading = true;
      this.daTimKiem = true;
      this.loiTraCuu = '';
      
      // Lấy dữ liệu từ form
      const formData: TraCuuVNPostRequest = {
        ...this.traCuuVNPostForm.value,
        ngaySinh: this.formatDate(this.traCuuVNPostForm.value.ngaySinh),
        maXa: this.traCuuVNPostForm.value.maXa || ''
      };
      
      // Gọi API tra cứu VNPost
      this.bhxhService.traCuuMaSoBHXHVNPost(formData)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res && res.success) {
              this.ketQuaTraCuu = this.mapVNPostResponseToData(res.data);
              this.message.success('Tra cứu thành công');
            } else {
              this.ketQuaTraCuu = null;
              this.loiTraCuu = res.message || 'Không tìm thấy thông tin phù hợp';
              this.message.error(this.loiTraCuu);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.ketQuaTraCuu = null;
            this.loiTraCuu = 'Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại sau.';
            this.message.error(this.loiTraCuu);
            console.error('Lỗi khi tra cứu VNPost:', err);
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
    if (this.activeTab === 0) {
      this.traCuuForm.reset();
    } else {
      this.traCuuVNPostForm.reset({
        isCoDau: true
      });
      this.huyenTheoTinh = [];
      this.xaTheoHuyen = [];
    }
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
} 