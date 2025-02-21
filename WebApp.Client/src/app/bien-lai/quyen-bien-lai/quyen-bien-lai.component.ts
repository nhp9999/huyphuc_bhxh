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
import { AuthService } from '../../services/auth.service';
import { 
  HomeOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline
} from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
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

const icons: IconDefinition[] = [
  HomeOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline
];

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
  form: FormGroup;
  nguoiThus: NguoiThuOption[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  editingQuyenBienLai: QuyenBienLai | null = null;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService,
    private userService: UserService,
    private quyenBienLaiService: QuyenBienLaiService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      quyen_so: ['', [Validators.required]],
      tu_so: ['', [Validators.required]],
      den_so: ['', [Validators.required]],
      nhan_vien_thu: [null, [Validators.required]],
      trang_thai: ['dang_su_dung']
    });

    // Thêm subscription để theo dõi thay đổi của tu_so
    this.form.get('tu_so')?.valueChanges.subscribe(value => {
      if (value) {
        const tuSo = parseInt(value);
        if (!isNaN(tuSo)) {
          const denSo = (tuSo + 49).toString().padStart(value.length, '0');
          this.form.patchValue({
            den_so: denSo
          }, { emitEvent: false }); // Không trigger valueChanges của den_so
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.quyenBienLaiService.getQuyenBienLais().subscribe({
      next: (data: QuyenBienLai[]) => {
        console.log('Loaded quyen bien lai:', data);
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
        console.log('Loaded users:', users);
        this.users = users;
        this.userMap = new Map(users.map(user => [user.id, user]));
        this.nguoiThus = users.map((user: NguoiDung) => ({
          value: user.id,
          label: this.getDisplayName(user)
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
    return nguoiThu ? this.getDisplayName(nguoiThu) : '';
  }

  showModal(): void {
    this.editingQuyenBienLai = null;
    this.form.reset({
      trang_thai: 'dang_su_dung'
    });
    this.modalTitle = 'Thêm quyển biên lai';
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.form.valid) {
      this.isOkLoading = true;
      
      const currentUser = this.authService.getCurrentUser();
      
      const formValue = this.form.value;
      
      const data = {
        id: this.editingQuyenBienLai?.id,
        quyen_so: formValue.quyen_so,
        tu_so: formValue.tu_so,
        den_so: formValue.den_so,
        nhan_vien_thu: Number(formValue.nhan_vien_thu),
        trang_thai: formValue.trang_thai,
        so_hien_tai: this.editingQuyenBienLai?.so_hien_tai || formValue.tu_so,
        nguoi_cap: this.editingQuyenBienLai?.nguoi_cap || currentUser?.user_name || currentUser?.userName || currentUser?.username
      };

      if (this.editingQuyenBienLai) {
        // Nếu đang sửa
        this.quyenBienLaiService.updateQuyenBienLai(this.editingQuyenBienLai.id!, data).subscribe({
          next: (response) => {
            this.message.success('Cập nhật quyển biên lai thành công');
            this.isVisible = false;
            this.isOkLoading = false;
            this.editingQuyenBienLai = null;
            this.loadData();
          },
          error: (error) => {
            console.error('Update error:', error);
            this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật');
            this.isOkLoading = false;
          }
        });
      } else {
        // Nếu đang thêm mới
        this.quyenBienLaiService.createQuyenBienLai(data).subscribe({
          next: (response) => {
            this.message.success('Thêm quyển biên lai thành công');
            this.isVisible = false;
            this.isOkLoading = false;
            this.loadData();
          },
          error: (error) => {
            console.error('Create error:', error);
            this.message.error(error.error?.message || 'Có lỗi xảy ra khi thêm mới');
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
    this.editingQuyenBienLai = null;
  }

  edit(item: QuyenBienLai): void {
    this.modalTitle = 'Sửa quyển biên lai';
    this.editingQuyenBienLai = item;
    this.form.patchValue({
      quyen_so: item.quyen_so,
      tu_so: item.tu_so,
      den_so: item.den_so,
      nhan_vien_thu: item.nhan_vien_thu,
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
        control.setValue(value, { emitEvent: true });
        
        // Nếu đang nhập tu_so, tự động tính den_so
        if (controlName === 'tu_so' && value) {
          const tuSo = parseInt(value);
          if (!isNaN(tuSo)) {
            const denSo = (tuSo + 49).toString().padStart(value.length, '0');
            this.form.patchValue({
              den_so: denSo
            }, { emitEvent: false });
          }
        }
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
    // Chỉ cho phép chọn những quyển chưa sử dụng
    this.listQuyenBienLai
      .filter(item => item.trang_thai === 'chua_su_dung')
      .forEach(({ id }) => this.updateCheckedSet(id!, checked));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    // Chỉ tính toán trạng thái checked dựa trên những quyển chưa sử dụng
    const listChuaSuDung = this.listQuyenBienLai.filter(item => item.trang_thai === 'chua_su_dung');
    
    // Nếu không có quyển nào chưa sử dụng, set checked và indeterminate về false
    if (listChuaSuDung.length === 0) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }

    // Kiểm tra xem tất cả các quyển chưa sử dụng có được chọn không
    this.checked = listChuaSuDung.every(({ id }) => this.setOfCheckedId.has(id!));
    
    // Kiểm tra xem có ít nhất một quyển được chọn nhưng không phải tất cả
    this.indeterminate = listChuaSuDung.some(({ id }) => this.setOfCheckedId.has(id!)) && !this.checked;
  }

  getDisplayName(user: NguoiDung): string {
    return user.ho_ten || 
           user.hoTen || 
           user.user_name || 
           user.userName || 
           user.username || 
           'Không có tên';
  }
} 