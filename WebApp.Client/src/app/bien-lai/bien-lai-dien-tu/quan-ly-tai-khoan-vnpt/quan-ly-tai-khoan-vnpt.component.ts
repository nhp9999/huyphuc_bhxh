import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { VNPTAccountService } from '../../../services/vnpt-account.service';
import { VNPTAccount } from '../../models/vnpt-account.model';
import { NguoiDung, UserService } from '../../../services/user.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-quan-ly-tai-khoan-vnpt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzMessageModule,
    NzIconModule,
    NzTagModule,
    NzDividerModule,
    NzSwitchModule,
    NzToolTipModule,
    NzSpinModule,
    NzGridModule,
    NzCardModule,
    NzAlertModule,
    NzPopconfirmModule,
    NzSpaceModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzTabsModule,
    NzDescriptionsModule,
    NzBadgeModule,
    NzDropDownModule,
    NzEmptyModule,
    NzAvatarModule,
    NzRadioModule,
    NzProgressModule
  ],
  templateUrl: './quan-ly-tai-khoan-vnpt.component.html',
  styleUrls: ['./quan-ly-tai-khoan-vnpt.component.scss']
})
export class QuanLyTaiKhoanVNPTComponent implements OnInit {
  accounts: VNPTAccount[] = [];
  nguoiDungs: NguoiDung[] = [];
  isLoading = false;
  isVisible = false;
  isCloneModalVisible = false;
  isSubmitting = false;
  form!: FormGroup;
  cloneForm!: FormGroup;
  editingId: number | null = null;
  cloningId: number | null = null;
  currentAccount: VNPTAccount | null = null;
  passwordVisible = false;
  acpassVisible = false;
  nguoiDungMap = new Map<string, string>();
  searchValue = '';
  filteredAccounts: VNPTAccount[] = [];

  constructor(
    private vnptAccountService: VNPTAccountService,
    private userService: UserService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
    this.loadNguoiDungs();
  }

  initForm(): void {
    this.form = this.fb.group({
      maNhanVien: ['', [Validators.required]],
      account: ['', [Validators.required]],
      acpass: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      pattern: ['', [Validators.required]],
      serial: ['', [Validators.required]],
      serviceUrl: ['https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx', [Validators.required]],
      isActive: [true]
    });

    this.cloneForm = this.fb.group({
      maNhanVien: ['', [Validators.required]]
    });
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.vnptAccountService.getAccounts()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh sách tài khoản VNPT:', error);
          this.message.error('Có lỗi khi tải danh sách tài khoản VNPT');
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe({
        next: (data: VNPTAccount[]) => {
          this.accounts = data;
          this.filteredAccounts = [...this.accounts];
          this.isLoading = false;
        }
      });
  }

  loadNguoiDungs(): void {
    this.userService.getNguoiDungs()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh sách người dùng:', error);
          this.message.error('Có lỗi khi tải danh sách người dùng');
          return of([]);
        })
      )
      .subscribe({
        next: (data: NguoiDung[]) => {
          this.nguoiDungs = data;
          // Tạo map mã nhân viên -> tên người dùng
          this.nguoiDungs.forEach(user => {
            if (user.maNhanVien || user.ma_nhan_vien) {
              const maNV = user.maNhanVien || user.ma_nhan_vien || '';
              const hoTen = user.hoTen || user.ho_ten || '';
              this.nguoiDungMap.set(maNV, hoTen);
            }
          });
        }
      });
  }

  showAddModal(): void {
    this.editingId = null;
    this.form.reset({
      serviceUrl: 'https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx',
      isActive: true
    });
    this.isVisible = true;
  }

  showEditModal(id: number): void {
    this.isLoading = true;
    console.log('Yêu cầu lấy thông tin tài khoản VNPT với ID:', id);
    this.vnptAccountService.getAccountById(id)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải thông tin tài khoản VNPT:', error);
          this.message.error('Có lỗi khi tải thông tin tài khoản VNPT');
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (account) => {
          console.log('Thông tin tài khoản VNPT nhận được:', account);
          if (account) {
            this.editingId = id;
            this.currentAccount = account;
            this.form.patchValue({
              maNhanVien: account.maNhanVien,
              account: account.account,
              acpass: account.acpass,
              username: account.username,
              password: account.password,
              pattern: account.pattern,
              serial: account.serial,
              serviceUrl: account.serviceUrl,
              isActive: account.isActive
            });
            this.isVisible = true;
          } else {
            this.message.error('Không tìm thấy thông tin tài khoản VNPT');
          }
          this.isLoading = false;
        }
      });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.form.reset();
  }

  handleOk(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      const formData = this.form.getRawValue();

      if (this.editingId) {
        // Cập nhật tài khoản
        // Đảm bảo gán đúng ID
        formData.id = this.editingId;
        console.log('Dữ liệu cập nhật:', formData);
        this.vnptAccountService.updateAccount(this.editingId, formData)
          .pipe(
            finalize(() => {
              this.isSubmitting = false;
            }),
            catchError(error => {
              console.error('Lỗi khi cập nhật tài khoản VNPT:', error);
              this.message.error(error.error?.message || 'Có lỗi khi cập nhật tài khoản VNPT');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response) {
                this.message.success('Cập nhật tài khoản VNPT thành công');
                this.isVisible = false;
                this.loadAccounts();
              }
            }
          });
      } else {
        // Tạo mới tài khoản
        this.vnptAccountService.createAccount(formData)
          .pipe(
            finalize(() => {
              this.isSubmitting = false;
            }),
            catchError(error => {
              console.error('Lỗi khi tạo tài khoản VNPT:', error);
              this.message.error(error.error?.message || 'Có lỗi khi tạo tài khoản VNPT');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response) {
                this.message.success('Tạo tài khoản VNPT thành công');
                this.isVisible = false;
                this.loadAccounts();
              }
            }
          });
      }
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }

  deleteAccount(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa tài khoản VNPT này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.vnptAccountService.deleteAccount(id)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
            catchError(error => {
              console.error('Lỗi khi xóa tài khoản VNPT:', error);
              this.message.error(error.error?.message || 'Có lỗi khi xóa tài khoản VNPT');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response) {
                this.message.success('Xóa tài khoản VNPT thành công');
                this.loadAccounts();
              }
            }
          });
      }
    });
  }

  toggleStatus(account: VNPTAccount): void {
    if (!account.id) {
      this.message.error('Không tìm thấy ID tài khoản');
      return;
    }

    const updatedAccount = { ...account, isActive: !account.isActive };
    console.log('Dữ liệu cập nhật trạng thái:', updatedAccount);
    this.vnptAccountService.updateAccount(account.id, updatedAccount)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi cập nhật trạng thái tài khoản VNPT:', error);
          this.message.error(error.error?.message || 'Có lỗi khi cập nhật trạng thái tài khoản VNPT');
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.message.success(`Tài khoản VNPT đã được ${response.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
            this.loadAccounts();
          }
        }
      });
  }

  getNguoiDungName(maNhanVien: string): string {
    return this.nguoiDungMap.get(maNhanVien) || maNhanVien;
  }

  search(): void {
    if (this.searchValue) {
      const searchLower = this.searchValue.toLowerCase();
      this.filteredAccounts = this.accounts.filter(account =>
        account.maNhanVien.toLowerCase().includes(searchLower) ||
        account.account.toLowerCase().includes(searchLower) ||
        account.username.toLowerCase().includes(searchLower) ||
        account.pattern.toLowerCase().includes(searchLower) ||
        account.serial.toLowerCase().includes(searchLower) ||
        (this.nguoiDungMap.get(account.maNhanVien) || '').toLowerCase().includes(searchLower)
      );
    } else {
      this.filteredAccounts = [...this.accounts];
    }
  }

  resetSearch(): void {
    this.searchValue = '';
    this.filteredAccounts = [...this.accounts];
  }

  showCloneModal(id: number): void {
    this.cloningId = id;
    this.cloneForm.reset();
    this.isCloneModalVisible = true;
  }

  handleCloneCancel(): void {
    this.isCloneModalVisible = false;
    this.cloneForm.reset();
  }

  handleCloneOk(): void {
    if (this.cloneForm.valid && this.cloningId) {
      this.isSubmitting = true;
      const maNhanVien = this.cloneForm.get('maNhanVien')?.value;

      this.vnptAccountService.cloneAccount(this.cloningId, maNhanVien)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          }),
          catchError(error => {
            console.error('Lỗi khi tạo bản sao tài khoản VNPT:', error);
            this.message.error(error.error?.message || 'Có lỗi khi tạo bản sao tài khoản VNPT');
            return of(null);
          })
        )
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Tạo bản sao tài khoản VNPT thành công:', response);
              this.message.success(`Tạo bản sao tài khoản VNPT thành công với mã nhân viên ${response.maNhanVien}`);
              this.isCloneModalVisible = false;
              this.loadAccounts();
            }
          }
        });
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.values(this.cloneForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }
}
