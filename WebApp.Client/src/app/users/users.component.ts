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
import { User, UserService } from '../services/user.service';
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
    NzSpinModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isModalVisible = false;
  editingUser: Partial<User> | null = null;
  isLoading = false;
  userForm!: FormGroup;
  searchValue = '';
  selectedRole: string | null = null;
  selectedStatus: string | null = null;
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  provinces: Province[] = [];
  districts: District[] = [];
  communes: Commune[] = [];
  selectedProvince: string | null = null;
  selectedDistrict: string | null = null;
  selectedCommune: string | null = null;

  filterProvince = (input: string, option: { nzLabel: string | number | null }): boolean => {
    if (!input || !option.nzLabel) return true;
    const normalized = this.normalizeString(input);
    const normalizedLabel = this.normalizeString(option.nzLabel.toString());
    return normalizedLabel.includes(normalized);
  };

  filterDistrict = (input: string, option: { nzLabel: string | number | null }): boolean => {
    if (!input || !option.nzLabel) return true;
    const normalized = this.normalizeString(input);
    const normalizedLabel = this.normalizeString(option.nzLabel.toString());
    return normalizedLabel.includes(normalized);
  };

  filterCommune = (input: string, option: { nzLabel: string | number | null }): boolean => {
    if (!input || !option.nzLabel) return true;
    const normalized = this.normalizeString(input);
    const normalizedLabel = this.normalizeString(option.nzLabel.toString());
    return normalizedLabel.includes(normalized);
  };

  normalizeString(str: string): string {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Nhân viên', value: 'employee' },
    { label: 'BHXH', value: 'bhxh' }
  ];

  statusOptions = [
    { label: 'Hoạt động', value: 'active' },
    { label: 'Không hoạt động', value: 'inactive' }
  ];

  constructor(
    private userService: UserService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private locationService: LocationService
  ) {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.editingUser ? [] : [Validators.required, Validators.minLength(6)]],
      ho_ten: ['', [Validators.required]],
      email: ['', [Validators.email]],
      so_dien_thoai: [''],
      role: ['employee', [Validators.required]],
      department_code: ['', [Validators.required]],
      unit: [''],
      status: ['active', [Validators.required]],
      province: [null, [Validators.required]],
      district: [null, [Validators.required]],
      commune: [null, [Validators.required]],
      hamlet: [''],
      address: ['']
    });

    // Theo dõi sự thay đổi của trường province
    this.userForm.get('province')?.valueChanges.subscribe(province => {
      if (province) {
        const selectedProvince = this.provinces.find(p => p.ma === province);
        if (selectedProvince) {
          this.loadDistricts(selectedProvince.ma);
        }
      } else {
        this.districts = [];
        this.communes = [];
        this.userForm.patchValue({
          district: null,
          commune: null
        });
      }
    });

    // Theo dõi sự thay đổi của trường district
    this.userForm.get('district')?.valueChanges.subscribe(district => {
      if (district) {
        this.loadCommunes(district);
      } else {
        this.communes = [];
        this.userForm.patchValue({
          commune: null
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.restoreFilters();
    this.loadProvinces();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
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
    this.filteredUsers = this.users.filter(user => {
      const matchSearch = !this.searchValue || 
        user.username.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        (user.ho_ten && user.ho_ten.toLowerCase().includes(this.searchValue.toLowerCase()));
      
      const matchRole = !this.selectedRole || user.role === this.selectedRole;
      const matchStatus = !this.selectedStatus || user.status === this.selectedStatus;
      const matchProvince = !this.selectedProvince || user.province === this.selectedProvince;
      const matchDistrict = !this.selectedDistrict || user.district === this.selectedDistrict;
      const matchCommune = !this.selectedCommune || user.commune === this.selectedCommune;

      return matchSearch && matchRole && matchStatus && matchProvince && matchDistrict && matchCommune;
    });
  }

  onSearch(): void {
    this.applyFilters();
    this.saveFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
    this.saveFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
    this.saveFilters();
  }

  onProvinceChange(): void {
    this.selectedDistrict = null;
    this.selectedCommune = null;
    this.districts = [];
    this.communes = [];
    if (this.selectedProvince) {
      this.loadDistricts(this.selectedProvince);
    }
    this.applyFilters();
    this.saveFilters();
  }

  onDistrictChange(): void {
    this.selectedCommune = null;
    this.communes = [];
    if (this.selectedDistrict) {
      this.loadCommunes(this.selectedDistrict);
    }
    this.applyFilters();
    this.saveFilters();
  }

  onCommuneChange(): void {
    this.applyFilters();
    this.saveFilters();
  }

  resetFilters(): void {
    this.searchValue = '';
    this.selectedRole = null;
    this.selectedStatus = null;
    this.selectedProvince = null;
    this.selectedDistrict = null;
    this.selectedCommune = null;
    this.districts = [];
    this.communes = [];
    localStorage.removeItem('userFilters');
    this.applyFilters();
  }

  showAddModal(): void {
    this.editingUser = null;
    this.initForm();
    this.isModalVisible = true;
  }

  showEditModal(user: User): void {
    this.editingUser = { ...user };
    
    // Reset form và xóa validators cho password
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    // Set các giá trị cơ bản không phụ thuộc vào API
    this.userForm.patchValue({
      username: user.username,
      ho_ten: user.ho_ten,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai,
      role: user.role,
      department_code: user.department_code,
      unit: user.unit,
      status: user.status
    });

    // Load dữ liệu địa chỉ theo thứ tự: Tỉnh -> Huyện -> Xã
    if (user.province && typeof user.province === 'string') {
      // Load danh sách tỉnh và set giá trị
      this.locationService.getProvinces().subscribe({
        next: (provinces) => {
          this.provinces = provinces;
          this.userForm.patchValue({ province: user.province });

          // Sau khi có tỉnh, load danh sách huyện
          if (user.district && typeof user.district === 'string') {
            this.locationService.getDistricts(user.province as string).subscribe({
              next: (districts) => {
                this.districts = districts;
                this.userForm.patchValue({ district: user.district });

                // Sau khi có huyện, load danh sách xã
                if (user.commune) {
                  this.locationService.getCommunes(user.district as string).subscribe({
                    next: (response) => {
                      if (response.success) {
                        this.communes = response.data;
                        this.userForm.patchValue({ commune: user.commune });
                      }
                    },
                    error: (error) => {
                      console.error('Error loading communes:', error);
                      this.message.error('Không thể tải danh sách xã/phường');
                    }
                  });
                }
              },
              error: (error) => {
                console.error('Error loading districts:', error);
                this.message.error('Không thể tải danh sách quận/huyện');
              }
            });
          }
        },
        error: (error) => {
          console.error('Error loading provinces:', error);
          this.message.error('Không thể tải danh sách tỉnh/thành phố');
        }
      });
    }

    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.editingUser = null;
  }

  handleOk(): void {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      this.message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.isLoading = true;
    const formData = this.userForm.value;
    const userData = {
      ...formData,
      first_login: true,
      password_changed: false,
      status: formData.status || 'active'
    };

    if (this.editingUser?.id) {
      // Cập nhật user
      this.userService.updateUser(this.editingUser.id, userData).subscribe({
        next: () => {
          this.message.success('Cập nhật thành công');
          this.loadUsers();
          this.isModalVisible = false;
          this.editingUser = null;
          this.userForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400 && error.error?.message) {
            this.message.error(error.error.message);
          } else {
            this.message.error('Có lỗi xảy ra khi cập nhật người dùng');
          }
          console.error('Error updating user:', error);
        }
      });
    } else {
      // Thêm mới user
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.message.success('Thêm mới thành công');
          this.loadUsers();
          this.isModalVisible = false;
          this.editingUser = null;
          this.userForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400 && error.error?.message) {
            this.message.error(error.error.message);
          } else {
            this.message.error('Có lỗi xảy ra khi thêm người dùng');
          }
          console.error('Error creating user:', error);
        }
      });
    }
  }

  deleteUser(user: User): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa người dùng "${user.ho_ten || user.username}" không? Hành động này không thể hoàn tác.`,
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.message.success('Xóa người dùng thành công');
            this.loadUsers();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status === 400 && error.error?.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error('Có lỗi xảy ra khi xóa người dùng');
            }
            console.error('Error deleting user:', error);
          }
        });
      },
      nzCancelText: 'Hủy'
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

  resetPassword(user: User): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận đặt lại mật khẩu',
      nzContent: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản "${user.ho_ten || user.username}" không?`,
      nzOkText: 'Đặt lại',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.isLoading = true;
        this.userService.resetPassword(user.id).subscribe({
          next: (response) => {
            this.isLoading = false;
            const modalRef = this.modal.success({
              nzTitle: 'Đặt lại mật khẩu thành công',
              nzContent: `
                <div style="margin-bottom: 16px;">
                  Mật khẩu mới: <strong>${response.password}</strong>
                </div>
              `,
              nzOkText: 'Đóng',
              nzCancelText: 'Sao chép',
              nzOnCancel: () => {
                this.copyToClipboard(response.password);
                return false;
              }
            });
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status === 400 && error.error?.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error('Có lỗi xảy ra khi đặt lại mật khẩu');
            }
            console.error('Error resetting password:', error);
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  toggleStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.isLoading = true;
    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: () => {
        const action = newStatus === 'active' ? 'Mở khóa' : 'Khóa';
        this.message.success(`${action} tài khoản thành công`);
        this.loadUsers();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400 && error.error?.message) {
          this.message.error(error.error.message);
        } else {
          const action = newStatus === 'active' ? 'mở khóa' : 'khóa';
          this.message.error(`Có lỗi xảy ra khi ${action} tài khoản`);
        }
        console.error(`Error toggling user status:`, error);
      }
    });
  }

  onAllChecked(checked: boolean): void {
    this.filteredUsers
      .forEach(user => this.updateCheckedSet(user.id, checked));
    this.refreshCheckedStatus();
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

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.filteredUsers;
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  deleteSelectedUsers(): void {
    const selectedUsers = this.filteredUsers.filter(user => this.setOfCheckedId.has(user.id));
    const userNames = selectedUsers.map(user => user.ho_ten || user.username).join('", "');
    
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng sau không?\n"${userNames}"\nHành động này không thể hoàn tác.`,
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        const deleteObservables = Array.from(this.setOfCheckedId).map(id =>
          this.userService.deleteUser(id)
        );

        // Thực hiện xóa song song
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.message.success(`Đã xóa ${this.setOfCheckedId.size} người dùng`);
            this.setOfCheckedId.clear();
            this.loadUsers();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            this.message.error('Có lỗi xảy ra khi xóa người dùng');
            console.error('Error deleting users:', error);
          }
        });
      },
      nzCancelText: 'Hủy'
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

  saveFilters(): void {
    const filters = {
      searchValue: this.searchValue,
      selectedRole: this.selectedRole,
      selectedStatus: this.selectedStatus,
      selectedProvince: this.selectedProvince,
      selectedDistrict: this.selectedDistrict,
      selectedCommune: this.selectedCommune
    };
    localStorage.setItem('userFilters', JSON.stringify(filters));
  }

  restoreFilters(): void {
    const savedFilters = localStorage.getItem('userFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      this.searchValue = filters.searchValue || '';
      this.selectedRole = filters.selectedRole;
      this.selectedStatus = filters.selectedStatus;
      this.selectedProvince = filters.selectedProvince;
      this.selectedDistrict = filters.selectedDistrict;
      this.selectedCommune = filters.selectedCommune;

      if (this.selectedProvince) {
        this.loadDistricts(this.selectedProvince);
      }
      if (this.selectedDistrict) {
        this.loadCommunes(this.selectedDistrict);
      }
    }
  }

  loadProvinces(): void {
    this.locationService.getProvinces().subscribe({
      next: (data) => {
        this.provinces = data;
      },
      error: (error) => {
        console.error('Error loading provinces:', error);
        this.message.error('Không thể tải danh sách tỉnh thành');
      }
    });
  }

  loadDistricts(provinceCode: string): void {
    this.locationService.getDistricts(provinceCode).subscribe({
      next: (data) => {
        this.districts = data;
        // Reset quận/huyện và xã/phường khi đổi tỉnh
        this.userForm.patchValue({
          district: null,
          commune: null
        });
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.message.error('Không thể tải danh sách quận/huyện');
      }
    });
  }

  loadCommunes(districtCode: string): void {
    this.locationService.getCommunes(districtCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.communes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading communes:', error);
        this.message.error('Không thể tải danh sách xã/phường');
      }
    });
  }
}
