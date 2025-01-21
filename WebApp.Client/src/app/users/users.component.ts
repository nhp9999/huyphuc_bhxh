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
import { User, UserService } from '../services/user.service';

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
    NzToolTipModule
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
  selectedRole = '';
  selectedStatus = '';

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
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      ho_ten: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      so_dien_thoai: ['', Validators.required],
      role: ['employee', Validators.required],
      department_code: [''],
      unit: [''],
      status: ['active'],
      commune: [''],
      district: [''],
      province: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
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

  resetFilters(): void {
    this.searchValue = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  showAddModal(): void {
    this.editingUser = {
      status: 'active',
      first_login: true,
      password_changed: false
    };
    this.initForm();
    this.isModalVisible = true;
  }

  showEditModal(user: User): void {
    this.editingUser = { ...user };
    this.userForm.patchValue({
      username: user.username,
      ho_ten: user.ho_ten,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai,
      role: user.role,
      department_code: user.department_code,
      unit: user.unit,
      status: user.status,
      commune: user.commune,
      district: user.district,
      province: user.province,
      address: user.address
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
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

  toggleStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'mở khóa' : 'khóa';
    
    this.modal.confirm({
      nzTitle: `Xác nhận ${action} tài khoản`,
      nzContent: `Bạn có chắc chắn muốn ${action} tài khoản "${user.ho_ten || user.username}" không?`,
      nzOkText: 'Xác nhận',
      nzOkType: newStatus === 'active' ? 'primary' : 'default',
      nzOnOk: () => {
        this.isLoading = true;
        this.userService.toggleUserStatus(user.id, newStatus).subscribe({
          next: () => {
            this.message.success(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`);
            this.loadUsers();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status === 400 && error.error?.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error(`Có lỗi xảy ra khi ${action} tài khoản`);
            }
            console.error(`Error ${action} user:`, error);
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }
}
