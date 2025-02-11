import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NguoiDung, UserService } from '../services/user.service';
import { 
  LockOutline,
  UnlockOutline,
  DeleteOutline,
  EditOutline,
  PlusOutline,
  SearchOutline,
  CloseOutline,
  UserOutline,
  MailOutline,
  PhoneOutline,
  TeamOutline,
  ApartmentOutline,
  EnvironmentOutline
} from '@ant-design/icons-angular/icons';
import { forkJoin } from 'rxjs';
import { LocationService, Province, District, Commune } from '../services/location.service';
import { DaiLy } from '../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzSelectModule,
    NzGridModule,
    NzToolTipModule,
    NzTabsModule,
    NzSpinModule,
    NzTagModule,
    NzInputNumberModule,
    NzSwitchModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  nguoiDungs: NguoiDung[] = [];
  filteredNguoiDungs: NguoiDung[] = [];
  isModalVisible = false;
  editingNguoiDung: NguoiDung | null = null;
  isLoading = false;
  userForm!: FormGroup;
  searchValue = '';
  selectedRole: string | null = null;
  selectedStatus: number | null = null;
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  daiLys: DaiLy[] = [];
  showDaiLySelect = false;

  roleOptions = [
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Nhân viên thu', value: 'nhan_vien_thu' },
    { label: 'User', value: 'user' }
  ];

  statusOptions = [
    { label: 'Hoạt động', value: 1 },
    { label: 'Không hoạt động', value: 0 }
  ];

  constructor(
    private userService: UserService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder
  ) {
    this.initForm();
    this.loadDaiLys();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      userName: [{ value: '', disabled: false }, [Validators.required, Validators.minLength(3)]],
      hoTen: ['', [Validators.required]],
      mangLuoi: [''],
      donViCongTac: [''],
      chucDanh: [''],
      email: ['', [Validators.email]],
      soDienThoai: [''],
      isSuperAdmin: [false],
      cap: [''],
      typeMangLuoi: [null],
      status: [1],
      roles: [[]]
    });

    // Theo dõi sự thay đổi của roles để hiển thị select đại lý
    this.userForm.get('roles')?.valueChanges.subscribe(roles => {
      this.showDaiLySelect = roles?.includes('nhan_vien_thu');
      if (!this.showDaiLySelect) {
        this.userForm.patchValue({ donViCongTac: '' });
      }
    });
  }

  ngOnInit(): void {
    this.loadNguoiDungs();
  }

  loadNguoiDungs(): void {
    this.isLoading = true;
    this.userService.getNguoiDungs().subscribe({
      next: (nguoiDungs) => {
        console.log('Data from API:', nguoiDungs);
        this.nguoiDungs = nguoiDungs;
        this.applyFilters();
        this.refreshCheckedStatus();
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error('Không thể tải danh sách người dùng');
        this.isLoading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredNguoiDungs = this.nguoiDungs.filter(nguoiDung => {
      const matchSearch = !this.searchValue || 
        nguoiDung.userName.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        nguoiDung.hoTen.toLowerCase().includes(this.searchValue.toLowerCase());
      
      const matchRole = !this.selectedRole || nguoiDung.roles.includes(this.selectedRole);
      const matchStatus = this.selectedStatus === null || nguoiDung.status === this.selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  showAddModal(): void {
    this.editingNguoiDung = null;
    
    // Enable userName control khi thêm mới
    const userNameControl = this.userForm.get('userName');
    if (userNameControl) {
      userNameControl.enable();
    }
    
    this.userForm.reset({ status: 1, isSuperAdmin: false });
    this.isModalVisible = true;
  }

  showEditModal(nguoiDung: NguoiDung): void {
    this.editingNguoiDung = nguoiDung;
    
    // Disable userName control khi đang edit
    const userNameControl = this.userForm.get('userName');
    if (userNameControl) {
      userNameControl.disable();
    }

    this.userForm.patchValue({
      userName: nguoiDung.userName,
      hoTen: nguoiDung.hoTen,
      mangLuoi: nguoiDung.mangLuoi,
      donViCongTac: nguoiDung.donViCongTac,
      chucDanh: nguoiDung.chucDanh,
      email: nguoiDung.email,
      soDienThoai: nguoiDung.soDienThoai,
      isSuperAdmin: nguoiDung.isSuperAdmin,
      cap: nguoiDung.cap,
      typeMangLuoi: nguoiDung.typeMangLuoi,
      status: nguoiDung.status,
      roles: nguoiDung.roles
    });
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.userForm.reset();
  }

  handleOk(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formData = this.userForm.value;

      if (this.editingNguoiDung) {
        this.userService.updateNguoiDung(this.editingNguoiDung.id, formData).subscribe({
          next: () => {
            this.message.success('Cập nhật người dùng thành công');
            this.isModalVisible = false;
            this.loadNguoiDungs();
          },
          error: (error) => {
            this.message.error('Lỗi khi cập nhật người dùng');
            console.error('Error updating user:', error);
            this.isLoading = false;
          }
        });
      } else {
        this.userService.createNguoiDung(formData).subscribe({
          next: () => {
            this.message.success('Thêm người dùng thành công');
            this.isModalVisible = false;
            this.loadNguoiDungs();
          },
          error: (error) => {
            this.message.error('Lỗi khi thêm người dùng');
            console.error('Error creating user:', error);
            this.isLoading = false;
          }
        });
      }
    } else {
      Object.values(this.userForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  deleteNguoiDung(nguoiDung: NguoiDung): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa người dùng ${nguoiDung.hoTen}?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.userService.deleteNguoiDung(nguoiDung.id).subscribe({
          next: () => {
            this.message.success('Xóa người dùng thành công');
            this.loadNguoiDungs();
          },
          error: (error) => {
            this.message.error('Lỗi khi xóa người dùng');
            console.error('Error deleting user:', error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  copyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.message.success('Đã sao chép mật khẩu');
    } catch (err) {
      this.message.error('Không thể sao chép mật khẩu');
    }
    document.body.removeChild(textArea);
  }

  resetPassword(nguoiDung: NguoiDung): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận đặt lại mật khẩu',
      nzContent: `Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng ${nguoiDung.hoTen}?`,
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.isLoading = true;
        this.userService.resetPassword(nguoiDung.id).subscribe({
          next: (response) => {
            this.message.success('Đặt lại mật khẩu thành công');
            this.isLoading = false;
          },
          error: (error) => {
            this.message.error('Lỗi khi đặt lại mật khẩu');
            console.error('Error resetting password:', error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  toggleStatus(nguoiDung: NguoiDung): void {
    this.isLoading = true;
    this.userService.toggleStatus(nguoiDung.id).subscribe({
      next: () => {
        this.message.success('Cập nhật trạng thái thành công');
        this.loadNguoiDungs();
      },
      error: (error) => {
        this.message.error('Lỗi khi cập nhật trạng thái');
        console.error('Error toggling status:', error);
        this.isLoading = false;
      }
    });
  }

  onAllChecked(checked: boolean): void {
    this.filteredNguoiDungs.forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.filteredNguoiDungs.filter(({ id }) => !this.setOfCheckedId.has(id));
    this.checked = this.filteredNguoiDungs.length > 0 && listOfEnabledData.length === 0;
    this.indeterminate = listOfEnabledData.length > 0 && listOfEnabledData.length < this.filteredNguoiDungs.length;
  }

  deleteSelectedNguoiDungs(): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${this.setOfCheckedId.size} người dùng đã chọn?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        const deleteObservables = Array.from(this.setOfCheckedId).map(id =>
          this.userService.deleteNguoiDung(id)
        );

        this.isLoading = true;
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.message.success(`Đã xóa ${this.setOfCheckedId.size} người dùng`);
            this.setOfCheckedId.clear();
            this.loadNguoiDungs();
          },
          error: (error) => {
            this.message.error('Lỗi khi xóa người dùng');
            console.error('Error deleting users:', error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  getTimeAgo(date: string | Date): string {
    if (!date) return '';
    
    const now = new Date();
    const loginDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} năm trước`;
  }

  loadDaiLys(): void {
    this.userService.getDaiLys().subscribe({
      next: (daiLys) => {
        this.daiLys = daiLys;
      },
      error: (error) => {
        this.message.error('Không thể tải danh sách đại lý');
        console.error('Error loading dai ly:', error);
      }
    });
  }
}
