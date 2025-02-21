import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService, NguoiDung } from '../../services/user.service';
import { QuyenBienLaiService, QuyenBienLai } from '../../services/quyen-bien-lai.service';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
// Import other needed modules

interface NguoiThuOption {
  value: number;
  label: string;
}

// Thêm interface cho token payload
interface TokenPayload {
  hoTen?: string;
  userName?: string;
  [key: string]: any; // Cho phép các trường động
}

@Component({
  selector: 'app-quyen-bien-lai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzTagModule,
    NzBreadCrumbModule
  ],
  templateUrl: './quyen-bien-lai.component.html',
  styles: [`
    .page-header {
      margin-bottom: 16px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .actions {
      text-align: right;
    }
  `]
})
export class QuyenBienLaiComponent implements OnInit {
  listQuyenBienLai: QuyenBienLai[] = [];
  users: NguoiDung[] = [];
  userMap = new Map<number, NguoiDung>();
  loading = false;
  isVisible = false;
  isOkLoading = false;
  modalTitle = 'Thêm quyển biên lai';
  form!: FormGroup;
  nguoiThus: NguoiThuOption[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService,
    private userService: UserService,
    private quyenBienLaiService: QuyenBienLaiService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadUsers();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      quyen_so: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{1,5}$')
      ]],
      tu_so: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{1,7}$')
      ]],
      den_so: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{1,7}$'),
        this.validateSoThuTu.bind(this)
      ]],
      nguoi_thu: [null, [Validators.required]],
      trang_thai: ['chua_su_dung', [Validators.required]]
    });

    // Theo dõi sự thay đổi của tu_so
    this.form.get('tu_so')?.valueChanges.subscribe((value) => {
      if (value) {
        // Tự động tính đến số = từ số + 49 (để có tổng 50 số)
        const tuSo = parseInt(value);
        const denSo = tuSo + 49;
        
        // Kiểm tra nếu denSo không vượt quá 7 chữ số
        if (denSo.toString().length <= 7) {
          this.form.patchValue({
            den_so: denSo.toString()
          }, { emitEvent: false }); // Không trigger valueChanges của den_so
        }
      }
      // Validate lại den_so
      this.form.get('den_so')?.updateValueAndValidity();
    });
  }

  loadData(): void {
    this.loading = true;
    this.quyenBienLaiService.getQuyenBienLais().subscribe({
      next: (data: QuyenBienLai[]) => {
        this.listQuyenBienLai = data;
        this.loading = false;
        this.setOfCheckedId.clear();
        this.refreshCheckedStatus();
      },
      error: (err: any) => {
        this.message.error('Lỗi khi tải danh sách quyển biên lai');
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: NguoiDung[]) => {
        this.users = users;
        this.userMap = new Map(users.map(user => [user.id, user]));
        this.nguoiThus = users.map((user: NguoiDung) => ({
          value: user.id,
          label: user.ho_ten || user.username
        }));
      },
      error: (err: any) => {
        this.message.error('Lỗi khi tải danh sách người thu');
        console.error(err);
      }
    });
  }

  getNguoiThuName(nguoiThuId: number): string {
    const nguoiThu = this.userMap.get(nguoiThuId);
    return nguoiThu ? (nguoiThu.ho_ten || nguoiThu.username) : '';
  }

  showModal(): void {
    this.form.reset();
    this.modalTitle = 'Thêm quyển biên lai';
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.form.valid) {
      this.isOkLoading = true;
      
      // Lấy token từ localStorage và decode để lấy thông tin người dùng
      const token = localStorage.getItem('token');
      let nguoiCap = '';
      
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
          // Ưu tiên lấy họ tên, nếu không có thì lấy username
          nguoiCap = decodeURIComponent(escape(
            tokenPayload.hoTen || // Lấy họ tên từ token
            tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || // Lấy họ tên từ claim
            tokenPayload.userName || // Lấy username từ token
            tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] // Lấy username từ claim
          ));
        } catch (error) {
          console.error('Error decoding token:', error);
          this.message.error('Lỗi khi lấy thông tin người dùng');
          this.isOkLoading = false;
          return;
        }
      }

      if (!nguoiCap) {
        this.message.error('Không thể xác định người cấp. Vui lòng đăng nhập lại.');
        this.isOkLoading = false;
        return;
      }

      const formData = {
        ...this.form.value,
        nguoi_cap: nguoiCap
      };

      if (formData.id) {
        this.quyenBienLaiService.updateQuyenBienLai(formData.id, formData).subscribe({
          next: () => {
            this.message.success('Cập nhật quyển biên lai thành công');
            this.isVisible = false;
            this.loadData();
            this.isOkLoading = false;
          },
          error: (err: any) => {
            this.message.error('Lỗi khi cập nhật quyển biên lai: ' + (err.error?.message || 'Đã có lỗi xảy ra'));
            console.error(err);
            this.isOkLoading = false;
          }
        });
      } else {
        const { id, ...createData } = formData;
        this.quyenBienLaiService.createQuyenBienLai(createData).subscribe({
          next: () => {
            this.message.success('Thêm quyển biên lai thành công');
            this.isVisible = false;
            this.loadData();
            this.isOkLoading = false;
          },
          error: (err: any) => {
            this.message.error('Lỗi khi thêm quyển biên lai: ' + (err.error?.errors?.nguoi_cap?.[0] || err.error?.message || 'Đã có lỗi xảy ra'));
            console.error(err);
            this.isOkLoading = false;
          }
        });
      }
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  edit(item: QuyenBienLai): void {
    this.modalTitle = 'Sửa quyển biên lai';
    this.form.reset();
    this.form.patchValue({
      id: item.id,
      quyen_so: item.quyen_so,
      tu_so: item.tu_so,
      den_so: item.den_so,
      nguoi_thu: item.nguoi_thu,
      trang_thai: item.trang_thai
    });
    this.isVisible = true;
  }

  delete(item: QuyenBienLai): void {
    if (!item.id) {
      this.message.error('Không tìm thấy ID quyển biên lai');
      return;
    }

    // Hiển thị modal xác nhận trước khi xóa
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa quyển biên lai ${item.quyen_so}?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        // Gọi API xóa
        this.quyenBienLaiService.deleteQuyenBienLai(item.id!).subscribe({
          next: () => {
            this.message.success('Xóa quyển biên lai thành công');
            this.loadData(); // Tải lại dữ liệu
          },
          error: (err) => {
            this.message.error('Lỗi khi xóa quyển biên lai: ' + (err.error?.message || 'Đã có lỗi xảy ra'));
            console.error(err);
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'chua_su_dung':
        return 'blue';
      case 'dang_su_dung':
        return 'green';
      case 'da_su_dung':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'chua_su_dung':
        return 'Chưa sử dụng';
      case 'dang_su_dung':
        return 'Đang sử dụng';
      case 'da_su_dung':
        return 'Đã sử dụng';
      default:
        return status;
    }
  }

  // Thêm custom validator
  validateSoThuTu(control: AbstractControl) {
    const form = control.parent as FormGroup;
    if (!form) return null;

    const tuSo = form.get('tu_so')?.value;
    const denSo = form.get('den_so')?.value;

    if (tuSo && denSo) {
      const tuSoNum = parseInt(tuSo);
      const denSoNum = parseInt(denSo);
      
      if (tuSoNum >= denSoNum) {
        return { soThuTuKhongHopLe: true };
      }
    }
    return null;
  }

  onNumberInput(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Loại bỏ các ký tự không phải số
    value = value.replace(/[^0-9]/g, '');
    
    // Giới hạn độ dài
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    
    // Cập nhật giá trị vào input và form control
    input.value = value;
    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      const control = this.form.get(controlName);
      if (control) {
        control.setValue(value, { emitEvent: true }); // Đảm bảo trigger valueChanges
      }
    }
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listQuyenBienLai
      .filter(item => item.trang_thai === 'chua_su_dung')
      .forEach(({ id }) => this.updateCheckedSet(id!, checked));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listChuaSuDung = this.listQuyenBienLai.filter(item => item.trang_thai === 'chua_su_dung');
    this.checked = listChuaSuDung.every(({ id }) => this.setOfCheckedId.has(id!));
    this.indeterminate = listChuaSuDung.some(({ id }) => this.setOfCheckedId.has(id!)) && !this.checked;
  }
} 