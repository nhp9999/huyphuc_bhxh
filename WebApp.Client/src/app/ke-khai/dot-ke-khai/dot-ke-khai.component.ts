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
import { UserService, DaiLy } from '../../services/user.service';
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
  ExportOutline,
  SendOutline
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
import * as XLSX from 'xlsx';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

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
  ma_so_bhxh?: string;
  nguoi_thu: number;
  phuong_an_dong?: string;
  ngay_bien_lai?: Date;
  ma_tinh_nkq?: string;
  ma_huyen_nkq?: string;
  ma_xa_nkq?: string;
  dia_chi_nkq?: string;
  so_thang_dong?: number;
  ma_benh_vien?: string;
  ma_hgd?: string;
  quoc_tich?: string;
  ma_tinh_ks?: string;
  ma_huyen_ks?: string;
  ma_xa_ks?: string;
  so_bien_lai?: string;
  han_the_moi_tu?: Date;
  is_urgent?: boolean;
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
    NzCardModule,
    NzToolTipModule
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
  isIndeterminate = false;
  selectedTabIndex = 0;
  filteredDotKeKhais: DotKeKhai[] = [];
  donVis: any[] = [];
  daiLys: DaiLy[] = [];
  checkedSet = new Set<number>();

  // Thêm các thuộc tính cho modal xem hóa đơn
  isViewBillModalVisible = false;
  selectedBillUrl: string = '';

  // Map trạng thái theo tab index
  private readonly trangThaiMap = [
    '', // Tất cả
    'chua_gui',
    'da_gui',
    'dang_xu_ly',
    'cho_thanh_toan',
    'hoan_thanh',
    'tu_choi'
  ];

  // Thêm các thuộc tính
  isCreateDaiLyVisible = false;
  daiLyForm!: FormGroup;

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private router: Router,
    private iconService: NzIconService,
    private donViService: DonViService,
    private userService: UserService
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
      ExportOutline,
      SendOutline
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
      dai_ly_id: [null, [Validators.required]]
    });

    this.form.get('so_dot')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('thang')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('nam')?.valueChanges.subscribe(() => this.updateTenDot());

    // Khởi tạo form đại lý ngay trong constructor
    this.initDaiLyForm();
  }

  initDaiLyForm(): void {
    this.daiLyForm = this.fb.group({
      ma: ['', [Validators.required]],
      ten: ['', [Validators.required]],
      diaChi: [''],
      soDienThoai: [''],
      email: ['', [Validators.email]],
      nguoiDaiDien: [''],
      trangThai: [true],
      nguoiTao: [this.currentUser.username]
    });
  }

  showCreateDaiLyModal(): void {
    this.isCreateDaiLyVisible = true;
    this.initDaiLyForm();
  }

  handleCreateDaiLyCancel(): void {
    this.isCreateDaiLyVisible = false;
    this.daiLyForm.reset();
  }

  handleCreateDaiLyOk(): void {
    if (this.daiLyForm.valid) {
      const daiLyData = this.daiLyForm.value;
      this.userService.createDaiLy(daiLyData).subscribe({
        next: (response) => {
          this.message.success('Thêm mới đại lý thành công');
          this.isCreateDaiLyVisible = false;
          this.loadDaiLys(); // Tải lại danh sách đại lý
          // Tự động chọn đại lý vừa tạo
          this.form.patchValue({
            dai_ly_id: response.id
          });
        },
        error: (error) => {
          if (error.error?.message) {
            this.message.error(error.error.message);
          } else {
            this.message.error('Có lỗi xảy ra khi tạo đại lý');
          }
        }
      });
    } else {
      Object.values(this.daiLyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
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

  private sortDotKeKhais(data: any[]): any[] {
    return data.sort((a, b) => {
      const dateA = a.ngay_tao ? new Date(a.ngay_tao).getTime() : 0;
      const dateB = b.ngay_tao ? new Date(b.ngay_tao).getTime() : 0;
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên trên)
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadDonVis();
    this.loadDaiLys();
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
      this.dotKeKhais = this.sortDotKeKhais(data);
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
        this.dotKeKhais = this.sortDotKeKhais(data);
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

  loadDaiLys(): void {
    // Kiểm tra nếu có mã đại lý trong thông tin user
    if (this.currentUser.donViCongTac) {
      this.userService.getDaiLys().subscribe({
        next: (data) => {
          // Lọc chỉ lấy đại lý của tài khoản hiện tại
          this.daiLys = data.filter(daiLy => daiLy.ma === this.currentUser.donViCongTac);
          
          // Nếu có đại lý, tự động set vào form
          if (this.daiLys.length > 0) {
            this.form.patchValue({
              dai_ly_id: this.daiLys[0].id
            });
          }
        },
        error: () => {
          this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
        }
      });
    }
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

    // Đảm bảo tong_so_tien luôn là số
    filtered = filtered.map(item => ({
      ...item,
      tong_so_tien: item.tong_so_tien || 0
    }));

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
        id: data.id,
        ten_dot: data.ten_dot,
        so_dot: data.so_dot,
        thang: data.thang,
        nam: data.nam,
        ghi_chu: data.ghi_chu,
        trang_thai: data.trang_thai,
        nguoi_tao: data.nguoi_tao,
        don_vi_id: data.don_vi_id,
        ma_ho_so: data.ma_ho_so,
        dai_ly_id: data.dai_ly_id
      });
    } else {
      this.form.reset({
        ten_dot: '',
        so_dot: 1,
        thang: new Date().getMonth() + 1,
        nam: new Date().getFullYear(),
        ghi_chu: '',
        trang_thai: 'chua_gui',
        nguoi_tao: this.currentUser.username || '',
        don_vi_id: null,
        ma_ho_so: '',
        dai_ly_id: null
      });
      
      // Load đại lý của tài khoản hiện tại
      this.loadDaiLys();
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
      const formValue = this.form.getRawValue();
      if (this.isEdit) {
        const updateData: UpdateDotKeKhai = {
          id: formValue.id,
          ten_dot: formValue.ten_dot,
          so_dot: formValue.so_dot,
          thang: formValue.thang,
          nam: formValue.nam,
          ghi_chu: formValue.ghi_chu,
          trang_thai: formValue.trang_thai,
          nguoi_tao: formValue.nguoi_tao,
          don_vi_id: formValue.don_vi_id,
          ma_ho_so: formValue.ma_ho_so,
          dai_ly_id: formValue.dai_ly_id
        };

        this.dotKeKhaiService.updateDotKeKhai(formValue.id, updateData).subscribe({
          next: () => {
            this.message.success('Cập nhật đợt kê khai thành công');
            this.isVisible = false;
            this.loadData();
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật:', error);
            this.message.error('Có lỗi xảy ra khi cập nhật đợt kê khai');
          }
        });
      } else {
        const createData: CreateDotKeKhai = {
          ten_dot: formValue.ten_dot,
          so_dot: formValue.so_dot,
          thang: formValue.thang,
          nam: formValue.nam,
          ghi_chu: formValue.ghi_chu,
          trang_thai: formValue.trang_thai,
          nguoi_tao: formValue.nguoi_tao,
          don_vi_id: formValue.don_vi_id,
          ma_ho_so: formValue.ma_ho_so,
          dai_ly_id: formValue.dai_ly_id
        };

        this.dotKeKhaiService.createDotKeKhai(createData).subscribe({
          next: (response) => {
            this.message.success('Thêm mới đợt kê khai thành công');
            this.isVisible = false;
            this.loadData();
          },
          error: (error) => {
            console.error('Lỗi khi thêm mới:', error);
            this.message.error('Có lỗi xảy ra khi thêm mới đợt kê khai');
          }
        });
      }
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  delete(id: number | undefined): void {
    if (!id) return;
    
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
    this.isIndeterminate = this.selectedIds.length > 0 && this.selectedIds.length < this.filteredDotKeKhais.length;
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
      'dang_xu_ly': 'cyan',
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
      'dang_xu_ly': 'Đang xử lý',
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

  getDaiLyName(daiLyId: number): string {
    const daiLy = this.daiLys.find(d => d.id === daiLyId);
    return daiLy ? daiLy.ten : '';
  }

  getTotalAmount(): number {
    if (!this.filteredDotKeKhais) return 0;
    return this.filteredDotKeKhais.reduce((total, dot) => {
      const amount = dot.tong_so_tien || 0;
      return total + amount;
    }, 0);
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

    // Subscribe để nhận kết quả từ modal
    modalRef.afterClose.subscribe(result => {
      if (result) {
        // Đóng modal xem hóa đơn nếu đang mở
        if (this.isViewBillModalVisible) {
          this.handleViewBillModalCancel();
        }
        // Tải lại dữ liệu
        this.loadData();
      }
    });
  }

  // Thêm hàm chuyển đổi phương án đóng
  getPhuongAnDongText(phuongAnDong: string): string {
    const phuongAnDongMap: Record<string, string> = {
      'dao_han': 'ON',
      'tang_moi': 'TM',
      'dung_dong': 'GH'
    };
    return phuongAnDongMap[phuongAnDong] || '';
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
        console.log('Dữ liệu từ API:', keKhaiBHYTs); // Thêm log để kiểm tra
        // Chuẩn bị dữ liệu cho sheet danh sách kê khai
        const keKhaiHeaders = [
          'STT', // Cột A - Số thứ tự
          'HoTen', // Cột B - Họ tên người tham gia
          'MasoBHXH', // Cột C - Mã số BHXH
          'MaPhongBan', // Cột D - Mã phòng ban (để trống)
          'Loai', // Cột E - Loại (mặc định là 1)
          'PA', // Cột F - Phương án đóng (ON/TM/GH)
          'TyleNSDP', // Cột G - Tỷ lệ NSDP (để trống)
          'NgayBienLai', // Cột H - Ngày biên lai
          'SoBienLai', // Cột I - Số biên lai (để trống)
          'NguoiThamGiaThu', // Cột J - Người thu
          'Tiendong', // Cột K - Tiền đóng (mặc định 2,340,000)
          'TienDongThucTe', // Cột L - Tiền đóng thực tế (để trống)
          'MucHuong', // Cột M - Mức hưởng (mặc định là 4)
          'TuNgay', // Cột N - Từ ngày (để trống)
          'NgayChet', // Cột O - Ngày chết (để trống)
          'HotroKhac', // Cột P - Hỗ trợ khác (để trống)
          'TenTinhDangSS', // Cột Q - Tên tỉnh đăng ký (để trống)
          'Matinh_DangSS', // Cột R - Mã tỉnh đăng ký
          'Tenhuyen_DangSS', // Cột S - Tên huyện đăng ký
          'Mahuyen_DangSS', // Cột T - Mã huyện đăng ký
          'TenxaDangSS', // Cột U - Tên xã đăng ký
          'Maxa_DangSS', // Cột V - Mã xã đăng ký
          'Diachi_DangSS', // Cột W - Địa chỉ đăng ký
          'Sothang', // Cột X - Số tháng đóng
          'Ghichu', // Cột Y - Ghi chú (để trống)
          'NgaySinh', // Cột Z - Ngày sinh
          'GioiTinh', // Cột AA - Giới tính
          'TenTinhBenhVien', // Cột AB - Tên tỉnh bệnh viện (để trống)
          'MaTinhBenhVien', // Cột AC - Mã tỉnh nơi khám quyết định
          'TenBenhVien', // Cột AD - Tên bệnh viện (để trống)
          'MaBenhVien', // Cột AE - Mã bệnh viện
          'MavungSS', // Cột AF - Mã vùng (để trống)
          'Tk1_Save', // Cột AG - TK1 Save (để trống)
          'CMND', // Cột AH - CCCD
          'Maho_Giadinh', // Cột AI - Mã hộ gia đình
          '', // Cột AJ - Để trống
          'QuocTich', // Cột AK - Quốc tịch
          '', // Cột AL - Để trống
          '', // Cột AM - Để trống
          'TenTinhKS', // Cột AN - Tên tỉnh khai sinh (để trống)
          'MaTinh_KS', // Cột AO - Mã tỉnh khai sinh
          'TenHuyenKS', // Cột AP - Tên huyện khai sinh (để trống)
          'MaHuyen_KS', // Cột AQ - Mã huyện khai sinh
          'TenXaKS', // Cột AR - Tên xã khai sinh (để trống)
          'MaXa_KS', // Cột AS - Mã xã khai sinh
          'TenTinhNN', // Cột AT - Tên tỉnh nơi khám (để trống)
          'Matinh_NN', // Cột AU - Mã tỉnh nơi khám quyết định
          'TenHuyenNN', // Cột AV - Tên huyện nơi khám (để trống)
          'Mahuyen_NN', // Cột AW - Mã huyện nơi khám quyết định
          'TenXaNN', // Cột AX - Tên xã nơi khám (để trống)
          'Maxa_NN', // Cột AY - Mã xã nơi khám quyết định
          'Diachi_NN', // Cột AZ - Địa chỉ nơi khám quyết định
          '', // Cột BA - Để trống
          '', // Cột BB - Để trống
          '', // Cột BC - Để trống
          '', // Cột BD - Để trống
          '', // Cột BE - Để trống
          '', // Cột BF - Để trống
          '', // Cột BG - Để trống
          '', // Cột BH - Để trống
          'SoCCCD', // Cột BI - Số CCCD
          'SoBienLai', // Cột BJ - Số biên lai
          'NgayBienLai', // Cột BK - Ngày biên lai
        ];

        // Thêm 2 dòng trống trước header
        const emptyRows = [
          Array(13).fill(''),  // Dòng 1 trống với 13 cột
          Array(13).fill('')   // Dòng 2 trống với 13 cột
        ];
        
        const keKhaiData = keKhaiBHYTs.map((item, index) => [
          index + 1, // STT
          item.ho_ten,
          item.ma_so_bhxh || '', 
          '', // Cột D trống
          '1', // Cột E giá trị mặc định là 1
          this.getPhuongAnDongText(item.phuong_an_dong || ''),
          '', // Cột G trống
          item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '',
          '', // Cột I trống
          typeof item.nguoi_thu !== 'undefined' ? item.nguoi_thu.toString() : '',
          '2340000', // Cột K - Tiendong - giá trị mặc định không có dấu phẩy
          '0', // Cột L - giá trị mặc định là 0
          '4', // Cột M giá trị mặc định là 4
          item.han_the_moi_tu ? new Date(item.han_the_moi_tu).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '', // Cột N hiển thị Hạn thẻ mới từ
          '', // Cột O trống
          '', // Cột P trống
          '', // Cột Q trống
          item.ma_tinh_nkq || '', // Cột R - Mã tỉnh
          '', // Cột S - Tên huyện (trống)
          item.ma_huyen_nkq || '', // Cột T - Mã huyện
          '', // Cột U - Tên xã (trống)
          item.ma_xa_nkq || '', // Cột V - Mã xã
          item.dia_chi_nkq || '', // Cột W - Địa chỉ
          item.so_thang_dong?.toString() || '', // Cột X hiển thị số tháng đóng
          item.is_urgent ? 'Thẻ Gấp' : '', // Cột Y - Ghi "Thẻ Gấp" nếu là thẻ gấp
          item.ngay_sinh ? new Date(item.ngay_sinh).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '', // Cột Z hiển thị ngày sinh
          this.getGioiTinhValue(item.gioi_tinh), // Cột AA hiển thị giới tính
          '', // Cột AB trống
          item.ma_tinh_nkq || '', // Cột AC hiển thị mã tỉnh nơi khám quyết định
          '', // Cột AD trống
          item.ma_benh_vien || '', // Cột AE hiển thị mã bệnh viện
          '', // Cột AF trống
          'x', // Cột AG giá trị mặc định là x
          item.cccd || '', // Cột AH hiển thị CCCD
          item.ma_hgd || '', // Cột AI hiển thị mã hộ gia đình
          '', // Cột AJ trống
          item.quoc_tich || '', // Cột AK hiển thị quốc tịch
          '', // Cột AL trống
          '', // Cột AM trống
          '', // Cột AN trống
          item.ma_tinh_ks || '', // Cột AO hiển thị mã tỉnh khai sinh
          '', // Cột AP trống
          item.ma_huyen_ks || '', // Cột AQ hiển thị mã huyện khai sinh
          '', // Cột AR trống
          item.ma_xa_ks || '', // Cột AS hiển thị mã xã khai sinh
          '', // Cột AT trống
          item.ma_tinh_nkq || '', // Cột AU hiển thị mã tỉnh nơi khám quyết định
          '', // Cột AV trống
          item.ma_huyen_nkq || '', // Cột AW hiển thị mã huyện nơi khám quyết định
          '', // Cột AX trống
          item.ma_xa_nkq || '', // Cột AY hiển thị mã xã nơi khám quyết định
          item.dia_chi_nkq || '', // Cột AZ hiển thị địa chỉ nơi khám quyết định
          '', // Cột BA trống
          '', // Cột BB trống
          '', // Cột BC trống
          '', // Cột BD trống
          '', // Cột BE trống
          '', // Cột BF trống
          '', // Cột BG trống
          '', // Cột BH trống
          item.cccd || '', // Cột BI hiển thị CCCD
          item.so_bien_lai || '', // Cột BJ hiển thị số biên lai
          item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '', // Cột BK hiển thị ngày biên lai
        ]);

        // Tạo workbook và thêm sheet danh sách kê khai
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([...emptyRows, keKhaiHeaders, ...keKhaiData]);
        XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu');

        // Tạo style cho sheet
        ws['!cols'] = [
          { wch: 8 },  // STT
          { wch: 30 }, // HoTen  
          { wch: 15 }, // Mã số BHXH
          { wch: 10 }, // Cột D trống
          { wch: 10 }, // Cột E trống
          { wch: 15 }, // Phương án đóng
          { wch: 10 }, // Cột G trống 
          { wch: 15 }, // Ngày biên lai
          { wch: 10 }, // Cột I trống
          { wch: 15 }, // Người thứ
          { wch: 15 }, // Cột K
          { wch: 10 }, // Cột L trống
          { wch: 10 }, // Cột M
          { wch: 10 }, // Cột N trống
          { wch: 10 }, // Cột O trống
          { wch: 10 }, // Cột P trống
          { wch: 10 }, // Cột Q trống
          { wch: 15 }, // Cột R trống
          { wch: 10 }, // Cột S trống
          { wch: 15 }, // Cột T trống
          { wch: 10 }, // Cột U trống
          { wch: 50 }, // Cột V Diachi_DangSS
          { wch: 10 }, // Cột W trống
          { wch: 15 }, // Cột X Sothang
          { wch: 10 }, // Cột Y trống
          { wch: 15 }, // Cột Z NgaySinh
          { wch: 10 }, // Cột AA GioiTinh
          { wch: 10 }, // Cột AB trống
          { wch: 15 }, // Cột AC trống
          { wch: 10 }, // Cột AD trống
          { wch: 15 }, // Cột AE trống
          { wch: 10 }, // Cột AF trống
          { wch: 10 }, // Cột AG trống
          { wch: 15 }, // Cột AH trống
          { wch: 15 }, // Cột AI trống
          { wch: 15 }, // Cột AK trống
          { wch: 10 }, // Cột AL trống
          { wch: 10 }, // Cột AM trống
          { wch: 10 }, // Cột AN trống
          { wch: 15 }, // Cột AO trống
          { wch: 10 }, // Cột AP trống
          { wch: 15 }, // Cột AQ trống
          { wch: 10 }, // Cột AR trống
          { wch: 15 }, // Cột AS trống
          { wch: 10 }, // Cột AT trống
          { wch: 15 }, // Cột AU trống
          { wch: 10 }, // Cột AV trống
          { wch: 15 }, // Cột AW trống
          { wch: 10 }, // Cột AX trống
          { wch: 15 }, // Cột AY trống
          { wch: 50 }, // Cột AZ DiaChi_DangSS
          { wch: 10 }, // Cột BA trống
          { wch: 10 }, // Cột BB trống
          { wch: 10 }, // Cột BC trống
          { wch: 10 }, // Cột BD trống
          { wch: 10 }, // Cột BE trống
          { wch: 10 }, // Cột BF trống
          { wch: 10 }, // Cột BG trống
          { wch: 10 }, // Cột BH trống
          { wch: 15 }, // Cột BI trống
          { wch: 15 }, // Cột BJ trống
          { wch: 15 }, // Cột BK trống
        ];

        // Xuất file Excel
        XLSX.writeFile(wb, `ke-khai-bhyt-${data.ten_dot.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
        
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

  // Thêm hàm chuyển đổi giới tính
  getGioiTinhValue(gioiTinh: string): string {
    return gioiTinh?.toLowerCase() === 'nam' ? '1' : '0';
  }

  showViewBillModal(url: string): void {
    this.selectedBillUrl = url;
    this.isViewBillModalVisible = true;
  }

  handleViewBillModalCancel(): void {
    this.isViewBillModalVisible = false;
    this.selectedBillUrl = '';
  }

  guiDotKeKhai(data: DotKeKhai): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận gửi',
      nzContent: 'Bạn có chắc chắn muốn gửi đợt kê khai này?',
      nzOkText: 'Gửi',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.loading = true;
        this.dotKeKhaiService.guiDotKeKhai(data.id!).subscribe({
          next: () => {
            this.message.success('Gửi đợt kê khai thành công');
            this.loading = false;
          },
          error: (error) => {
            console.error('Lỗi khi gửi đợt kê khai:', error);
            this.message.error('Có lỗi xảy ra khi gửi đợt kê khai');
            this.loading = false;
          }
        });
      }
    });
  }
} 