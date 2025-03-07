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
import { SearchOutline, IdcardOutline, DeleteOutline, EditOutline, SaveOutline, ClearOutline } from '@ant-design/icons-angular/icons';
import { KeKhaiBHXHService } from '../../services/ke-khai-bhxh.service';
import { SSMV2Service } from '../../services/ssmv2.service';

registerLocaleData(vi);

interface SearchResponse {
  success: boolean;
  data: any;
  message?: string;
}

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
  
  danhSachLoaiKhaiBao = [
    { value: '1', label: 'Khai báo lần đầu' },
    { value: '2', label: 'Khai báo điều chỉnh' },
    { value: '3', label: 'Khai báo bổ sung' }
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

  // Thêm biến để kiểm soát thời gian giữa các lần gọi API
  private isSearching = false;

  // Thêm các thuộc tính SSMV2
  isLoginVisible = false;
  captchaImage = '';
  captchaCode = '';
  loginForm: FormGroup;
  loadingLogin = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modal: NzModalService,
    private diaChiService: DiaChiService,
    private datePipe: DatePipe,
    private iconService: NzIconService,
    private keKhaiBHXHService: KeKhaiBHXHService,
    private ssmv2Service: SSMV2Service
  ) {
    this.iconService.addIcon(...[SearchOutline, IdcardOutline, DeleteOutline, EditOutline, SaveOutline, ClearOutline]);
    this.generateMucThuNhap();
    
    // Khởi tạo form login SSMV2
    this.loginForm = this.fb.group({
      userName: ['884000_xa_tli_phuoclt'],
      password: ['123456d@D'],
      text: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]]
    });
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
    // Thêm log để kiểm tra dữ liệu currentUser
    console.log('currentUser:', this.currentUser);
    console.log('Mã nhân viên:', this.currentUser?.ma_nhan_vien || this.currentUser?.username);
    
    this.route.params.subscribe(params => {
      this.dotKeKhaiId = +params['id']; // Chuyển đổi sang số
      console.log('dotKeKhaiId:', this.dotKeKhaiId);
      
      if (!this.dotKeKhaiId || isNaN(this.dotKeKhaiId)) {
        this.message.error('Không tìm thấy thông tin đợt kê khai');
        return;
      }
      
      this.initForm();
      this.loadDanhMucTinh();
      this.loadData();
    });
    
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
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  initForm(): void {
    // Log trước khi khởi tạo form
    const maNhanVien = this.currentUser?.ma_nhan_vien || this.currentUser?.username || '';
    console.log('Khởi tạo form với mã nhân viên:', maNhanVien);
    
    this.form = this.fb.group({
      ma_so_bhxh: ['', [Validators.required, Validators.maxLength(10)]],
      cccd: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      ho_ten: ['', [Validators.required]],
      ma_nhan_vien: [{value: maNhanVien, disabled: true}, [Validators.required]],
      ngay_sinh: [null, Validators.required],
      gioi_tinh: [null, Validators.required],
      so_dien_thoai: ['', [Validators.pattern(/^(0|84)\d{9,10}$/)]],
      tinh_nkq: [null, Validators.required],
      huyen_nkq: [null, Validators.required],
      xa_nkq: [null, Validators.required],
      dia_chi_nkq: '',
      muc_thu_nhap: [1500000, [Validators.required, Validators.min(1500000)]],
      ty_le_dong: [{value: 22, disabled: true}, [Validators.required, Validators.min(0), Validators.max(100)]],
      ty_le_nsnn: [{value: 10, disabled: true}, [Validators.required, Validators.min(0), Validators.max(100)]],
      loai_nsnn: ['khac', [Validators.required]],
      tien_ho_tro: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
      so_tien_can_dong: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
      phuong_thuc_dong: [1, [Validators.required]],
      thang_bat_dau: [null, Validators.required],
      tu_thang: [null],
      phuong_an: ['TM', [Validators.required]],
      loai_khai_bao: [{value: '1', disabled: true}, [Validators.required]],
      ngay_bien_lai: [new Date(), Validators.required],
      ghi_chu: ['']
    });
  }

  loadData(): void {
    this.loading = true;
    this.keKhaiBHXHService.getByDotKeKhaiId(this.dotKeKhaiId).subscribe({
      next: (data) => {
        this.keKhaiBHXHs = data;
        this.thongKe.tongSoThe = data.length;
        this.thongKe.tongSoTien = data.reduce((total, item) => total + (item.so_tien_can_dong || 0), 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu kê khai BHXH:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu kê khai BHXH');
        this.loading = false;
      }
    });
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
    const soTienCanDong = mucDong - tienHoTro;
    
    this.form.patchValue({
      tien_ho_tro: tienHoTro,
      so_tien_can_dong: soTienCanDong
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
      const tenPhuongAn = this.danhSachPhuongAn.find(pa => pa.value === phuongAn)?.label.split(' - ')[1] || phuongAn;
      this.form.patchValue({
        ghi_chu: `Phương án: ${tenPhuongAn}`
      });
    } else {
      this.form.patchValue({
        ghi_chu: ''
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      ma_so_bhxh: '',
      cccd: '',
      ho_ten: '',
      ma_nhan_vien: '',
      ngay_sinh: null,
      gioi_tinh: null,
      so_dien_thoai: '',
      tinh_nkq: null,
      huyen_nkq: null,
      xa_nkq: null,
      dia_chi_nkq: '',
      muc_thu_nhap: 1500000,
      ty_le_dong: 22,
      ty_le_nsnn: 10,
      loai_nsnn: 'khac',
      tien_ho_tro: 0,
      so_tien_can_dong: 0,
      phuong_thuc_dong: 1,
      thang_bat_dau: null,
      tu_thang: null,
      phuong_an: 'TM',
      loai_khai_bao: '1',
      ngay_bien_lai: new Date(),
      ghi_chu: ''
    });
    
    // Reset các dropdown phụ thuộc
    this.danhMucHuyens = [];
    this.danhMucXas = [];
  }

  saveKeKhaiBHXH(): void {
    console.log('Form valid:', this.form.valid);
    console.log('Form values:', this.form.value);
    console.log('Form errors:', this.getFormValidationErrors());
    
    if (this.form.invalid) {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
      this.message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    // Hiển thị thông báo đang xử lý
    const msgId = this.message.loading('Đang lưu thông tin...', { nzDuration: 0 }).messageId;
    
    // Gọi trực tiếp processKeKhaiBHXH
    this.processKeKhaiBHXH();
    
    // Đóng thông báo loading sau khi gọi API
    setTimeout(() => {
      this.message.remove(msgId);
    }, 500);
  }

  // Thêm hàm này để kiểm tra lỗi của form
  getFormValidationErrors() {
    const result: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        result[key] = control.errors;
      }
    });
    return result;
  }

  // Phương thức để lấy tên huyện từ mã huyện
  getHuyenTen(maHuyen: string): string {
    const huyen = this.danhMucHuyens.find(h => h.ma === maHuyen);
    if (!huyen) {
      console.warn(`Không tìm thấy huyện với mã: ${maHuyen}`);
      return maHuyen; // Trả về mã nếu không tìm thấy tên
    }
    return huyen.ten;
  }

  // Phương thức để lấy tên xã từ mã xã
  getXaTen(maXa: string): string {
    const xa = this.danhMucXas.find(x => x.ma === maXa);
    if (!xa) {
      console.warn(`Không tìm thấy xã với mã: ${maXa}`);
      return maXa; // Trả về mã nếu không tìm thấy tên
    }
    return xa.ten;
  }

  processKeKhaiBHXH(): void {
    // Lấy cả giá trị của các trường bị vô hiệu hóa
    const formValue = this.form.getRawValue();
    
    // Nếu tu_thang không có giá trị, sử dụng thang_bat_dau
    const tuThang = formValue.tu_thang || formValue.thang_bat_dau;
    
    // Đảm bảo ty_le_dong là số
    const tyLeDong = parseFloat(formValue.ty_le_dong);
    
    // Luôn sử dụng giá trị '1' cho loại khai báo
    const loaiKhaiBao = '1';
    
    // Lấy mã và tên tỉnh, huyện, xã
    const maTinh = formValue.tinh_nkq;
    const tenTinh = this.getTinhTen(maTinh);
    
    const maHuyen = formValue.huyen_nkq;
    const tenHuyen = this.getHuyenTen(maHuyen);
    
    const maXa = formValue.xa_nkq;
    const tenXa = this.getXaTen(maXa);
    
    const keKhaiBHXH = {
      dot_ke_khai_id: this.dotKeKhaiId,
      thong_tin_the: {
        ma_so_bhxh: formValue.ma_so_bhxh,
        cccd: formValue.cccd,
        ho_ten: formValue.ho_ten,
        ngay_sinh: this.datePipe.transform(formValue.ngay_sinh, 'yyyy-MM-dd'),
        gioi_tinh: formValue.gioi_tinh,
        so_dien_thoai: formValue.so_dien_thoai,
        tinh_nkq: formValue.tinh_nkq,
        huyen_nkq: formValue.huyen_nkq,
        xa_nkq: formValue.xa_nkq,
        dia_chi_nkq: formValue.dia_chi_nkq,
        ma_tinh_nkq: maTinh, // Mã tỉnh
        ma_huyen_nkq: maHuyen, // Mã huyện
        ma_xa_nkq: maXa // Mã xã
      },
      muc_thu_nhap: formValue.muc_thu_nhap,
      ty_le_dong: tyLeDong, // Sử dụng giá trị đã chuyển đổi
      ty_le_nsnn: formValue.ty_le_nsnn,
      loai_nsnn: formValue.loai_nsnn,
      tien_ho_tro: formValue.tien_ho_tro,
      so_tien_can_dong: formValue.so_tien_can_dong,
      phuong_thuc_dong: formValue.phuong_thuc_dong,
      thang_bat_dau: this.datePipe.transform(formValue.thang_bat_dau, 'yyyy-MM-dd'),
      tu_thang: tuThang ? this.datePipe.transform(tuThang, 'yyyy-MM-dd') : null,
      phuong_an: formValue.phuong_an,
      loai_khai_bao: loaiKhaiBao, // Luôn sử dụng giá trị '1'
      ngay_bien_lai: this.datePipe.transform(formValue.ngay_bien_lai, 'yyyy-MM-dd'),
      ghi_chu: formValue.ghi_chu,
      nguoi_tao: this.currentUser.username || 'unknown',
      is_urgent: false,
      tinh_nkq: tenTinh, // Tên tỉnh
      huyen_nkq: tenHuyen, // Tên huyện
      xa_nkq: tenXa, // Tên xã
      ma_nhan_vien: formValue.ma_nhan_vien // Thêm mã nhân viên vào dữ liệu gửi đi
    };

    console.log('Dữ liệu gửi đi:', keKhaiBHXH);
    console.log('Tỷ lệ đóng gửi đi:', keKhaiBHXH.ty_le_dong);
    console.log('Tỉnh NKQ gửi đi:', keKhaiBHXH.tinh_nkq);
    console.log('Mã tỉnh NKQ gửi đi:', keKhaiBHXH.thong_tin_the.ma_tinh_nkq);
    console.log('Huyện NKQ gửi đi:', keKhaiBHXH.huyen_nkq);
    console.log('Xã NKQ gửi đi:', keKhaiBHXH.xa_nkq);
    
    this.loading = true;
    this.keKhaiBHXHService.create(keKhaiBHXH).subscribe({
      next: (response) => {
        console.log('Phản hồi từ server:', response);
        this.message.success('Lưu thông tin kê khai BHXH thành công');
        this.loading = false;
        this.resetForm();
        this.loadData(); // Tải lại danh sách
      },
      error: (error) => {
        console.error('Lỗi khi lưu thông tin kê khai BHXH:', error);
        this.message.error('Có lỗi xảy ra khi lưu thông tin kê khai BHXH: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  // Thêm phương thức để tính ty_le_dong
  calculateTyLeDong(): void {
    // Lấy giá trị từ form
    const mucThuNhap = this.form.get('muc_thu_nhap')?.value || 0;
    const soTienPhaiDong = this.form.get('so_tien_can_dong')?.value || 0;
    
    // Tính tỷ lệ đóng
    let tyLeDong = 0;
    if (mucThuNhap > 0) {
      tyLeDong = (soTienPhaiDong / mucThuNhap) * 100;
    }
    
    // Cập nhật giá trị vào form
    this.form.patchValue({
      ty_le_dong: tyLeDong
    });
    
    console.log('Tỷ lệ đóng đã tính:', tyLeDong);
  }

  // Phương thức để lấy tên tỉnh từ mã tỉnh
  getTinhTen(maTinh: string): string {
    const tinh = this.danhMucTinhs.find(t => t.ma === maTinh);
    if (!tinh) {
      console.warn(`Không tìm thấy tỉnh với mã: ${maTinh}`);
      return maTinh; // Trả về mã nếu không tìm thấy tên
    }
    return tinh.ten;
  }

  deleteKeKhaiBHXH(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa bản ghi này không?',
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.loading = true;
        this.keKhaiBHXHService.delete(this.dotKeKhaiId, id).subscribe({
          next: () => {
            this.message.success('Xóa bản ghi thành công');
            this.loadData();
          },
          error: (error) => {
            this.message.error('Xóa bản ghi thất bại: ' + error.error?.message || error.message);
            this.loading = false;
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  // Thêm xử lý xóa nhiều bản ghi
  deleteSelectedRecords(): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${this.selectedIds.length} bản ghi đã chọn không?`,
      nzOkText: 'Đồng ý',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.loading = true;
        const deletePromises = this.selectedIds.map(id => 
          this.keKhaiBHXHService.delete(this.dotKeKhaiId, id).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.message.success('Xóa thành công');
            this.selectedIds = [];
            this.loadData();
          })
          .catch(error => {
            console.error('Lỗi khi xóa các kê khai BHXH:', error);
            this.message.error('Có lỗi xảy ra khi xóa các kê khai BHXH');
          })
          .finally(() => {
            this.loading = false;
          });
      },
      nzCancelText: 'Hủy'
    });
  }

  // Xử lý sự kiện keyup
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isSearching) {
      this.searchBHXH();
    }
  }

  searchBHXH(): void {
    if (this.isSearching) return;

    const maSoBHXH = this.form.get('ma_so_bhxh')?.value;
    if (!maSoBHXH || maSoBHXH.length !== 10) {
      this.message.warning('Vui lòng nhập đủ 10 số BHXH');
      return;
    }

    // Kiểm tra token trước khi tìm kiếm
    const token = this.ssmv2Service.getToken();
    if (!token) {
      console.log('Không có token SSMV2, yêu cầu đăng nhập');
      this.getAccessToken();
      return;
    }

    this.isSearching = true;
    
    this.keKhaiBHXHService.searchBHXH(maSoBHXH).subscribe({
      next: (response: any) => {
        console.log('Response from BHXH search:', response);
        
        if (response.success) {
          const data = response.data;
          console.log('BHXH search response data:', data);
          this.processSearchResult(data);
          this.message.success('Đã tìm thấy thông tin BHXH');
        } else {
          this.message.error(response.message || 'Lỗi không xác định');
        }
      },
      error: (err: any) => {
        console.error('Search error:', err);
        
        // Xử lý lỗi xác thực
        if (err.status === 401 || err.status === 403 || 
            err.error?.error === 'Lỗi xác thực' || 
            err.error?.error_description?.includes('Không tìm thấy thông tin phiên đăng nhập')) {
          
          console.log('Lỗi xác thực, yêu cầu đăng nhập lại');
          this.ssmv2Service.clearToken();
          this.getAccessToken();
        } else if (err.status === 406) {
          // Xử lý lỗi Not Acceptable
          console.log('Lỗi 406 - Not Acceptable, xóa token và yêu cầu đăng nhập lại');
          this.ssmv2Service.clearToken();
          this.getAccessToken();
        } else {
          this.message.error('Lỗi tìm kiếm: ' + (err.error?.message || err.error?.error_description || 'Lỗi không xác định'));
        }
      },
      complete: () => {
        this.isSearching = false;
      }
    });
  }

  private processSearchResult(data: any): void {
    try {
      // Xử lý và chuyển đổi ngày tháng
      const ngaySinh = data.ngaySinh ? this.formatDate(data.ngaySinh) : '';

      // Cập nhật form với dữ liệu từ API
      this.form.patchValue({
        ma_so_bhxh: data.maSoBHXH,
        cccd: data.cmnd,
        ho_ten: data.hoTen,
        ngay_sinh: ngaySinh,
        gioi_tinh: data.gioiTinh === 1 ? 'Nam' : 'Nữ',
        so_dien_thoai: data.soDienThoai,
        ma_hgd: data.maHoGiaDinh,
        ma_tinh_ks: data.maTinhKS,
        ma_huyen_ks: data.maHuyenKS,
        ma_xa_ks: data.maXaKS,
        tinh_nkq: data.maTinhNkq,
        huyen_nkq: data.maHuyenNkq,
        xa_nkq: data.maXaNkq,
        dia_chi_nkq: data.noiNhanHoSo,
        ma_dan_toc: data.danToc,
        quoc_tich: data.quocTich,
      });

      this.message.success('Đã tìm thấy thông tin BHXH');
    } catch (error) {
      console.error('Error processing search result:', error);
      this.message.error('Có lỗi xảy ra khi xử lý dữ liệu');
    }
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    // Kiểm tra nếu dateString đã ở định dạng yyyy-MM-dd
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  // Thêm phương thức lấy token
  getAccessToken(): void {
    console.log('Yêu cầu đăng nhập SSMV2');
    this.isLoginVisible = true;
    this.getCaptcha();
  }

  getCaptcha(): void {
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        console.log('Captcha response:', res);
        if (res && res.data) {
          this.captchaImage = res.data.image;
          this.captchaCode = res.data.code;
        } else {
          this.message.error('Không nhận được dữ liệu captcha');
        }
      },
      error: (err) => {
        console.error('Captcha error:', err);
        this.message.error('Lỗi khi lấy captcha: ' + err.message);
      }
    });
  }

  handleLogin(): void {
    if (this.loginForm.get('text')?.valid) {
      this.loadingLogin = true;
      
      const data = {
        grant_type: 'password',
        userName: this.loginForm.get('userName')?.value,
        password: this.loginForm.get('password')?.value,
        text: this.loginForm.get('text')?.value,
        code: this.captchaCode,
        clientId: 'ZjRiYmI5ZTgtZDcyOC00ODRkLTkyOTYtMDNjYmUzM2U4Yjc5',
        isWeb: true
      };

      console.log('Gửi request đăng nhập với data:', { ...data, password: '***' });

      this.ssmv2Service.authenticate(data).subscribe({
        next: (response) => {
          this.loadingLogin = false;
          
          if (response.body?.access_token) {
            console.log('Xác thực thành công, token hết hạn sau:', response.body.expires_in, 'giây');
            this.message.success('Xác thực thành công');
            this.isLoginVisible = false;
            
            // Đảm bảo token đã được lưu trước khi tìm kiếm
            setTimeout(() => {
              if (this.form.get('ma_so_bhxh')?.value) {
                console.log('Thực hiện tìm kiếm sau khi đăng nhập thành công');
                this.searchBHXH();
              }
            }, 2000); // Tăng thời gian chờ lên 2 giây
          } else {
            this.message.error('Không nhận được token');
            this.getCaptcha();
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          this.loadingLogin = false;
          this.loginForm.patchValue({ text: '' });

          if (err.error?.error === 'invalid_captcha') {
            this.message.error('Mã xác thực sai');
          } else if (err.error?.error_description?.includes('xác thực')) {
            this.message.error('Mã xác thực sai');
          } else if (err.error?.message) {
            this.message.error(err.error.message);
          } else {
            this.message.error('Xác thực thất bại, vui lòng thử lại');
          }

          setTimeout(() => {
            this.getCaptcha();
          }, 100);
        }
      });
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  handleLoginCancel(): void {
    this.isLoginVisible = false;
    this.loginForm.reset({
      userName: '884000_xa_tli_phuoclt',
      password: '123456d@D'
    });
  }

  convertToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperCaseValue = input.value.toUpperCase();
    
    if (input.value !== upperCaseValue) {
      input.value = upperCaseValue;
      this.loginForm.get('text')?.setValue(upperCaseValue, { emitEvent: false });
    }
  }
} 