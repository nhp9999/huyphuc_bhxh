import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DotKeKhai, DotKeKhaiService } from '../../services/dot-ke-khai.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RouterModule, Router } from '@angular/router';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { 
  SaveOutline,
  PlusOutline,
  CloseOutline,
  EditOutline,
  DeleteOutline,
  FormOutline,
  ReloadOutline 
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-dot-ke-khai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzInputNumberModule,
    DatePipe,
    NzSelectModule,
    NzCheckboxModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dot-ke-khai.component.html',
  styleUrls: ['./dot-ke-khai.component.scss']
})
export class DotKeKhaiComponent implements OnInit {
  dotKeKhais: DotKeKhai[] = [];
  loading = false;
  isVisible = false;
  isEdit = false;
  form: FormGroup;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  selectedIds: number[] = [];
  filterThang = 0; // 0 means all
  filterNam = 0; // 0 means all
  filterDichVu = ''; // empty means all
  namList: number[] = [];
  originalDotKeKhais: DotKeKhai[] = []; // Lưu trữ dữ liệu gốc
  isAllChecked = false;

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private router: Router,
    private iconService: NzIconService
  ) {
    // Đăng ký các icons
    this.iconService.addIcon(
      SaveOutline,
      PlusOutline,
      CloseOutline,
      EditOutline,
      DeleteOutline,
      FormOutline,
      ReloadOutline
    );

    const currentDate = new Date();
    this.form = this.fb.group({
      id: [null],
      ten_dot: [{value: '', disabled: true}],
      so_dot: [1, [Validators.required, Validators.min(1)]],
      thang: [currentDate.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      nam: [currentDate.getFullYear(), [Validators.required, Validators.min(2000)]],
      dich_vu: ['', [Validators.required]],
      ghi_chu: [''],
      trang_thai: ['chua_gui'],
      nguoi_tao: [this.currentUser.username || '', [Validators.required]]
    });

    this.form.get('so_dot')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('thang')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('nam')?.valueChanges.subscribe(() => this.updateTenDot());
  }

  updateTenDot(): void {
    const so_dot = this.form.get('so_dot')?.value;
    const thang = this.form.get('thang')?.value;
    const nam = this.form.get('nam')?.value;

    if (so_dot > 0 && thang >= 1 && thang <= 12 && nam >= 2000) {
      const ten_dot = `Đợt ${so_dot} Tháng ${thang} năm ${nam}`;
      this.form.patchValue({ ten_dot }, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.updateTenDot();
    this.initNamList();
  }

  initNamList(): void {
    const currentYear = new Date().getFullYear();
    this.namList = Array.from({length: 5}, (_, i) => currentYear - i);
  }

  loadData(): void {
    this.loading = true;
    this.dotKeKhaiService.getDotKeKhais().subscribe({
      next: (data) => {
        // Lưu dữ liệu gốc với thuộc tính checked
        this.originalDotKeKhais = data
          .filter(dot => dot.nguoi_tao === this.currentUser.username)
          .map(item => ({
            ...item,
            checked: this.selectedIds.includes(item.id!)
          }));
        // Áp dụng filter
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let filteredData = [...this.originalDotKeKhais];

    if (this.filterThang > 0) {
      filteredData = filteredData.filter(dot => dot.thang === this.filterThang);
    }

    if (this.filterNam > 0) {
      filteredData = filteredData.filter(dot => dot.nam === this.filterNam);
    }

    if (this.filterDichVu) {
      filteredData = filteredData.filter(dot => dot.dich_vu === this.filterDichVu);
    }

    this.dotKeKhais = filteredData.map(item => ({
      ...item,
      checked: this.selectedIds.includes(item.id!)
    }));
  }

  getNextSoDot(nam: number): number {
    // Lọc các đợt kê khai trong năm hiện tại của người dùng hiện tại
    const dotKeKhaisInYear = this.dotKeKhais.filter(dot => 
      dot.nam === nam && dot.nguoi_tao === this.currentUser.username
    );
    if (dotKeKhaisInYear.length === 0) {
      return 1; // Nếu không có đợt nào trong năm, trả về 1
    }
    // Tìm số đợt lớn nhất và cộng thêm 1
    const maxSoDot = Math.max(...dotKeKhaisInYear.map(dot => dot.so_dot));
    return maxSoDot + 1;
  }

  showModal(data?: DotKeKhai): void {
    this.isEdit = !!data;
    if (data) {
      this.form.patchValue({
        ...data
      });
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const nextSoDot = this.getNextSoDot(currentYear);
      
      this.form.reset({
        id: null,
        ten_dot: '',
        so_dot: nextSoDot,
        thang: currentDate.getMonth() + 1,
        nam: currentYear,
        dich_vu: '',
        ghi_chu: '',
        trang_thai: 'chua_gui',
        nguoi_tao: this.currentUser.username || ''
      });
      this.updateTenDot();
    }
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextSoDot = this.getNextSoDot(currentYear);
    
    this.form.reset({ 
      so_dot: nextSoDot,
      thang: currentDate.getMonth() + 1,
      nam: currentYear,
      dich_vu: '',
      trang_thai: 'chua_gui',
      nguoi_tao: this.currentUser.username || ''
    });
    this.updateTenDot();
  }

  handleOk(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.getRawValue();
      
      const data: DotKeKhai = {
        ten_dot: formValue.ten_dot,
        so_dot: Number(formValue.so_dot),
        thang: Number(formValue.thang),
        nam: Number(formValue.nam),
        dich_vu: formValue.dich_vu,
        ghi_chu: formValue.ghi_chu || '',
        trang_thai: formValue.trang_thai,
        nguoi_tao: this.currentUser.username || ''
      };

      if (this.isEdit && formValue.id) {
        data.id = Number(formValue.id);
        this.dotKeKhaiService.updateDotKeKhai(data.id, data).subscribe({
          next: () => {
            this.message.success('Cập nhật thành công');
            this.loadData();
            this.handleCancel();
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật:', error);
            if (error.error?.errors) {
              const errorMessages = Object.values(error.error.errors).flat();
              errorMessages.forEach((message: unknown) => {
                if (typeof message === 'string') {
                  this.message.error(message);
                }
              });
            } else {
              this.message.error('Có lỗi xảy ra khi cập nhật');
            }
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        this.dotKeKhaiService.createDotKeKhai(data).subscribe({
          next: (response) => {
            this.message.success('Thêm mới thành công');
            this.loadData();
            this.handleCancel();
            
            // Chuyển hướng đến trang kê khai BHYT nếu là đợt kê khai BHYT
            if (data.dich_vu === 'BHYT' && response && response.id) {
              this.router.navigate(['/dot-ke-khai', response.id, 'ke-khai-bhyt']);
            }
          },
          error: (error) => {
            console.error('Lỗi khi thêm mới:', error);
            if (error.error?.errors) {
              const errorMessages = Object.values(error.error.errors).flat();
              errorMessages.forEach((message: unknown) => {
                if (typeof message === 'string') {
                  this.message.error(message);
                }
              });
            } else {
              this.message.error('Có lỗi xảy ra khi thêm mới');
            }
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    } else {
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
      nzContent: 'Bạn có chắc chắn muốn xóa đợt kê khai này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.dotKeKhaiService.deleteDotKeKhai(id).subscribe({
          next: () => {
            this.message.success('Xóa thành công');
            this.loadData();
          },
          error: () => this.message.error('Có lỗi xảy ra khi xóa')
        });
      }
    });
  }

  onAllChecked(checked: boolean): void {
    this.isAllChecked = checked;
    this.dotKeKhais.forEach(data => {
      data.checked = checked;
      if (checked) {
        if (!this.selectedIds.includes(data.id!)) {
          this.selectedIds.push(data.id!);
        }
      }
    });
    if (!checked) {
      this.selectedIds = [];
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    }
    
    // Cập nhật trạng thái isAllChecked
    this.isAllChecked = this.dotKeKhais.every(data => this.selectedIds.includes(data.id!));
  }

  deleteSelected(): void {
    if (this.selectedIds.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một đợt kê khai để xóa');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${this.selectedIds.length} đợt kê khai đã chọn?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        const deletePromises = this.selectedIds.map(id =>
          this.dotKeKhaiService.deleteDotKeKhai(id).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.message.success('Xóa thành công');
            this.selectedIds = [];
            this.loadData();
          })
          .catch(() => {
            this.message.error('Có lỗi xảy ra khi xóa');
          });
      }
    });
  }

  onRowClick(data: DotKeKhai): void {
    if (data.dich_vu === 'BHYT') {
      this.router.navigate(['/dot-ke-khai', data.id, 'ke-khai-bhyt']);
    }
  }

  getTagColor(trangThai: string): string {
    const colors: Record<string, string> = {
      'chua_gui': 'default',
      'da_gui': 'processing',
      'cho_thanh_toan': 'warning',
      'hoan_thanh': 'success',
      'tu_choi': 'error'
    };
    return colors[trangThai] || 'default';
  }

  getTagText(trangThai: string): string {
    const texts: Record<string, string> = {
      'chua_gui': 'Chưa gửi',
      'da_gui': 'Đã gửi',
      'cho_thanh_toan': 'Chờ thanh toán',
      'hoan_thanh': 'Hoàn thành',
      'tu_choi': 'Từ chối'
    };
    return texts[trangThai] || trangThai;
  }
} 