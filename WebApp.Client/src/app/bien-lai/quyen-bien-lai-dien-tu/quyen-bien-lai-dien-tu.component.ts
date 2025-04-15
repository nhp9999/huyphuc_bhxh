import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BienLaiDienTuService } from '../../services/bien-lai-dien-tu.service';
import { QuyenBienLaiDienTu } from '../models/bien-lai-dien-tu.model';
import { User, UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { catchError, of } from 'rxjs';

// Cập nhật interface cho phù hợp với dữ liệu API trả về
interface NguoiDung {
  id: number;
  userName: string;
  hoTen: string;
  email: string | null;
  roles: string[] | null;
  maNhanVien: string | null;
}

@Component({
  selector: 'app-quyen-bien-lai-dien-tu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzTagModule,
    NzIconModule,
    NzDividerModule,
    NzAlertModule
  ],
  templateUrl: './quyen-bien-lai-dien-tu.component.html',
  styleUrls: ['./quyen-bien-lai-dien-tu.component.scss']
})
export class QuyenBienLaiDienTuComponent implements OnInit {
  quyenBienLais: QuyenBienLaiDienTu[] = [];
  users: NguoiDung[] = [];
  isLoading = false;
  isVisible = false;
  isSubmitting = false;
  form!: FormGroup;
  editingId: number | null = null;
  currentQuyenBienLai: QuyenBienLaiDienTu | null = null;

  // Định nghĩa các trạng thái
  readonly TRANG_THAI = {
    CHUA_SU_DUNG: 'chua_su_dung',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DA_SU_DUNG_HET: 'da_su_dung_het'
  };

  // Hàm helper để sử dụng trong template
  parseInt(value: string): number {
    return parseInt(value || '0');
  }

  constructor(
    private bienLaiDienTuService: BienLaiDienTuService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadQuyenBienLais();
    this.loadUsers();
  }

  initForm(): void {
    this.form = this.fb.group({
      ky_hieu: ['BH25-AG/08907/E', [Validators.required]],
      tu_so: ['0000001', [Validators.required, Validators.pattern('^[0-9]+$')]],
      den_so: ['9999999', [Validators.required, Validators.pattern('^[0-9]+$')]],
      so_hien_tai: ['', [Validators.pattern('^[0-9]+$')]],
      trang_thai: [this.TRANG_THAI.CHUA_SU_DUNG, [Validators.required]],
      nguoi_cap: [''],
      ma_co_quan_bhxh: ['', [Validators.required, Validators.maxLength(20)]]
    });

    // Theo dõi thay đổi số hiện tại để tự động cập nhật trạng thái khi cần
    this.form.get('so_hien_tai')?.valueChanges.subscribe(value => {
      if (this.editingId && value) {
        this.checkSoHienTaiAndUpdateTrangThai();
      }
    });
  }

  loadQuyenBienLais(): void {
    this.isLoading = true;
    this.bienLaiDienTuService.getQuyenBienLais()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh sách quyển biên lai điện tử:', error);
          this.message.error('Có lỗi khi tải danh sách quyển biên lai điện tử');
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe({
        next: (data: QuyenBienLaiDienTu[]) => {
          this.quyenBienLais = data;
          this.isLoading = false;
        }
      });
  }

  loadUsers(): void {
    this.usersService.getUsers()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh sách người dùng:', error);
          this.message.error('Có lỗi khi tải danh sách người dùng');
          return of([]);
        })
      )
      .subscribe({
        next: (data: any[]) => {
          // Chuyển đổi dữ liệu từ API sang định dạng NguoiDung
          this.users = data.map(item => ({
            id: item.id,
            userName: item.userName,
            hoTen: item.hoTen,
            email: item.email,
            roles: item.roles,
            maNhanVien: item.maNhanVien
          }));
        }
      });
  }

  showAddModal(): void {
    this.editingId = null;
    this.form.reset();
    this.form.patchValue({
      ky_hieu: 'BH25-AG/08907/E',
      tu_so: '0000001',
      den_so: '9999999',
      ma_co_quan_bhxh: '',
      nguoi_cap: '',
      trang_thai: this.TRANG_THAI.CHUA_SU_DUNG
    });
    this.isVisible = true;
  }

  showEditModal(id: number): void {
    this.isLoading = true;
    
    this.bienLaiDienTuService.getQuyenBienLaiById(id)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải thông tin quyển biên lai điện tử:', error);
          this.message.error('Có lỗi khi tải thông tin quyển biên lai điện tử');
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (data: QuyenBienLaiDienTu | null) => {
          if (data) {
            this.currentQuyenBienLai = data;
            this.editingId = id;
            this.form.patchValue({
              ky_hieu: data.ky_hieu,
              tu_so: data.tu_so,
              den_so: data.den_so,
              so_hien_tai: data.so_hien_tai,
              nguoi_cap: data.nguoi_cap,
              ma_co_quan_bhxh: data.ma_co_quan_bhxh,
              trang_thai: data.trang_thai || this.TRANG_THAI.CHUA_SU_DUNG
            });
            this.isVisible = true;
          }
          this.isLoading = false;
        }
      });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // Kiểm tra số hiện tại và cập nhật trạng thái nếu cần
  checkSoHienTaiAndUpdateTrangThai(): void {
    const tuSo = parseInt(this.form.get('tu_so')?.value || '0');
    const denSo = parseInt(this.form.get('den_so')?.value || '0');
    const soHienTai = parseInt(this.form.get('so_hien_tai')?.value || '0');
    const trangThaiControl = this.form.get('trang_thai');
    
    if (!trangThaiControl) return;
    
    // Nếu số hiện tại đạt đến số cuối cùng hoặc vượt quá
    if (soHienTai >= denSo) {
      // Hiển thị thông báo gợi ý cho người dùng
      if (trangThaiControl.value !== this.TRANG_THAI.DA_SU_DUNG_HET) {
        this.message.warning('Số hiện tại đã đạt tới số cuối. Bạn có thể đánh dấu quyển này là "Đã sử dụng hết".');
        // Không tự động thay đổi trạng thái, chỉ gợi ý
      }
    }
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }

    // Kiểm tra tính hợp lệ của số hiện tại
    if (this.editingId) {
      const tuSo = parseInt(this.form.get('tu_so')?.value || '0');
      const denSo = parseInt(this.form.get('den_so')?.value || '0');
      const soHienTai = parseInt(this.form.get('so_hien_tai')?.value || '0');
      
      if (soHienTai < tuSo || soHienTai > denSo) {
        this.message.error('Số hiện tại phải nằm trong khoảng từ số đến số');
        return;
      }
    }

    const formData = this.form.value;
    const trangThai = formData.trang_thai;
    const oldTrangThai = this.currentQuyenBienLai?.trang_thai;
    const soHienTai = parseInt(formData.so_hien_tai || '0');
    const denSo = parseInt(formData.den_so || '0');

    // Hiển thị cảnh báo khi số hiện tại gần đạt đến số cuối
    if (soHienTai > 0 && denSo > 0 && (denSo - soHienTai <= 10) && trangThai !== this.TRANG_THAI.DA_SU_DUNG_HET) {
      this.modal.confirm({
        nzTitle: 'Cảnh báo số biên lai còn lại',
        nzContent: `Quyển biên lai này chỉ còn ${denSo - soHienTai + 1} số biên lai có thể sử dụng. Bạn có muốn đánh dấu trạng thái là "Đã sử dụng hết" không?`,
        nzOkText: 'Đánh dấu đã sử dụng hết',
        nzCancelText: 'Giữ nguyên trạng thái',
        nzOnOk: () => {
          formData.trang_thai = this.TRANG_THAI.DA_SU_DUNG_HET;
          this.submitForm(formData);
        },
        nzOnCancel: () => {
          this.submitForm(formData);
        }
      });
      return;
    }

    // Hiển thị hộp thoại xác nhận khi thay đổi thành trạng thái "đã sử dụng hết"
    if (trangThai === this.TRANG_THAI.DA_SU_DUNG_HET && oldTrangThai !== this.TRANG_THAI.DA_SU_DUNG_HET) {
      this.modal.confirm({
        nzTitle: 'Xác nhận thay đổi trạng thái',
        nzContent: 'Khi đặt trạng thái là "Đã sử dụng hết", hệ thống sẽ không sử dụng quyển biên lai này nữa. Bạn có chắc chắn muốn tiếp tục?',
        nzOkText: 'Đồng ý',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzOnOk: () => this.submitForm(formData),
        nzCancelText: 'Hủy',
        nzOnCancel: () => {
          this.isSubmitting = false;
        }
      });
    } 
    // Hiển thị xác nhận khi chuyển từ trạng thái inactive sang active
    else if (trangThai === this.TRANG_THAI.ACTIVE && oldTrangThai === this.TRANG_THAI.INACTIVE) {
      this.modal.confirm({
        nzTitle: 'Xác nhận kích hoạt',
        nzContent: 'Khi chuyển quyển biên lai sang trạng thái active, hệ thống sẽ sử dụng quyển này để cấp biên lai mới. Bạn có chắc chắn?',
        nzOkText: 'Đồng ý',
        nzOnOk: () => this.submitForm(formData),
        nzCancelText: 'Hủy',
        nzOnCancel: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.submitForm(formData);
    }
  }

  submitForm(formData: any): void {
    this.isSubmitting = true;

    // Đảm bảo ký hiệu biên lai luôn là BH25-AG/08907/E
    formData.ky_hieu = 'BH25-AG/08907/E';
    
    // Để trống trường nguoi_cap, server sẽ tự động lấy từ người đăng nhập
    formData.nguoi_cap = '';

    if (this.editingId) {
      // Đảm bảo có trường id khi cập nhật
      formData.id = this.editingId;
      
      // Cập nhật quyển biên lai
      this.bienLaiDienTuService.updateQuyenBienLai(this.editingId, formData).subscribe({
        next: () => {
          this.message.success('Cập nhật quyển biên lai điện tử thành công');
          this.isVisible = false;
          this.isSubmitting = false;
          this.loadQuyenBienLais();
        },
        error: (error: any) => {
          console.error('Lỗi khi cập nhật quyển biên lai điện tử:', error);
          if (error.error && error.error.message) {
            this.message.error(error.error.message);
          } else {
            this.message.error('Có lỗi khi cập nhật quyển biên lai điện tử');
          }
          this.isSubmitting = false;
        }
      });
    } else {
      // Thêm quyển biên lai mới
      this.bienLaiDienTuService.createQuyenBienLai(formData).subscribe({
        next: (response: any) => {
          this.message.success('Thêm quyển biên lai điện tử thành công');
          this.isVisible = false;
          this.isSubmitting = false;
          this.loadQuyenBienLais();
        },
        error: (error: any) => {
          console.error('Lỗi khi thêm quyển biên lai điện tử:', error);
          if (error.error && error.error.message) {
            this.message.error(error.error.message);
          } else {
            this.message.error('Có lỗi khi thêm quyển biên lai điện tử');
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteQuyenBienLai(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa quyển biên lai điện tử này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.bienLaiDienTuService.deleteQuyenBienLai(id).subscribe({
          next: () => {
            this.message.success('Xóa quyển biên lai điện tử thành công');
            this.loadQuyenBienLais();
          },
          error: (error: any) => {
            console.error('Lỗi khi xóa quyển biên lai điện tử:', error);
            if (error.status === 400) {
              this.message.error('Không thể xóa quyển biên lai điện tử đã sử dụng');
            } else {
              this.message.error('Có lỗi khi xóa quyển biên lai điện tử');
            }
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Hiển thị trạng thái dạng text
  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case this.TRANG_THAI.CHUA_SU_DUNG:
        return 'Chưa sử dụng';
      case this.TRANG_THAI.ACTIVE:
        return 'Đang active';
      case this.TRANG_THAI.INACTIVE:
        return 'Không active';
      case this.TRANG_THAI.DA_SU_DUNG_HET:
        return 'Đã sử dụng hết';
      default:
        return trangThai || 'Không xác định';
    }
  }

  // Lấy class CSS cho tag trạng thái
  getTrangThaiClass(trangThai: string): string {
    switch (trangThai) {
      case this.TRANG_THAI.CHUA_SU_DUNG:
        return 'processing';
      case this.TRANG_THAI.ACTIVE:
        return 'success';
      case this.TRANG_THAI.INACTIVE:
        return 'warning';
      case this.TRANG_THAI.DA_SU_DUNG_HET:
        return 'error';
      default:
        return 'default';
    }
  }

  // Kiểm tra nếu có quyển biên lai nào đang active và sắp hết số
  hasQuyenSapHet(): boolean {
    if (!this.quyenBienLais || this.quyenBienLais.length === 0) return false;
    
    return this.quyenBienLais.some(item => 
      item.trang_thai === this.TRANG_THAI.ACTIVE && 
      this.getSoConLai(item) < 20
    );
  }

  // Kiểm tra nếu quyển biên lai cụ thể đang sắp hết số
  isQuyenSapHet(quyen: QuyenBienLaiDienTu): boolean {
    return quyen.trang_thai === this.TRANG_THAI.ACTIVE && 
           this.getSoConLai(quyen) < 20;
  }

  // Tính số biên lai còn lại của một quyển
  getSoConLai(quyen: QuyenBienLaiDienTu): number {
    if (!quyen) return 0;
    if (quyen.trang_thai === this.TRANG_THAI.DA_SU_DUNG_HET) return 0;
    
    const denSo = parseInt(quyen.den_so || '0');
    const soHienTai = parseInt(quyen.so_hien_tai || quyen.tu_so || '0');
    
    return denSo - soHienTai + 1;
  }

  // Kiểm tra nếu số hiện tại trong form đang gần đến số cuối
  isSoHienTaiGanHet(): boolean {
    const soHienTaiValue = this.form.get('so_hien_tai')?.value;
    const denSoValue = this.form.get('den_so')?.value;
    
    if (!soHienTaiValue || !denSoValue) return false;
    
    const soHienTai = parseInt(soHienTaiValue);
    const denSo = parseInt(denSoValue);
    
    return (denSo - soHienTai) < 20;
  }

  // Tính số biên lai còn lại từ dữ liệu form
  getSoConLaiFromForm(): number {
    const soHienTai = parseInt(this.form.get('so_hien_tai')?.value || '0');
    const denSo = parseInt(this.form.get('den_so')?.value || '0');
    
    return denSo - soHienTai + 1;
  }
} 