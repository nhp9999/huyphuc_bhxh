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
import { AuthService } from '../services/auth.service';
import { DonViService, DonVi } from '../services/don-vi.service';
import { DaiLyDonViService } from '../services/dai-ly-don-vi.service';

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
  daiLys: DaiLy[] = [];
  showDaiLySelect = false;
  daiLyMap = new Map<string, string>();
  isSuperAdmin = false;
  isCreateDaiLyVisible = false;
  isEditDaiLy = false;
  daiLyForm!: FormGroup;
  selectedDaiLyId?: number;
  donVis: DonVi[] = [];
  isCreateDonViVisible = false;
  isEditDonVi = false;
  donViForm!: FormGroup;
  selectedDonViId?: number;
  filterStatus: number | null = null;

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
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private authService: AuthService,
    private donViService: DonViService,
    private daiLyDonViService: DaiLyDonViService
  ) {
    this.initForm();
    this.loadDaiLys();
    this.initDaiLyForm();
    this.initDonViForm();
    this.chucDanhMap = new Map(this.chucDanhOptions.map(opt => [opt.value, opt.label]));
    const currentUser = this.authService.getCurrentUser();
    this.isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.roles?.includes('super_admin');
  }

  initForm(): void {
    this.userForm = this.fb.group({
      userName: [{ value: '', disabled: false }, [Validators.required, Validators.minLength(3)]],
      hoTen: ['', [Validators.required]],
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
    this.loadDonVis();
  }

  loadNguoiDungs(): void {
    this.isLoading = true;
    this.userService.getNguoiDungs().subscribe({
      next: (nguoiDungs) => {
        if (!this.isSuperAdmin) {
          this.nguoiDungs = nguoiDungs.filter(user => 
            !user.isSuperAdmin && !user.roles?.includes('super_admin')
          );
        } else {
          this.nguoiDungs = nguoiDungs;
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

  onStatusChange(): void {
    this.applyFilters();
  }

  showAddModal(): void {
    this.editingNguoiDung = null;
    
    const userNameControl = this.userForm.get('userName');
    if (userNameControl) {
      userNameControl.enable();
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
      maNhanVien: nguoiDung.maNhanVien
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

      formData.roles = [formData.chucDanh];

      if (this.editingNguoiDung) {
        this.userService.updateNguoiDung(this.editingNguoiDung.id, formData).subscribe({
          next: () => {
            this.message.success('Cập nhật người dùng thành công');
            this.isModalVisible = false;
            this.loadNguoiDungs();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.message.error(error.error?.message || 'Lỗi khi cập nhật người dùng');
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
            this.isLoading = false;
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
      nzContent: `Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng ${nguoiDung.hoTen || nguoiDung.ho_ten || nguoiDung.username}?`,
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
    this.isLoading = true;
    this.userService.getDaiLys().subscribe({
      next: (data) => {
        this.daiLys = data;
        this.isLoading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
        this.isLoading = false;
      }
    });
  }

  getDonViCongTacDisplay(maDaiLy: string | undefined): string {
    if (!maDaiLy) return '';
    return this.daiLyMap.get(maDaiLy) || maDaiLy;
  }

  initDaiLyForm(): void {
    this.daiLyForm = this.fb.group({
      ma: ['', [Validators.required]],
      ten: ['', [Validators.required]],
      diaChi: [''],
      soDienThoai: [''],
      email: ['', [Validators.email]],
      nguoiDaiDien: [''],
      trangThai: [true],
      nguoiTao: [this.authService.getCurrentUser().username]
    });
  }

  showCreateDaiLyModal(): void {
    this.isEditDaiLy = false;
    this.selectedDaiLyId = undefined;
    this.isCreateDaiLyVisible = true;
    this.initDaiLyForm();
  }

  editDaiLy(daiLy: DaiLy): void {
    this.isEditDaiLy = true;
    this.selectedDaiLyId = daiLy.id;
    this.daiLyForm.patchValue({
      ma: daiLy.ma,
      ten: daiLy.ten,
      diaChi: daiLy.diaChi,
      soDienThoai: daiLy.soDienThoai,
      email: daiLy.email,
      nguoiDaiDien: daiLy.nguoiDaiDien,
      trangThai: daiLy.trangThai
    });
    this.isCreateDaiLyVisible = true;
  }

  handleCreateDaiLyCancel(): void {
    this.isCreateDaiLyVisible = false;
    this.daiLyForm.reset();
  }

  handleCreateDaiLyOk(): void {
    if (this.daiLyForm.valid) {
      const daiLyData = this.daiLyForm.value;
      
      if (this.isEditDaiLy && this.selectedDaiLyId) {
        this.userService.updateDaiLy(this.selectedDaiLyId, daiLyData).subscribe({
          next: () => {
            this.message.success('Cập nhật đại lý thành công');
            this.isCreateDaiLyVisible = false;
            this.loadDaiLys();
          },
          error: (error) => {
            this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật đại lý');
          }
        });
      } else {
        this.userService.createDaiLy(daiLyData).subscribe({
          next: () => {
            this.message.success('Thêm mới đại lý thành công');
            this.isCreateDaiLyVisible = false;
            this.loadDaiLys();
          },
          error: (error) => {
            this.message.error(error.error?.message || 'Có lỗi xảy ra khi tạo đại lý');
          }
        });
      }
    } else {
      Object.values(this.daiLyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  deleteDaiLy(daiLy: DaiLy): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa đại lý "${daiLy.ten}"?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.userService.deleteDaiLy(daiLy.id).subscribe({
          next: (response) => {
            this.message.success('Xóa đại lý thành công');
            this.loadDaiLys();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status === 400) {
              this.message.error(error.error.message || 'Không thể xóa đại lý này');
            } else {
              this.message.error('Có lỗi xảy ra khi xóa đại lý');
            }
            console.error('Lỗi khi xóa đại lý:', error);
          }
        });
      }
    });
  }

  onDaiLyStatusChange(daiLy: DaiLy): void {
    daiLy.loading = true;
    this.userService.updateDaiLy(daiLy.id, { trangThai: daiLy.trangThai }).subscribe({
      next: () => {
        this.message.success('Cập nhật trạng thái thành công');
        daiLy.loading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi cập nhật trạng thái');
        daiLy.trangThai = !daiLy.trangThai;
        daiLy.loading = false;
      }
    });
  }

  initDonViForm(): void {
    this.donViForm = this.fb.group({
      maCoQuanBHXH: ['', [Validators.required]],
      maSoBHXH: ['', [Validators.required]],
      tenDonVi: ['', [Validators.required]],
      isBHXHTN: [false],
      isBHYT: [false],
      daiLyIds: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  loadDonVis(): void {
    this.isLoading = true;
    this.donViService.getDonVis().subscribe({
      next: (data) => {
        this.donVis = data;
        this.isLoading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đơn vị');
        this.isLoading = false;
      }
    });
  }

  showCreateDonViModal(): void {
    this.isEditDonVi = false;
    this.selectedDonViId = undefined;
    this.isCreateDonViVisible = true;
    this.initDonViForm();
  }

  editDonVi(donVi: DonVi): void {
    this.isEditDonVi = true;
    this.selectedDonViId = donVi.id;
    
    this.daiLyDonViService.getDaiLysByDonVi(donVi.id).subscribe({
      next: (daiLys) => {
        const daiLyIds = daiLys.map(d => d.id);
        this.donViForm.patchValue({
          maCoQuanBHXH: donVi.maCoQuanBHXH,
          maSoBHXH: donVi.maSoBHXH,
          tenDonVi: donVi.tenDonVi,
          isBHXHTN: donVi.isBHXHTN,
          isBHYT: donVi.isBHYT,
          daiLyIds: daiLyIds
        });
        this.isCreateDonViVisible = true;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý của đơn vị');
      }
    });
  }

  handleCreateDonViCancel(): void {
    this.isCreateDonViVisible = false;
    this.donViForm.reset();
  }

  handleCreateDonViOk(): void {
    if (this.donViForm.valid) {
      const donViData = this.donViForm.value;
      
      if (this.isEditDonVi && this.selectedDonViId) {
        this.donViService.updateDonVi(this.selectedDonViId, donViData).subscribe({
          next: () => {
            this.message.success('Cập nhật đơn vị thành công');
            this.isCreateDonViVisible = false;
            this.loadDonVis();
          },
          error: (error) => {
            this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật đơn vị');
          }
        });
      } else {
        this.donViService.createDonVi(donViData).subscribe({
          next: () => {
            this.message.success('Thêm mới đơn vị thành công');
            this.isCreateDonViVisible = false;
            this.loadDonVis();
          },
          error: (error) => {
            this.message.error(error.error?.message || 'Có lỗi xảy ra khi tạo đơn vị');
          }
        });
      }
    } else {
      Object.values(this.donViForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  deleteDonVi(donVi: DonVi): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa đơn vị "${donVi.tenDonVi}"?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.donViService.deleteDonVi(donVi.id).subscribe({
          next: () => {
            this.message.success('Xóa đơn vị thành công');
            this.loadDonVis();
          },
          error: () => this.message.error('Có lỗi xảy ra khi xóa đơn vị')
        });
      }
    });
  }

  onDonViStatusChange(donVi: DonVi): void {
    donVi.loading = true;
    const updateData = {
      maCoQuanBHXH: donVi.maCoQuanBHXH,
      maSoBHXH: donVi.maSoBHXH,
      tenDonVi: donVi.tenDonVi,
      isBHXHTN: donVi.isBHXHTN,
      isBHYT: donVi.isBHYT,
      dmKhoiKcbId: donVi.dmKhoiKcbId,
      trangThai: donVi.trangThai,
      daiLyId: donVi.daiLyId
    };

    this.donViService.updateDonVi(donVi.id, updateData).subscribe({
      next: () => {
        this.message.success('Cập nhật trạng thái thành công');
        donVi.loading = false;
      },
      error: (error) => {
        this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        donVi.trangThai = !donVi.trangThai;
        donVi.loading = false;
      }
    });
  }

  prepareFormData(nguoiDung: NguoiDung): any {
    const chucDanh = nguoiDung.roles && nguoiDung.roles.length > 0 ? nguoiDung.roles[0] : '';
    
    return {
      id: nguoiDung.id,
      username: nguoiDung.username,
      userName: nguoiDung.userName || nguoiDung.username,
      hoTen: nguoiDung.hoTen || nguoiDung.ho_ten,
      donViCongTac: nguoiDung.donViCongTac || '',
      email: nguoiDung.email || '',
      soDienThoai: nguoiDung.soDienThoai || nguoiDung.sdt || '',
      isSuperAdmin: nguoiDung.isSuperAdmin || false,
      typeMangLuoi: nguoiDung.typeMangLuoi || 0,
      status: nguoiDung.status || (nguoiDung.trang_thai ? 1 : 0),
      maNhanVien: nguoiDung.maNhanVien || ''
    };
  }

  getChucDanh(nguoiDung: NguoiDung): string {
    if (nguoiDung.chucDanh) {
      return nguoiDung.chucDanh;
    }
    if (nguoiDung.roles && nguoiDung.roles[0]) {
      return this.chucDanhMap.get(nguoiDung.roles[0]) || '';
    }
    return '';
  }

  filterNguoiDungs(): void {
    this.displayData = this.nguoiDungs.filter((nguoiDung: NguoiDung) => {
      const searchValue = this.searchValue.toLowerCase();
      return (
        (nguoiDung.user_name?.toLowerCase().includes(searchValue)) ||
        (nguoiDung.userName?.toLowerCase().includes(searchValue)) ||
        (nguoiDung.username?.toLowerCase().includes(searchValue)) ||
        (nguoiDung.ho_ten?.toLowerCase().includes(searchValue)) ||
        (nguoiDung.hoTen?.toLowerCase().includes(searchValue)) ||
        false
      );
    });

    // Sắp xếp theo trạng thái
    if (this.filterStatus !== null) {
      this.displayData = this.displayData.filter((nguoiDung: NguoiDung) => {
        const userStatus = nguoiDung.status ?? (nguoiDung.trang_thai ? 1 : 0);
        return userStatus === this.filterStatus;
      });
    }
  }

  getUserDisplayName(nguoiDung: NguoiDung): string {
    return nguoiDung.ho_ten || 
           nguoiDung.hoTen || 
           nguoiDung.user_name || 
           nguoiDung.userName || 
           nguoiDung.username || 
           'Không có tên';
  }

  onFilterStatusChange(status: number | null): void {
    this.filterStatus = status;
    this.filterNguoiDungs();
  }
}
