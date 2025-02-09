import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  DollarOutline,
  ExportOutline
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { DonViService } from '../../services/don-vi.service';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ThanhToanModalComponent } from './thanh-toan-modal/thanh-toan-modal.component';

interface KeKhaiBHYT {
  ho_ten: string;
  cccd: string;
  ngay_sinh: Date;
  gioi_tinh: string;
  dia_chi: string;
  so_dien_thoai: string;
  email: string;
  so_tien: number;
  ghi_chu?: string;
  so_the_bhyt: string;
}

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
      DollarOutline,
      ExportOutline
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
      ma_ho_so: [''],
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
        don_vi_id: null,
        ma_ho_so: '',
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
      ma_ho_so: '',
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
      
      const createData: CreateDotKeKhai = {
        ten_dot: formValue.ten_dot,
        so_dot: Number(formValue.so_dot),
        thang: Number(formValue.thang),
        nam: Number(formValue.nam),
        dich_vu: selectedDonVi.is_bhyt ? 'BHYT' : 'BHXH TN',
        ghi_chu: formValue.ghi_chu || '',
        trang_thai: formValue.trang_thai || 'chua_gui',
        nguoi_tao: this.currentUser.username || '',
        don_vi_id: Number(formValue.don_vi_id),
        ma_ho_so: formValue.ma_ho_so || '',
        KeKhaiBHYTs: []
      };

      // Log dữ liệu trước khi gửi
      console.log('Data to be sent:', createData);

      if (!createData.don_vi_id || !createData.nguoi_tao) {
        this.message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        this.loading = false;
        return;
      }

      if (this.isEdit) {
        const updateData: UpdateDotKeKhai = {
          id: formValue.id,
          ten_dot: formValue.ten_dot,
          so_dot: Number(formValue.so_dot),
          thang: Number(formValue.thang),
          nam: Number(formValue.nam),
          dich_vu: selectedDonVi.is_bhyt ? 'BHYT' : 'BHXH TN',
          ghi_chu: formValue.ghi_chu || '',
          trang_thai: formValue.trang_thai || 'chua_gui',
          nguoi_tao: formValue.nguoi_tao || this.currentUser.username || '',
          don_vi_id: Number(formValue.don_vi_id),
          ma_ho_so: formValue.ma_ho_so || '',
          KeKhaiBHYTs: []
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
        this.dotKeKhaiService.createDotKeKhai(createData).subscribe({
          next: (response) => {
            this.message.success('Thêm mới thành công');
            this.handleCancel();
            this.loading = false;
            
            if (createData.dich_vu === 'BHYT' && response && response.id) {
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

  showThanhToanModal(data: DotKeKhai): void {
    // Kiểm tra nếu không phải trạng thái chờ thanh toán
    if (data.trang_thai !== 'cho_thanh_toan') {
      this.message.warning('Đợt kê khai này không ở trạng thái chờ thanh toán');
      return;
    }

    // Mở modal thanh toán
    const modalRef = this.modal.create({
      nzTitle: 'QR Thanh toán',
      nzContent: ThanhToanModalComponent,
      nzWidth: 800,
      nzData: {
        dotKeKhai: data
      },
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzClassName: 'thanh-toan-modal'
    });

    // Subscribe để nhận kết quả từ modal nếu cần
    modalRef.afterClose.subscribe(result => {
      if (result) {
        // Xử lý sau khi modal đóng nếu cần
        this.loadData();
      }
    });
  }

  exportData(data: DotKeKhai): void {
    if (!data || !data.id) {
      this.message.warning('Không tìm thấy thông tin đợt kê khai');
      return;
    }

    if (data.dich_vu !== 'BHYT') {
      this.message.warning('Chỉ hỗ trợ xuất dữ liệu kê khai BHYT');
      return;
    }

    this.loading = true;
    this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(data.id).subscribe({
      next: (keKhaiBHYTs: KeKhaiBHYT[]) => {
        // Chuẩn bị dữ liệu để xuất
        const exportData = {
          dot_ke_khai: {
            ten_dot: data.ten_dot,
            don_vi: this.getDonViName(data.don_vi_id),
            tong_so_the: data.tong_so_the || 0,
            tong_so_tien: data.tong_so_tien || 0,
            trang_thai: this.getTagText(data.trang_thai),
            ghi_chu: data.ghi_chu || '',
            ngay_tao: data.ngay_tao ? new Date(data.ngay_tao).toLocaleDateString('vi-VN') : '',
          },
          ke_khai_bhyt: keKhaiBHYTs.map((item: KeKhaiBHYT) => ({
            ho_ten: item.ho_ten,
            cccd: item.cccd,
            ngay_sinh: new Date(item.ngay_sinh).toLocaleDateString('vi-VN'),
            gioi_tinh: item.gioi_tinh,
            so_dien_thoai: item.so_dien_thoai,
            so_the_bhyt: item.so_the_bhyt,
            so_tien: item.so_tien
          }))
        };

        // Chuyển đổi dữ liệu thành chuỗi JSON
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Tạo blob từ chuỗi JSON
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Tạo URL cho blob
        const url = window.URL.createObjectURL(blob);
        
        // Tạo thẻ a để tải xuống
        const a = document.createElement('a');
        a.href = url;
        a.download = `ke-khai-bhyt-${data.ten_dot.toLowerCase().replace(/\s+/g, '-')}.json`;
        
        // Thêm thẻ a vào document và click
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.message.success('Xuất dữ liệu kê khai BHYT thành công');
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Lỗi khi lấy dữ liệu kê khai BHYT:', error);
        if (error.status === 404) {
          this.message.error(`Không tìm thấy đợt kê khai có ID: ${data.id}`);
        } else {
          this.message.error('Có lỗi xảy ra khi xuất dữ liệu kê khai BHYT');
        }
        this.loading = false;
      }
    });
  }
} 