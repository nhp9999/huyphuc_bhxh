import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DotKeKhai, CreateDotKeKhai, UpdateDotKeKhai, DotKeKhaiService } from '../../services/dot-ke-khai.service';
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
  FileDoneOutline,
  ReloadOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  DollarOutline
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { DonViService } from '../../services/don-vi.service';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
    NzCheckboxModule,
    NzTabsModule,
    NzBadgeModule,
    NzStatisticModule,
    NzCardModule
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
  originalDotKeKhais: DotKeKhai[] = []; // Lưu trữ dữ liệu gốc
  isAllChecked = false;
  selectedTabIndex = 0;
  filteredDotKeKhais: DotKeKhai[] = [];
  donVis: any[] = [];
  checkedSet = new Set<number>();

  // Map trạng thái theo tab index
  private readonly trangThaiMap = [
    '', // Tất cả
    'chua_gui',
    'da_gui',
    'cho_thanh_toan',
    'hoan_thanh',
    'tu_choi'
  ];

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private router: Router,
    private iconService: NzIconService,
    private donViService: DonViService
  ) {
    // Đăng ký các icons
    this.iconService.addIcon(
      SaveOutline,
      PlusOutline,
      CloseOutline,
      EditOutline,
      DeleteOutline,
      FormOutline,
      FileDoneOutline,
      ReloadOutline,
      ArrowUpOutline,
      ArrowDownOutline,
      DollarOutline
    );

    const currentDate = new Date();
    this.form = this.fb.group({
      id: [null],
      ten_dot: [{value: '', disabled: true}],
      so_dot: [1, [Validators.required, Validators.min(1)]],
      thang: [currentDate.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      nam: [currentDate.getFullYear(), [Validators.required, Validators.min(2000)]],
      ghi_chu: [''],
      trang_thai: ['chua_gui'],
      nguoi_tao: [this.currentUser.username || '', [Validators.required]],
      don_vi_id: [null, [Validators.required]],
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
    this.loadDonVis();
    this.updateTenDot();
    
    // Combine các valueChanges
    combineLatest([
      this.form.get('don_vi_id')!.valueChanges,
      this.form.get('thang')!.valueChanges,
      this.form.get('nam')!.valueChanges
    ]).pipe(
      debounceTime(300) // Đợi 300ms sau thay đổi cuối
    ).subscribe(() => {
      this.updateSoDot();
    });

    // Subscribe to dotKeKhais stream
    this.dotKeKhaiService.dotKeKhais$.subscribe(data => {
      this.dotKeKhais = data;
      this.filterData();
    });
  }

  private updateSoDot(): void {
    const donViId = this.form.get('don_vi_id')?.value;
    const thang = this.form.get('thang')?.value;
    const nam = this.form.get('nam')?.value;

    if (donViId && thang && nam) {
      this.dotKeKhaiService.getNextSoDot(donViId, thang, nam).subscribe({
        next: (nextSoDot) => {
          this.form.patchValue({ so_dot: nextSoDot }, { emitEvent: false });
          this.updateTenDot();
        },
        error: (error) => {
          console.error('Lỗi khi lấy số đợt:', error);
          this.message.error('Lỗi khi lấy số đợt tiếp theo');
        }
      });
    }
  }

  loadData(): void {
    this.loading = true;
    // Lấy danh sách đợt kê khai
    this.dotKeKhaiService.getDotKeKhais().subscribe({
      next: (data) => {
        console.log('Danh sách đợt kê khai:', data); // Log để debug
        this.dotKeKhais = data;
        this.filterData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  loadDonVis(): void {
    this.donViService.getDonVis().subscribe({
      next: (data) => {
        this.donVis = data;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đơn vị');
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterData();
  }

  filterData(): void {
    let filtered = [...this.dotKeKhais];

    // Lọc theo trạng thái (tab)
    const selectedTrangThai = this.trangThaiMap[this.selectedTabIndex];
    if (selectedTrangThai) {
      filtered = filtered.filter(item => item.trang_thai === selectedTrangThai);
    }

    this.filteredDotKeKhais = filtered;
  }

  getNextSoDot(nam: number): number {
    const dotKeKhaisInYear = this.filteredDotKeKhais.filter(dot => 
      dot.nam === nam && dot.nguoi_tao === this.currentUser.username
    );
    if (dotKeKhaisInYear.length === 0) {
      return 1;
    }
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
      this.form.patchValue({
        id: null,
        ten_dot: '',
        thang: currentDate.getMonth() + 1,
        nam: currentDate.getFullYear(),
        ghi_chu: '',
        trang_thai: 'chua_gui',
        nguoi_tao: this.currentUser.username || '',
        don_vi_id: null
      });
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
      ghi_chu: '',
      trang_thai: 'chua_gui',
      nguoi_tao: this.currentUser.username || '',
      don_vi_id: null,
    });
    this.updateTenDot();
  }

  handleOk(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.getRawValue();
      const selectedDonVi = this.donVis.find(d => d.id === formValue.don_vi_id);
      if (!selectedDonVi) {
        this.message.error('Không tìm thấy thông tin đơn vị');
        this.loading = false;
        return;
      }
      
      const baseData: CreateDotKeKhai = {
        ten_dot: formValue.ten_dot,
        so_dot: Number(formValue.so_dot),
        thang: Number(formValue.thang),
        nam: Number(formValue.nam),
        dich_vu: selectedDonVi.is_bhyt ? 'BHYT' : 'BHXH TN',
        ghi_chu: formValue.ghi_chu || '',
        trang_thai: formValue.trang_thai || 'chua_gui',
        nguoi_tao: this.currentUser.username || '',
        don_vi_id: Number(formValue.don_vi_id),
      };

      // Log dữ liệu trước khi gửi
      console.log('Data to be sent:', baseData);

      if (!baseData.don_vi_id || !baseData.nguoi_tao) {
        this.message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        this.loading = false;
        return;
      }

      if (this.isEdit) {
        const updateData: UpdateDotKeKhai = {
          ...baseData,
          id: formValue.id
        };
        
        this.dotKeKhaiService.updateDotKeKhai(updateData.id, updateData).subscribe({
          next: () => {
            this.message.success('Cập nhật thành công');
            this.handleCancel();
            this.loading = false;
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
        this.dotKeKhaiService.createDotKeKhai(baseData).subscribe({
          next: (response) => {
            this.message.success('Thêm mới thành công');
            this.handleCancel();
            this.loading = false;
            
            if (baseData.dich_vu === 'BHYT' && response && response.id) {
              this.router.navigate(['/dot-ke-khai', response.id, 'ke-khai-bhyt']);
            }
          },
          error: (error) => {
            console.error('Lỗi khi thêm mới:', error);
            if (error.error?.errors) {
              let errorMessages: string[] = [];
              // Xử lý trường hợp errors là array
              if (Array.isArray(error.error.errors)) {
                errorMessages = error.error.errors;
              } 
              // Xử lý trường hợp errors là object
              else {
                Object.keys(error.error.errors).forEach(key => {
                  const messages = error.error.errors[key];
                  if (Array.isArray(messages)) {
                    errorMessages.push(...messages);
                  } else if (typeof messages === 'string') {
                    errorMessages.push(messages);
                  }
                });
              }

              errorMessages.forEach((message: unknown) => {
                if (typeof message === 'string') {
                  this.message.error(message);
                }
              });
            } else if (error.error?.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error('Có lỗi xảy ra khi thêm mới');
            }
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
          },
          error: () => this.message.error('Có lỗi xảy ra khi xóa')
        });
      }
    });
  }

  getCheckedStatus(data: DotKeKhai): boolean {
    return this.checkedSet.has(data.id!);
  }

  onItemChecked(checked: boolean, data: DotKeKhai): void {
    if (checked) {
      this.checkedSet.add(data.id!);
    } else {
      this.checkedSet.delete(data.id!);
    }
    this.updateSelectedIds();
  }

  updateSelectedIds(): void {
    this.selectedIds = Array.from(this.checkedSet);
    this.isAllChecked = this.selectedIds.length === this.filteredDotKeKhais.length;
  }

  onAllChecked(checked: boolean): void {
    this.isAllChecked = checked;
    this.filteredDotKeKhais.forEach(item => {
      if (checked) {
        this.checkedSet.add(item.id!);
      } else {
        this.checkedSet.delete(item.id!);
      }
    });
    this.updateSelectedIds();
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

  getCounts(trangThai: string): number {
    return this.dotKeKhais.filter(item => item.trang_thai === trangThai).length;
  }

  getTotalDotKeKhai(): number {
    return this.dotKeKhais.length;
  }

  getDonViName(donViId: number): string {
    const donVi = this.donVis.find(d => d.id === donViId);
    return donVi ? donVi.tenDonVi : '';
  }

  getTotalAmount(): number {
    return this.filteredDotKeKhais.reduce((total, dot) => total + (dot.tong_so_tien || 0), 0);
  }
} 