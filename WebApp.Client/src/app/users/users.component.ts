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
import { DaiLy, DaiLyService } from '../services/dai-ly.service';
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
import { AuthService } from '../services/auth.service';

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
  daiLys: DaiLy[] = [];
  displayData: NguoiDung[] = [];
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
  showDaiLySelect = false;
  filterStatus: number | null = null;
  isSuperAdmin = false;
  daiLyMap = new Map<string, string>();
  passwordVisible = false;

  chucDanhOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'nhan_vien_thu', label: 'Nhân viên thu' },
    { value: 'user', label: 'User' }
  ];

  chucDanhMap = new Map<string, string>();

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
    private daiLyService: DaiLyService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initForm();
    this.chucDanhMap = new Map(this.chucDanhOptions.map(opt => [opt.value, opt.label]));
    const currentUser = this.authService.getCurrentUser();
    this.isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.roles?.includes('super_admin');
  }

  initForm(): void {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      hoTen: ['', [Validators.required]],
      password: ['', this.editingNguoiDung ? [] : [Validators.required, Validators.minLength(6)]],
      donViCongTac: [''],
      chucDanh: [''],
      email: ['', [Validators.email]],
      soDienThoai: [''],
      isSuperAdmin: [false],
      typeMangLuoi: [null],
      status: [1],
      roles: [[]],
      maNhanVien: ['']
    });

    this.userForm.get('chucDanh')?.valueChanges.subscribe(chucDanh => {
      this.showDaiLySelect = chucDanh === 'nhan_vien_thu';
      if (!this.showDaiLySelect) {
        this.userForm.patchValue({ donViCongTac: '' });
      }
    });
  }

  ngOnInit(): void {
    this.loadNguoiDungs();
    this.loadDaiLys();
  }

  loadNguoiDungs(): void {
    this.isLoading = true;
    this.userService.getNguoiDungs().subscribe({
      next: (nguoiDungs) => {
        this.nguoiDungs = nguoiDungs;
        
        if (!this.isSuperAdmin) {
          this.nguoiDungs = this.nguoiDungs.filter(user => 
            !user.isSuperAdmin && !user.roles?.includes('super_admin')
          );
        }
        
        this.displayData = [...this.nguoiDungs];
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

  loadDaiLys(): void {
    this.daiLyService.getDaiLys().subscribe({
      next: (daiLys) => {
        this.daiLys = daiLys;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đại lý:', error);
      }
    });
  }

  applyFilters(): void {
    if (!this.nguoiDungs) return;

    this.displayData = this.nguoiDungs.filter((nguoiDung: NguoiDung) => {
      const matchSearch = !this.searchValue || 
        (nguoiDung.userName?.toLowerCase().includes(this.searchValue.toLowerCase()) || 
         nguoiDung.hoTen?.toLowerCase().includes(this.searchValue.toLowerCase()) ||
         nguoiDung.username?.toLowerCase().includes(this.searchValue.toLowerCase()) ||
         nguoiDung.ho_ten?.toLowerCase().includes(this.searchValue.toLowerCase()));

      const matchRole = !this.selectedRole || 
        (nguoiDung.roles && nguoiDung.roles.includes(this.selectedRole));

      const userStatus = nguoiDung.status ?? (nguoiDung.trang_thai ? 1 : 0);
      const matchStatus = this.filterStatus === null || userStatus === this.filterStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  onStatusChange(id: number, checked: boolean): void {
    const user = this.nguoiDungs.find(u => u.id === id);
    if (!user) return;

    user.isStatusLoading = true;

    this.userService.toggleStatus(id).subscribe({
      next: (response) => {
        if (response) {
          user.status = response.status;
          
          const displayUser = this.displayData.find(u => u.id === id);
          if (displayUser) {
            displayUser.status = response.status;
          }
          
          this.message.success('Cập nhật trạng thái thành công');
        }
      },
      error: (error) => {
        console.error('Toggle error:', error);
        this.message.error('Lỗi khi cập nhật trạng thái');
      },
      complete: () => {
        user.isStatusLoading = false;
      }
    });
  }

  showAddModal(): void {
    this.editingNguoiDung = null;
    
    const userNameControl = this.userForm.get('userName');
    if (userNameControl) {
      userNameControl.enable();
    }

    const passwordControl = this.userForm.get('password');
    if (passwordControl) {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      passwordControl.updateValueAndValidity();
    }

    this.userForm.reset({ status: 1, isSuperAdmin: false });

    this.chucDanhOptions = this.isSuperAdmin ? [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'admin', label: 'Admin' },
      { value: 'nhan_vien_thu', label: 'Nhân viên thu' },
      { value: 'user', label: 'User' }
    ] : [
      { value: 'admin', label: 'Admin' },
      { value: 'nhan_vien_thu', label: 'Nhân viên thu' },
      { value: 'user', label: 'User' }
    ];

    this.isModalVisible = true;
  }

  showEditModal(nguoiDung: NguoiDung): void {
    this.editingNguoiDung = nguoiDung;
    
    const userNameControl = this.userForm.get('userName');
    if (userNameControl) {
      userNameControl.disable();
    }

    const passwordControl = this.userForm.get('password');
    if (passwordControl) {
      passwordControl.clearValidators();
      passwordControl.updateValueAndValidity();
    }

    const chucDanh = nguoiDung.roles && nguoiDung.roles.length > 0 ? nguoiDung.roles[0] : '';

    this.userForm.patchValue({
      userName: nguoiDung.userName,
      hoTen: nguoiDung.hoTen,
      donViCongTac: nguoiDung.donViCongTac,
      chucDanh: chucDanh,
      email: nguoiDung.email,
      soDienThoai: nguoiDung.soDienThoai,
      isSuperAdmin: nguoiDung.isSuperAdmin,
      typeMangLuoi: nguoiDung.typeMangLuoi,
      status: nguoiDung.status,
      maNhanVien: nguoiDung.maNhanVien,
      password: ''
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
      const formData = {...this.userForm.getRawValue()};

      formData.status = Number(formData.status);
      formData.roles = [formData.chucDanh];

      if (this.editingNguoiDung) {
        console.log('Updating user with data:', formData);
        
        this.userService.updateNguoiDung(this.editingNguoiDung.id, formData).subscribe({
          next: (response) => {
            console.log('Update response:', response);
            this.message.success('Cập nhật người dùng thành công');
            this.isModalVisible = false;
            this.loadNguoiDungs();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.message.error(error.error?.message || 'Lỗi khi cập nhật người dùng');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        console.log('Creating new user with data:', formData);
        this.userService.createNguoiDung(formData).subscribe({
          next: (response) => {
            console.log('Create user response:', response);
            this.message.success('Thêm người dùng thành công');
            this.isModalVisible = false;
            this.loadNguoiDungs();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            if (error.error?.errors) {
              Object.keys(error.error.errors).forEach(key => {
                this.message.error(error.error.errors[key][0]);
              });
            } else {
              this.message.error(error.error?.message || 'Lỗi khi thêm người dùng');
            }
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });

      this.message.error('Vui lòng kiểm tra lại thông tin nhập liệu');

      Object.values(this.userForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    }
  }

  deleteNguoiDung(nguoiDung: NguoiDung): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa người dùng ${nguoiDung.hoTen || nguoiDung.ho_ten || nguoiDung.username}?`,
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
            this.modal.info({
              nzTitle: 'Mật khẩu mới',
              nzContent: `Mật khẩu mới là: ${response.password}`,
              nzOkText: 'Sao chép',
              nzOnOk: () => {
                this.copyToClipboard(response.password);
              }
            });
            this.isLoading = false;
          },
          error: (error) => {
            this.message.error('Lỗi khi đặt lại mật khẩu');
            this.isLoading = false;
          }
        });
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
}