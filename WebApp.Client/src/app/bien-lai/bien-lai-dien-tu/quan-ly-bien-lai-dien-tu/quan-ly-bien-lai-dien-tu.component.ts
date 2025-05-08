import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BienLaiDienTuService, BienLaiDienTuSearchParams } from '../../../services/bien-lai-dien-tu.service';
import { BienLaiDienTu, QuyenBienLaiDienTu } from '../../models/bien-lai-dien-tu.model';
import { VNPTBienLaiService } from '../../../services/vnpt-bien-lai.service';
import { AuthService } from '../../../services/auth.service';
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
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import html2canvas from 'html2canvas';

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
    NzRadioModule,
    NzUploadModule,
    NzAlertModule,
    NzGridModule,
    NzSpinModule
  ],
  templateUrl: './quan-ly-bien-lai-dien-tu.component.html',
  styleUrls: ['./quan-ly-bien-lai-dien-tu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QuanLyBienLaiDienTuComponent implements OnInit {
  bienLais: BienLaiDienTu[] = [];
  quyenBienLais: QuyenBienLaiDienTu[] = [];
  isLoading = false;
  isVisible = false;
  isSubmitting = false;
  form!: FormGroup;
  searchForm!: FormGroup;
  editingId: number | null = null;
  currentBienLai: BienLaiDienTu | null = null;

  // Checkbox và xóa nhiều
  setOfCheckedId = new Set<number>();
  isAllChecked = false;
  isIndeterminate = false;
  selectedIds: number[] = [];

  // Import Excel
  isImportVisible = false;
  importFileList: NzUploadFile[] = [];
  isImporting = false;
  importResult: any = null;

  // Modal xem biên lai
  isViewModalVisible = false;
  bienLaiContent: SafeHtml | null = null;
  isLoadingBienLai = false;
  currentViewBienLaiId: number | null = null;
  currentUser: any;
  isAdmin = false;

  constructor(
    private bienLaiDienTuService: BienLaiDienTuService,
    private vnptBienLaiService: VNPTBienLaiService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.roles?.some((role: string) =>
      ['admin', 'super_admin'].includes(role)
    ) || this.currentUser?.isSuperAdmin;
  }

  ngOnInit(): void {
    this.initForm();
    this.initSearchForm();
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

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      ky_hieu: [''],
      so_bien_lai: [''],
      ten_nguoi_dong: [''],
      ma_so_bhxh: [''],
      ma_nhan_vien: [''],
      loai_ke_khai: [''] // Thêm trường lọc loại kê khai
    });
  }

  loadBienLais(): void {
    this.isLoading = true;

    // Lấy các giá trị tìm kiếm từ form
    const searchParams: BienLaiDienTuSearchParams = {};
    const formValue = this.searchForm?.value;

    if (formValue) {
      if (formValue.ky_hieu) searchParams.ky_hieu = formValue.ky_hieu;
      if (formValue.so_bien_lai) searchParams.so_bien_lai = formValue.so_bien_lai;
      if (formValue.ten_nguoi_dong) searchParams.ten_nguoi_dong = formValue.ten_nguoi_dong;
      if (formValue.ma_so_bhxh) searchParams.ma_so_bhxh = formValue.ma_so_bhxh;
      if (formValue.ma_nhan_vien) searchParams.ma_nhan_vien = formValue.ma_nhan_vien;

      // Xử lý lọc theo loại kê khai
      if (formValue.loai_ke_khai) {
        if (formValue.loai_ke_khai === 'bhyt') {
          searchParams.is_bhyt = true;
        } else if (formValue.loai_ke_khai === 'bhxh') {
          searchParams.is_bhxh = true;
        }
      }
    }

    this.bienLaiDienTuService.getBienLais(searchParams)
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

  search(): void {
    this.loadBienLais();
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadBienLais();
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

    // Tự động điền mã nhân viên từ người dùng hiện tại
    const maNhanVien = this.currentUser?.ma_nhan_vien || this.currentUser?.username || '';

    this.form.patchValue({
      tinh_chat: 'bien_lai_goc',
      is_bhyt: true,
      is_bhxh: false,
      so_tien: 0,
      ma_nhan_vien: maNhanVien
    });

    // Nếu không phải admin, disable trường mã nhân viên
    if (!this.isAdmin) {
      this.form.get('ma_nhan_vien')?.disable();
    } else {
      this.form.get('ma_nhan_vien')?.enable();
    }

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

            // Nếu không phải admin, disable trường mã nhân viên
            if (!this.isAdmin) {
              this.form.get('ma_nhan_vien')?.disable();
            } else {
              this.form.get('ma_nhan_vien')?.enable();
            }

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
    // Lấy giá trị từ form, bao gồm cả các trường bị disabled
    const formData = {...this.form.getRawValue()};

    // Đảm bảo mã nhân viên được điền
    if (!formData.ma_nhan_vien) {
      formData.ma_nhan_vien = this.currentUser?.ma_nhan_vien || this.currentUser?.username || '';
    }

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

  // Phương thức này được giữ lại để tương thích ngược
  publishToVNPT(id: number): void {
    this.publishToVNPTWithLink(id);
  }

  // Phương thức này được giữ lại để tương thích ngược
  publishToVNPTDirect(id: number): void {
    this.publishToVNPTWithLink(id);
  }

  // Tạo biên lai điện tử (phương thức hợp nhất)
  publishToVNPTWithLink(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận tạo biên lai điện tử',
      nzContent: 'Bạn có chắc chắn muốn tạo biên lai điện tử này?',
      nzOkText: 'Tạo',
      nzOkType: 'primary',
      nzOnOk: () => {
        const loadingId = this.message.loading('Đang tạo biên lai điện tử...', { nzDuration: 0 }).messageId;

        this.vnptBienLaiService.publishBienLaiToVNPTWithLink(id)
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
                if (response.data && response.data.link) {
                  this.modal.success({
                    nzTitle: 'Tạo biên lai điện tử thành công',
                    nzContent: `
                      <p>Biên lai điện tử đã được tạo thành công.</p>
                      <p>Mẫu số: ${response.data.pattern}</p>
                      <p>Ký hiệu: ${response.data.serial}</p>
                      <p>Số biên lai: ${response.data.invoiceNo}</p>
                      <p>Link biên lai: <a href="${response.data.link}" target="_blank">${response.data.link}</a></p>
                    `,
                    nzOkText: 'Đóng'
                  });
                } else {
                  this.modal.success({
                    nzTitle: 'Tạo biên lai điện tử thành công',
                    nzContent: `
                      <p>Biên lai điện tử đã được tạo thành công.</p>
                      <p>Mẫu số: ${response.data.pattern || ''}</p>
                      <p>Ký hiệu: ${response.data.serial || ''}</p>
                      <p>Số biên lai: ${response.data.invoiceNo || ''}</p>
                    `,
                    nzOkText: 'Đóng'
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

  // Phương thức xử lý import Excel
  showImportModal(): void {
    this.isImportVisible = true;
    this.importFileList = [];
    this.importResult = null;
  }

  handleImportCancel(): void {
    this.isImportVisible = false;
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // Kiểm tra định dạng file
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXlsx) {
      this.message.error('Chỉ hỗ trợ file Excel (.xlsx)!');
      return false;
    }

    // Kiểm tra kích thước file
    const isLt5M = (file.size || 0) / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('File phải nhỏ hơn 5MB!');
      return false;
    }

    // Chỉ cho phép 1 file
    this.importFileList = [file];
    return false;
  };

  importFromExcel(): void {
    if (this.importFileList.length === 0) {
      this.message.warning('Vui lòng chọn file Excel để import!');
      return;
    }

    this.isImporting = true;
    const formData = new FormData();
    formData.append('file', this.importFileList[0] as any);

    this.http.post(`${environment.apiUrl}/bien-lai-dien-tu/import`, formData)
      .subscribe({
        next: (response: any) => {
          this.isImporting = false;
          this.importResult = response;
          this.message.success(response.message || 'Import thành công!');
          this.loadBienLais(); // Cập nhật lại danh sách biên lai
          this.loadQuyenBienLais(); // Cập nhật lại danh sách quyển biên lai
        },
        error: (error) => {
          this.isImporting = false;
          this.message.error(error.error?.message || 'Lỗi khi import dữ liệu!');
          console.error('Import error:', error);
        }
      });
  }

  downloadTemplate(): void {
    // Sử dụng đường dẫn trực tiếp đến file mẫu trong thư mục assets
    const templateUrl = '/assets/templates/mau-import-bien-lai-dien-tu.xlsx';

    // Tạo link tải xuống
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'mau-import-bien-lai-dien-tu.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.message.success('Tải mẫu Excel thành công!');
  }

  // PortalService methods

  /**
   * Xem biên lai điện tử
   * @param id ID biên lai
   */
  viewBienLai(id: number): void {
    this.isLoadingBienLai = true;
    this.isViewModalVisible = true;
    this.currentViewBienLaiId = id;
    this.bienLaiContent = null;

    this.vnptBienLaiService.getBienLaiContent(id)
      .pipe(
        finalize(() => {
          this.isLoadingBienLai = false;
        }),
        catchError(error => {
          console.error('Lỗi khi lấy nội dung biên lai:', error);
          this.message.error('Có lỗi khi lấy nội dung biên lai');
          return of('');
        })
      )
      .subscribe({
        next: (content: string) => {
          if (content) {
            // Kiểm tra nếu nội dung là HTML
            if (content.includes('<html') || content.includes('<!DOCTYPE html')) {
              this.bienLaiContent = this.sanitizer.bypassSecurityTrustHtml(content);
            } else if (content.startsWith('Error:')) {
              // Hiển thị thông báo lỗi
              this.message.error(content);
              this.bienLaiContent = this.sanitizer.bypassSecurityTrustHtml(`<div class="error-message">${content}</div>`);
            } else if (content.startsWith('ERR:')) {
              // Xử lý mã lỗi từ VNPT
              const errorMessage = this.getVNPTErrorMessage(content);
              this.message.error(errorMessage);
              this.bienLaiContent = this.sanitizer.bypassSecurityTrustHtml(`<div class="error-message">${errorMessage}</div>`);
            } else if (content.includes('<a href=')) {
              // Nếu là link biên lai
              this.bienLaiContent = this.sanitizer.bypassSecurityTrustHtml(content);
            } else {
              // Nội dung không xác định
              this.bienLaiContent = this.sanitizer.bypassSecurityTrustHtml(`<div>${content}</div>`);
            }
          } else {
            this.bienLaiContent = this.sanitizer.bypassSecurityTrustHtml('<div class="error-message">Không có nội dung biên lai</div>');
          }
        }
      });
  }

  /**
   * Đóng modal xem biên lai
   */
  closeViewModal(): void {
    this.isViewModalVisible = false;
    this.bienLaiContent = null;
    this.currentViewBienLaiId = null;
  }

  /**
   * Mở biên lai trong tab mới
   */
  openBienLaiInNewTab(): void {
    if (this.currentViewBienLaiId) {
      window.open(this.vnptBienLaiService.viewBienLai(this.currentViewBienLaiId), '_blank');
    }
  }

  /**
   * Tải biên lai điện tử dưới dạng PDF
   * @param id ID biên lai
   * @returns URL để tải file PDF
   */
  downloadBienLaiPdf(id: number): string {
    return this.vnptBienLaiService.downloadBienLaiPdf(id);
  }

  /**
   * Tải PDF của biên lai hiện tại
   * Phương thức này sẽ tạo một thẻ a tạm thời để tải file PDF trực tiếp
   */
  downloadPdf(): void {
    if (!this.currentViewBienLaiId) {
      this.message.warning('Không có biên lai để tải');
      return;
    }

    // Tạo một thẻ a tạm thời
    const link = document.createElement('a');
    link.href = this.downloadBienLaiPdf(this.currentViewBienLaiId);

    // Đặt thuộc tính download để tải xuống thay vì mở trong trình duyệt
    link.setAttribute('download', `BienLai_${this.currentViewBienLaiId}.pdf`);

    // Thêm vào DOM, kích hoạt sự kiện click, và xóa
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Tải PDF của biên lai từ bảng
   * @param id ID biên lai cần tải
   */
  downloadPdfFromTable(id: number): void {
    if (!id) {
      this.message.warning('Không có biên lai để tải');
      return;
    }

    // Tạo một thẻ a tạm thời
    const link = document.createElement('a');
    link.href = this.downloadBienLaiPdf(id);

    // Đặt thuộc tính download để tải xuống thay vì mở trong trình duyệt
    link.setAttribute('download', `BienLai_${id}.pdf`);

    // Thêm vào DOM, kích hoạt sự kiện click, và xóa
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * In biên lai điện tử
   * Sử dụng iframe để in nội dung biên lai hiện tại
   */
  printBienLai(): void {
    if (!this.bienLaiContent) {
      this.message.warning('Không có nội dung biên lai để in');
      return;
    }

    try {
      // Tạo một iframe ẩn
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.top = '-9999px';
      printIframe.style.left = '-9999px';
      document.body.appendChild(printIframe);

      // Lấy phần tử DOM chứa nội dung biên lai thay vì chuyển đổi SafeHtml thành chuỗi
      const bienLaiElement = document.querySelector('.bien-lai-content');
      if (!bienLaiElement) {
        throw new Error('Không tìm thấy phần tử chứa nội dung biên lai');
      }

      // Ghi nội dung vào iframe
      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Không thể truy cập document của iframe');
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Biên lai điện tử</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 0;
                size: auto;
              }
            }
          </style>
        </head>
        <body>
          ${bienLaiElement.innerHTML}
        </body>
        </html>
      `);
      iframeDoc.close();

      // Đợi iframe tải xong
      setTimeout(() => {
        // In nội dung của iframe
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();

        // Xóa iframe sau khi in
        setTimeout(() => {
          document.body.removeChild(printIframe);
        }, 1000);
      }, 500);
    } catch (error) {
      console.error('Lỗi khi in biên lai:', error);
      this.message.error('Có lỗi khi in biên lai. Vui lòng thử lại sau.');
    }
  }

  /**
   * Sao chép biên lai dưới dạng ảnh vào clipboard
   */
  copyBienLaiAsImage(): void {
    if (!this.bienLaiContent) {
      this.message.warning('Không có nội dung biên lai để sao chép');
      return;
    }

    try {
      // Lấy phần tử DOM chứa nội dung biên lai
      const bienLaiElement = document.querySelector('.bien-lai-content');
      if (!bienLaiElement) {
        throw new Error('Không tìm thấy phần tử chứa nội dung biên lai');
      }

      // Hiển thị thông báo đang xử lý
      const loadingId = this.message.loading('Đang xử lý...', { nzDuration: 0 }).messageId;

      // Sử dụng html2canvas để chuyển đổi nội dung HTML thành canvas
      html2canvas(bienLaiElement as HTMLElement, {
        scale: 2, // Tăng độ phân giải
        useCORS: true, // Cho phép tải hình ảnh từ các domain khác
        allowTaint: true, // Cho phép taint canvas
        backgroundColor: '#ffffff' // Đặt màu nền trắng
      }).then(canvas => {
        // Xóa thông báo đang xử lý
        this.message.remove(loadingId);

        // Chuyển đổi canvas thành blob
        canvas.toBlob(blob => {
          if (!blob) {
            this.message.error('Không thể chuyển đổi biên lai thành ảnh');
            return;
          }

          // Tạo ClipboardItem và sao chép vào clipboard
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item])
            .then(() => {
              this.message.success('Đã sao chép ảnh biên lai vào clipboard');
            })
            .catch(err => {
              console.error('Lỗi khi sao chép vào clipboard:', err);
              this.message.error('Không thể sao chép ảnh vào clipboard. Vui lòng thử lại sau.');

              // Phương án dự phòng: Tạo URL và mở trong tab mới
              this.fallbackCopyImage(canvas);
            });
        }, 'image/png');
      }).catch(err => {
        // Xóa thông báo đang xử lý
        this.message.remove(loadingId);

        console.error('Lỗi khi tạo ảnh từ biên lai:', err);
        this.message.error('Không thể tạo ảnh từ biên lai. Vui lòng thử lại sau.');
      });
    } catch (error) {
      console.error('Lỗi khi sao chép ảnh biên lai:', error);
      this.message.error('Có lỗi khi sao chép ảnh biên lai. Vui lòng thử lại sau.');
    }
  }

  /**
   * Phương án dự phòng khi không thể sao chép ảnh vào clipboard
   * @param canvas Canvas chứa ảnh biên lai
   */
  private fallbackCopyImage(canvas: HTMLCanvasElement): void {
    try {
      // Tạo URL từ canvas
      const imageUrl = canvas.toDataURL('image/png');

      // Tạo thẻ a tạm thời để tải ảnh
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `BienLai_${this.currentViewBienLaiId || 'image'}.png`;

      // Thêm vào DOM, kích hoạt sự kiện click, và xóa
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.message.info('Không thể sao chép ảnh vào clipboard. Đã tải ảnh xuống thay thế.');
    } catch (error) {
      console.error('Lỗi khi tải ảnh xuống:', error);
      this.message.error('Không thể tải ảnh xuống. Vui lòng thử lại sau.');
    }
  }

  /**
   * In biên lai từ bảng danh sách biên lai
   * @param id ID biên lai cần in
   */
  printBienLaiFromTable(id: number): void {
    // Hiển thị thông báo đang xử lý
    const loadingId = this.message.loading('Đang tải nội dung biên lai...', { nzDuration: 0 }).messageId;

    // Lấy nội dung biên lai từ API
    this.vnptBienLaiService.getBienLaiContent(id)
      .pipe(
        finalize(() => {
          this.message.remove(loadingId);
        }),
        catchError(error => {
          console.error('Lỗi khi lấy nội dung biên lai:', error);
          this.message.error('Có lỗi khi lấy nội dung biên lai');
          return of('');
        })
      )
      .subscribe({
        next: (content: string) => {
          if (!content) {
            this.message.warning('Không có nội dung biên lai để in');
            return;
          }

          if (content.startsWith('Error:') || content.startsWith('ERR:')) {
            // Hiển thị thông báo lỗi
            const errorMessage = content.startsWith('ERR:') ? this.getVNPTErrorMessage(content) : content;
            this.message.error(errorMessage);
            return;
          }

          try {
            // Tạo một iframe ẩn
            const printIframe = document.createElement('iframe');
            printIframe.style.position = 'absolute';
            printIframe.style.top = '-9999px';
            printIframe.style.left = '-9999px';
            document.body.appendChild(printIframe);

            // Ghi nội dung vào iframe
            const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
            if (!iframeDoc) {
              throw new Error('Không thể truy cập document của iframe');
            }

            iframeDoc.open();
            iframeDoc.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Biên lai điện tử</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                  }
                  @media print {
                    body {
                      padding: 0;
                    }
                    @page {
                      margin: 0;
                      size: auto;
                    }
                  }
                </style>
              </head>
              <body>
                ${content}
              </body>
              </html>
            `);
            iframeDoc.close();

            // Đợi iframe tải xong
            setTimeout(() => {
              // In nội dung của iframe
              printIframe.contentWindow?.focus();
              printIframe.contentWindow?.print();

              // Xóa iframe sau khi in
              setTimeout(() => {
                document.body.removeChild(printIframe);
              }, 1000);
            }, 500);
          } catch (error) {
            console.error('Lỗi khi in biên lai:', error);
            this.message.error('Có lỗi khi in biên lai. Vui lòng thử lại sau.');
          }
        }
      });
  }

  /**
   * Lấy thông báo lỗi từ mã lỗi VNPT
   * @param errorCode Mã lỗi từ VNPT
   * @returns Thông báo lỗi
   */
  getVNPTErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'ERR:1':
        return 'Lỗi xác thực: Tài khoản đăng nhập sai hoặc không có quyền';
      case 'ERR:2':
        return 'Không tìm thấy biên lai';
      case 'ERR:6':
        return 'Dải biên lai cũ đã hết, vui lòng sử dụng chức năng "Mở link" để xem biên lai';
      case 'ERR:8':
        return 'Biên lai đã được thay thế hoặc hủy';
      case 'ERR:9':
        return 'Trạng thái biên lai không hợp lệ';
      default:
        return `Lỗi không xác định: ${errorCode}`;
    }
  }

  // Phương thức xử lý checkbox
  onAllChecked(checked: boolean): void {
    this.bienLais.forEach(item => {
      // Chỉ chọn các biên lai chưa phát hành
      if (item.id && !item.is_published_to_vnpt) {
        this.updateCheckedSet(item.id, checked);
      }
    });
    this.refreshCheckedStatus();
  }

  onItemChecked(id: number, checked: boolean): void {
    // Kiểm tra xem biên lai có đã phát hành không
    const bienLai = this.bienLais.find(item => item.id === id);
    if (bienLai && bienLai.is_published_to_vnpt) {
      // Không cho phép chọn biên lai đã phát hành
      return;
    }

    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    this.selectedIds = Array.from(this.setOfCheckedId);
  }

  refreshCheckedStatus(): void {
    // Chỉ tính toán trạng thái checkbox dựa trên các biên lai chưa phát hành
    const listOfEnabledData = this.bienLais.filter(item => item.id !== undefined && !item.is_published_to_vnpt);
    this.isAllChecked = listOfEnabledData.length > 0 && listOfEnabledData.every(({ id }) => id !== undefined && this.setOfCheckedId.has(id));
    this.isIndeterminate = listOfEnabledData.some(({ id }) => id !== undefined && this.setOfCheckedId.has(id)) && !this.isAllChecked;
    this.selectedIds = Array.from(this.setOfCheckedId);
  }

  // Xóa nhiều biên lai điện tử
  deleteMultiple(): void {
    if (this.selectedIds.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một biên lai để xóa');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${this.selectedIds.length} biên lai điện tử đã chọn?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.bienLaiDienTuService.deleteMultiple(this.selectedIds).subscribe({
          next: () => {
            this.message.success(`Xóa ${this.selectedIds.length} biên lai điện tử thành công`);
            this.setOfCheckedId.clear();
            this.selectedIds = [];
            this.loadBienLais();
          },
          error: (error: any) => {
            console.error('Lỗi khi xóa nhiều biên lai điện tử:', error);
            this.message.error('Có lỗi khi xóa nhiều biên lai điện tử');
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Phát hành nhiều biên lai điện tử lên VNPT
  publishMultiple(): void {
    if (this.selectedIds.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một biên lai để tạo');
      return;
    }

    // Lọc ra những biên lai chưa phát hành
    const unpublishedBienLais = this.bienLais.filter(
      item => item.id && this.setOfCheckedId.has(item.id) && !item.is_published_to_vnpt
    );

    if (unpublishedBienLais.length === 0) {
      this.message.warning('Không có biên lai nào chưa phát hành trong danh sách đã chọn');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận tạo biên lai điện tử',
      nzContent: `Bạn có chắc chắn muốn tạo ${unpublishedBienLais.length} biên lai điện tử đã chọn? Hệ thống sẽ xử lý theo thứ tự số biên lai từ bé đến lớn.`,
      nzOkText: 'Tạo',
      nzOkType: 'primary',
      nzOnOk: () => {
        const loadingId = this.message.loading('Đang tạo biên lai điện tử...', { nzDuration: 0 }).messageId;

        this.bienLaiDienTuService.publishMultiple(this.selectedIds)
          .pipe(
            finalize(() => {
              this.message.remove(loadingId);
            }),
            catchError(error => {
              console.error('Lỗi khi tạo nhiều biên lai điện tử:', error);
              this.message.error(error.error?.message || 'Có lỗi khi tạo nhiều biên lai điện tử');
              return of(null);
            })
          )
          .subscribe({
            next: (response) => {
              if (response) {
                // Hiển thị thông báo kết quả
                this.message.success(`Đã xử lý ${response.successCount + response.errorCount} biên lai: ${response.successCount} thành công, ${response.errorCount} lỗi`);

                // Hiển thị modal kết quả chi tiết
                this.modal.success({
                  nzTitle: 'Kết quả tạo biên lai điện tử',
                  nzContent: `
                    <p>Tổng số biên lai đã xử lý: ${response.successCount + response.errorCount}</p>
                    <p>Số biên lai thành công: ${response.successCount}</p>
                    <p>Số biên lai lỗi: ${response.errorCount}</p>
                  `,
                  nzWidth: 600,
                  nzOkText: 'Đóng'
                });

                // Cập nhật lại danh sách biên lai
                this.loadBienLais();

                // Xóa danh sách đã chọn
                this.setOfCheckedId.clear();
                this.selectedIds = [];
              }
            }
          });
      }
    });
  }
}