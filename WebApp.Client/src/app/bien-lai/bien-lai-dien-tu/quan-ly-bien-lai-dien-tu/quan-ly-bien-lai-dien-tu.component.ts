import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BienLaiDienTuService } from '../../../services/bien-lai-dien-tu.service';
import { BienLaiDienTu, QuyenBienLaiDienTu } from '../../models/bien-lai-dien-tu.model';
import { VNPTBienLaiService } from '../../../services/vnpt-bien-lai.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-quan-ly-bien-lai-dien-tu',
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
    NzTagModule,
    NzIconModule,
    NzDividerModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzRadioModule
  ],
  templateUrl: './quan-ly-bien-lai-dien-tu.component.html',
  styleUrls: ['./quan-ly-bien-lai-dien-tu.component.scss']
})
export class QuanLyBienLaiDienTuComponent implements OnInit {
  bienLais: BienLaiDienTu[] = [];
  quyenBienLais: QuyenBienLaiDienTu[] = [];
  isLoading = false;
  isVisible = false;
  isSubmitting = false;
  form!: FormGroup;
  editingId: number | null = null;
  currentBienLai: BienLaiDienTu | null = null;

  constructor(
    private bienLaiDienTuService: BienLaiDienTuService,
    private vnptBienLaiService: VNPTBienLaiService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadBienLais();
    this.loadQuyenBienLais();
  }

  // Hàm định dạng tiền VND
  formatterVND = (value: number): string => {
    return `${value} đ`;
  }

  initForm(): void {
    this.form = this.fb.group({
      quyen_bien_lai_dien_tu_id: [null, [Validators.required]],
      ten_nguoi_dong: ['', [Validators.required]],
      so_tien: [0, [Validators.required, Validators.min(0)]],
      ghi_chu: [''],
      ma_so_bhxh: ['', [Validators.required]],
      ma_nhan_vien: ['', [Validators.required]],
      ma_co_quan_bhxh: ['', [Validators.required]],
      ma_so_bhxh_don_vi: ['', [Validators.required]],
      is_bhyt: [true],
      is_bhxh: [false],
      tinh_chat: ['bien_lai_goc']
    });
  }

  loadBienLais(): void {
    this.isLoading = true;
    this.bienLaiDienTuService.getBienLais()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh sách biên lai điện tử:', error);
          this.message.error('Có lỗi khi tải danh sách biên lai điện tử');
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe({
        next: (data: BienLaiDienTu[]) => {
          this.bienLais = data;
          this.isLoading = false;
        }
      });
  }

  loadQuyenBienLais(): void {
    this.bienLaiDienTuService.getQuyenBienLais()
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh sách quyển biên lai điện tử:', error);
          this.message.error('Có lỗi khi tải danh sách quyển biên lai điện tử');
          return of([]);
        })
      )
      .subscribe({
        next: (data: QuyenBienLaiDienTu[]) => {
          // Lọc chỉ lấy các quyển biên lai có thể sử dụng
          this.quyenBienLais = data.filter((q: QuyenBienLaiDienTu) => q.trang_thai !== 'da_su_dung_het');
        }
      });
  }

  showAddModal(): void {
    this.editingId = null;
    this.form.reset();
    this.form.patchValue({
      tinh_chat: 'bien_lai_goc',
      is_bhyt: true,
      is_bhxh: false,
      so_tien: 0
    });
    this.isVisible = true;
  }

  showEditModal(id: number): void {
    this.isLoading = true;
    this.bienLaiDienTuService.getBienLaiById(id)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải thông tin biên lai điện tử:', error);
          this.message.error('Có lỗi khi tải thông tin biên lai điện tử');
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (data: BienLaiDienTu | null) => {
          if (data) {
            this.currentBienLai = data;
            this.editingId = id;
            this.form.patchValue({
              quyen_bien_lai_dien_tu_id: data.quyen_bien_lai_dien_tu_id,
              ten_nguoi_dong: data.ten_nguoi_dong,
              so_tien: data.so_tien,
              ghi_chu: data.ghi_chu,
              ma_so_bhxh: data.ma_so_bhxh,
              ma_nhan_vien: data.ma_nhan_vien,
              ma_co_quan_bhxh: data.ma_co_quan_bhxh,
              ma_so_bhxh_don_vi: data.ma_so_bhxh_don_vi,
              is_bhyt: data.is_bhyt,
              is_bhxh: data.is_bhxh,
              tinh_chat: data.tinh_chat
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

    this.isSubmitting = true;
    const formData = this.form.value;

    if (this.editingId) {
      // Cập nhật biên lai
      this.bienLaiDienTuService.updateBienLai(this.editingId, formData).subscribe({
        next: () => {
          this.message.success('Cập nhật biên lai điện tử thành công');
          this.isVisible = false;
          this.isSubmitting = false;
          this.loadBienLais();
        },
        error: (error: any) => {
          console.error('Lỗi khi cập nhật biên lai điện tử:', error);
          this.message.error('Có lỗi khi cập nhật biên lai điện tử');
          this.isSubmitting = false;
        }
      });
    } else {
      // Thêm biên lai mới
      this.bienLaiDienTuService.createBienLai(formData).subscribe({
        next: (response: any) => {
          this.message.success('Thêm biên lai điện tử thành công');
          this.isVisible = false;
          this.isSubmitting = false;
          this.loadBienLais();
          this.loadQuyenBienLais(); // Cập nhật lại danh sách quyển biên lai
        },
        error: (error: any) => {
          console.error('Lỗi khi thêm biên lai điện tử:', error);
          this.message.error(error.error?.message || 'Có lỗi khi thêm biên lai điện tử');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteBienLai(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa biên lai điện tử này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.bienLaiDienTuService.deleteBienLai(id).subscribe({
          next: () => {
            this.message.success('Xóa biên lai điện tử thành công');
            this.loadBienLais();
          },
          error: (error: any) => {
            console.error('Lỗi khi xóa biên lai điện tử:', error);
            this.message.error('Có lỗi khi xóa biên lai điện tử');
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Trạng thái sang văn bản có thể đọc
  getTinhChatText(tinhChat: string | undefined): string {
    switch (tinhChat) {
      case 'bien_lai_goc':
        return 'Biên lai gốc';
      case 'bien_lai_huy_bo':
        return 'Biên lai hủy bỏ';
      default:
        return tinhChat || 'Không xác định';
    }
  }

  // Tạo biên lai điện tử
  publishToVNPT(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận tạo',
      nzContent: 'Bạn có chắc chắn muốn tạo biên lai điện tử này?',
      nzOkText: 'Tạo',
      nzOkType: 'primary',
      nzOnOk: () => {
        const loadingId = this.message.loading('Đang tạo biên lai điện tử...', { nzDuration: 0 }).messageId;

        this.vnptBienLaiService.publishBienLaiToVNPT(id)
          .pipe(
            finalize(() => {
              this.message.remove(loadingId);
            }),
            catchError(error => {
              console.error('Lỗi khi tạo biên lai điện tử:', error);
              this.message.error(error.error?.message || 'Có lỗi khi tạo biên lai điện tử');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response && response.success) {
                this.message.success('Tạo biên lai điện tử thành công');
                // Hiển thị thông báo khi phát hành thành công
                this.modal.success({
                  nzTitle: 'Tạo biên lai điện tử thành công',
                  nzContent: 'Biên lai điện tử đã được tạo thành công và sẵn sàng sử dụng.'
                });
                this.loadBienLais();
              }
            }
          });
      }
    });
  }

  // Tạo và phát hành biên lai trực tiếp
  publishToVNPTDirect(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận tạo và phát hành',
      nzContent: 'Bạn có chắc chắn muốn tạo và phát hành biên lai điện tử này trực tiếp?',
      nzOkText: 'Tạo và phát hành',
      nzOkType: 'primary',
      nzOnOk: () => {
        const loadingId = this.message.loading('Đang tạo và phát hành biên lai điện tử...', { nzDuration: 0 }).messageId;

        this.vnptBienLaiService.publishBienLaiToVNPTDirect(id)
          .pipe(
            finalize(() => {
              this.message.remove(loadingId);
            }),
            catchError(error => {
              console.error('Lỗi khi tạo và phát hành biên lai điện tử:', error);
              this.message.error(error.error?.message || 'Có lỗi khi tạo và phát hành biên lai điện tử');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response && response.success) {
                this.message.success('Tạo và phát hành biên lai điện tử thành công');
                this.modal.success({
                  nzTitle: 'Tạo và phát hành biên lai điện tử thành công',
                  nzContent: `
                    <p>Biên lai điện tử đã được tạo và phát hành thành công.</p>
                    <p>Mẫu số: ${response.data.pattern}</p>
                    <p>Ký hiệu: ${response.data.serial}</p>
                    <p>Số biên lai: ${response.data.invoiceNo}</p>
                  `,
                  nzOkText: 'Đóng'
                });
                this.loadBienLais();
              }
            }
          });
      }
    });
  }

  // Tạo biên lai điện tử với link
  publishToVNPTWithLink(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận tạo',
      nzContent: 'Bạn có chắc chắn muốn tạo biên lai điện tử này với link?',
      nzOkText: 'Tạo',
      nzOkType: 'primary',
      nzOnOk: () => {
        const loadingId = this.message.loading('Đang tạo biên lai điện tử với link...', { nzDuration: 0 }).messageId;

        this.vnptBienLaiService.publishBienLaiToVNPTWithLink(id)
          .pipe(
            finalize(() => {
              this.message.remove(loadingId);
            }),
            catchError(error => {
              console.error('Lỗi khi tạo biên lai điện tử với link:', error);
              this.message.error(error.error?.message || 'Có lỗi khi tạo biên lai điện tử với link');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response && response.success) {
                this.message.success('Tạo biên lai điện tử với link thành công');

                // Hiển thị thông báo khi phát hành thành công với link
                if (response.data && response.data.link) {
                  this.modal.success({
                    nzTitle: 'Tạo biên lai điện tử thành công',
                    nzContent: `
                      <p>Biên lai điện tử đã được tạo thành công và sẵn sàng sử dụng.</p>
                      <p>Link biên lai: <a href="${response.data.link}" target="_blank">${response.data.link}</a></p>
                    `,
                    nzOkText: 'Đóng'
                  });
                } else {
                  this.modal.success({
                    nzTitle: 'Tạo biên lai điện tử thành công',
                    nzContent: 'Biên lai điện tử đã được tạo thành công và sẵn sàng sử dụng.'
                  });
                }

                this.loadBienLais();
              }
            }
          });
      }
    });
  }

  // Hủy biên lai trên VNPT
  cancelVNPT(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận hủy',
      nzContent: 'Bạn có chắc chắn muốn hủy biên lai điện tử này trên VNPT?',
      nzOkText: 'Hủy',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        const loadingId = this.message.loading('Đang hủy biên lai trên VNPT...', { nzDuration: 0 }).messageId;

        this.vnptBienLaiService.cancelBienLaiVNPT(id)
          .pipe(
            finalize(() => {
              this.message.remove(loadingId);
            }),
            catchError(error => {
              console.error('Lỗi khi hủy biên lai trên VNPT:', error);
              this.message.error(error.error?.message || 'Có lỗi khi hủy biên lai trên VNPT');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response && response.success) {
                this.message.success('Hủy biên lai trên VNPT thành công');
                this.loadBienLais();
              }
            }
          });
      }
    });
  }
}