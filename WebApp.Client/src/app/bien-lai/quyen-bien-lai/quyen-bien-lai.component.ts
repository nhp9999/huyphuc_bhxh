import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService, NguoiDung } from '../../services/user.service';
// Import other needed modules

interface NguoiThuOption {
  value: number;
  label: string;
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
    NzTagModule
  ],
  templateUrl: './quyen-bien-lai.component.html'
})
export class QuyenBienLaiComponent implements OnInit {
  listQuyenBienLai: any[] = [];
  users: NguoiDung[] = [];
  loading = false;
  isVisible = false;
  isOkLoading = false;
  modalTitle = 'Thêm quyển biên lai';
  form!: FormGroup;
  nguoiThus: NguoiThuOption[] = [];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private userService: UserService
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
      quyen_so: [null, [Validators.required]],
      tu_so: [null, [Validators.required]],
      den_so: [null, [Validators.required]],
      nguoi_thu: [null, [Validators.required]]
    });
  }

  loadData(): void {
    this.loading = true;
    // TODO: Call API to get data
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: NguoiDung[]) => {
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

  showModal(): void {
    this.form.reset();
    this.modalTitle = 'Thêm quyển biên lai';
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.form.valid) {
      this.isOkLoading = true;
      // TODO: Call API to save data
      setTimeout(() => {
        this.isOkLoading = false;
        this.isVisible = false;
        this.loadData();
      }, 1000);
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

  edit(item: any): void {
    this.modalTitle = 'Sửa quyển biên lai';
    this.form.patchValue(item);
    this.isVisible = true;
  }

  delete(item: any): void {
    // TODO: Implement delete
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
} 