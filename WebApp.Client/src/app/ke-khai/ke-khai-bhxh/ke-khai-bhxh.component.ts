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
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  
  // Biến để theo dõi dòng đang được chọn
  selectedRowId: number | null = null;
  
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

  // Thêm thuộc tính để lưu cache
  private diaChiCache: {
    tinhs: { [key: string]: DanhMucTinh[] },
    huyens: { [key: string]: DanhMucHuyen[] },
    xas: { [key: string]: DanhMucXa[] }
  } = {
    tinhs: {},
    huyens: {},
    xas: {}
  };

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
    
    // Khởi tạo form login SSMV2 với tài khoản và mật khẩu mặc định
    this.loginForm = this.fb.group({
      userName: ['884000_xa_tli_phuoclt', [Validators.required]],
      password: ['123456d@D', [Validators.required]],
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
    // Thêm CSS cho modal đăng nhập
    const style = document.createElement('style');
    style.innerHTML = `
      .login-message {
        text-align: center;
        margin-bottom: 20px;
        color: #1890ff;
        font-size: 16px;
      }
      
      .captcha-image {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }
      
      .captcha-image img {
        max-width: 100%;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      .input-with-button {
        display: flex;
      }
      
      .input-with-button .refresh-button {
        margin-left: 8px;
      }
      
      .captcha-container {
        margin-bottom: 0;
      }
    `;
    document.head.appendChild(style);
    
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
      this.generateMucThuNhap();
      
      // Thiết lập các sự kiện theo dõi thay đổi của form
      this.setupFormValueChanges();
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      dot_ke_khai_id: [this.dotKeKhaiId],
      ma_so_bhxh: ['', [Validators.required, Validators.maxLength(10)]],
      cccd: ['', [Validators.required, Validators.maxLength(12)]],
      ho_ten: ['', [Validators.required, Validators.maxLength(100)]],
      ngay_sinh: [null, [Validators.required]],
      gioi_tinh: ['', [Validators.required]],
      so_dien_thoai: ['', [Validators.pattern(/^[0-9]{10,11}$/)]],
      ma_hgd: [''],
      ma_dan_toc: [''],
      ma_nhan_vien: [{value: this.currentUser?.ma_nhan_vien || '', disabled: true}, [Validators.required]],
      dia_chi_nkq: '',
      ma_tinh: [null, [Validators.required]],
      ma_huyen: [null, [Validators.required]],
      ma_xa: [null, [Validators.required]],
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
        console.log('Dữ liệu kê khai BHXH được tải về:', JSON.stringify(data));
        
        // Kiểm tra dữ liệu nhận được từ API
        if (Array.isArray(data)) {
          // Đảm bảo các trường dữ liệu được hiển thị đúng
          this.keKhaiBHXHs = data.map(item => {
            // Log chi tiết từng item để debug
            console.log(`Chi tiết item ${item.id}:`, JSON.stringify(item));
            console.log(`Mã hộ gia đình trực tiếp: ${item.ma_hgd || 'không có'}`);
            
            // Tạo ra một đối tượng mới với ma_hgd được gán đúng
            const itemWithMaHGD = {
              ...item,
              ma_hgd: item.ma_hgd || '' // Đảm bảo ma_hgd luôn có giá trị để hiển thị
            };
            
            return itemWithMaHGD;
          });
          
          // Log kết quả sau khi xử lý
          console.log('Danh sách kê khai sau khi xử lý:', this.keKhaiBHXHs);
        } else {
          console.error('Dữ liệu API không phải là mảng:', data);
          this.keKhaiBHXHs = [];
        }
        
        this.thongKe.tongSoThe = this.keKhaiBHXHs.length;
        this.thongKe.tongSoTien = this.keKhaiBHXHs.reduce((total, item) => total + (item.so_tien_can_dong || 0), 0);
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
    // Kiểm tra cache trước
    if (this.danhMucTinhs.length > 0) {
      return;
    }

    this.diaChiService.getDanhMucTinh().subscribe({
      next: (data) => {
        this.danhMucTinhs = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
        // Lưu vào cache
        this.diaChiCache.tinhs['all'] = this.danhMucTinhs;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục tỉnh:', error);
        this.message.error('Có lỗi xảy ra khi tải danh mục tỉnh');
      }
    });
  }

  onTinhChange(maTinh: string): void {
    console.log('onTinhChange được gọi với mã tỉnh:', maTinh);
    
    // Reset các danh sách và giá trị form
    this.danhMucHuyens = [];
    this.danhMucXas = [];
    this.form.patchValue({
      ma_huyen: null,
      ma_xa: null
    });
    
    if (!maTinh) return;

    // Kiểm tra cache
    if (this.diaChiCache.huyens[maTinh]) {
      this.danhMucHuyens = this.diaChiCache.huyens[maTinh];
      return;
    }

    this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
      next: (data) => {
        this.danhMucHuyens = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
        // Lưu vào cache
        this.diaChiCache.huyens[maTinh] = this.danhMucHuyens;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục huyện:', error);
        this.message.error('Có lỗi xảy ra khi tải danh mục quận/huyện');
      }
    });
  }

  onHuyenChange(maHuyen: string): void {
    console.log('onHuyenChange được gọi với mã huyện:', maHuyen);
    
    // Reset danh sách xã và giá trị form
    this.danhMucXas = [];
    this.form.patchValue({
      ma_xa: null
    });
    
    if (!maHuyen) return;

    // Kiểm tra cache
    if (this.diaChiCache.xas[maHuyen]) {
      this.danhMucXas = this.diaChiCache.xas[maHuyen];
      return;
    }

    // Lấy mã tỉnh từ form
    const maTinh = this.form.get('ma_tinh')?.value;
    if (!maTinh) return;

    // Kiểm tra xem huyện có thuộc tỉnh đã chọn không
    const huyenHopLe = this.danhMucHuyens.find(h => h.ma === maHuyen && h.ma_tinh === maTinh);
    if (!huyenHopLe) return;

    this.diaChiService.getDanhMucXaByMaHuyen(maHuyen).subscribe({
      next: (xas: DanhMucXa[]) => {
        this.danhMucXas = xas.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
        // Lưu vào cache
        this.diaChiCache.xas[maHuyen] = this.danhMucXas;
      },
      error: (error: any) => {
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

  // Phương thức điền dữ liệu từ bảng vào form
  fillFormData(data: any): void {
    if (!data) return;
    
    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Cập nhật dòng đang được chọn
    this.selectedRowId = data.id;
    
    // Reset form trước khi điền dữ liệu
    this.form.reset();
    
    // In thông tin để debug
    console.log('Dữ liệu hàng được chọn:', data);
    
    // Lấy giá trị mã hộ gia đình từ dữ liệu
    const maHoGiaDinh = data.ma_hgd || data.thong_tin_the?.ma_hgd || '';
    console.log('Mã hộ gia đình trong fillFormData:', maHoGiaDinh);
    
    // Điền dữ liệu từ bảng vào form
    const ngaySinh = data.ngay_sinh ? new Date(data.ngay_sinh) : null;
    const thangBatDau = data.thang_bat_dau ? new Date(data.thang_bat_dau) : null;
    const ngayBienLai = data.ngay_bien_lai ? new Date(data.ngay_bien_lai) : new Date();
    
    // Điền dữ liệu cơ bản (không bao gồm thông tin địa chỉ)
    this.form.patchValue({
      id: data.id,
      dot_ke_khai_id: this.dotKeKhaiId,
      ma_so_bhxh: data.ma_so_bhxh,
      cccd: data.cccd,
      ho_ten: data.ho_ten,
      ngay_sinh: ngaySinh,
      gioi_tinh: data.gioi_tinh,
      so_dien_thoai: data.so_dien_thoai,
      ma_hgd: maHoGiaDinh,
      ma_dan_toc: data.ma_dan_toc || data.thong_tin_the?.ma_dan_toc,
      ma_nhan_vien: data.ma_nhan_vien || this.currentUser?.ma_nhan_vien,
      dia_chi_nkq: data.dia_chi_nkq,
      muc_thu_nhap: data.muc_thu_nhap,
      ty_le_dong: data.ty_le_dong,
      ty_le_nsnn: data.ty_le_nsnn,
      loai_nsnn: data.loai_nsnn,
      tien_ho_tro: data.tien_ho_tro,
      so_tien_can_dong: data.so_tien_can_dong,
      phuong_thuc_dong: data.phuong_thuc_dong,
      thang_bat_dau: thangBatDau,
      phuong_an: data.phuong_an,
      loai_khai_bao: data.loai_khai_bao || '1',
      ngay_bien_lai: ngayBienLai,
      ghi_chu: data.ghi_chu
    });
    
    // Xử lý dữ liệu địa chỉ
    // Đảm bảo tải danh mục tỉnh trước
    this.loadDanhMucTinh();
    
    // Lấy thông tin tỉnh, huyện, xã từ API
    this.diaChiService.getDanhMucTinh().subscribe({
      next: (tinhs) => {
        this.danhMucTinhs = tinhs;
        
        // Xác định mã tỉnh
        let maTinh = '';
        // Nếu có mã tỉnh trong data, sử dụng
        if (data.ma_tinh) {
          maTinh = data.ma_tinh;
        } 
        // Nếu không tìm thấy mã tỉnh nhưng có tên tỉnh
        else if (data.tinh_nkq) {
          const tinh = this.danhMucTinhs.find(t => t.ten.toLowerCase() === data.tinh_nkq.toLowerCase());
          if (tinh) {
            maTinh = tinh.ma;
          }
        }
        
        console.log('Mã tỉnh được xác định:', maTinh);
        
        if (maTinh) {
          // Cập nhật mã tỉnh vào form
          this.form.patchValue({ ma_tinh: maTinh });
          
          // Tải danh sách huyện
          this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
            next: (huyens) => {
              this.danhMucHuyens = huyens;
              
              // Xác định mã huyện
              let maHuyen = '';
              // Nếu có mã huyện trong data, sử dụng
              if (data.ma_huyen) {
                maHuyen = data.ma_huyen;
              } 
              // Nếu không tìm thấy mã huyện nhưng có tên huyện
              else if (data.huyen_nkq) {
                const huyen = this.danhMucHuyens.find(h => h.ten.toLowerCase() === data.huyen_nkq.toLowerCase());
                if (huyen) {
                  maHuyen = huyen.ma;
                }
              }
              
              console.log('Mã huyện được xác định:', maHuyen);
              
              if (maHuyen) {
                // Cập nhật mã huyện vào form
                this.form.patchValue({ ma_huyen: maHuyen });
                
                // Tải danh sách xã
                this.diaChiService.getDanhMucXaByMaHuyen(maHuyen).subscribe({
                  next: (xas) => {
                    this.danhMucXas = xas;
                    
                    // Xác định mã xã
                    let maXa = '';
                    // Nếu có mã xã trong data, sử dụng
                    if (data.ma_xa) {
                      maXa = data.ma_xa;
                    } 
                    // Nếu không tìm thấy mã xã nhưng có tên xã
                    else if (data.xa_nkq) {
                      const xa = this.danhMucXas.find(x => x.ten.toLowerCase() === data.xa_nkq.toLowerCase());
                      if (xa) {
                        maXa = xa.ma;
                      }
                    }
                    
                    console.log('Mã xã được xác định:', maXa);
                    
                    if (maXa) {
                      // Cập nhật mã xã vào form
                      this.form.patchValue({ ma_xa: maXa });
                    }
                  },
                  error: (error) => {
                    console.error('Lỗi khi tải danh mục xã:', error);
                  }
                });
              }
            },
            error: (error) => {
              console.error('Lỗi khi tải danh mục huyện:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục tỉnh:', error);
      }
    });
    
    // Hiển thị thông báo
    this.message.success('Đã điền thông tin vào form');
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
    // Reset form về giá trị mặc định
    this.form.reset({
      id: null,
      dot_ke_khai_id: this.dotKeKhaiId,
      ma_so_bhxh: '',
      cccd: '',
      ho_ten: '',
      ngay_sinh: null,
      gioi_tinh: null,
      so_dien_thoai: '',
      ma_hgd: '',
      ma_dan_toc: '',
      ma_nhan_vien: this.currentUser?.ma_nhan_vien || '',
      dia_chi_nkq: '',
      ma_tinh: null,
      ma_huyen: null,
      ma_xa: null,
      muc_thu_nhap: 1500000,
      ty_le_dong: 22,
      ty_le_nsnn: 10,
      loai_nsnn: 'khac',
      tien_ho_tro: 0,
      so_tien_can_dong: 0,
      phuong_thuc_dong: 1,
      thang_bat_dau: null,
      phuong_an: 'TM',
      loai_khai_bao: '1',
      ngay_bien_lai: new Date(),
      ghi_chu: ''
    });
  }

  // Phương thức kiểm tra trùng lặp mã số BHXH
  private checkDuplicateBHXH(maSoBHXH: string): Observable<boolean> {
    // Nếu không có đợt kê khai, không cần kiểm tra
    if (!this.dotKeKhaiId) {
      return of(false);
    }
    
    // Kiểm tra trong danh sách kê khai hiện tại (không cần gọi API)
    const existingRecord = this.keKhaiBHXHs.find(item => 
      item.ma_so_bhxh === maSoBHXH && 
      (!this.isEdit || (this.isEdit && item.id !== this.form.get('id')?.value))
    );
    
    if (existingRecord) {
      return of(true); // Đã tìm thấy bản ghi trùng trong danh sách hiện tại
    }
    
    // Nếu không tìm thấy trong danh sách hiện tại, trả về false
    return of(false);
  }

  saveKeKhaiBHXH(): void {
    // Kiểm tra form hợp lệ
    if (this.form.invalid) {
      this.getFormValidationErrors();
      this.message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const maSoBHXH = this.form.get('ma_so_bhxh')?.value;
    
    // Kiểm tra trùng lặp mã số BHXH
    this.checkDuplicateBHXH(maSoBHXH).subscribe(isDuplicate => {
      if (isDuplicate) {
        this.message.error(`Mã số BHXH ${maSoBHXH} đã tồn tại trong đợt kê khai này!`);
        return;
      }
      
      // Tiếp tục xử lý lưu kê khai nếu không trùng lặp
      this.processKeKhaiBHXH();
    });
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

  // Phương thức để lấy tên tỉnh từ mã
  getTinhTen(maTinh: string): string {
    if (!maTinh) return '';
    
    const tinh = this.danhMucTinhs.find(t => t.ma === maTinh);
    return tinh ? tinh.ten : '';
  }

  // Phương thức để lấy tên huyện từ mã
  getHuyenTen(maHuyen: string): string {
    if (!maHuyen) return '';
    
    const huyen = this.danhMucHuyens.find(h => h.ma === maHuyen);
    return huyen ? huyen.ten : '';
  }

  // Phương thức để lấy tên xã từ mã
  getXaTen(maXa: string): string {
    if (!maXa) return '';
    
    const xa = this.danhMucXas.find(x => x.ma === maXa);
    return xa ? xa.ten : '';
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
    const maTinh = formValue.ma_tinh;
    const tenTinh = this.getTinhTen(maTinh);
    
    const maHuyen = formValue.ma_huyen;
    const tenHuyen = this.getHuyenTen(maHuyen);
    
    const maXa = formValue.ma_xa;
    const tenXa = this.getXaTen(maXa);
    
    // Xử lý thang_bat_dau để chỉ lưu tháng và năm
    let thangBatDau = formValue.thang_bat_dau;
    let thangBatDauFormatted = '';
    if (thangBatDau) {
      // Format thành yyyy-MM (không có ngày)
      const date = new Date(thangBatDau);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const formattedMonth = month < 10 ? `0${month}` : `${month}`;
      thangBatDauFormatted = `${year}-${formattedMonth}`;
      
      console.log('Tháng bắt đầu đã được format:', thangBatDauFormatted);
    }
    
    // Xử lý tu_thang để chỉ lưu tháng và năm
    let tuThangDate = tuThang;
    let tuThangFormatted = null;
    if (tuThangDate) {
      // Format thành yyyy-MM (không có ngày)
      const date = new Date(tuThangDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const formattedMonth = month < 10 ? `0${month}` : `${month}`;
      tuThangFormatted = `${year}-${formattedMonth}`;
      
      console.log('Từ tháng đã được format:', tuThangFormatted);
    }
    
    const keKhaiBHXH = {
      dot_ke_khai_id: this.dotKeKhaiId,
      thong_tin_the: {
        ma_so_bhxh: formValue.ma_so_bhxh,
        cccd: formValue.cccd,
        ho_ten: formValue.ho_ten,
        ngay_sinh: this.datePipe.transform(formValue.ngay_sinh, 'yyyy-MM-dd'),
        gioi_tinh: formValue.gioi_tinh,
        so_dien_thoai: formValue.so_dien_thoai,
        tinh_nkq: formValue.ma_tinh,
        huyen_nkq: formValue.ma_huyen,
        xa_nkq: formValue.ma_xa,
        dia_chi_nkq: formValue.dia_chi_nkq,
        ma_tinh_nkq: maTinh,
        ma_huyen_nkq: maHuyen,
        ma_xa_nkq: maXa,
        ma_tinh_ks: maTinh,
        ma_huyen_ks: maHuyen,
        ma_xa_ks: maXa,
        ma_hgd: formValue.ma_hgd,
        ma_dan_toc: formValue.ma_dan_toc
      },
      muc_thu_nhap: formValue.muc_thu_nhap,
      ty_le_dong: tyLeDong, // Sử dụng giá trị đã chuyển đổi
      ty_le_nsnn: formValue.ty_le_nsnn,
      loai_nsnn: formValue.loai_nsnn,
      tien_ho_tro: formValue.tien_ho_tro,
      so_tien_can_dong: formValue.so_tien_can_dong,
      phuong_thuc_dong: formValue.phuong_thuc_dong,
      thang_bat_dau: thangBatDauFormatted, // Sử dụng định dạng yyyy-MM
      tu_thang: tuThangFormatted, // Sử dụng định dạng yyyy-MM
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

  // Xử lý khi người dùng chọn tháng bắt đầu
  onThangBatDauChange(date: Date): void {
    if (date) {
      // Cập nhật giá trị vào form
      this.form.patchValue({
        thang_bat_dau: date
      });
      
      // Format thành yyyy-MM để hiển thị
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const formattedMonth = month < 10 ? `0${month}` : `${month}`;
      const formattedDate = `${year}-${formattedMonth}`;
      
      console.log('Tháng bắt đầu đã được chọn:', formattedDate);
    }
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
    if (this.isSearching) {
      return;
    }

    const maSoBHXH = this.form.get('ma_so_bhxh')?.value;
    if (!maSoBHXH) {
      this.message.warning('Vui lòng nhập mã số BHXH để tìm kiếm!');
      return;
    }

    // Kiểm tra xem có đang ở chế độ ngoại tuyến không
    const userInfo = localStorage.getItem('ssmv2_user_info');
    const isOfflineMode = userInfo && JSON.parse(userInfo).mangLuoi === 'OFFLINE';

    // Kiểm tra token trước khi tìm kiếm (trừ khi đang ở chế độ ngoại tuyến)
    const token = this.ssmv2Service.getToken();
    if (!token && !isOfflineMode) {
      // Tự động mở form đăng nhập mà không hiển thị thông báo
      this.getCaptcha();
      this.isLoginVisible = true;
      return;
    }

    // Bắt đầu tìm kiếm
    this.isSearching = true;
    
    // Hiển thị loading
    const msgId = this.message.loading('Đang tìm kiếm thông tin...', { nzDuration: 0 }).messageId;
    
    // Nếu đang ở chế độ ngoại tuyến, tạo dữ liệu mẫu
    if (isOfflineMode) {
      setTimeout(() => {
        this.isSearching = false;
        this.message.remove(msgId);
        
        // Tạo dữ liệu mẫu dựa trên mã số BHXH
        const mockData = this.createMockData(maSoBHXH);
        this.processSearchResult(mockData);
        this.message.success('Tìm kiếm thông tin thành công (chế độ ngoại tuyến)!');
      }, 1500); // Giả lập độ trễ mạng
      return;
    }
    
    // Gọi API tìm kiếm
    this.keKhaiBHXHService.searchBHXH(maSoBHXH).subscribe({
      next: (response: SearchResponse) => {
        this.isSearching = false;
        this.message.remove(msgId);
        
        if (response.success && response.data) {
          // Xử lý dữ liệu trả về
          const fixedData = this.fixDiaChiData(response.data);
          this.processSearchResult(fixedData);
          this.message.success('Tìm kiếm thông tin thành công!');
        } else {
          this.message.error(response.message || 'Không tìm thấy thông tin!');
        }
      },
      error: (error: any) => {
        this.isSearching = false;
        this.message.remove(msgId);
        
        if (error.status === 401) {
          this.message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          this.getAccessToken();
        } else {
          this.message.error('Lỗi khi tìm kiếm: ' + (error.error?.message || error.message || 'Không xác định'));
        }
      }
    });
  }

  // Tạo dữ liệu mẫu cho chế độ ngoại tuyến
  createMockData(maSoBHXH: string): any {
    // Tạo họ tên ngẫu nhiên
    const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
    const tenDem = ['Văn', 'Thị', 'Đức', 'Minh', 'Quang', 'Thanh', 'Hồng', 'Thành', 'Đình', 'Xuân'];
    const ten = ['Anh', 'Hùng', 'Hương', 'Thảo', 'Nam', 'Linh', 'Tuấn', 'Hà', 'Phương', 'Tùng'];
    
    const randomHo = ho[Math.floor(Math.random() * ho.length)];
    const randomTenDem = tenDem[Math.floor(Math.random() * tenDem.length)];
    const randomTen = ten[Math.floor(Math.random() * ten.length)];
    
    const hoTen = `${randomHo} ${randomTenDem} ${randomTen}`;
    
    // Tạo ngày sinh ngẫu nhiên (từ 1960 đến 2000)
    const year = Math.floor(Math.random() * (2000 - 1960) + 1960);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const ngaySinh = new Date(year, month - 1, day);
    
    // Tạo CCCD ngẫu nhiên (12 số)
    let cccd = '';
    for (let i = 0; i < 12; i++) {
      cccd += Math.floor(Math.random() * 10).toString();
    }
    
    // Tạo giới tính ngẫu nhiên
    const gioiTinh = Math.random() > 0.5 ? 'Nam' : 'Nữ';
    
    // Tạo số điện thoại ngẫu nhiên
    let soDienThoai = '0';
    for (let i = 0; i < 9; i++) {
      soDienThoai += Math.floor(Math.random() * 10).toString();
    }
    
    // Trả về dữ liệu mẫu
    return {
      ma_so_bhxh: maSoBHXH,
      ho_ten: hoTen,
      ngay_sinh: ngaySinh,
      gioi_tinh: gioiTinh,
      cccd: cccd,
      so_dien_thoai: soDienThoai,
      dia_chi: {
        ma_tinh: '01',
        ten_tinh: 'Thành phố Hà Nội',
        ma_huyen: '001',
        ten_huyen: 'Quận Ba Đình',
        ma_xa: '00001',
        ten_xa: 'Phường Phúc Xá',
        dia_chi_chi_tiet: 'Số 123, đường ABC'
      }
    };
  }

  // Thêm phương thức lấy token
  getAccessToken(): void {
    console.log('Yêu cầu xác thực');
    this.isLoginVisible = true;
    
    // Đặt lại giá trị mặc định cho form đăng nhập
    this.loginForm.patchValue({
      userName: '884000_xa_tli_phuoclt',
      password: '123456d@D',
      text: ''
    });
    
    // Lấy captcha
    this.getCaptcha();
  }

  getCaptcha(): void {
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        console.log('Captcha response:', res);
        if (res && res.data) {
          // Đảm bảo dữ liệu hình ảnh có định dạng đúng
          // Kiểm tra xem dữ liệu hình ảnh đã có tiền tố data:image chưa
          if (res.data.image && !res.data.image.startsWith('data:image')) {
            this.captchaImage = 'data:image/png;base64,' + res.data.image;
          } else {
            this.captchaImage = res.data.image;
          }
          this.captchaCode = res.data.code;
          console.log('Captcha image URL:', this.captchaImage);
        } else {
          console.warn('Không nhận được dữ liệu captcha từ server, sử dụng captcha dự phòng');
          this.generateFallbackCaptcha();
          this.message.warning('Không thể kết nối đến máy chủ BHXH. Đang sử dụng captcha dự phòng.');
        }
      },
      error: (err) => {
        console.error('Captcha error:', err);
        console.warn('Lỗi khi lấy captcha từ server, sử dụng captcha dự phòng');
        this.generateFallbackCaptcha();
        this.message.warning('Không thể kết nối đến máy chủ BHXH. Đang sử dụng captcha dự phòng.');
      }
    });
  }

  handleLogin(): void {
    // Đánh dấu trường captcha là đã chạm vào để hiển thị lỗi
    const textControl = this.loginForm.get('text');
    if (textControl && textControl.invalid) {
      textControl.markAsTouched();
    }

    // Kiểm tra tính hợp lệ của trường captcha
    if (textControl && textControl.valid) {
      this.loadingLogin = true;
      
      // Kiểm tra xem có đang sử dụng captcha dự phòng không
      const userInput = this.loginForm.get('text')?.value;
      const isFallbackCaptcha = this.captchaImage && this.captchaImage.startsWith('data:image/png;base64,') && !this.captchaImage.includes('iVBORw0KGgoAAAANSUhEUgAAASwAAABs');
      
      if (isFallbackCaptcha) {
        // Nếu đang sử dụng captcha dự phòng, kiểm tra trực tiếp
        if (userInput.toUpperCase() === this.captchaCode) {
          // Xác thực thành công với captcha dự phòng
          this.loadingLogin = false;
          this.message.success('Xác thực thành công (chế độ ngoại tuyến)');
          this.isLoginVisible = false;
          
          // Lưu thông tin đăng nhập tạm thời
          const userInfo = {
            userName: this.loginForm.get('userName')?.value,
            name: 'Người dùng ngoại tuyến',
            mangLuoi: 'OFFLINE',
            donViCongTac: 'Chế độ ngoại tuyến',
            chucDanh: 'Người dùng'
          };
          localStorage.setItem('ssmv2_user_info', JSON.stringify(userInfo));
          
          // Đảm bảo token đã được lưu trước khi tìm kiếm
          setTimeout(() => {
            if (this.form.get('ma_so_bhxh')?.value) {
              console.log('Thực hiện tìm kiếm sau khi xác thực thành công (chế độ ngoại tuyến)');
              this.searchBHXH();
            }
          }, 2000);
        } else {
          this.loadingLogin = false;
          this.message.error('Mã xác thực sai');
          this.loginForm.patchValue({ text: '' });
          this.generateFallbackCaptcha();
        }
        return;
      }
      
      // Xử lý đăng nhập bình thường với server
      const data = {
        grant_type: 'password',
        userName: this.loginForm.get('userName')?.value,
        password: this.loginForm.get('password')?.value,
        text: this.loginForm.get('text')?.value,
        code: this.captchaCode,
        clientId: 'ZjRiYmI5ZTgtZDcyOC00ODRkLTkyOTYtMDNjYmUzM2U4Yjc5',
        isWeb: true
      };

      console.log('Gửi request xác thực với data:', { ...data, password: '***' });

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
                console.log('Thực hiện tìm kiếm sau khi xác thực thành công');
                this.searchBHXH();
              }
            }, 2000); // Tăng thời gian chờ lên 2 giây
          } else {
            this.message.error('Không nhận được token');
            this.getCaptcha();
          }
        },
        error: (err) => {
          console.error('Lỗi xác thực:', err);
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
      this.message.warning('Vui lòng nhập mã xác nhận!');
    }
  }

  handleLoginCancel(): void {
    this.isLoginVisible = false;
    // Chỉ reset trường text, giữ nguyên tài khoản và mật khẩu mặc định
    this.loginForm.patchValue({
      text: ''
    });
  }

  // Tạo captcha dự phòng trong trường hợp không thể kết nối đến máy chủ
  generateFallbackCaptcha(): void {
    // Tạo mã captcha ngẫu nhiên gồm 6 ký tự
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captchaCode = '';
    for (let i = 0; i < 6; i++) {
      captchaCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.captchaCode = captchaCode;
    
    // Tạo hình ảnh captcha đơn giản
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Vẽ nền
      ctx.fillStyle = '#f0f2f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Vẽ text
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#1890ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Thêm hiệu ứng nhiễu
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }
      
      // Vẽ text với hiệu ứng nghiêng
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.2);
      ctx.fillText(captchaCode, 0, 0);
      ctx.restore();
      
      // Chuyển canvas thành base64 image
      this.captchaImage = canvas.toDataURL('image/png');
    }
    
    console.log('Đã tạo captcha dự phòng:', captchaCode);
  }

  convertToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperCaseValue = input.value.toUpperCase();
    
    if (input.value !== upperCaseValue) {
      input.value = upperCaseValue;
      this.loginForm.get('text')?.setValue(upperCaseValue, { emitEvent: false });
    }
  }

  // Phương thức để tải danh sách huyện theo tỉnh
  loadHuyensByTinh(maTinh: string): void {
    if (!maTinh) return;
    
    this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
      next: (huyens: DanhMucHuyen[]) => {
        this.danhMucHuyens = huyens;
        console.log(`Đã tải ${huyens.length} huyện của tỉnh ${maTinh}`);
      },
      error: (error: any) => {
        console.error('Lỗi khi tải danh sách huyện:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách huyện');
      }
    });
  }

  // Phương thức để tính số tiền cần đóng
  calculateSoTienCanDong(): void {
    const mucThuNhap = this.form.get('muc_thu_nhap')?.value || 0;
    const tyLeDong = this.form.get('ty_le_dong')?.value || 0;
    const tyLeNSNN = this.form.get('ty_le_nsnn')?.value || 0;
    
    // Tính tiền hỗ trợ
    const tienHoTro = Math.round((mucThuNhap * tyLeNSNN) / 100);
    
    // Tính số tiền cần đóng
    const soTienCanDong = Math.round((mucThuNhap * tyLeDong) / 100) - tienHoTro;
    
    // Cập nhật form
    this.form.patchValue({
      tien_ho_tro: tienHoTro,
      so_tien_can_dong: soTienCanDong
    });
    
    console.log('Đã tính toán số tiền:', {
      mucThuNhap,
      tyLeDong,
      tyLeNSNN,
      tienHoTro,
      soTienCanDong
    });
  }

  // Phương thức định dạng ngày tháng
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    // Kiểm tra nếu dateString đã ở định dạng yyyy-MM-dd
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      console.log('Parsed date from yyyy-MM-dd:', date);
      return date.toISOString().split('T')[0];
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`;
  }

  // Phương thức để xử lý các sự kiện thay đổi giá trị form
  setupFormValueChanges(): void {
    console.log('Thiết lập các sự kiện theo dõi thay đổi của form');
    
    // Không cần thiết lập sự kiện cho tinh_nkq và huyen_nkq vì đã có onTinhChange và onHuyenChange
    // Chỉ thiết lập sự kiện cho các trường khác
    
    // Xử lý khi thay đổi mức thu nhập hoặc tỷ lệ đóng
    this.form.get('muc_thu_nhap')?.valueChanges.subscribe(() => {
      this.calculateSoTienCanDong();
      this.tinhSoTienPhaiDong(); // Gọi phương thức cũ nếu cần
    });

    this.form.get('ty_le_dong')?.valueChanges.subscribe(() => {
      this.calculateSoTienCanDong();
      this.tinhSoTienPhaiDong(); // Gọi phương thức cũ nếu cần
    });

    this.form.get('ty_le_nsnn')?.valueChanges.subscribe(() => {
      this.calculateSoTienCanDong();
      this.tinhSoTienPhaiDong(); // Gọi phương thức cũ nếu cần
    });

    this.form.get('phuong_thuc_dong')?.valueChanges.subscribe(() => {
      this.tinhSoTienPhaiDong(); // Gọi phương thức cũ
    });

    // Theo dõi thay đổi loại NSNN
    this.form.get('loai_nsnn')?.valueChanges.subscribe(loaiNSNN => {
      // Cập nhật tỷ lệ NSNN dựa trên loại NSNN
      let tyLeNSNN = 0;
      if (loaiNSNN === 'ngheo') {
        tyLeNSNN = 30;
      } else if (loaiNSNN === 'can_ngheo') {
        tyLeNSNN = 25;
      } else if (loaiNSNN === 'khac') {
        tyLeNSNN = 10;
      }
      
      this.form.patchValue({
        ty_le_nsnn: tyLeNSNN
      });
      
      // Tính lại số tiền cần đóng
      this.calculateSoTienCanDong();
      
      // Gọi phương thức cũ nếu cần
      this.onLoaiNSNNChange(loaiNSNN);
    });

    // Theo dõi thay đổi phương án
    this.form.get('phuong_an')?.valueChanges.subscribe(phuongAn => {
      this.onPhuongAnChange(phuongAn);
    });
  }

  // Phương thức để kiểm tra và sửa lỗi dữ liệu tỉnh, huyện, xã
  fixDiaChiData(data: any): any {
    // Clone dữ liệu để không ảnh hưởng đến dữ liệu gốc
    const fixedData = { ...data };
    
    // Kiểm tra mã tỉnh
    if (!fixedData.maTinhKs) {
      console.log('Không tìm thấy mã tỉnh trong dữ liệu API');
      
      // Thử tìm mã tỉnh từ danh sách tỉnh nếu có
      if (this.danhMucTinhs.length > 0) {
        // Nếu có mã huyện, thử tìm mã tỉnh từ mã huyện
        if (fixedData.maHuyenKs) {
          console.log('Tìm mã tỉnh từ mã huyện:', fixedData.maHuyenKs);
          const huyen = this.danhMucHuyens.find(h => h.ma === fixedData.maHuyenKs);
          if (huyen) {
            console.log('Đã tìm thấy mã tỉnh từ huyện:', huyen.ma_tinh);
            fixedData.maTinhKs = huyen.ma_tinh;
          }
        }
      }
    }
    
    // Nếu vẫn không có mã tỉnh, gán giá trị mặc định
    if (!fixedData.maTinhKs) {
      console.log('Không thể tìm thấy mã tỉnh, sử dụng giá trị mặc định');
      // Sử dụng mã tỉnh đầu tiên trong danh sách (nếu có)
      if (this.danhMucTinhs.length > 0) {
        fixedData.maTinhKs = this.danhMucTinhs[0].ma;
      }
    }
    
    // Kiểm tra và chuyển đổi các giá trị khác
    if (fixedData.phuongThuc && typeof fixedData.phuongThuc === 'string') {
      // Chuyển đổi phuongThuc từ chuỗi sang số nếu có thể
      const phuongThucNum = parseInt(fixedData.phuongThuc);
      if (!isNaN(phuongThucNum)) {
        fixedData.phuongThuc = phuongThucNum;
      }
    }
    
    // Đảm bảo các giá trị số là số
    if (fixedData.mucThuNhap && typeof fixedData.mucThuNhap === 'string') {
      fixedData.mucThuNhap = parseFloat(fixedData.mucThuNhap);
    }
    
    if (fixedData.tongTien && typeof fixedData.tongTien === 'string') {
      fixedData.tongTien = parseFloat(fixedData.tongTien);
    }
    
    if (fixedData.tienHoTro && typeof fixedData.tienHoTro === 'string') {
      fixedData.tienHoTro = parseFloat(fixedData.tienHoTro);
    }
    
    console.log('Dữ liệu sau khi sửa:', fixedData);
    return fixedData;
  }

  // Phương thức để xử lý dữ liệu từ API
  private processSearchResult(data: any): void {
    try {
      console.log('Processing search result:', data);
      
      // Log để kiểm tra giá trị giới tính từ API
      console.log('Giới tính từ API:', data.gioiTinh);
      
      // Kiểm tra và ghi log mã hộ gia đình từ API
      console.log('Mã hộ gia đình từ API:', data.maHoGiaDinh);
      
      // Xử lý dữ liệu cơ bản
      const processedData = {
        ...data,
        ngaySinh: this.parseDate(data.ngaySinh),
        gioiTinh: data.gioiTinh, // Giữ nguyên giá trị gốc
        thangBatDau: this.parseDate(data.thangBatDau),
        phuongThuc: parseInt(data.phuongThuc),
        mucThuNhap: parseFloat(data.mucThuNhap),
        tongTien: parseFloat(data.tongTien),
        tienHoTro: parseFloat(data.tienHoTro),
        maHoGiaDinh: data.maHoGiaDinh || '',
        maDanToc: data.danToc
      };

      // Format thangBatDau thành yyyy-MM
      if (processedData.thangBatDau) {
        const date = new Date(processedData.thangBatDau);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        
        // Tạo chuỗi yyyy-MM
        const formattedDate = `${year}-${formattedMonth}`;
        
        console.log('Tháng bắt đầu đã được format:', formattedDate);
        
        // Lưu lại giá trị đã format
        processedData.thangBatDauFormatted = formattedDate;
      }
      
      // Cập nhật form với dữ liệu cơ bản
      const formData = {
        ma_so_bhxh: processedData.maSoBHXH,
        cccd: processedData.cmnd,
        ho_ten: processedData.hoTen,
        ngay_sinh: processedData.ngaySinh,
        gioi_tinh: processedData.gioiTinh === 1 || processedData.gioiTinh === '1' ? 'Nam' : 'Nữ',
        so_dien_thoai: processedData.dienThoaiLh,
        muc_thu_nhap: processedData.mucThuNhap,
        phuong_an: processedData.phuongAn,
        phuong_thuc_dong: processedData.phuongThuc,
        thang_bat_dau: processedData.thangBatDau,
        ty_le_dong: 22,
        tien_ho_tro: processedData.tienHoTro,
        so_tien_can_dong: processedData.tongTien,
        ma_hgd: processedData.maHoGiaDinh || '',
        ma_dan_toc: processedData.maDanToc || ''
      };

      console.log('Giới tính sau khi xử lý:', formData.gioi_tinh);
      
      this.form.patchValue(formData);

      // Xử lý địa chỉ
      if (processedData.maTinhKs) {
        this.form.patchValue({ ma_tinh: processedData.maTinhKs });
        
        // Load danh sách huyện
        this.diaChiService.getDanhMucHuyenByMaTinh(processedData.maTinhKs).subscribe({
          next: (huyens) => {
            this.danhMucHuyens = huyens;
            if (processedData.maHuyenKs) {
              this.form.patchValue({ ma_huyen: processedData.maHuyenKs });
              
              // Load danh sách xã
              this.diaChiService.getDanhMucXaByMaHuyen(processedData.maHuyenKs).subscribe({
                next: (xas) => {
                  this.danhMucXas = xas;
                  if (processedData.maXaKs) {
                    this.form.patchValue({ ma_xa: processedData.maXaKs });
                  }
                }
              });
            }
          }
        });
      }

      // Tính toán các giá trị liên quan
      this.tinhSoTienPhaiDong();

    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu từ API:', error);
      this.message.error('Có lỗi xảy ra khi xử lý dữ liệu');
    }
  }

  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    
    console.log('Parsing date:', dateStr);
    
    try {
      if (typeof dateStr === 'string') {
        // Xử lý định dạng yyyy-MM-dd hoặc yyyy-MM
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            // Định dạng yyyy-MM-dd
            const [year, month, day] = parts;
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            console.log('Parsed date from yyyy-MM-dd:', date);
            return date;
          } else if (parts.length === 2) {
            // Định dạng yyyy-MM
            const [year, month] = parts;
            // Tạo đối tượng Date với ngày 1
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            console.log('Parsed date from yyyy-MM:', date);
            return date;
          }
        }
        
        // Xử lý định dạng dd/MM/yyyy hoặc MM/yyyy
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Định dạng dd/MM/yyyy
            const [day, month, year] = parts;
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            console.log('Parsed date from dd/MM/yyyy:', date);
            return date;
          } else if (parts.length === 2) {
            // Định dạng MM/yyyy
            const [month, year] = parts;
            // Tạo đối tượng Date với ngày 1
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            console.log('Parsed date from MM/yyyy:', date);
            return date;
          }
        }
        
        // Xử lý timestamp
        const timestamp = parseInt(dateStr);
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp);
          console.log('Parsed date from timestamp:', date);
          return date;
        }
      }
      
      // Thử parse trực tiếp
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        console.log('Parsed date directly:', date);
        return date;
      }
      
      console.log('Failed to parse date');
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  private parseGioiTinh(gioiTinh: any): string | null {
    if (gioiTinh === null || gioiTinh === undefined) return null;
    
    if (typeof gioiTinh === 'number') {
      return gioiTinh === 1 ? 'Nam' : 'Nữ';
    }
    
    if (typeof gioiTinh === 'string') {
      const gioiTinhLower = gioiTinh.toLowerCase();
      if (['nam', 'male', '1'].includes(gioiTinhLower)) return 'Nam';
      if (['nữ', 'nu', 'female', '0'].includes(gioiTinhLower)) return 'Nữ';
    }
    
    return null;
  }
} 