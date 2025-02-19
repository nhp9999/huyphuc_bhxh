import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon';
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
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ActivatedRoute } from '@angular/router';
import { DiaChiService, DanhMucTinh, DanhMucHuyen, DanhMucXa } from '../../services/dia-chi.service';
import { vi_VN } from 'ng-zorro-antd/i18n';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { SearchOutline, IdcardOutline, DeleteOutline, EditOutline } from '@ant-design/icons-angular/icons';

registerLocaleData(vi);

@Component({
  selector: 'app-ke-khai-bhxh',
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
    DatePipe,
    NzToolTipModule
  ],
  templateUrl: './ke-khai-bhxh.component.html',
  styleUrls: ['./ke-khai-bhxh.component.scss'],
  providers: [
    DecimalPipe,
    DatePipe,
    { provide: NZ_I18N, useValue: vi_VN }
  ]
})
export class KeKhaiBHXHComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  isVisible = false;
  isEdit = false;
  selectedIds: number[] = [];
  isAllChecked = false;
  isIndeterminate = false;
  dotKeKhaiId: number = 0;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  ngay_bien_lai: Date = new Date();
  
  locale = {
    lang: {
      placeholder: 'Chọn ngày',
      rangePlaceholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
      today: 'Hôm nay',
      now: 'Bây giờ',
      backToToday: 'Trở về hôm nay',
      ok: 'Đồng ý',
      clear: 'Xóa',
      month: 'Tháng',
      year: 'Năm',
      timeSelect: 'Chọn giờ',
      dateSelect: 'Chọn ngày',
      monthSelect: 'Chọn tháng',
      yearSelect: 'Chọn năm',
      decadeSelect: 'Chọn thập kỷ',
      yearFormat: 'YYYY',
      dateFormat: 'DD/MM/YYYY',
      dayFormat: 'DD',
      dateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
      monthBeforeYear: true,
      previousMonth: 'Tháng trước',
      nextMonth: 'Tháng sau',
      previousYear: 'Năm trước',
      nextYear: 'Năm sau',
      previousDecade: 'Thập kỷ trước',
      nextDecade: 'Thập kỷ sau',
      previousCentury: 'Thế kỷ trước',
      nextCentury: 'Thế kỷ sau'
    },
    timePickerLocale: {
      placeholder: 'Chọn giờ'
    }
  };
  
  danhMucTinhs: DanhMucTinh[] = [];
  danhMucHuyens: DanhMucHuyen[] = [];
  danhMucXas: DanhMucXa[] = [];
  
  danhSachMucThuNhap: { value: number; label: string }[] = [];

  mucThuNhapFilter = (input: string, option: { nzLabel: string | number | null; nzValue: any }): boolean => {
    if (!input || !option.nzValue) return true;
    const searchValue = input.replace(/[,.]/g, '');
    const optionValue = option.nzValue.toString();
    return optionValue.includes(searchValue);
  };

  danhSachPhuongAn = [
    { value: 'TM', label: 'TM - Tăng mới' },
    { value: 'DT', label: 'DT - Đóng tiếp' },
    { value: 'DB', label: 'DB - Đóng bù' },
    { value: 'DL', label: 'DL - Đóng lại' },
    { value: 'GH', label: 'GH - Dừng đóng' }
  ];

  danhSachPhuongThucDong = [
    { value: 1, label: 'Đóng 1 tháng' },
    { value: 3, label: 'Đóng 3 tháng' },
    { value: 6, label: 'Đóng 6 tháng' },
    { value: 12, label: 'Đóng 1 Năm' },
    { value: 'VS', label: 'Đóng cho những năm về sau' },
    { value: 'TH', label: 'Đóng cho những năm còn thiếu' }
  ];

  danhSachLoaiNSNN = [
    { value: 'ngheo', label: 'Nghèo' },
    { value: 'can_ngheo', label: 'Cận nghèo' },
    { value: 'khac', label: 'Khác' }
  ];
  
  keKhaiBHXHs: any[] = [];
  thongKe = {
    tongSoThe: 0,
    tongSoTien: 0
  };

  formatCurrency = (value: number): string => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  parseCurrency = (value: string): number => Number(value.replace(/\$\s?|(,*)/g, ''));

  formatPercent = (value: number | string): string => `${value}%`;
  parsePercent = (value: string): number => Number(value.replace('%', ''));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modal: NzModalService,
    private diaChiService: DiaChiService,
    private datePipe: DatePipe,
    private iconService: NzIconService
  ) {
    this.iconService.addIcon(...[SearchOutline, IdcardOutline, DeleteOutline, EditOutline]);
    this.generateMucThuNhap();
  }

  generateMucThuNhap(): void {
    const mucToiThieu = 1500000;
    const mucToiDa = 10000000; // Giả sử mức tối đa là 10 triệu
    const buocNhay = 50000;
    
    for (let muc = mucToiThieu; muc <= mucToiDa; muc += buocNhay) {
      this.danhSachMucThuNhap.push({
        value: muc,
        label: muc.toLocaleString('vi-VN') + ' đồng'
      });
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDanhMucTinh();
    
    // Theo dõi thay đổi của các trường để tính số tiền
    this.form.get('muc_thu_nhap')?.valueChanges.subscribe(() => {
      this.tinhSoTienPhaiDong();
    });

    this.form.get('ty_le_dong')?.valueChanges.subscribe(() => {
      this.tinhSoTienPhaiDong();
    });

    this.form.get('ty_le_nsnn')?.valueChanges.subscribe(() => {
      this.tinhSoTienPhaiDong();
    });

    this.form.get('phuong_thuc_dong')?.valueChanges.subscribe(() => {
      this.tinhSoTienPhaiDong();
    });

    // Theo dõi thay đổi loại NSNN
    this.form.get('loai_nsnn')?.valueChanges.subscribe((value) => {
      this.onLoaiNSNNChange(value);
    });

    // Theo dõi thay đổi phương án
    this.form.get('phuong_an')?.valueChanges.subscribe((value) => {
      this.onPhuongAnChange(value);
    });
    
    this.route.params.subscribe(params => {
      this.dotKeKhaiId = +params['id'];
      if (this.dotKeKhaiId) {
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  initForm(): void {
    this.form = this.fb.group({
      ma_so_bhxh: ['', [Validators.required, Validators.maxLength(10)]],
      cccd: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      ho_ten: ['', [Validators.required]],
      ngay_sinh: [null, Validators.required],
      gioi_tinh: [null, Validators.required],
      so_dien_thoai: ['', [Validators.pattern(/^(0|84)\d{9,10}$/)]],
      tinh_nkq: [null, Validators.required],
      huyen_nkq: [null, Validators.required],
      xa_nkq: [null, Validators.required],
      dia_chi_nkq: ['', Validators.required],
      muc_thu_nhap: [1500000, [Validators.required, Validators.min(1500000)]],
      ty_le_dong: [{value: 22, disabled: true}, [Validators.required, Validators.min(0), Validators.max(100)]],
      ty_le_nsnn: [{value: 10, disabled: true}, [Validators.required, Validators.min(0), Validators.max(100)]],
      loai_nsnn: ['khac', [Validators.required]],
      tien_ho_tro: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
      so_tien_phai_dong: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
      tu_thang: [null, Validators.required],
      ngay_bien_lai: [{value: new Date(), disabled: true}, Validators.required],
      loai_khai_bao: [{value: 1, disabled: true}, Validators.required],
      phuong_an: ['TM', Validators.required],
      phuong_thuc_dong: [1, Validators.required],
      thang_bat_dau: [null, [Validators.required]],
      ghi_chu: ['']
    });
  }

  loadData(): void {
    this.loading = true;
    // TODO: Implement loadData from API
    this.loading = false;
  }

  loadDanhMucTinh(): void {
    this.diaChiService.getDanhMucTinh().subscribe({
      next: (data) => {
        this.danhMucTinhs = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục tỉnh:', error);
        this.message.error('Có lỗi xảy ra khi tải danh mục tỉnh');
      }
    });
  }

  onTinhChange(maTinh: string): void {
    if (!maTinh) {
      this.danhMucHuyens = [];
      this.danhMucXas = [];
      return;
    }

    this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
      next: (data) => {
        this.danhMucHuyens = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục huyện:', error);
        this.message.error('Có lỗi xảy ra khi tải danh mục quận/huyện');
      }
    });
  }

  onHuyenChange(maHuyen: string): void {
    if (!maHuyen) {
      this.danhMucXas = [];
      return;
    }

    this.diaChiService.getDanhMucXaByMaHuyen(maHuyen).subscribe({
      next: (data) => {
        this.danhMucXas = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục xã:', error);
        this.message.error('Có lỗi xảy ra khi tải danh mục phường/xã');
      }
    });
  }

  showModal(data?: any): void {
    this.isVisible = true;
    this.isEdit = !!data;
    this.form.reset();

    if (data) {
      this.form.patchValue({
        // TODO: Patch form values
      });
    }
  }

  handleOk(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      // TODO: Implement save/update logic
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  onAllChecked(checked: boolean): void {
    this.keKhaiBHXHs.forEach(item => {
      if (item.id) {
        const index = this.selectedIds.indexOf(item.id);
        if (checked && index === -1) {
          this.selectedIds.push(item.id);
        } else if (!checked && index !== -1) {
          this.selectedIds.splice(index, 1);
        }
      }
    });
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const allChecked = this.keKhaiBHXHs.every(item => 
      item.id && this.selectedIds.includes(item.id));
    const someChecked = this.keKhaiBHXHs.some(item => 
      item.id && this.selectedIds.includes(item.id));
    this.isAllChecked = allChecked;
    this.isIndeterminate = !allChecked && someChecked;
  }

  onlyNumber(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  tinhSoTienPhaiDong(): void {
    const mucThuNhap = this.form.get('muc_thu_nhap')?.value || 0;
    const tyLeDong = this.form.get('ty_le_dong')?.value || 0;
    const tyLeNSNN = this.form.get('ty_le_nsnn')?.value || 0;
    const phuongThucDong = this.form.get('phuong_thuc_dong')?.value || 1;
    
    // Lấy số tháng đóng từ phương thức đóng
    const soThangDong = typeof phuongThucDong === 'number' ? phuongThucDong : 1;
    
    // Tính mức đóng = Mức thu nhập × Tỷ lệ đóng × Số tháng đóng
    const mucDong = Math.round((mucThuNhap * tyLeDong * soThangDong) / 100);
    
    // Tính tiền đóng mức tối thiểu = 1,500,000 × Tỷ lệ đóng
    const tienDongMucToiThieu = Math.round((1500000 * tyLeDong) / 100);
    
    // Tính số tiền hỗ trợ = Tiền đóng mức tối thiểu × Tỷ lệ NSNN × Số tháng đóng
    const tienHoTro = Math.round((tienDongMucToiThieu * tyLeNSNN * soThangDong) / 100);
    
    // Tính số tiền thực phải đóng = Mức đóng - Tiền hỗ trợ
    const soTienPhaiDong = mucDong - tienHoTro;
    
    this.form.patchValue({
      tien_ho_tro: tienHoTro,
      so_tien_phai_dong: soTienPhaiDong
    }, { emitEvent: false });
  }

  onLoaiNSNNChange(loaiNSNN: string): void {
    let tyLeNSNN = 10; // Mặc định là 10%
    
    switch (loaiNSNN) {
      case 'ngheo':
        tyLeNSNN = 30;
        break;
      case 'can_ngheo':
        tyLeNSNN = 25;
        break;
      case 'khac':
        tyLeNSNN = 10;
        break;
    }
    
    this.form.patchValue({
      ty_le_nsnn: tyLeNSNN
    });
  }

  onPhuongAnChange(phuongAn: string): void {
    if (phuongAn) {
      this.form.patchValue({
        ghi_chu: `Phương án: ${phuongAn}`
      });
    } else {
      this.form.patchValue({
        ghi_chu: ''
      });
    }
  }
} 