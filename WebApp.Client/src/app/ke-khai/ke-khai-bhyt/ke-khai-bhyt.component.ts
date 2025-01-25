import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { KeKhaiBHYT, KeKhaiBHYTService, ThongTinThe } from '../../services/ke-khai-bhyt.service';
import { DotKeKhai, DotKeKhaiService } from '../../services/dot-ke-khai.service';
import { ActivatedRoute } from '@angular/router';
import { vi_VN } from 'ng-zorro-antd/i18n';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { 
  SaveOutline,
  PlusOutline,
  CloseOutline,
  EditOutline,
  DeleteOutline
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';

registerLocaleData(vi);

@Component({
  selector: 'app-ke-khai-bhyt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzDividerModule,
    NzCardModule,
    NzGridModule,
    NzInputNumberModule,
    NzCheckboxModule,
    DatePipe
  ],
  templateUrl: './ke-khai-bhyt.component.html',
  styleUrls: ['./ke-khai-bhyt.component.scss']
})
export class KeKhaiBHYTComponent implements OnInit {
  keKhaiBHYTs: KeKhaiBHYT[] = [];
  thongTinThe: ThongTinThe | null = null;
  dotKeKhai: DotKeKhai | null = null;
  loading = false;
  isVisible = false;
  isEdit = false;
  form: FormGroup;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  selectedIds: number[] = [];
  dotKeKhaiId: number = 0;
  isAllChecked = false;

  constructor(
    private keKhaiBHYTService: KeKhaiBHYTService,
    private dotKeKhaiService: DotKeKhaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: NzI18nService,
    private iconService: NzIconService
  ) {
    this.i18n.setLocale(vi_VN);
    this.iconService.addIcon(
      SaveOutline,
      PlusOutline,
      CloseOutline,
      EditOutline,
      DeleteOutline
    );
    this.form = this.fb.group({
      id: [null],
      thong_tin_the_id: [null],
      ma_so_bhxh: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      cccd: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      ho_ten: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÀ-ỹ]+(([',. -][a-zA-ZÀ-ỹ ])?[a-zA-ZÀ-ỹ]*)*$/)
      ]],
      ngay_sinh: [null, [Validators.required]],
      gioi_tinh: [null, [Validators.required]],
      so_dien_thoai: ['', [Validators.pattern(/^(0|\+84)[0-9]{9}$/)]],
      nguoi_thu: [1, [Validators.required, Validators.min(1)]],
      so_thang_dong: [1, [Validators.required, Validators.min(1)]],
      phuong_an_dong: ['', [Validators.required]],
      han_the_cu: [null],
      han_the_moi_tu: [null, [Validators.required]],
      han_the_moi_den: [null, [Validators.required]],
      tinh_nkq: ['', [Validators.required]],
      huyen_nkq: ['', [Validators.required]],
      xa_nkq: ['', [Validators.required]],
      dia_chi_nkq: ['', [Validators.required]],
      benh_vien_kcb: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.dotKeKhaiId = +params['id'];
      this.loadDotKeKhai();
      this.loadData();
    });
  }

  loadDotKeKhai(): void {
    this.dotKeKhaiService.getDotKeKhai(this.dotKeKhaiId).subscribe({
      next: (data) => {
        this.dotKeKhai = data;
      },
      error: (error) => {
        this.message.error('Có lỗi xảy ra khi tải thông tin đợt kê khai');
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.keKhaiBHYTService.getByDotKeKhai(this.dotKeKhaiId).subscribe({
      next: (data) => {
        console.log('Received data:', data);
        this.keKhaiBHYTs = data.map(item => {
          if (!item.thongTinThe) {
            console.warn('thongTinThe is missing for item:', item);
          }
          return item;
        });
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error('Error loading data:', error);
        this.loading = false;
      }
    });
  }

  showModal(data?: KeKhaiBHYT): void {
    this.isVisible = true;
    this.isEdit = !!data;
    this.form.reset();

    if (data) {
      console.log('Modal data:', data);
      this.form.patchValue({
        id: data.id,
        thong_tin_the_id: data.thong_tin_the_id,
        ...data.thongTinThe,
        nguoi_thu: data.nguoi_thu,
        so_thang_dong: data.so_thang_dong,
        phuong_an_dong: data.phuong_an_dong,
        han_the_cu: data.han_the_cu,
        han_the_moi_tu: data.han_the_moi_tu,
        han_the_moi_den: data.han_the_moi_den,
        tinh_nkq: data.tinh_nkq,
        huyen_nkq: data.huyen_nkq,
        xa_nkq: data.xa_nkq,
        dia_chi_nkq: data.dia_chi_nkq,
        benh_vien_kcb: data.benh_vien_kcb
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.form.reset();
  }

  // Hàm format tên đợt theo định dạng yêu cầu
  formatTenDot(soDot: number, thang: number, nam: number): string {
    return `Đợt ${soDot} Tháng ${thang} năm ${nam}`;
  }

  handleOk(): void {
    if (this.form.valid && this.dotKeKhai) {
      this.loading = true;
      const formValue = this.form.value;

      // Tạo đối tượng ThongTinThe
      const thongTinTheData: ThongTinThe = {
        id: this.isEdit ? formValue.thong_tin_the_id : undefined,
        ma_so_bhxh: formValue.ma_so_bhxh,
        cccd: formValue.cccd,
        ho_ten: formValue.ho_ten,
        ngay_sinh: formValue.ngay_sinh ? new Date(formValue.ngay_sinh) : new Date(),
        gioi_tinh: formValue.gioi_tinh,
        so_dien_thoai: formValue.so_dien_thoai || '',
        nguoi_tao: this.currentUser.username
      };

      if (this.isEdit) {
        const keKhaiBHYTId = formValue.id;
        const thongTinTheId = formValue.thong_tin_the_id;

        if (typeof keKhaiBHYTId !== 'number' || typeof thongTinTheId !== 'number') {
          this.message.error('Không tìm thấy ID kê khai hoặc thông tin thẻ');
          this.loading = false;
          return;
        }

        // Cập nhật ThongTinThe - chỉ gửi các trường cần thiết
        const updateData = {
          ma_so_bhxh: formValue.ma_so_bhxh,
          cccd: formValue.cccd,
          ho_ten: formValue.ho_ten,
          ngay_sinh: formValue.ngay_sinh ? new Date(formValue.ngay_sinh) : new Date(),
          gioi_tinh: formValue.gioi_tinh,
          so_dien_thoai: formValue.so_dien_thoai || '',
          nguoi_tao: this.currentUser.username
        };

        console.log('Sending update request with data:', updateData);
        this.keKhaiBHYTService.updateThongTinThe(thongTinTheId, updateData).subscribe({
          next: (thongTinThe) => {
            console.log('Received response:', thongTinThe);
            
            // Nếu không có response, sử dụng dữ liệu gốc
            const updatedThongTinThe: ThongTinThe = {
              id: thongTinTheId,
              ...updateData
            };

            // Tạo đối tượng KeKhaiBHYT với thông tin đã được cập nhật
            const keKhaiBHYTData: KeKhaiBHYT = {
              id: keKhaiBHYTId,
              dot_ke_khai_id: this.dotKeKhaiId,
              thong_tin_the_id: thongTinTheId,
              dotKeKhai: this.dotKeKhai as DotKeKhai,
              thongTinThe: updatedThongTinThe,
              nguoi_thu: formValue.nguoi_thu,
              so_thang_dong: formValue.so_thang_dong,
              phuong_an_dong: formValue.phuong_an_dong,
              han_the_cu: formValue.han_the_cu ? new Date(formValue.han_the_cu) : null,
              han_the_moi_tu: formValue.han_the_moi_tu ? new Date(formValue.han_the_moi_tu) : new Date(),
              han_the_moi_den: formValue.han_the_moi_den ? new Date(formValue.han_the_moi_den) : new Date(),
              tinh_nkq: formValue.tinh_nkq,
              huyen_nkq: formValue.huyen_nkq,
              xa_nkq: formValue.xa_nkq,
              dia_chi_nkq: formValue.dia_chi_nkq,
              benh_vien_kcb: formValue.benh_vien_kcb,
              nguoi_tao: this.currentUser.username
            };

            // Cập nhật KeKhaiBHYT
            console.log('Updating KeKhaiBHYT with data:', keKhaiBHYTData);
            this.keKhaiBHYTService.update(this.dotKeKhaiId, keKhaiBHYTId, keKhaiBHYTData).subscribe({
              next: (response) => {
                console.log('Update successful:', response);
                this.message.success('Cập nhật thành công');
                this.isVisible = false;
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                console.error('Error updating KeKhaiBHYT:', error);
                let errorMessage = 'Có lỗi xảy ra khi cập nhật kê khai';
                if (error.error?.message) {
                  errorMessage += ': ' + error.error.message;
                } else if (typeof error.error === 'string') {
                  errorMessage += ': ' + error.error;
                }
                this.message.error(errorMessage);
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error updating ThongTinThe:', error);
            let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin thẻ';
            if (error.error?.message) {
              errorMessage += ': ' + error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage += ': ' + error.error;
            }
            this.message.error(errorMessage);
            this.loading = false;
          }
        });
      } else {
        // Tạo mới ThongTinThe
        this.keKhaiBHYTService.createThongTinThe(thongTinTheData).subscribe({
          next: (thongTinThe) => {
            // Tạo đối tượng KeKhaiBHYT
            const data: KeKhaiBHYT = {
              dot_ke_khai_id: this.dotKeKhaiId,
              thong_tin_the_id: thongTinThe.id!,
              dotKeKhai: {
                id: this.dotKeKhaiId,
                nam: this.dotKeKhai!.nam,
                thang: this.dotKeKhai!.thang,
                so_dot: this.dotKeKhai!.so_dot,
                ten_dot: this.dotKeKhai!.ten_dot,
                dich_vu: this.dotKeKhai!.dich_vu,
                trang_thai: this.dotKeKhai!.trang_thai,
                nguoi_tao: this.currentUser.username,
                ghi_chu: this.dotKeKhai!.ghi_chu || ''
              } as DotKeKhai,
              thongTinThe: thongTinThe,
              nguoi_thu: formValue.nguoi_thu,
              so_thang_dong: formValue.so_thang_dong,
              phuong_an_dong: formValue.phuong_an_dong,
              han_the_cu: formValue.han_the_cu ? new Date(formValue.han_the_cu) : null,
              han_the_moi_tu: formValue.han_the_moi_tu ? new Date(formValue.han_the_moi_tu) : new Date(),
              han_the_moi_den: formValue.han_the_moi_den ? new Date(formValue.han_the_moi_den) : new Date(),
              tinh_nkq: formValue.tinh_nkq,
              huyen_nkq: formValue.huyen_nkq,
              xa_nkq: formValue.xa_nkq,
              dia_chi_nkq: formValue.dia_chi_nkq,
              benh_vien_kcb: formValue.benh_vien_kcb,
              nguoi_tao: this.currentUser.username
            };

            // Tạo mới KeKhaiBHYT
            this.keKhaiBHYTService.create(this.dotKeKhaiId, data).subscribe({
              next: () => {
                this.message.success('Thêm mới thành công');
                this.isVisible = false;
                this.loadData();
              },
              error: (error) => {
                this.message.error('Có lỗi xảy ra: ' + error.error);
                this.loading = false;
              }
            });
          },
          error: (error) => {
            this.message.error('Có lỗi xảy ra: ' + error.error);
            this.loading = false;
          }
        });
      }
    } else {
      if (!this.dotKeKhai) {
        this.message.error('Không tìm thấy thông tin đợt kê khai');
        return;
      }
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  delete(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa kê khai này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.keKhaiBHYTService.delete(this.dotKeKhaiId, id).subscribe({
          next: () => {
            this.message.success('Xóa thành công');
            this.loadData();
          },
          error: (error) => {
            this.message.error('Có lỗi xảy ra khi xóa');
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  deleteMultiple(): void {
    if (this.selectedIds.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một kê khai để xóa');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${this.selectedIds.length} kê khai đã chọn?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.keKhaiBHYTService.deleteMultiple(this.dotKeKhaiId, this.selectedIds).subscribe({
          next: () => {
            this.message.success('Xóa thành công');
            this.selectedIds = [];
            this.isAllChecked = false;
            this.loadData();
          },
          error: (error) => {
            this.message.error('Có lỗi xảy ra khi xóa');
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  onAllChecked(checked: boolean): void {
    this.selectedIds = checked ? this.keKhaiBHYTs.map(item => item.id!) : [];
  }

  onItemChecked(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    }
    this.isAllChecked = this.keKhaiBHYTs.every(item => this.selectedIds.includes(item.id!));
  }

  formatCurrency = (value: number): string => {
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  parseCurrency = (value: string): number => {
    return Number(value.replace(/\$\s?|(,*)/g, ''));
  };

  onlyNumber(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onlyLetter(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Cho phép các phím điều khiển như Backspace, Delete, mũi tên,...
    if (charCode <= 31) {
      return true;
    }
    // Cho phép khoảng trắng
    if (charCode === 32) {
      return true;
    }
    // Chỉ cho phép chữ cái (a-z, A-Z) và chữ có dấu
    const char = String.fromCharCode(charCode);
    return /^[a-zA-ZÀ-ỹ]$/.test(char);
  }
} 