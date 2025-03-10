import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { NzSelectModule, NzFilterOptionType } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { KeKhaiBHYT, KeKhaiBHYTService, ThongTinThe, DanhMucCSKCB } from '../../services/ke-khai-bhyt.service';
import { DotKeKhai, DotKeKhaiService } from '../../services/dot-ke-khai.service';
import { DiaChiService, DanhMucTinh, DanhMucHuyen, DanhMucXa } from '../../services/dia-chi.service';
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
  DeleteOutline,
  ReloadOutline,
  ApartmentOutline,
  CalendarOutline,
  IdcardOutline,
  SearchOutline,
  CopyOutline // Thêm icon Copy
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { DonViService, DonVi } from '../../services/don-vi.service';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CCCDService } from '../../services/cccd.service';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import * as XLSX from 'xlsx';
import * as docx from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import Docxtemplater from 'docxtemplater';
import { AuthService } from '../../services/auth.service';
import { SSMV2Service } from '../../services/ssmv2.service';
import { BienLaiService, BienLai } from '../../services/bien-lai.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';

registerLocaleData(vi);

interface NoiNhanHoSo {
  diaChi?: string;
  tinh?: string;
  huyen?: string;
  xa?: string;
}

// Thêm interface để định nghĩa kiểu dữ liệu cho giới tính
type GioiTinh = 'Nam' | 'Nữ';

// Thêm các biến mới để lưu kết quả tìm kiếm
interface SearchResult {
  maSoBHXH: string;
  status: 'success' | 'error';
  message: string;
}

// Thêm interface để định nghĩa kiểu dữ liệu cho thông tin CCCD
interface ThongTinCCCD {
  id: string;                    // Số CCCD
  id_prob: string;              // Độ chính xác số CCCD
  name: string;                 // Họ và tên
  name_prob: string;            // Độ chính xác họ tên
  dob: string;                  // Ngày sinh
  dob_prob: string;             // Độ chính xác ngày sinh
  sex: string;                  // Giới tính
  sex_prob: string;             // Độ chính xác giới tính
  nationality: string;          // Quốc tịch
  nationality_prob: string;     // Độ chính xác quốc tịch
  home: string;                 // Quê quán
  home_prob: string;            // Độ chính xác quê quán
  address: string;              // Địa chỉ thường trú
  address_prob: string;         // Độ chính xác địa chỉ
  doe: string;                  // Ngày hết hạn
  doe_prob: string;             // Độ chính xác ngày hết hạn
  overall_score: string;        // Điểm tổng thể
  number_of_name_lines: string; // Số dòng tên
  address_entities: {           // Thông tin địa chỉ chi tiết
    province: string;           // Tỉnh/thành phố
    district: string;           // Quận/huyện
    ward: string;               // Phường/xã
    street: string;             // Đường/phố
  };
  type_new: string;             // Loại CCCD mới
  type: string;                 // Loại CCCD
}

// Thêm interface mới
interface CCCDResult {
  id: string;                    
  id_prob?: string;              
  name: string;                 
  name_prob?: string;            
  dob: string;                  
  dob_prob?: string;             
  sex: string;                  
  sex_prob?: string;             
  nationality: string;          
  nationality_prob?: string;     
  home?: string;                 
  home_prob?: string;            
  address: string;              
  address_prob?: string;         
  doe?: string;                  
  doe_prob?: string;             
  overall_score?: string;        
  number_of_name_lines?: string; 
  address_entities?: {           
    province: string;           
    district: string;           
    ward: string;               
    street?: string;             
  };
  type_new?: string;             
  type?: string;                 
  status: 'success' | 'error';
  message: string;
  checked?: boolean;
  home_address?: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
  permanent_address?: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
}

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
    DatePipe,
    NzTabsModule,
    NzUploadModule,
    NzDescriptionsModule,
    NzSpinModule,
    NzEmptyModule,
    NzToolTipModule,
    NzRadioModule,
    NzAlertModule
  ],
  templateUrl: './ke-khai-bhyt.component.html',
  styleUrls: ['./ke-khai-bhyt.component.scss']
})
export class KeKhaiBHYTComponent implements OnInit, OnDestroy {
  keKhaiBHYTs: KeKhaiBHYT[] = [];
  filteredKeKhaiBHYTs: KeKhaiBHYT[] = []; // Thêm biến để lưu kết quả lọc
  thongTinThe: ThongTinThe | null = null;
  dotKeKhai: DotKeKhai | null = null;
  loading = false;
  isVisible = false;
  isEdit = false;
  form!: FormGroup;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  selectedIds: number[] = [];
  dotKeKhaiId: number = 0;
  isAllChecked = false;
  isIndeterminate = false;
  loadingApDung = false;
  danhMucTinhs: DanhMucTinh[] = [];
  danhMucHuyens: DanhMucHuyen[] = [];
  danhMucXas: DanhMucXa[] = [];
  danhMucCSKCBs: DanhMucCSKCB[] = [];
  danhMucHuyenKS: DanhMucHuyen[] = [];
  danhMucXaKS: DanhMucXa[] = [];
  donViName: string = '';
  private donViCache: DonVi[] = [];
  isSearchMultipleVisible = false;
  isSearchingMultiple = false;
  multipleSearchText = '';
  multipleSearchNguoiThu: number = 1;
  multipleSearchSoThangDong: number = 3;
  // Thêm biến để lưu bệnh viện được chọn
  multipleSearchBenhVien: string = '';

  // Thêm biến lọc số tháng đóng
  filterSoThangDong: number | null = null;
  // Thêm biến lọc người thứ
  filterNguoiThu: number | null = null;
  // Danh sách các lựa chọn số tháng đóng phổ biến
  soThangDongOptions: number[] = [1, 3, 6, 12];
  // Danh sách các lựa chọn người thứ
  nguoiThuOptions: number[] = [1, 2, 3, 4, 5];

  // Thêm các biến thống kê
  thongKe = {
    daoHan: 0,
    tangMoi: 0,
    dungDong: 0,
    tongSoTien: 0,
    tongSoThe: 0
  };

  isSearchResultVisible = false;
  searchResults: SearchResult[] = [];
  isQuetCCCDVisible = false;
  loadingQuetCCCD = false;
  avatarUrl?: string;
  thongTinCCCD: ThongTinCCCD | null = null;

  avatarUrls: string[] = [];
  currentImageIndex = 0;
  danhSachCCCD: CCCDResult[] = [];
  pendingFiles: File[] = [];

  // Thêm thuộc tính mới
  applyPermanentAddress = true;
  applyHomeAddress = false;

  // Thêm biến để theo dõi trạng thái loading khi lưu
  loadingSave = false;
  loadingGui = false;

  // Thêm các thuộc tính cho modal nhập nhanh
  isQuickInputVisible = false;
  isProcessing = false;
  quickInputText = '';

  accessToken: string = '';
  loadingToken = false;

  isLoginVisible = false;
  captchaImage = '';
  captchaCode = '';
  loginForm: FormGroup;
  loadingLogin = false;

  // Thêm thuộc tính mới
  isHoGiaDinh = false; // Thêm biến để theo dõi chế độ Hộ gia đình

  // Thêm các biến cache để lưu trữ dữ liệu đã tải
  private tinhCache: Map<string, any[]> = new Map(); // Cache danh sách tỉnh
  private huyenCache: Map<string, any[]> = new Map(); // Cache danh sách huyện theo mã tỉnh
  private xaCache: Map<string, any[]> = new Map(); // Cache danh sách xã theo mã huyện

  // Thêm các hằng số để lưu trữ cache
  private readonly TINH_CACHE_KEY = 'bhyt_tinh_cache';
  private readonly HUYEN_CACHE_PREFIX = 'bhyt_huyen_cache_';
  private readonly XA_CACHE_PREFIX = 'bhyt_xa_cache_';

  // Thêm biến theo dõi đã tải dữ liệu hay chưa
  private dataInitialized = false;

  // Thêm biến locale cho DatePicker
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

  // Thêm biến countries cho danh sách quốc tịch
  countries = [
    { ma: 'VN', ten: 'Việt Nam' },
    { ma: 'US', ten: 'Hoa Kỳ' },
    { ma: 'CN', ten: 'Trung Quốc' },
    { ma: 'JP', ten: 'Nhật Bản' },
    { ma: 'KR', ten: 'Hàn Quốc' },
    { ma: 'GB', ten: 'Anh' },
    { ma: 'FR', ten: 'Pháp' },
    { ma: 'DE', ten: 'Đức' },
    { ma: 'SG', ten: 'Singapore' },
    { ma: 'TH', ten: 'Thái Lan' },
    { ma: 'LA', ten: 'Lào' },
    { ma: 'KH', ten: 'Campuchia' },
    { ma: 'MY', ten: 'Malaysia' },
    { ma: 'AU', ten: 'Úc' },
    { ma: 'CA', ten: 'Canada' }
  ];

  constructor(
    private keKhaiBHYTService: KeKhaiBHYTService,
    private dotKeKhaiService: DotKeKhaiService,
    private diaChiService: DiaChiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: NzI18nService,
    private iconService: NzIconService,
    private donViService: DonViService,
    private cccdService: CCCDService,
    private authService: AuthService,
    private ssmv2Service: SSMV2Service,
    private bienLaiService: BienLaiService
  ) {
    this.i18n.setLocale(vi_VN);
    this.iconService.addIcon(
      SaveOutline,
      PlusOutline,
      CloseOutline,
      EditOutline,
      DeleteOutline,
      ReloadOutline,
      ApartmentOutline,
      CalendarOutline,
      IdcardOutline,  // Thêm vào danh sách
      SearchOutline,   // Thêm vào danh sách
      CopyOutline // Thêm vào danh sách
    );
    this.initForm();
    
    // Khởi tạo form trong constructor
    this.loginForm = this.fb.group({
      userName: ['884000_xa_tli_phuoclt'], // Tài khoản mặc định
      password: ['123456d@D'], // Mật khẩu mặc định  
      text: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]] // Validate độ dài 4 ký tự
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.dotKeKhaiId = +params['id'];
      this.loadDotKeKhai();
      this.loadData();
      
      // Tải trước tất cả dữ liệu địa chính
      this.preloadAddressData();
    });

    // Load danh mục CSKCB một lần duy nhất ở đây
    this.loadDanhMucCSKCB();

    // Subscribe to changes in tinh_nkq to load huyện NKQ
    this.form.get('tinh_nkq')?.valueChanges.subscribe(maTinh => {
      if (maTinh) {
        this.loadDanhMucHuyenByMaTinh(maTinh);
      } else {
        this.danhMucHuyens = [];
        this.danhMucXas = [];
        this.form.patchValue({
          huyen_nkq: null,
          xa_nkq: null
        });
      }
    });

    // Subscribe to changes in huyen_nkq to load xã NKQ
    this.form.get('huyen_nkq')?.valueChanges.subscribe(maHuyen => {
      if (maHuyen) {
        this.loadDanhMucXaByMaHuyen(maHuyen);
      } else {
        this.danhMucXas = [];
        this.form.patchValue({
          xa_nkq: null
        });
      }
    });

    // Subscribe to changes in ma_tinh_ks to load huyện KS
    this.form.get('ma_tinh_ks')?.valueChanges.subscribe(maTinh => {
      console.log('ma_tinh_ks changed:', maTinh);
      if (maTinh) {
        // Tạo một biến riên để lưu danh sách huyện KS
        this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
          next: (huyens) => {
            this.danhMucHuyenKS = huyens.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
            console.log('Loaded huyện KS:', this.danhMucHuyenKS);
          },
          error: (error) => {
            console.error('Error loading huyện KS:', error);
            this.message.error('Có lỗi xảy ra khi tải danh sách quận/huyện KS');
          }
        });
      } else {
        this.danhMucHuyenKS = [];
        this.danhMucXaKS = [];
        this.form.patchValue({
          ma_huyen_ks: null,
          ma_xa_ks: null
        });
      }
    });

    // Subscribe to changes in ma_huyen_ks to load xã KS
    this.form.get('ma_huyen_ks')?.valueChanges.subscribe(maHuyen => {
      console.log('ma_huyen_ks changed:', maHuyen);
      if (maHuyen) {
        // Tạo một biến riên để lưu danh sách xã KS
        this.diaChiService.getDanhMucXaByMaHuyen(maHuyen).subscribe({
          next: (xas) => {
            this.danhMucXaKS = xas.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
            console.log('Loaded xã KS:', this.danhMucXaKS);
          },
          error: (error) => {
            console.error('Error loading xã KS:', error);
            this.message.error('Có lỗi xảy ra khi tải danh sách xã/phường KS');
          }
        });
      } else {
        this.danhMucXaKS = [];
        this.form.patchValue({
          ma_xa_ks: null
        });
      }
    });

    // Subscribe to changes in han_the_cu
    this.form.get('han_the_cu')?.valueChanges.subscribe(value => {
      if (value) {
        const hanTheCu = new Date(value);
        const phuongAnDong = this.checkPhuongAnDong(hanTheCu);
        this.form.patchValue({
          phuong_an_dong: phuongAnDong
        }, { emitEvent: false });
      } else {
        // Nếu không có hạn thẻ cũ -> tăng mới
        this.form.patchValue({
          phuong_an_dong: 'tang_moi'
        }, { emitEvent: false });
      }
    });

    // Subscribe cho benh_vien_kcb đang có vấn đề
    this.form.get('benh_vien_kcb')?.valueChanges.subscribe(value => {
      if (value) {
        const benhVien = this.danhMucCSKCBs.find(bv => bv.value === value);
        if (benhVien) {
          this.form.patchValue({
            ma_benh_vien: benhVien.value
          }, { emitEvent: false });
        }
      }
    });

    // Thêm subscription cho nguoi_thu và so_thang_dong
    this.form.get('nguoi_thu')?.valueChanges.subscribe(() => {
      this.capNhatSoTienCanDong();
    });

    this.form.get('so_thang_dong')?.valueChanges.subscribe(soThangDong => {
      if (soThangDong) {
        const hanTheMoiTu = this.form.get('han_the_moi_tu')?.value;
        if (hanTheMoiTu) {
          const hanTheMoiDen = this.tinhHanTheMoiDen(new Date(hanTheMoiTu), soThangDong);
          this.form.patchValue({
            han_the_moi_den: hanTheMoiDen
          }, { emitEvent: false });
        }
      }
    });

    // Subscribe to changes in ngay_bien_lai and han_the_cu
    this.form.get('ngay_bien_lai')?.valueChanges.subscribe(() => {
      this.capNhatHanThe();
    });

    // Subscribe to changes in han_the_cu
    this.form.get('han_the_cu')?.valueChanges.subscribe(() => {
      this.capNhatHanThe();
    });

    // Subscribe to changes in so_thang_dong
    this.form.get('so_thang_dong')?.valueChanges.subscribe(() => {
      this.capNhatSoTienCanDong();
    });

    // Tải danh sách tỉnh khi component được khởi tạo
    this.loadDanhMucTinh().then(() => {
      console.log('Đã tải danh sách tỉnh thành công');
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('urgentItems');
    
    // Không xóa cache địa chính để sử dụng lại cho các lần sau
    // Chỉ xóa nếu cần thiết, ví dụ khi dữ liệu quá cũ
    // this.clearAddressCache();
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      thong_tin_the_id: [null],
      ma_so_bhxh: ['', [Validators.required, Validators.maxLength(10)]],
      cccd: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      ho_ten: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      ngay_sinh: ['', [
        Validators.required,
        Validators.pattern(/^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4})$/) // Cho phép dd/MM/yyyy hoặc yyyy
      ]],
      gioi_tinh: [null, Validators.required],
      so_dien_thoai: ['', [Validators.pattern(/^(0|84)\d{9,10}$/)]],
      ma_hgd: [null],
      ma_tinh_ks: [null],
      ma_huyen_ks: [null],
      ma_xa_ks: [null],
      tinh_nkq: [null, Validators.required],
      huyen_nkq: [null, Validators.required],
      xa_nkq: [null, Validators.required],
      dia_chi_nkq: ['', Validators.required],
      benh_vien_kcb: ['', Validators.required],
      ma_benh_vien: [''],
      so_the_bhyt: [''],
      ma_dan_toc: [null],
      quoc_tich: ['VN'],
      nguoi_thu: [null, Validators.required],
      so_thang_dong: [null, Validators.required],
      phuong_an_dong: [null, Validators.required],
      han_the_cu: [null],
      han_the_moi_tu: [null, Validators.required],
      han_the_moi_den: [null, Validators.required],
      so_tien_can_dong: [null],
      ngay_bien_lai: [new Date()],
      so_bien_lai: [null], // Thêm trường so_bien_lai
      quyen_bien_lai_id: [null], // Thêm trường quyen_bien_lai_id
      trang_thai: ['chua_gui'] // Thêm trường trang_thai với giá trị mặc định
    });

    // Reset các biến trạng thái
    this.isVisible = false;
    this.isEdit = false;
    this.selectedIds = [];
    this.isAllChecked = false;
    this.isIndeterminate = false;
    this.loadingApDung = false;
    this.thongTinThe = null;
    this.loadingSave = false;
    
    // Reset các danh mục
    this.danhMucHuyens = [];
    this.danhMucXas = [];
    this.danhMucHuyenKS = [];
    this.danhMucXaKS = [];

    // Lắng nghe sự thay đổi của số tháng đóng
    this.form.get('so_thang_dong')?.valueChanges.subscribe(soThangDong => {
      if (soThangDong) {
        const hanTheMoiTu = this.form.get('han_the_moi_tu')?.value;
        if (hanTheMoiTu) {
          const hanTheMoiDen = this.tinhHanTheMoiDen(new Date(hanTheMoiTu), soThangDong);
          this.form.patchValue({
            han_the_moi_den: hanTheMoiDen
          }, { emitEvent: false });
        }
      }
    });

    // Log để kiểm tra form sau khi khởi tạo
    console.log('Form after init:', this.form);
  }

  loadDotKeKhai(): void {
    this.dotKeKhaiService.getDotKeKhai(this.dotKeKhaiId).subscribe({
      next: (data) => {
        this.dotKeKhai = data;
        // Kiểm tra cache trước khi gọi API
        if (data.don_vi_id) {
          if (this.donViCache.length > 0) {
            const donVi = this.donViCache.find(d => d.id === data.don_vi_id);
            if (donVi) {
              this.donViName = donVi.tenDonVi + (donVi.isBHYT ? ' (BHYT)' : '');
              // Nếu là DTTS, tự động set người thứ là 1
              if (this.donViName.includes('DTTS')) {
                this.form.patchValue({
                  nguoi_thu: 1
                });
              }
              return;
            }
          }

          this.donViService.getDonVis().subscribe({
            next: (donVis: DonVi[]) => {
              this.donViCache = donVis; // Lưu vào cache
              const donVi = donVis.find(d => d.id === data.don_vi_id);
              if (donVi) {
                this.donViName = donVi.tenDonVi + (donVi.isBHYT ? ' (BHYT)' : '');
                // Nếu là DTTS, tự động set người thứ là 1
                if (this.donViName.includes('DTTS')) {
                  this.form.patchValue({
                    nguoi_thu: 1
                  });
                }
              }
            },
            error: (error: Error) => {
              console.error('Error loading don vi:', error);
              this.message.error('Có lỗi xảy ra khi tải thông tin đơn vị');
            }
          });
        }
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
        // Khôi phục trạng thái urgent từ localStorage
        const urgentItems = JSON.parse(localStorage.getItem('urgentItems') || '{}');
        
        // Sắp xếp dữ liệu theo id giảm dần (mới nhất lên đầu)
        this.keKhaiBHYTs = data
          .map(item => ({
            ...item,
            is_urgent: urgentItems[item.id!] || false
          }))
          .sort((a, b) => (b.id || 0) - (a.id || 0)); // Sắp xếp theo id giảm dần
        
        // Áp dụng bộ lọc nếu có
        this.applyFilters();
          
        this.tinhThongKe();
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  // Tải danh mục tỉnh với cache
  loadDanhMucTinh(): Promise<void> {
    // Nếu đã có dữ liệu trong bộ nhớ, sử dụng luôn
    if (this.danhMucTinhs?.length > 0) {
      return Promise.resolve();
    }
    
    // Kiểm tra xem có trong localStorage không
    const cachedData = this.loadFromLocalStorage(this.TINH_CACHE_KEY);
    if (cachedData) {
      this.danhMucTinhs = cachedData;
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      this.diaChiService.getDanhMucTinh().subscribe({
        next: (tinhs) => {
          const sortedTinhs = tinhs.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
          this.danhMucTinhs = sortedTinhs;
          
          // Lưu vào localStorage
          this.saveToLocalStorage(this.TINH_CACHE_KEY, sortedTinhs);
          
          resolve();
        },
        error: (error) => {
          console.error('Lỗi khi tải danh mục tỉnh:', error);
          reject(error);
        }
      });
    });
  }

  // Tối ưu tải danh mục huyện với cache
  loadDanhMucHuyenByMaTinh(maTinh: string): Promise<void> {
    if (!maTinh) return Promise.resolve();
    
    // Kiểm tra cache trong bộ nhớ
    if (this.huyenCache.has(maTinh)) {
      this.danhMucHuyens = this.huyenCache.get(maTinh) || [];
      return Promise.resolve();
    }
    
    // Kiểm tra cache trong localStorage
    const cacheKey = this.HUYEN_CACHE_PREFIX + maTinh;
    const cachedData = this.loadFromLocalStorage(cacheKey);
    if (cachedData) {
      this.danhMucHuyens = cachedData;
      this.huyenCache.set(maTinh, cachedData);
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
        next: (huyens) => {
          const sortedHuyens = huyens.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
          this.danhMucHuyens = sortedHuyens;
          
          // Lưu vào cache và localStorage
          this.huyenCache.set(maTinh, sortedHuyens);
          this.saveToLocalStorage(cacheKey, sortedHuyens);
          
          resolve();
        },
        error: (error) => {
          console.error('Lỗi khi tải danh mục huyện:', error);
          reject(error);
        }
      });
    });
  }

  // Tối ưu tải danh mục xã với cache
  loadDanhMucXaByMaHuyen(maHuyen: string): Promise<void> {
    if (!maHuyen) return Promise.resolve();
    
    // Kiểm tra cache trong bộ nhớ
    if (this.xaCache.has(maHuyen)) {
      this.danhMucXas = this.xaCache.get(maHuyen) || [];
      return Promise.resolve();
    }
    
    // Kiểm tra cache trong localStorage
    const cacheKey = this.XA_CACHE_PREFIX + maHuyen;
    const cachedData = this.loadFromLocalStorage(cacheKey);
    if (cachedData) {
      this.danhMucXas = cachedData;
      this.xaCache.set(maHuyen, cachedData);
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      this.diaChiService.getDanhMucXaByMaHuyen(maHuyen).subscribe({
        next: (xas) => {
          const sortedXas = xas.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
          this.danhMucXas = sortedXas;
          
          // Lưu vào cache và localStorage
          this.xaCache.set(maHuyen, sortedXas);
          this.saveToLocalStorage(cacheKey, sortedXas);
          
          resolve();
        },
        error: (error) => {
          console.error('Lỗi khi tải danh mục xã:', error);
          reject(error);
        }
      });
    });
  }

  loadDanhMucCSKCB(): void {
    this.keKhaiBHYTService.getDanhMucCSKCB().subscribe({
      next: (data) => {
        this.danhMucCSKCBs = data;
        console.log('Đã load danh sách bệnh viện:', this.danhMucCSKCBs);
      },
      error: (error) => {
        console.error('Lỗi khi load danh sách bệnh viện:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách bệnh viện');
      }
    });
  }

  showModal(data?: KeKhaiBHYT): void {
    this.isVisible = true;
    this.isEdit = !!data;
    this.form.reset();

    if (data) {
      console.log('Modal data:', data);
      
      // Patch thông tin thẻ trước
      if (data.thongTinThe) {
        this.form.patchValue({
          id: data.id, // Thêm ID của kê khai
          thong_tin_the_id: data.thongTinThe.id, // Thêm ID của thông tin thẻ
          ma_so_bhxh: data.thongTinThe.ma_so_bhxh,
          cccd: data.thongTinThe.cccd,
          ho_ten: data.thongTinThe.ho_ten,
          ngay_sinh: data.thongTinThe.ngay_sinh,
          gioi_tinh: data.thongTinThe.gioi_tinh,
          so_dien_thoai: data.thongTinThe.so_dien_thoai,
          ma_hgd: data.thongTinThe.ma_hgd,
          ma_tinh_ks: data.thongTinThe.ma_tinh_ks,
          ma_huyen_ks: data.thongTinThe.ma_huyen_ks,
          ma_xa_ks: data.thongTinThe.ma_xa_ks,
          tinh_nkq: data.thongTinThe.ma_tinh_nkq,
          huyen_nkq: data.thongTinThe.ma_huyen_nkq,
          xa_nkq: data.thongTinThe.ma_xa_nkq,
          dia_chi_nkq: data.thongTinThe.dia_chi_nkq || '',
          benh_vien_kcb: data.benh_vien_kcb || data.thongTinThe.benh_vien_kcb || '',
          ma_benh_vien: data.ma_benh_vien || data.thongTinThe.ma_benh_vien || '',
          so_the_bhyt: data.thongTinThe.so_the_bhyt,
          ma_dan_toc: data.thongTinThe.ma_dan_toc,
          quoc_tich: data.thongTinThe.quoc_tich,
          nguoi_thu: data.nguoi_thu,
          so_thang_dong: data.so_thang_dong,
          phuong_an_dong: data.phuong_an_dong,
          han_the_cu: data.han_the_cu,
          han_the_moi_tu: data.han_the_moi_tu,
          han_the_moi_den: data.han_the_moi_den,
          so_tien_can_dong: data.so_tien_can_dong,
          ngay_bien_lai: data.ngay_bien_lai || new Date(),
          so_bien_lai: data.so_bien_lai, // Thêm trường so_bien_lai
          quyen_bien_lai_id: data.quyen_bien_lai_id, // Thêm trường quyen_bien_lai_id
          trang_thai: data.trang_thai // Thêm trường trang_thai
        });

        // Log để kiểm tra
        console.log('Form values after patch:', this.form.value);
      }
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isEdit = false;
    this.form.reset();
  }

  // Hàm format tên đợt theo định dạng yêu cầu
  formatTenDot(soDot: number, thang: number, nam: number): string {
    return `Đợt ${soDot} Tháng ${thang} năm ${nam}`;
  }

  handleOk(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const soTienCanDong = this.tinhSoTienCanDong(formValue.nguoi_thu, formValue.so_thang_dong);
      
      // Gán giá trị so_tien_can_dong vào form
      formValue.so_tien_can_dong = soTienCanDong;

      // Sử dụng hàm formatNgaySinh để chuyển đổi ngày sinh sang chuỗi ISO
      const ngaySinh = this.formatNgaySinh(formValue.ngay_sinh);

      // Chuyển đổi chuỗi ISO thành đối tượng Date
      const ngaySinhDate = new Date(ngaySinh);

      if (this.isEdit) {
        const keKhaiBHYTId = formValue.id;
        const thongTinTheId = formValue.thong_tin_the_id;

        if (typeof keKhaiBHYTId !== 'number' || typeof thongTinTheId !== 'number') {
          this.message.error('Không tìm thấy ID kê khai hoặc thông tin thẻ');
          this.loading = false;
          return;
        }

        // Lấy thông tin thẻ hiện tại để giữ lại các giá trị cũ
        this.keKhaiBHYTService.getThongTinTheById(thongTinTheId).subscribe({
          next: (currentThongTinThe) => {
            // Cập nhật ThongTinThe
            const updateData: ThongTinThe = {
              id: thongTinTheId,
              ma_so_bhxh: formValue.ma_so_bhxh,
              cccd: formValue.cccd,
              ho_ten: formValue.ho_ten,
              // Sử dụng ngày sinh đã được xử lý
              ngay_sinh: ngaySinhDate, // Sử dụng chuỗi ISO
              gioi_tinh: formValue.gioi_tinh,
              so_dien_thoai: formValue.so_dien_thoai || '',
              ma_hgd: formValue.ma_hgd || '',
              // Giữ lại giá trị cũ nếu form không có giá trị mới
              ma_tinh_ks: formValue.ma_tinh_ks || currentThongTinThe.ma_tinh_ks,
              ma_huyen_ks: formValue.ma_huyen_ks || currentThongTinThe.ma_huyen_ks,
              ma_xa_ks: formValue.ma_xa_ks || currentThongTinThe.ma_xa_ks,
              ma_tinh_nkq: formValue.tinh_nkq || '',
              ma_huyen_nkq: formValue.huyen_nkq || '',
              ma_xa_nkq: formValue.xa_nkq || '',
              dia_chi_nkq: formValue.dia_chi_nkq,
              benh_vien_kcb: this.getBenhVienTen(formValue.benh_vien_kcb),
              ma_benh_vien: formValue.benh_vien_kcb || '',
              nguoi_tao: this.currentUser.username,
              ngay_tao: new Date(),
              so_the_bhyt: formValue.so_the_bhyt || '',
              ma_dan_toc: formValue.ma_dan_toc || '',
              quoc_tich: formValue.quoc_tich || 'VN',
              noiNhanHoSo: {
                tinh: this.getTinhTen(formValue.tinh_nkq),
                huyen: this.getHuyenTen(formValue.huyen_nkq),
                xa: this.getXaTen(formValue.xa_nkq),
                diaChi: formValue.dia_chi_nkq
              }
            };

            // Tiếp tục với phần cập nhật
            this.keKhaiBHYTService.updateThongTinThe(thongTinTheId, updateData).subscribe({
              next: () => {
                // Lấy thông tin kê khai hiện tại để giữ lại số biên lai
                this.keKhaiBHYTService.getById(this.dotKeKhaiId, keKhaiBHYTId).subscribe({
                  next: (currentKeKhai) => {
                    // Tạo đối tượng KeKhaiBHYT với thông tin thẻ đã cập nhật
                    const keKhaiBHYTData: KeKhaiBHYT = {
                      id: keKhaiBHYTId,
                      dot_ke_khai_id: this.dotKeKhaiId,
                      thong_tin_the_id: thongTinTheId,
                      dotKeKhai: this.dotKeKhai || undefined,
                      thongTinThe: updateData,
                      nguoi_thu: formValue.nguoi_thu,
                      so_thang_dong: formValue.so_thang_dong,
                      phuong_an_dong: formValue.phuong_an_dong,
                      han_the_cu: formValue.han_the_cu ? new Date(formValue.han_the_cu) : null,
                      han_the_moi_tu: formValue.han_the_moi_tu ? new Date(formValue.han_the_moi_tu) : new Date(),
                      han_the_moi_den: formValue.han_the_moi_den ? new Date(formValue.han_the_moi_den) : new Date(),
                      tinh_nkq: this.getTinhTen(formValue.tinh_nkq),
                      huyen_nkq: this.getHuyenTen(formValue.huyen_nkq),
                      xa_nkq: this.getXaTen(formValue.xa_nkq),
                      dia_chi_nkq: formValue.dia_chi_nkq,
                      benh_vien_kcb: this.getBenhVienTen(formValue.benh_vien_kcb),
                      ma_benh_vien: formValue.benh_vien_kcb || '',
                      nguoi_tao: this.currentUser.username,
                      ngay_tao: new Date(),
                      ngay_bien_lai: formValue.ngay_bien_lai ? new Date(formValue.ngay_bien_lai) : null,
                      so_tien_can_dong: formValue.so_tien_can_dong || 0,
                      is_urgent: false,
                      so_bien_lai: currentKeKhai.so_bien_lai, // Giữ lại số biên lai từ dữ liệu hiện tại
                      quyen_bien_lai_id: currentKeKhai.quyen_bien_lai_id, // Giữ lại ID quyển biên lai từ dữ liệu hiện tại
                      trang_thai: currentKeKhai.trang_thai // Giữ lại trạng thái từ dữ liệu hiện tại
                    };

                    this.keKhaiBHYTService.update(this.dotKeKhaiId, keKhaiBHYTId, keKhaiBHYTData).subscribe({
                      next: () => {
                        this.message.success('Cập nhật thành công');
                        this.isVisible = false;
                        this.isEdit = false;
                        this.loadData();
                        this.loading = false;
                        this.loadingSave = false;
                        this.initForm();
                      },
                      error: (error) => {
                        console.error('Error updating KeKhaiBHYT:', error);
                        this.message.error('Có lỗi xảy ra khi cập nhật kê khai');
                        this.loading = false;
                        this.loadingSave = false;
                      }
                    });
                  },
                  error: (error) => {
                    console.error('Error getting current KeKhaiBHYT:', error);
                    this.message.error('Có lỗi xảy ra khi lấy thông tin kê khai hiện tại');
                    this.loading = false;
                    this.loadingSave = false;
                  }
                });
              },
              error: (error) => {
                console.error('Error updating ThongTinThe:', error);
                this.message.error('Có lỗi xảy ra khi cập nhật thông tin thẻ');
                this.loading = false;
                this.loadingSave = false;
              }
            });
          },
          error: (error) => {
            console.error('Error getting ThongTinThe:', error);
            this.message.error('Có lỗi xảy ra khi lấy thông tin thẻ');
            this.loading = false;
            this.loadingSave = false;
          }
        });
      } else {
        // Tạo mới ThongTinThe
        const thongTinTheData: ThongTinThe = {
          id: undefined,
          ma_so_bhxh: formValue.ma_so_bhxh,
          cccd: formValue.cccd,
          ho_ten: formValue.ho_ten,
          // Sử dụng ngày sinh đã được xử lý
          ngay_sinh: ngaySinhDate, // Sử dụng chuỗi ISO
          gioi_tinh: formValue.gioi_tinh,
          so_dien_thoai: formValue.so_dien_thoai || '',
          ma_hgd: formValue.ma_hgd || '',
          ma_tinh_ks: formValue.ma_tinh_ks || null,
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
          noiNhanHoSo: {
            tinh: this.getTinhTen(formValue.tinh_nkq),
            huyen: this.getHuyenTen(formValue.huyen_nkq),
            xa: this.getXaTen(formValue.xa_nkq),
            diaChi: formValue.dia_chi_nkq
          },
          ma_huyen_ks: formValue.ma_huyen_ks || null,
          ma_xa_ks: formValue.ma_xa_ks || null,
          ma_tinh_nkq: formValue.tinh_nkq || '',
          ma_huyen_nkq: formValue.huyen_nkq || '',
          ma_xa_nkq: formValue.xa_nkq || '',
          so_the_bhyt: formValue.so_the_bhyt || '',
          ma_dan_toc: formValue.ma_dan_toc || '',
          quoc_tich: formValue.quoc_tich || 'VN',
          ma_benh_vien: formValue.benh_vien_kcb || '',
        };

        // Tạo đối tượng KeKhaiBHYT
        const data: KeKhaiBHYT = {
          dot_ke_khai_id: this.dotKeKhaiId,
          thong_tin_the_id: thongTinTheData.id!,
          dotKeKhai: this.dotKeKhai || undefined,
          thongTinThe: thongTinTheData,
          nguoi_thu: formValue.nguoi_thu,
          so_thang_dong: formValue.so_thang_dong,
          phuong_an_dong: formValue.phuong_an_dong,
          han_the_cu: formValue.han_the_cu ? new Date(formValue.han_the_cu) : null,
          han_the_moi_tu: formValue.han_the_moi_tu ? new Date(formValue.han_the_moi_tu) : new Date(),
          han_the_moi_den: formValue.han_the_moi_den ? new Date(formValue.han_the_moi_den) : new Date(),
          tinh_nkq: this.getTinhTen(formValue.tinh_nkq),
          huyen_nkq: this.getHuyenTen(formValue.huyen_nkq),
          xa_nkq: this.getXaTen(formValue.xa_nkq),
          dia_chi_nkq: formValue.dia_chi_nkq,
          benh_vien_kcb: this.getBenhVienTen(formValue.benh_vien_kcb),
          ma_benh_vien: formValue.benh_vien_kcb || '',
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
          ngay_bien_lai: formValue.ngay_bien_lai ? new Date(formValue.ngay_bien_lai) : new Date(),
          so_tien_can_dong: formValue.so_tien_can_dong || 0,
          is_urgent: false, // Thêm trường này
          so_bien_lai: formValue.so_bien_lai, // Thêm trường so_bien_lai
          quyen_bien_lai_id: formValue.quyen_bien_lai_id, // Thêm trường quyen_bien_lai_id
          trang_thai: 'chua_gui' // Thêm trường trang_thai với giá trị mặc định
        };

        // Tạo mới KeKhaiBHYT
        this.keKhaiBHYTService.create(this.dotKeKhaiId, data).subscribe({
          next: (response) => {
            this.message.success('Thêm mới thành công');
            this.isVisible = false;
            this.loadData();
            this.loadingSave = false; // Reset trạng thái loading
            this.initForm(); // Thêm dòng này để làm mới form
          },
          error: (error) => {
            if (error.error && error.error.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error('Có lỗi xảy ra khi tạo mới');
            }
            this.loadingSave = false; // Reset trạng thái loading khi có lỗi
          }
        });
      }
    } else {
      if (!this.dotKeKhai) {
        this.message.error('Không tìm thấy thông tin đợt kê khai');
        this.loadingSave = false;
        return;
      }
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.loadingSave = false;
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
    // Reset mảng selectedIds
    this.selectedIds = [];
    
    // Nếu checked là true thì thêm tất cả id vào mảng selectedIds
    if (checked) {
      this.keKhaiBHYTs.forEach(item => {
        if (item.id) {
          this.selectedIds.push(item.id);
        }
      });
    }
    
    // Cập nhật trạng thái
    this.isAllChecked = checked;
    this.isIndeterminate = false;
  }

  onCCCDChecked(cccd: CCCDResult, checked: boolean): void {
    cccd.checked = checked;
    this.refreshCheckStatus();
  }

  refreshCheckStatus(): void {
    const validItems = this.danhSachCCCD.filter(cccd => cccd.status === 'success');
    const allChecked = validItems.length > 0 && validItems.every(item => item.checked);
    const allUnchecked = validItems.every(item => !item.checked);
    
    this.isAllChecked = allChecked;
    this.isIndeterminate = !allChecked && !allUnchecked;
  }

  hasSelectedCCCD(): boolean {
    return this.danhSachCCCD.some(cccd => cccd.checked && cccd.status === 'success');
  }

  async apDungNhieuCCCD(): Promise<void> {
    const selectedCCCDs = this.danhSachCCCD.filter(cccd => cccd.checked && cccd.status === 'success');
    if (selectedCCCDs.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một CCCD để áp dụng');
      return;
    }

    if (!this.applyPermanentAddress && !this.applyHomeAddress) {
      this.message.warning('Vui lòng chọn ít nhất một loại địa chỉ để áp dụng');
      return;
    }

    this.loadingApDung = true;
    try {
      for (const cccd of selectedCCCDs) {
        await this.apDungThongTin(cccd, false);
      }
      
      const addressTypes = [];
      if (this.applyPermanentAddress) addressTypes.push('địa chỉ thường trú');
      if (this.applyHomeAddress) addressTypes.push('quê quán');
      
      this.message.success(
        `Đã áp dụng thành công ${selectedCCCDs.length} CCCD với ${addressTypes.join(' và ')}`
      );
      this.isQuetCCCDVisible = false;
    } catch (error) {
      this.message.error('Có lỗi xảy ra khi áp dụng thông tin CCCD');
      console.error('Error applying multiple CCCDs:', error);
    } finally {
      this.loadingApDung = false;
    }
  }

  formatCurrency = (value: number): string => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  parseCurrency = (value: string): number => Number(value.replace(/\$\s?|(,*)/g, ''));

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

  // Hàm helper để chuyển đổi ngày tháng an toàn
  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    
    // Kiểm tra nếu chỉ là năm
    if (/^\d{4}$/.test(dateStr)) {
      const year = parseInt(dateStr);
      if (year >= 1900 && year <= new Date().getFullYear()) {
        return new Date(year, 0, 1); // Trả về ngày 1/1 của năm đó
      }
      return null;
    }
    
    // Nếu dateStr là định dạng dd/MM/yyyy
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        const date = new Date(year, month - 1, day);
        
        // Kiểm tra tính hợp lệ của ngày
        if (
          date.getDate() === day &&
          date.getMonth() === month - 1 &&
          date.getFullYear() === year &&
          date.getFullYear() >= 1900 &&
          date.getFullYear() <= new Date().getFullYear() &&
          !isNaN(date.getTime())
        ) {
          return date;
        }
      }
    }
    
    // Thử parse các định dạng khác
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date : null;
  }

  onSearchBHYT(): void {
    if (this.loading) return;
    
    const maSoBHXH = this.form.get('ma_so_bhxh')?.value;
    if (maSoBHXH && maSoBHXH.length === 10) {
      // Kiểm tra token trước khi tìm kiếm
      if (!this.ssmv2Service.getToken()) {
        // Bỏ dòng hiển thị thông báo
        // this.message.warning('Vui lòng xác thực lại để lấy token mới');
        this.getAccessToken(); // Chỉ hiển thị modal xác thực
        return;
      }

      this.loading = true;
      
      this.keKhaiBHYTService.traCuuThongTinBHYT(maSoBHXH).subscribe({
        next: async (response) => {
          if (response.success) {
            const data = response.data;
            console.log('BHYT search response:', data);

            // Kiểm tra hạn thẻ cũ
            if (data.denNgayTheCu) {
              const denNgayTheCu = this.parseDate(data.denNgayTheCu);
              if (denNgayTheCu) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const timeDiff = denNgayTheCu.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                
                if (daysDiff > 30) {
                  return new Promise((resolve) => {
                    this.modal.warning({
                      nzTitle: 'Cảnh báo',
                      nzContent: `Thẻ BHYT hiện tại còn ${daysDiff} ngày sử dụng. Bạn có muốn tiếp tục kê khai không?`,
                      nzOkText: 'Tiếp tục',
                      nzCancelText: 'Hủy',
                      nzOnOk: () => {
                        resolve(true);
                      },
                      nzOnCancel: () => {
                        this.form.reset();
                        this.loading = false;
                        resolve(false);
                      }
                    });
                  }).then((shouldContinue) => {
                    if (!shouldContinue) return;
                    this.processSearchResult(data);
                  });
                }
              }
            }

            await this.processSearchResult(data);
          } else {
            this.message.error(response.message || 'Lỗi không xác định');
          }
        },
        error: (err) => {
          console.error('Search error:', err);
          if (err.error?.error === 'Lỗi xác thực') {
            this.ssmv2Service.clearToken();
            // Bỏ dòng hiển thị thông báo
            // this.message.warning('Phiên làm việc hết hạn, vui lòng xác thực lại');
            this.getAccessToken();
          } else {
            this.message.error('Lỗi tìm kiếm: ' + (err.error?.message || 'Lỗi không xác định'));
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.message.warning('Vui lòng nhập đủ 10 số BHXH');
    }
  }

  // Thêm lại phương thức processSearchResult
  private async processSearchResult(data: any): Promise<void> {
    try {
      // Xử lý và chuyển đổi ngày tháng
      const ngaySinhDate = this.formatNgaySinh(data.ngaySinh);
      const ngaySinh = this.formatDateToString(ngaySinhDate);
      const denNgayTheCu = data.denNgayTheCu ? this.formatNgaySinh(data.denNgayTheCu) : null;

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
        benh_vien_kcb: data.maBenhVien,
        ma_benh_vien: data.maBenhVien,
        so_the_bhyt: data.soTheBHYT,
        han_the_cu: denNgayTheCu,
        ma_dan_toc: data.danToc, // Thêm mã dân tộc
        quoc_tich: data.quocTich, // Thêm quốc tịch
      });

      // Load danh sách huyện và xã tương ứng
      if (data.maTinhNkq) {
        await this.loadDanhMucHuyenByMaTinh(data.maTinhNkq);
      }
      if (data.maHuyenNkq) {
        await this.loadDanhMucXaByMaHuyen(data.maHuyenNkq);
      }

      // Tính toán phương án đóng
      const phuongAnDong = this.checkPhuongAnDong(denNgayTheCu);
      this.form.patchValue({
        phuong_an_dong: phuongAnDong
      });

      // Tính hạn thẻ mới từ
      const ngayBienLai = this.form.get('ngay_bien_lai')?.value;
      if (ngayBienLai) {
        const hanTheMoiTu = this.tinhHanTheMoiTu(new Date(ngayBienLai), denNgayTheCu);
        this.form.patchValue({
          han_the_moi_tu: hanTheMoiTu
        });
      }

      this.message.success('Đã tìm thấy thông tin BHYT');
    } catch (error) {
      console.error('Error processing search result:', error);
      this.message.error('Có lỗi xảy ra khi xử lý dữ liệu');
    }
  }

  filterOption: NzFilterOptionType = (input: string, option: { nzLabel: string | number | null; nzValue: any }): boolean => {
    if (option.nzLabel === null) return false;
    return String(option.nzLabel).toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  // Thêm phương thức để lấy tên bệnh viện từ mã
  getBenhVienTen(value: string): string {
    const benhVien = this.danhMucCSKCBs.find(bv => bv.value === value);
    return benhVien ? benhVien.ten : value;
  }

  // Thêm phương thức xử lý khi tìm kiếm bằng mã số BHXH
  searchByMaSoBHXH(): void {
    const maSoBHXH = this.form.get('ma_so_bhxh')?.value;
    if (!maSoBHXH) {
      this.message.warning('Vui lòng nhập mã số BHXH');
      return;
    }

    // Hiển thị loading
    this.loading = true;

    // Gọi API tra cứu thông tin BHYT
    this.keKhaiBHYTService.traCuuThongTinBHYT(maSoBHXH).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Thông tin BHYT:', response.data);
          
          // Cập nhật form với thông tin nhận được
          this.form.patchValue({
            ma_so_bhxh: response.data.maSoBHXH,
            ho_ten: response.data.hoTen,
            cccd: response.data.cmnd,
            so_dien_thoai: response.data.soDienThoai,
            ma_hgd: response.data.maHoGiaDinh,
            benh_vien_kcb: response.data.maBenhVien, // Cập nhật mã bệnh viện
          });

          // Log để kiểm tra
          console.log('Form sau khi cập nhật:', this.form.value);
          console.log('Mã bệnh viện nhận được:', response.data.maBenhVien);
          console.log('Danh sách bệnh viện hiện có:', this.danhMucCSKCBs);

          // Đảm bảo danh sách bệnh viện đã được load
          if (!this.danhMucCSKCBs.length) {
            this.loadDanhMucCSKCB();
          }

          this.loading = false;
        } else {
          this.message.error(response.message || 'Không tìm thấy thông tin BHYT');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Lỗi tra cứu BHYT:', error);
        this.message.error('Có lỗi xảy ra khi tra cứu thông tin BHYT');
        this.loading = false;
      }
    });
  }

  getTinhTen(maTinh: string): string {
    const tinh = this.danhMucTinhs.find(t => t.ma === maTinh);
    if (!tinh) {
      console.warn(`Không tìm thấy tỉnh với mã: ${maTinh}`);
      return maTinh; // Trả về mã nếu không tìm thấy tên
    }
    return tinh.ten;
  }

  getHuyenTen(maHuyen: string): string {
    console.log('getHuyenTen được gọi với mã:', maHuyen);
    console.log('Danh mục huyện hiện tại:', this.danhMucHuyens);
    
    const huyen = this.danhMucHuyens.find(h => h.ma === maHuyen);
    if (!huyen) {
      console.warn(`Không tìm thấy huyện với mã: ${maHuyen}`);
      return maHuyen;
    }
    return huyen.ten;
  }

  getXaTen(maXa: string): string {
    const xa = this.danhMucXas.find(x => x.ma === maXa);
    if (!xa) {
      console.warn(`Không tìm thấy xã với mã: ${maXa}`);
      return maXa; // Trả về mã nếu không tìm thấy tên
    }
    return xa.ten;
  }

  refresh(): void {
    this.loading = true;
    this.loadData();
    this.message.success('Đã làm mới dữ liệu');
  }

  // Thêm phương thức mới để hiển thị tên bệnh viện
  getBenhVienDisplay(maBenhVien: string): string {
    const benhVien = this.danhMucCSKCBs.find(bv => bv.value === maBenhVien);
    return benhVien ? benhVien.ten : maBenhVien;
  }

  // Thêm hàm tính số tiền cần đóng
  tinhSoTienCanDong(nguoiThu: number, soThangDong: number): number {
    const mucDong = 2340000 * 0.045;
    let tyLe = 1;
    
    // Kiểm tra nếu đơn vị là DTTS
    if (this.donViName.includes('DTTS')) {
      // Công thức cho DTTS: 2.340.000×4,5%×(100%−70%) x số tháng đóng
      return Math.round(mucDong * 0.3 * soThangDong); // 0.3 = 100% - 70%
    }

    // Kiểm tra nếu đơn vị là NLNN
    if (this.donViName.includes('NLNN')) {
      // Công thức cho NLNN: 2.340.000×4,5%×(100%−30%) x số tháng đóng
      return Math.round(mucDong * 0.7 * soThangDong); // 0.7 = 100% - 30%
    }
    
    // Công thức thông thường cho các đơn vị khác
    if (nguoiThu >= 1 && nguoiThu <= 5) {
      switch(nguoiThu) {
        case 1: tyLe = 1; break;
        case 2: tyLe = 0.7; break;
        case 3: tyLe = 0.6; break;
        case 4: tyLe = 0.5; break;
        case 5: tyLe = 0.4; break;
      }
    }

    return Math.round(mucDong * tyLe * soThangDong);
  }

  // Thêm hàm xử lý khi thay đổi người thứ hoặc số tháng đóng
  capNhatSoTienCanDong(): void {
    const nguoiThu = this.form.get('nguoi_thu')?.value;
    const soThangDong = this.form.get('so_thang_dong')?.value;
    
    if (nguoiThu && soThangDong) {
      const soTienCanDong = this.tinhSoTienCanDong(nguoiThu, soThangDong);
      this.form.patchValue({
        so_tien_can_dong: soTienCanDong
      }, { emitEvent: false });
    }
  }

  // Thêm hàm tính hạn thẻ mới từ
  tinhHanTheMoiTu(ngayBienLai: Date, hanTheCu: Date | null): Date {
    // Log để debug
    console.log('Tính hạn thẻ mới từ với:', {
      ngayBienLai: ngayBienLai,
      hanTheCu: hanTheCu,
      donViName: this.donViName
    });

    // Đảm bảo ngayBienLai là Date object và reset time về 00:00:00
    const ngayBL = new Date(ngayBienLai);
    ngayBL.setHours(0, 0, 0, 0);

    // Trường hợp DTTS
    if (this.donViName.includes('DTTS')) {
      // Lấy ngày đầu tháng của ngày biên lai hiện tại (không phải tháng tiếp theo)
      const result = new Date(ngayBL.getFullYear(), ngayBL.getMonth(), 1);
      console.log('DTTS - Hạn thẻ mới từ:', result);
      return result;
    }
    
    // Trường hợp HGD và NLNN
    if (this.donViName.includes('NLNN') || !this.donViName.includes('DTTS')) {
      if (!hanTheCu) {
        // Nếu không có hạn thẻ cũ, cộng 30 ngày
        const result = new Date(ngayBL.getTime());
        result.setDate(result.getDate() + 30);
        console.log('Không có hạn thẻ cũ - Hạn thẻ mới từ:', result);
        return result;
      }

      // Đảm bảo hanTheCu là Date object và reset time về 00:00:00
      const hanTC = new Date(hanTheCu);
      hanTC.setHours(0, 0, 0, 0);

      // Nếu ngày biên lai lớn hơn hạn thẻ cũ
      if (ngayBL.getTime() > hanTC.getTime()) {
        const result = new Date(ngayBL.getTime());
        result.setDate(result.getDate() + 1);
        console.log('Ngày biên lai lớn hơn hạn thẻ cũ - Hạn thẻ mới từ:', result);
        return result;
      }

      // Nếu hạn thẻ cũ lớn hơn ngày biên lai
      if (hanTC.getTime() > ngayBL.getTime()) {
        const result = new Date(hanTC.getTime());
        result.setDate(result.getDate() + 1);
        console.log('Hạn thẻ cũ lớn hơn ngày biên lai - Hạn thẻ mới từ:', result);
        return result;
      }
    }

    // Mặc định cộng 30 ngày nếu không rơi vào các trường hợp trên
    const result = new Date(ngayBL.getTime());
    result.setDate(result.getDate() + 30);
    console.log('Mặc định - Hạn thẻ mới từ:', result);
    return result;
  }

  // Cập nhật lại phương thức tính hạn thẻ mới đến
  tinhHanTheMoiDen(hanTheMoiTu: Date, soThangDong: number): Date {
    // Tạo bản sao của hanTheMoiTu để không ảnh hưởng đến ngày gốc
    const result = new Date(hanTheMoiTu);
    
    // Cộng số tháng đóng vào hạn thẻ mới từ
    result.setMonth(result.getMonth() + soThangDong);
    // Trừ đi 1 ngày
    result.setDate(result.getDate() - 1);
    
    return result;
  }

  // Thêm phương thức cập nhật hạn thẻ
  capNhatHanThe(): void {
    const ngayBienLai = this.form.get('ngay_bien_lai')?.value;
    const hanTheCu = this.form.get('han_the_cu')?.value;
    const soThangDong = this.form.get('so_thang_dong')?.value;

    if (ngayBienLai) {
      // Tính hạn thẻ mới từ
      const hanTheMoiTu = this.tinhHanTheMoiTu(new Date(ngayBienLai), hanTheCu ? new Date(hanTheCu) : null);
      
      this.form.patchValue({
        han_the_moi_tu: hanTheMoiTu
      }, { emitEvent: false });

      // Nếu có số tháng đóng thì tính hạn thẻ mới đến
      if (soThangDong) {
        const hanTheMoiDen = this.tinhHanTheMoiDen(hanTheMoiTu, soThangDong);
        this.form.patchValue({
          han_the_moi_den: hanTheMoiDen
        }, { emitEvent: false });
      }
    }
  }

  // Thêm phương thức tính tổng số tiền
  getTongSoTienCanDong(): number {
    return this.keKhaiBHYTs.reduce((total, item) => total + (item.so_tien_can_dong || 0), 0);
  }

  toggleUrgent(id: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.keKhaiBHYTService.toggleUrgent(this.dotKeKhaiId, id).subscribe({
      next: (response) => {
        // Cập nhật trạng thái trong danh sách local
        const item = this.keKhaiBHYTs.find(x => x.id === id);
        if (item) {
          item.is_urgent = response.is_urgent; // Sử dụng giá trị từ response
          // Lưu vào localStorage để duy trì trạng thái
          const urgentItems = JSON.parse(localStorage.getItem('urgentItems') || '{}');
          urgentItems[id] = response.is_urgent;
          localStorage.setItem('urgentItems', JSON.stringify(urgentItems));
        }
        this.message.success(item?.is_urgent ? 'Đã đánh dấu gấp' : 'Đã bỏ đánh dấu gấp');
      },
      error: (error) => {
        console.error('Error toggling urgent status:', error);
        this.message.error('Có lỗi xảy ra khi cập nhật trạng thái gấp');
      }
    });
  }

  getNguoiThuText(nguoiThu: number): string {
    switch (nguoiThu) {
      case 1:
        return 'Người thứ 1';
      case 2:
        return 'Người thứ 2';
      case 3:
        return 'Người thứ 3';
      case 4:
        return 'Người thứ 4';
      case 5:
        return 'Người thứ 5 trở đi';
      default:
        return '';
    }
  }

  // Thêm các hàm xử lý modal tìm kiếm nhiều mã số
  showSearchMultipleModal(): void {
    this.isSearchMultipleVisible = true;
    this.multipleSearchText = '';
    this.multipleSearchBenhVien = '';
    
    // Bỏ việc gán giá trị mặc định
    this.multipleSearchNguoiThu = null as any;
    this.multipleSearchSoThangDong = null as any;

    // Chỉ set người thứ = 1 nếu là DTTS
    if (this.donViName.includes('DTTS')) {
      this.multipleSearchNguoiThu = 1;
    }
  }

  handleSearchMultipleCancel(): void {
    this.isSearchMultipleVisible = false;
  }

  // Thêm hàm mới để tạo kê khai từ dữ liệu API
  private async createKeKhaiFromApiData(data: any): Promise<{ success: boolean; message?: string }> {
    try {
      // Kiểm tra hạn thẻ cũ
      if (data.denNgayTheCu) {
        const denNgayTheCu = this.parseDate(data.denNgayTheCu);
        if (denNgayTheCu) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const timeDiff = denNgayTheCu.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          // Nếu thẻ còn hạn sử dụng > 60 ngày
          if (daysDiff > 60) {
            return {
              success: false,
              message: `Thẻ BHYT còn ${daysDiff} ngày sử dụng (> 60 ngày). Không thể tạo kê khai.`
            };
          }
        }
      }

      // Kiểm tra và tạo danh sách các trường bị thiếu
      const missingFields = [];
      if (!data?.maSoBHXH) missingFields.push('Mã số BHXH');
      if (!data?.hoTen) missingFields.push('Họ tên');
      if (!data?.ngaySinh) missingFields.push('Ngày sinh');
      if (!data?.cmnd) missingFields.push('CCCD');
      if (!data?.maTinhNkq) missingFields.push('Tỉnh nơi khám bệnh');
      if (!data?.maHuyenNkq) missingFields.push('Huyện nơi khám bệnh');
      if (!data?.maXaNkq) missingFields.push('Xã nơi khám bệnh');

      // Nếu có trường bị thiếu (trừ giới tính), trả về thông báo chi tiết
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Thiếu thông tin: ${missingFields.join(', ')}`
        };
      }

      // Xử lý ngày sinh
      let ngaySinh: Date;
      try {
        // Thử parse theo định dạng dd/MM/yyyy
        const parts = data.ngaySinh.split('/');
        if (parts.length === 3) {
          ngaySinh = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])));
        } else {
          // Nếu không phải dd/MM/yyyy thì thử parse trực tiếp
          ngaySinh = new Date(data.ngaySinh);
        }

        if (isNaN(ngaySinh.getTime())) {
          return {
            success: false,
            message: 'Ngày sinh không hợp lệ'
          };
        }

      } catch (error) {
        return {
          success: false,
          message: 'Ngày sinh không đúng định dạng (dd/MM/yyyy)'
        };
      }

      // Xử lý và kiểm tra giới tính
      let gioiTinh: GioiTinh;
      
      // Log để debug
      console.log('Dữ liệu giới tính từ API:', {
        gioiTinh: data.gioiTinh,
        typeOf: typeof data.gioiTinh,
        sex: data.sex
      });

      try {
        if (data.gioiTinh === null || data.gioiTinh === undefined) {
          // Thử lấy từ trường sex nếu có
          if (data.sex) {
            const sexNormalized = data.sex.toString().toLowerCase().trim();
            if (['nam', 'male', '1', 'm'].includes(sexNormalized)) {
              gioiTinh = 'Nam';
            } else if (['nu', 'nữ', 'female', '2', '0', 'f'].includes(sexNormalized)) {
              gioiTinh = 'Nữ';
            } else {
              throw new Error('Không thể xác định giới tính từ trường sex');
            }
          } else {
            throw new Error('Thiếu thông tin giới tính');
          }
        } else if (typeof data.gioiTinh === 'number') {
          if ([0, 2].includes(data.gioiTinh)) {
            gioiTinh = 'Nữ';
          } else if (data.gioiTinh === 1) {
            gioiTinh = 'Nam';
          } else {
            throw new Error(`Giá trị giới tính không hợp lệ: ${data.gioiTinh}`);
          }
        } else if (typeof data.gioiTinh === 'string') {
          const gioiTinhNormalized = data.gioiTinh.toLowerCase().trim();
          if (['nam', 'male', '1', 'm', 'true'].includes(gioiTinhNormalized)) {
            gioiTinh = 'Nam';
          } else if (['nu', 'nữ', 'female', '2', '0', 'f', 'false'].includes(gioiTinhNormalized)) {
            gioiTinh = 'Nữ';
          } else {
            throw new Error(`Giá trị giới tính không hợp lệ: ${data.gioiTinh}`);
          }
        } else if (typeof data.gioiTinh === 'boolean') {
          gioiTinh = data.gioiTinh ? 'Nam' : 'Nữ';
        } else {
          throw new Error(`Không thể xử lý kiểu dữ liệu giới tính: ${typeof data.gioiTinh}`);
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Lỗi xử lý giới tính'
        };
      }

      // Log kết quả xử lý giới tính
      console.log('Giới tính sau khi xử lý:', gioiTinh);

      // Xử lý địa chỉ
      let diaChiNKQ = '';
      if (typeof data.noiNhanHoSo === 'string') {
        diaChiNKQ = data.noiNhanHoSo;
      } else if (data.noiNhanHoSo?.diaChi) {
        diaChiNKQ = data.noiNhanHoSo.diaChi;
      } else {
        diaChiNKQ = 'Chưa có địa chỉ'; // Giá trị mặc định
      }

      // Tối ưu việc tải dữ liệu địa chỉ
      if (this.danhMucTinhs.length === 0) {
        await this.loadDanhMucTinh();
      }

      if (data.maTinhNkq) {
        await this.loadDanhMucHuyenByMaTinh(data.maTinhNkq);
      }

      if (data.maHuyenNkq) {
        await this.loadDanhMucXaByMaHuyen(data.maHuyenNkq);
      }

      // Kiểm tra và log thông tin chuyển đổi
      const tinhNKQ = this.getTinhTen(data.maTinhNkq || '');
      const huyenNKQ = this.getHuyenTen(data.maHuyenNkq || '');
      const xaNKQ = this.getXaTen(data.maXaNkq || '');

      // Kiểm tra thông tin địa chỉ
      if (!tinhNKQ || !huyenNKQ || !xaNKQ) {
        const missingAddress = [];
        if (!tinhNKQ) missingAddress.push('Tỉnh');
        if (!huyenNKQ) missingAddress.push('Huyện');
        if (!xaNKQ) missingAddress.push('Xã');
        
        return {
          success: false,
          message: `Không tìm thấy thông tin ${missingAddress.join(', ')} nơi khám bệnh`
        };
      }

      // Sử dụng bệnh viện được chọn từ modal nếu có
      const maBenhVien = this.multipleSearchBenhVien || data.maBenhVien || '';

      // Tạo ThongTinThe với bệnh viện đã chọn
      const thongTinTheData: ThongTinThe = {
        ma_so_bhxh: data.maSoBHXH,
        cccd: data.cmnd || '',
        ho_ten: data.hoTen,
        ngay_sinh: ngaySinh,
        gioi_tinh: gioiTinh,
        so_dien_thoai: data.soDienThoai || '',
        ma_hgd: data.maHoGiaDinh || '',
        ma_tinh_ks: data.maTinhKS || null,
        ma_huyen_ks: data.maHuyenKS || null,
        ma_xa_ks: data.maXaKS || null,
        ma_tinh_nkq: data.maTinhNkq || '',
        ma_huyen_nkq: data.maHuyenNkq || '',
        ma_xa_nkq: data.maXaNkq || '',
        dia_chi_nkq: diaChiNKQ,
        benh_vien_kcb: this.getBenhVienTen(maBenhVien),
        ma_benh_vien: maBenhVien,
        so_the_bhyt: data.soTheBHYT || '',
        ma_dan_toc: data.danToc || '',
        quoc_tich: data.quocTich || 'VN',
        nguoi_tao: this.currentUser.username,
        ngay_tao: new Date(),
        noiNhanHoSo: {
          tinh: tinhNKQ,
          huyen: huyenNKQ,
          xa: xaNKQ,
          diaChi: diaChiNKQ
        }
      };

      try {
        // Tạo mới ThongTinThe và lấy kết quả trả về
        const createdThongTinThe = await this.keKhaiBHYTService.createThongTinThe(thongTinTheData).toPromise();

        if (!createdThongTinThe || !createdThongTinThe.id) {
          return { 
            success: false, 
            message: 'Không thể tạo thông tin thẻ' 
          };
        }

        // Tính toán các ngày tháng
        const ngayBienLai = new Date();
        
        // Xử lý hạn thẻ cũ
        let hanTheCu: Date | null = null;
        if (data.denNgayTheCu) {
          // Chuyển đổi chuỗi ngày thành Date object
          const parts = data.denNgayTheCu.split('/');
          if (parts.length === 3) {
            // Nếu ngày ở định dạng dd/MM/yyyy
            hanTheCu = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])));
          } else {
            // Thử parse trực tiếp nếu là định dạng ISO
            hanTheCu = new Date(data.denNgayTheCu);
          }

          // Kiểm tra tính hợp lệ của ngày
          if (isNaN(hanTheCu.getTime())) {
            console.warn('Hạn thẻ cũ không hợp lệ:', data.denNgayTheCu);
            hanTheCu = null; // Reset về null nếu không hợp lệ
          }
        }

        // Tính toán hạn thẻ mới
        const hanTheMoiTu = this.tinhHanTheMoiTu(ngayBienLai, hanTheCu);
        const hanTheMoiDen = this.tinhHanTheMoiDen(hanTheMoiTu, this.multipleSearchSoThangDong);
        const soTienCanDong = this.tinhSoTienCanDong(data.nguoiThu, this.multipleSearchSoThangDong);

        // Log để debug
        console.log('Thông tin ngày tháng:', {
          ngayBienLai,
          hanTheCu,
          hanTheMoiTu,
          hanTheMoiDen,
          rawDenNgayTheCu: data.denNgayTheCu
        });

        // Tạo KeKhaiBHYT
        const keKhaiBHYTData: KeKhaiBHYT = {
          dot_ke_khai_id: this.dotKeKhaiId,
          thong_tin_the_id: createdThongTinThe.id,
          dotKeKhai: this.dotKeKhai || undefined,
          thongTinThe: createdThongTinThe,
          nguoi_thu: data.nguoiThu,
          so_thang_dong: this.multipleSearchSoThangDong,
          phuong_an_dong: this.checkPhuongAnDong(hanTheCu),
          han_the_cu: hanTheCu,
          han_the_moi_tu: hanTheMoiTu,
          han_the_moi_den: hanTheMoiDen,
          tinh_nkq: tinhNKQ,
          huyen_nkq: huyenNKQ,
          xa_nkq: xaNKQ,
          dia_chi_nkq: diaChiNKQ,
          benh_vien_kcb: this.getBenhVienTen(maBenhVien),
          ma_benh_vien: maBenhVien,
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
          ngay_bien_lai: ngayBienLai,
          so_tien_can_dong: soTienCanDong,
          is_urgent: false, // Thêm trường này
          so_bien_lai: data.soBienLai || null, // Thêm trường so_bien_lai
          quyen_bien_lai_id: data.quyen_bien_lai_id, // Thêm trường quyen_bien_lai_id
          trang_thai: 'chua_gui' // Thêm trường trang_thai với giá trị mặc định
        };

        // Tạo mới kê khai
        await this.keKhaiBHYTService.create(this.dotKeKhaiId, keKhaiBHYTData).toPromise();
        return { success: true };

      } catch (error: any) {
        if (error?.status === 400) {
          return {
            success: false,
            message: error?.error?.message || 'Vui lòng kiểm tra lại thông tin'
          };
        }
        throw error; // Ném lỗi để xử lý ở catch bên ngoài
      }

    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xử lý dữ liệu'
      };
    }
  }

  // Cập nhật hàm handleSearchMultipleOk để sử dụng hàm mới
  async handleSearchMultipleOk(): Promise<void> {
    if (!this.multipleSearchText.trim()) {
      this.message.warning('Vui lòng nhập danh sách mã số BHXH');
      return;
    }

    if (!this.isHoGiaDinh && !this.multipleSearchNguoiThu) {
      this.message.warning('Vui lòng chọn người thứ');
      return;
    }

    if (!this.multipleSearchSoThangDong) {
      this.message.warning('Vui lòng chọn số tháng đóng');
      return;
    }

    this.isSearchingMultiple = true;
    this.searchResults = [];
    let loadingMessageId: string | undefined;
    
    try {
      const maSoBHXHList = this.multipleSearchText
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length === 10);

      if (maSoBHXHList.length === 0) {
        this.message.warning('Không tìm thấy mã số BHXH hợp lệ (phải có 10 số)');
        return;
      }

      const totalCount = maSoBHXHList.length;
      let successCount = 0;
      let failedCount = 0;
      let processedCount = 0;

      loadingMessageId = this.message.loading(
        `Đang xử lý 0/${totalCount} mã số BHXH...`, 
        { nzDuration: 0 }
      ).messageId;

      // Xử lý từng mã số BHXH
      for (let i = 0; i < maSoBHXHList.length; i++) {
        const maSoBHXH = maSoBHXHList[i];
        try {
          processedCount++;

          if (loadingMessageId) {
            this.message.remove(loadingMessageId);
            loadingMessageId = this.message.loading(
              `Đang xử lý ${processedCount}/${totalCount} mã số BHXH...`,
              { nzDuration: 0 }
            ).messageId;
          }

          const response = await this.keKhaiBHYTService.traCuuThongTinBHYT(maSoBHXH).toPromise();
          if (response && response.success) {
            let nguoiThu: number;
            
            if (this.isHoGiaDinh) {
              // Trong chế độ Hộ gia đình:
              // - Nếu index + 1 <= 5: gán người thứ theo index + 1
              // - Nếu index + 1 > 5: gán người thứ 5 (người thứ 5 trở đi)
              nguoiThu = (i + 1) <= 5 ? (i + 1) : 5;
            } else {
              // Trong chế độ thông thường, sử dụng người thứ được chọn
              nguoiThu = this.multipleSearchNguoiThu;
            }

            const result = await this.createKeKhaiFromApiData({
              ...response.data,
              nguoiThu: nguoiThu,
              ma_dan_toc: response.data.danToc,
              quoc_tich: response.data.quocTich
            });

            if (result.success) {
              successCount++;
              this.searchResults.push({
                maSoBHXH: this.isHoGiaDinh ? 
                  `${maSoBHXH} (${this.getNguoiThuText(nguoiThu)})` : 
                  maSoBHXH,
                status: 'success',
                message: 'Tạo kê khai thành công'
              });
            } else {
              failedCount++;
              this.searchResults.push({
                maSoBHXH: this.isHoGiaDinh ? 
                  `${maSoBHXH} (${this.getNguoiThuText(nguoiThu)})` : 
                  maSoBHXH,
                status: 'error',
                message: result.message || 'Không thể tạo kê khai'
              });
            }
          } else {
            failedCount++;
            this.searchResults.push({
              maSoBHXH,
              status: 'error',
              message: response?.message || 'Không tìm thấy thông tin BHYT'
            });
          }
        } catch (error) {
          failedCount++;
          this.searchResults.push({
            maSoBHXH,
            status: 'error',
            message: 'Lỗi khi xử lý mã số BHXH'
          });
        }
      }

      if (loadingMessageId) {
        this.message.remove(loadingMessageId);
      }

      this.message.success(`Đã xử lý ${successCount}/${totalCount} mã số BHXH thành công`);
      this.isSearchMultipleVisible = false;
      this.isSearchResultVisible = true;
      this.loadData();
    } catch (error) {
      this.message.error('Có lỗi xảy ra khi xử lý danh sách mã số BHXH');
    } finally {
      this.isSearchingMultiple = false;
      if (loadingMessageId) {
        this.message.remove(loadingMessageId);
      }
    }
  }

  handleSearchResultCancel(): void {
    this.isSearchResultVisible = false;
    this.searchResults = [];
  }

  // Thêm phương thức tính thống kê
  tinhThongKe(): void {
    // Sử dụng dữ liệu đã lọc thay vì toàn bộ dữ liệu
    const data = this.filterSoThangDong !== null ? this.filteredKeKhaiBHYTs : this.keKhaiBHYTs;
    
    this.thongKe.tongSoThe = data.length;
    this.thongKe.daoHan = data.filter(item => item.phuong_an_dong === 'dao_han').length;
    this.thongKe.tangMoi = data.filter(item => item.phuong_an_dong === 'tang_moi').length;
    this.thongKe.dungDong = data.filter(item => item.phuong_an_dong === 'dung_dong').length;
    this.thongKe.tongSoTien = data.reduce((sum, item) => sum + (item.so_tien_can_dong || 0), 0);
  }

  // Thêm các phương thức helper
  getSuccessResults(): SearchResult[] {
    return this.searchResults.filter(r => r.status === 'success');
  }

  getErrorResults(): SearchResult[] {
    return this.searchResults.filter(r => r.status === 'error');
  }

  getSuccessCount(): number {
    return this.getSuccessResults().length;
  }

  getErrorCount(): number {
    return this.getErrorResults().length;
  }

  showQuetCCCDModal(): void {
    this.isQuetCCCDVisible = true;
    this.clearImages();
    
    // Tự động focus vào modal sau khi nó được mở
    setTimeout(() => {
      const modalContent = document.querySelector('.ant-modal-content');
      if (modalContent) {
        const focusableElement = modalContent.querySelector('[tabindex="0"]') as HTMLElement;
        if (focusableElement) {
          focusableElement.focus();
        }
      }
    }, 100);
  }

  handleQuetCCCDCancel(): void {
    this.isQuetCCCDVisible = false;
    this.clearImages();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    const isLt2M = (file.size || 0) / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    this.addToPendingFiles(file as any);
    return false;
  };

  handleChange(info: { file: NzUploadFile, fileList: NzUploadFile[] }): void {
    if (info.file.status !== 'uploading') {
      console.log('File upload status changed:', info.file.status);
    }
    if (info.file.status === 'done') {
      this.message.success(`${info.file.name} đã được tải lên thành công`);
      if (info.file.originFileObj) {
        this.addToPendingFiles(info.file.originFileObj);
      }
    } else if (info.file.status === 'error') {
      this.message.error(`${info.file.name} tải lên thất bại.`);
    }
  }

  handlePaste(event: ClipboardEvent): void {
    if (!event.clipboardData) {
      return;
    }
    
    const items = event.clipboardData.items;
    let imageFound = false;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageFound = true;
        const blob = items[i].getAsFile();
        
        if (blob) {
          // Kiểm tra kích thước file
          const isLt2M = blob.size / 1024 / 1024 < 2;
          if (!isLt2M) {
            this.message.error('Ảnh phải nhỏ hơn 2MB!');
            return;
          }
          
          // Tạo tên file ngẫu nhiên
          const fileName = `pasted-image-${new Date().getTime()}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          
          this.message.success('Đã dán ảnh từ clipboard');
          this.addToPendingFiles(file);
        }
        break;
      }
    }
    
    if (!imageFound) {
      this.message.info('Không tìm thấy ảnh trong clipboard');
    }
  }

  requestPasteFromClipboard(): void {
    // Hiển thị thông báo hướng dẫn
    this.message.info('Nhấn Ctrl+V để dán ảnh từ clipboard');
    
    // Focus vào modal để nhận sự kiện paste
    const modalContent = document.querySelector('.ant-modal-content');
    if (modalContent) {
      const focusableElement = modalContent.querySelector('[tabindex="0"]') as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
    
    // Thử đọc clipboard thông qua Clipboard API (chỉ hoạt động trên HTTPS)
    if (navigator.clipboard && navigator.clipboard.read) {
      navigator.clipboard.read()
        .then(clipboardItems => {
          for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
              if (type.startsWith('image/')) {
                clipboardItem.getType(type)
                  .then(blob => {
                    const fileName = `pasted-image-${new Date().getTime()}.png`;
                    const file = new File([blob], fileName, { type });
                    this.addToPendingFiles(file);
                    this.message.success('Đã dán ảnh từ clipboard');
                  })
                  .catch(err => {
                    console.error('Lỗi khi đọc ảnh từ clipboard:', err);
                  });
                return;
              }
            }
          }
        })
        .catch(err => {
          console.log('Không thể truy cập clipboard qua API:', err);
          // Không hiển thị lỗi cho người dùng vì đây là tính năng bổ sung
        });
    }
  }

  private addToPendingFiles(file: File): void {
    console.log('Adding file to pending:', file);
    this.getBase64(file, (img: string) => {
      console.log('Generated base64 preview');
      this.avatarUrls = [...this.avatarUrls, img];
      this.pendingFiles = [...this.pendingFiles, file];
      this.currentImageIndex = this.avatarUrls.length - 1;
    });
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.avatarUrls.length - 1) {
      this.currentImageIndex++;
    }
  }

  clearImages(): void {
    this.avatarUrls = [];
    this.pendingFiles = [];
    this.currentImageIndex = 0;
    this.danhSachCCCD = [];
  }

  async quetTatCaCCCD(): Promise<void> {
    if (this.pendingFiles.length === 0) {
      this.message.warning('Vui lòng tải lên ít nhất một ảnh CCCD!');
      return;
    }

    this.loadingQuetCCCD = true;
    this.danhSachCCCD = [];

    try {
      for (const file of this.pendingFiles) {
        try {
          const response = await this.cccdService.quetCCCD(file).toPromise();
          console.log('Raw API Response:', response);

          // FPT.AI trả về dữ liệu trong response.data
          if (response && response.data && response.data.length > 0) {
            const cccdData = response.data[0];
            console.log('CCCD Data from FPT.AI:', cccdData);

            // Chuyển đổi dữ liệu từ FPT.AI sang định dạng CCCDResult
            const result: CCCDResult = {
              id: cccdData.id_number || cccdData.id || '',
              name: cccdData.name || '',
              dob: cccdData.birth_date || cccdData.dob || '',
              sex: this.formatGender(cccdData.gender || cccdData.sex || ''),
              nationality: 'Việt Nam',
              address: this.formatAddress(cccdData.residence || cccdData.address),
              home_address: {
                province: this.extractProvince(cccdData.home),
                district: this.extractDistrict(cccdData.home),
                ward: this.extractWard(cccdData.home),
                street: this.extractStreet(cccdData.home)
              },
              permanent_address: {
                province: this.extractProvince(cccdData.residence || cccdData.address),
                district: this.extractDistrict(cccdData.residence || cccdData.address),
                ward: this.extractWard(cccdData.residence || cccdData.address),
                street: this.extractStreet(cccdData.residence || cccdData.address)
              },
              status: 'success',
              message: 'Quét thành công'
            };

            console.log('Processed CCCD Result:', result);
            this.danhSachCCCD = [...this.danhSachCCCD, result];
          } else {
            const errorResult: CCCDResult = {
              id: '',
              name: '',
              dob: '',
              sex: '',
              nationality: '',
              address: '',
              status: 'error',
              message: 'Không nhận dạng được thông tin'
            };
            this.danhSachCCCD = [...this.danhSachCCCD, errorResult];
          }
        } catch (error: any) {
          console.error('Error scanning CCCD:', error);
          const errorResult: CCCDResult = {
            id: '',
            name: '',
            dob: '',
            sex: '',
            nationality: '',
            address: '',
            status: 'error',
            message: error?.error?.message || error?.message || 'Lỗi khi xử lý ảnh'
          };
          this.danhSachCCCD = [...this.danhSachCCCD, errorResult];
        }
      }

      // Cập nhật UI
      this.danhSachCCCD = [...this.danhSachCCCD];
      console.log('Final CCCD List:', this.danhSachCCCD);

      const successCount = this.danhSachCCCD.filter(cccd => cccd.status === 'success').length;
      if (successCount > 0) {
        this.message.success(`Đã quét thành công ${successCount} CCCD`);
      } else {
        this.message.error('Không thể đọc thông tin từ các ảnh đã tải lên');
      }
    } finally {
      this.loadingQuetCCCD = false;
    }
  }

  // Thêm các phương thức hỗ trợ xử lý dữ liệu
  private formatGender(gender: string): string {
    if (!gender) return '';
    const normalizedGender = gender.toUpperCase();
    if (normalizedGender.includes('NAM') || normalizedGender === 'MALE') return 'Nam';
    if (normalizedGender.includes('NỮ') || normalizedGender === 'FEMALE') return 'Nữ';
    return gender;
  }

  private formatAddress(addressData: any): string {
    if (!addressData) return '';
    const parts = [];
    
    if (typeof addressData === 'string') {
      return addressData;
    }

    if (addressData.street) parts.push(addressData.street);
    if (addressData.ward) parts.push(addressData.ward);
    if (addressData.district) parts.push(addressData.district);
    if (addressData.province) parts.push(addressData.province);

    return parts.join(', ');
  }

  private extractProvince(address?: any): string {
    if (!address) return '';
    return typeof address === 'object' ? (address.province || '').trim() : '';
  }

  private extractDistrict(address?: any): string {
    if (!address) return '';
    return typeof address === 'object' ? (address.district || '').trim() : '';
  }

  private extractWard(address?: any): string {
    if (!address) return '';
    return typeof address === 'object' ? (address.ward || '').trim() : '';
  }

  private extractStreet(address?: any): string {
    if (!address) return '';
    return typeof address === 'object' ? (address.street || '').trim() : '';
  }

  apDungThongTin(cccd: CCCDResult, closeModal: boolean = true): void {
    if (cccd.status === 'success') {
      // Cập nhật thông tin cơ bản
      this.form.patchValue({
        cccd: cccd.id,
        ho_ten: cccd.name,
        ngay_sinh: new Date(this.formatDate(cccd.dob)),
        gioi_tinh: cccd.sex === 'NAM' ? 'Nam' : 'Nữ',
        quoc_tich: cccd.nationality
      });

      // Áp dụng địa chỉ thường trú nếu được chọn
      if (this.applyPermanentAddress && cccd.permanent_address) {
        const { province, district, ward, street } = cccd.permanent_address;
        this.form.patchValue({
          dia_chi_nkq: this.formatFullAddress(cccd.permanent_address)
        });
        this.updateAddressFields(province, district, ward);
      }

      // Áp dụng quê quán nếu được chọn
      if (this.applyHomeAddress && cccd.home_address) {
        const { province, district, ward, street } = cccd.home_address;
        this.form.patchValue({
          que_quan: this.formatFullAddress(cccd.home_address)
        });
        this.updateHomeAddressFields(province, district, ward);
      }

      if (closeModal) {
        this.message.success('Đã áp dụng thông tin CCCD');
        this.isQuetCCCDVisible = false;
      }
    }
  }

  // Thêm phương thức mới để cập nhật trường quê quán
  private async updateHomeAddressFields(province: string, district: string, ward: string) {
    // Tìm mã tỉnh
    const tinh = this.danhMucTinhs.find(t => t.ten.toUpperCase().includes(province.toUpperCase()));
    if (tinh) {
      this.form.patchValue({ tinh_qq: tinh.ma });
      
      // Load và tìm mã huyện
      await this.loadDanhMucHuyenByMaTinh(tinh.ma);
      const huyen = this.danhMucHuyens.find(h => h.ten.toUpperCase().includes(district.toUpperCase()));
      if (huyen) {
        this.form.patchValue({ huyen_qq: huyen.ma });
        
        // Load và tìm mã xã
        await this.loadDanhMucXaByMaHuyen(huyen.ma);
        const xa = this.danhMucXas.find(x => x.ten.toUpperCase().includes(ward.toUpperCase()));
        if (xa) {
          this.form.patchValue({ xa_qq: xa.ma });
        }
      }
    }
  }

  // Thêm phương thức hỗ trợ format ngày
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

  // Thêm phương thức cập nhật các trường địa chỉ
  private async updateAddressFields(province: string, district: string, ward: string) {
    try {
      // Tải danh mục tỉnh nếu chưa có
      if (this.danhMucTinhs.length === 0) {
        await this.loadDanhMucTinh();
      }
      
      // Tìm mã tỉnh
      const tinh = this.danhMucTinhs.find(t => 
        t.ten.toUpperCase().includes(province.toUpperCase())
      );
      
      if (tinh) {
        // Cập nhật mã tỉnh
        this.form.patchValue({ tinh_nkq: tinh.ma });
        
        // Tải danh mục huyện sử dụng phương thức đã tối ưu
        await this.loadDanhMucHuyenByMaTinh(tinh.ma);
        
        // Tìm mã huyện
        const huyen = this.danhMucHuyens.find(h => 
          h.ten.toUpperCase().includes(district.toUpperCase())
        );
        
        if (huyen) {
          // Cập nhật mã huyện
          this.form.patchValue({ huyen_nkq: huyen.ma });
          
          // Tải danh mục xã sử dụng phương thức đã tối ưu
          await this.loadDanhMucXaByMaHuyen(huyen.ma);
          
          // Tìm mã xã
          const xa = this.danhMucXas.find(x => 
            x.ten.toUpperCase().includes(ward.toUpperCase())
          );
          
          if (xa) {
            // Cập nhật mã xã
            this.form.patchValue({ xa_nkq: xa.ma });
          }
        }
      }
    } catch (error) {
      console.error('Lỗi trong quá trình cập nhật địa chỉ:', error);
    }
  }

  // Thêm phương thức getBase64 vào class KeKhaiBHYTComponent
  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  // Thêm phương thức mới cho danh sách kê khai
  onKeKhaiChecked(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    }
    this.isAllChecked = this.keKhaiBHYTs.every(item => this.selectedIds.includes(item.id!));
  }

  // Thêm phương thức mới để format địa chỉ đầy đủ
  public formatFullAddress(address?: { province: string; district: string; ward: string; street?: string }): string {
    if (!address) return '';
    
    const parts = [];
    if (address.street?.trim()) parts.push(address.street.trim());
    if (address.ward?.trim()) parts.push(address.ward.trim());
    if (address.district?.trim()) parts.push(address.district.trim());
    if (address.province?.trim()) parts.push(address.province.trim());
    
    return parts.join(', ') || '';
  }

  // Thêm phương thức showEditForm
  showEditForm(data: KeKhaiBHYT): void {
    this.isVisible = true;
    this.isEdit = true;
    this.form.reset();

    if (data) {
      console.log('Modal data:', data);
      
      // Đảm bảo danh mục bệnh viện đã được load
      if (!this.danhMucCSKCBs || this.danhMucCSKCBs.length === 0) {
        this.keKhaiBHYTService.getDanhMucCSKCB().subscribe({
          next: (cskcbs) => {
            this.danhMucCSKCBs = cskcbs;
            // Truyền data gốc vào setFormValues
            this.setFormValues(data);
          },
          error: (error) => {
            console.error('Error loading CSKCB:', error);
            this.message.error('Có lỗi xảy ra khi tải danh sách cơ sở KCB');
          }
        });
      } else {
        // Truyền data gốc vào setFormValues
        this.setFormValues(data);
      }
    }
  }

  // Tách phần gán giá trị form ra một phương thức riêng
  private setFormValues(data: KeKhaiBHYT): void {
    if (data.thongTinThe) {
      // Xử lý ngày sinh
      let ngaySinh = '';
      if (data.thongTinThe.ngay_sinh) {
        const ngaySinhDate = this.formatNgaySinh(data.thongTinThe.ngay_sinh);
        ngaySinh = this.formatDateToString(ngaySinhDate);
      }
      
      this.form.patchValue({
        ma_so_bhxh: data.thongTinThe.ma_so_bhxh,
        cccd: data.thongTinThe.cccd,
        ho_ten: data.thongTinThe.ho_ten,
        ngay_sinh: ngaySinh,
        gioi_tinh: data.thongTinThe.gioi_tinh,
        so_dien_thoai: data.thongTinThe.so_dien_thoai,
        ma_hgd: data.thongTinThe.ma_hgd,
        ma_tinh_ks: data.thongTinThe.ma_tinh_ks,
        tinh_nkq: data.thongTinThe.ma_tinh_nkq,
        huyen_nkq: data.thongTinThe.ma_huyen_nkq,
        xa_nkq: data.thongTinThe.ma_xa_nkq,
        dia_chi_nkq: data.thongTinThe.dia_chi_nkq || '',
        // Tìm bệnh viện trong danh mục và gán value
        benh_vien_kcb: this.danhMucCSKCBs.find(bv => bv.ma === data.ma_benh_vien)?.value || '',
        so_the_bhyt: data.thongTinThe.so_the_bhyt,
        ma_dan_toc: data.thongTinThe.ma_dan_toc,
        quoc_tich: data.thongTinThe.quoc_tich
      });

      // Load danh sách huyện và xã dựa trên mã tỉnh/huyện đã chọn
      if (data.thongTinThe.ma_tinh_ks) {
        this.diaChiService.getDanhMucHuyenByMaTinh(data.thongTinThe.ma_tinh_ks).subscribe({
          next: (huyens) => {
            this.danhMucHuyenKS = huyens.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
            console.log('Loaded huyện KS:', this.danhMucHuyenKS);
          },
          error: (error) => {
            console.error('Error loading huyện KS:', error);
            this.message.error('Có lỗi xảy ra khi tải danh sách quận/huyện KS');
          }
        });
      }

      // Sửa lại cách gán giá trị cho benh_vien_kcb
      const benhVienValue = data.ma_benh_vien || data.thongTinThe.ma_benh_vien;
      
      this.form.patchValue({
        // Các trường khác giữ nguyên...
        benh_vien_kcb: benhVienValue, // Gán trực tiếp mã bệnh viện
        ma_benh_vien: benhVienValue
      });

      console.log('Bệnh viện được chọn:', {
        ma_benh_vien: benhVienValue,
        danh_sach_benh_vien: this.danhMucCSKCBs
      });
    }

    // Patch các thông tin khác
    this.form.patchValue({
      id: data.id,
      thong_tin_the_id: data.thong_tin_the_id,
      nguoi_thu: data.nguoi_thu,
      so_thang_dong: data.so_thang_dong,
      phuong_an_dong: data.phuong_an_dong,
      han_the_cu: data.han_the_cu,
      han_the_moi_tu: data.han_the_moi_tu,
      han_the_moi_den: data.han_the_moi_den,
      dia_chi_nkq: data.dia_chi_nkq,
      so_tien_can_dong: data.so_tien_can_dong,
      ngay_bien_lai: data.ngay_bien_lai || new Date(),
      so_bien_lai: data.so_bien_lai,
      quyen_bien_lai_id: data.quyen_bien_lai_id,
      trang_thai: data.trang_thai // Thêm trường trang_thai vào form
    });

    // Log để kiểm tra
    console.log('Form values after patch:', this.form.value);
  }

  getPhuongAnDongText(phuongAnDong: string): string {
    switch (phuongAnDong) {
      case 'tang_moi':
        return 'Tăng mới';
      case 'dao_han':
        return 'Đáo hạn';
      case 'dung_dong':
        return 'Dừng đóng';
      default:
        return '';
    }
  }

  getPhuongAnDongColor(phuongAnDong: string): string {
    switch (phuongAnDong) {
      case 'tang_moi':
        return 'blue';
      case 'dao_han':
        return 'green';
      case 'dung_dong':
        return 'red';
      default:
        return 'default';
    }
  }

  async xuatTK1(): Promise<void> {
    const selectedCCCDs = this.danhSachCCCD.filter(cccd => cccd.checked && cccd.status === 'success');
    if (selectedCCCDs.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một CCCD để xuất TK1');
      return;
    }

    try {
      // Tải file mẫu
      const response = await fetch('assets/templates/FileMau_TK1.docx');
      if (!response.ok) {
        throw new Error('Không tìm thấy file mẫu TK1');
      }
      const buffer = await response.arrayBuffer();

      // Xử lý từng CCCD đã chọn
      for (const cccd of selectedCCCDs) {
        const zip = new PizZip(buffer);
        const doc = new Docxtemplater().loadZip(zip);

        // Format ngày sinh
        const ngaySinh = cccd.dob ? this.formatDateForTK1(cccd.dob) : '';

        // Xử lý địa chỉ thường trú từ address
        const addressParts = this.parseAddress(cccd.address || '');
        
        // Xử lý quê quán từ home
        const homeParts = this.parseAddress(cccd.home || '');

        // Lấy ngày tháng năm hiện tại cho phần chữ ký
        const now = new Date();
        const ngay = now.getDate();
        const thang = now.getMonth() + 1;
        const nam = now.getFullYear();

        const data = {
          hoten: cccd.name || '',
          gioitinh: cccd.sex || '',
          ngaysinh: ngaySinh,
          quoctich: cccd.nationality || 'Việt Nam',
          dantoc: 'Kinh',
          cccd: cccd.id || '',
          dienthoai: '',
          email: '',
          noisinh_xa: homeParts.ward || '',
          noisinh_huyen: homeParts.district || '',
          noisinh_tinh: homeParts.province || '',
          diachi: addressParts.street || '',
          diachi_xa: addressParts.ward || '',
          diachi_huyen: addressParts.district || '',
          diachi_tinh: addressParts.province || '',
          ngay: ngay.toString(),
          thang: thang.toString(),
          nam: nam.toString(),
          noidung: 'Xin mã số'
        };

        doc.setData(data);

        try {
          doc.render();
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });

          // Tạo tên file riêng cho từng người
          const fileName = `tk1-${cccd.name}-${new Date().getTime()}.docx`;
          saveAs(out, fileName);
        } catch (error) {
          console.error(`Lỗi khi render template cho ${cccd.name}:`, error);
          this.message.error(`Có lỗi xảy ra khi tạo file TK1 cho ${cccd.name}`);
        }
      }

      this.message.success(`Đã xuất ${selectedCCCDs.length} file TK1 thành công`);
    } catch (error) {
      console.error('Lỗi xuất TK1:', error);
      this.message.error('Có lỗi xảy ra khi xuất TK1');
    }
  }

  // Thêm phương thức mới để parse địa chỉ từ chuỗi
  private parseAddress(addressStr: string): {
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  } {
    if (!addressStr) return {};

    // Tách chuỗi địa chỉ theo dấu phẩy và chuẩn hóa mỗi phần
    const parts = addressStr.split(',')
      .map(part => this.capitalizeFirstLetter(part.trim()));

    switch (parts.length) {
      case 4: // Đầy đủ: street, ward, district, province
        return {
          street: parts[0],
          ward: parts[1],
          district: parts[2],
          province: parts[3]
        };
      case 3: // Thiếu street: ward, district, province
        return {
          ward: parts[0],
          district: parts[1],
          province: parts[2]
        };
      case 2: // Chỉ có district, province
        return {
          district: parts[0],
          province: parts[1]
        };
      case 1: // Chỉ có province
        return {
          province: parts[0]
        };
      default:
        return {
          street: this.capitalizeFirstLetter(addressStr) // Chuẩn hóa cả trường hợp mặc định
        };
    }
  }

  // Cập nhật hàm format ngày tháng
  private formatDateForTK1(dateStr: string): string {
    try {
      if (!dateStr) return '';
      
      // Kiểm tra nếu đã đúng định dạng dd/MM/yyyy
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return dateStr; // Giữ nguyên nếu đã đúng định dạng
        }
      }

      // Xử lý các định dạng khác
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr; // Trả về nguyên gốc nếu không parse được
      }

      // Format về dd/MM/yyyy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr; // Trả về nguyên gốc nếu có lỗi
    }
  }

  // Thêm hàm chuẩn hóa chữ hoa đầu câu
  private capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    // Tách chuỗi thành các từ
    const words = str.toLowerCase().split(' ');
    // Viết hoa chữ cái đầu của mỗi từ
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Thêm phương thức copy thông tin
  copyThongTin(cccd: CCCDResult): void {
    if (!cccd) return;

    // Format thông tin theo yêu cầu, bỏ mã số BH ở đầu
    const thongTin = [
      cccd.name || '', // Họ và tên
      cccd.sex || '', // Giới tính
      cccd.dob || '', // Ngày tháng năm sinh
      cccd.address || '', // Địa chỉ
      cccd.id || '', // CCCD
      '' // Số điện thoại
    ].join('\t');

    // Copy vào clipboard
    navigator.clipboard.writeText(thongTin).then(() => {
      this.message.success('Đã sao chép thông tin');
    }).catch(err => {
      console.error('Lỗi khi sao chép:', err);
      this.message.error('Có lỗi xảy ra khi sao chép thông tin');
    });
  }

  // Thêm phương thức copy nhiều thông tin
  copyNhieuThongTin(): void {
    const selectedCCCDs = this.danhSachCCCD.filter(cccd => cccd.checked && cccd.status === 'success');
    if (selectedCCCDs.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một CCCD để sao chép thông tin');
      return;
    }
    
    // Format dữ liệu, bỏ mã số BH ở đầu
    const rows = selectedCCCDs.map(cccd => [
      cccd.name || '', // Họ và tên
      cccd.sex || '', // Giới tính
      cccd.dob || '', // Ngày tháng năm sinh
      cccd.address || '', // Địa chỉ
      cccd.id || '', // CCCD
      '' // Số điện thoại
    ]);

    // Chỉ join các rows
    const allData = rows.map(row => row.join('\t')).join('\n');

    // Copy vào clipboard
    navigator.clipboard.writeText(allData).then(() => {
      this.message.success(`Đã sao chép thông tin của ${selectedCCCDs.length} người`);
    }).catch(err => {
      console.error('Lỗi khi sao chép:', err);
      this.message.error('Có lỗi xảy ra khi sao chép thông tin');
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Kiểm tra nếu là Ctrl + S
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của trình duyệt
      if (this.form.valid) {
        this.handleOk();
      } else {
        this.message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      }
    }
  }

  // Thêm phương thức xử lý khi bấm nút Lưu
  onSave(): void {
    if (this.loadingSave) {
      return;
    }

    // Log để kiểm tra trạng thái form
    console.log('Form valid:', this.form.valid);
    console.log('Form values:', this.form.value);
    console.log('Form errors:', this.form.errors);

    // Log chi tiết các trường invalid
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.invalid) {
        console.log(`Field ${key} errors:`, control.errors);
      }
    });

    if (this.form.valid) {
      this.loadingSave = true;
      this.handleOk();
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });

      // Hiển thị thông báo chi tiết hơn về các trường bị lỗi
      const invalidFields = Object.keys(this.form.controls)
        .filter(key => this.form.get(key)?.invalid)
        .map(key => {
          // Map tên field sang tên hiển thị
          const fieldNames: {[key: string]: string} = {
            ma_so_bhxh: 'Mã số BHXH',
            cccd: 'CCCD',
            ho_ten: 'Họ tên',
            ngay_sinh: 'Ngày sinh',
            gioi_tinh: 'Giới tính',
            nguoi_thu: 'Người thứ',
            so_thang_dong: 'Số tháng đóng',
            tinh_nkq: 'Tỉnh NKQ',
            huyen_nkq: 'Huyện NKQ',
            xa_nkq: 'Xã NKQ',
            dia_chi_nkq: 'Địa chỉ NKQ',
            benh_vien_kcb: 'Bệnh viện KCB'
          };
          return fieldNames[key] || key;
        });

      if (invalidFields.length > 0) {
        this.message.warning(`Vui lòng điền đầy đủ thông tin: ${invalidFields.join(', ')}`);
      } else {
        this.message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      }
    }
  }

  // Thêm phương thức xử lý paste ngày sinh
  handleNgaySinhPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    // Lấy text từ clipboard
    const clipboardData = event.clipboardData;
    let pastedText = clipboardData?.getData('text') || '';
    
    // Thử parse các định dạng ngày phổ biến
    let formattedDate = '';
    
    // Thử các định dạng phổ biến
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/MM/yyyy
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,   // yyyy-MM-dd
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/    // dd-MM-yyyy
    ];

    for (const format of formats) {
      const match = pastedText.match(format);
      if (match) {
        try {
          let day, month, year;
          if (format === formats[0]) { // dd/MM/yyyy
            [, day, month, year] = match;
          } else if (format === formats[1]) { // yyyy-MM-dd
            [, year, month, day] = match;
          } else { // dd-MM-yyyy
            [, day, month, year] = match;
          }
          
          // Chuẩn hóa về định dạng dd/MM/yyyy
          formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
          break;
        } catch (e) {
          console.error('Lỗi parse ngày:', e);
        }
      }
    }

    // Nếu parse được ngày hợp lệ
    if (formattedDate) {
      const input = event.target as HTMLInputElement;
      input.value = formattedDate;
      this.form.patchValue({
        ngay_sinh: formattedDate
      });
    } else {
      this.message.warning('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng dd/MM/yyyy');
    }
  }

  copyMaSoBHXH(maSoBHXH: string): void {
    const el = document.createElement('textarea');
    el.value = maSoBHXH;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.message.success('Đã sao chép mã số BHXH: ' + maSoBHXH);
  }

  copyNhieuMaSoBHXH(): void {
    const selectedKeKhai = this.keKhaiBHYTs.filter(item => this.selectedIds.includes(item.id || 0));
    if (selectedKeKhai.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một mã số BHXH để sao chép');
      return;
    }

    const maSoBHXHList = selectedKeKhai.map(item => item.thongTinThe.ma_so_bhxh).join('\n');
    const el = document.createElement('textarea');
    el.value = maSoBHXHList;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.message.success(`Đã sao chép ${selectedKeKhai.length} mã số BHXH`);
  }

  // Thêm phương thức nhận diện thông tin từ chuỗi
  parseInfoFromString(input: string): any {
    const parts = input.split('\t').map(part => part.trim());
    if (parts.length >= 7) {
      const [maSoBHXH, hoTen, gioiTinh, ngaySinh, diaChi, soCCCD, soDienThoai] = parts;
      
      // Kiểm tra và chuẩn hóa dữ liệu
      if (!maSoBHXH || !hoTen || !ngaySinh || !soCCCD) {
        this.message.warning('Thiếu thông tin bắt buộc: Mã số BHXH, Họ tên, Ngày sinh hoặc CCCD');
        return null;
      }

      return {
        maSoBHXH: maSoBHXH,
        hoTen: this.capitalizeFullName(hoTen),
        gioiTinh: this.normalizeGender(gioiTinh),
        ngaySinh: this.parseNgaySinh(ngaySinh),
        diaChi: diaChi,
        soCCCD: soCCCD,
        soDienThoai: soDienThoai
      };
    }
    return null;
  }

  // Thêm các phương thức hỗ trợ
  private capitalizeFullName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private normalizeGender(gender: string): 'Nam' | 'Nữ' {
    const normalizedGender = gender.toLowerCase().trim();
    return normalizedGender === 'nam' || normalizedGender === 'nam' ? 'Nam' : 'Nữ';
  }

  // Hàm hỗ trợ chuyển đổi ngày sinh sang định dạng yyyy-MM-dd
  private parseNgaySinh(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  }

  // Thêm phương thức điền thông tin vào form
  fillFormFromString(input: string): void {
    const info = this.parseInfoFromString(input);
    if (info) {
      // Chuyển đổi ngày sinh sang đối tượng Date
      const [day, month, year] = info.ngaySinh.split('-').reverse();
      const ngaySinh = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // Chỉ cập nhật các thông tin cơ bản từ dữ liệu đầu vào
      this.form.patchValue({
        ma_so_bhxh: info.maSoBHXH,
        cccd: info.soCCCD,
        ho_ten: info.hoTen,
        ngay_sinh: ngaySinh,
        gioi_tinh: info.gioiTinh,
        so_dien_thoai: info.soDienThoai,
        dia_chi_nkq: info.diaChi
      });

      // Hiển thị thông báo thành công
      this.message.success('Đã điền thông tin tự động vào form');
    } else {
      this.message.error('Không thể nhận diện thông tin từ chuỗi dữ liệu');
    }
  }

  // Thêm phương thức hiển thị modal
  showQuickInputModal(): void {
    this.isQuickInputVisible = true;
    this.quickInputText = '';
  }

  // Thêm phương thức đóng modal
  handleQuickInputCancel(): void {
    this.isQuickInputVisible = false;
  }

  // Thêm phương thức xử lý khi nhấn OK
  async handleQuickInputOk(): Promise<void> {
    if (!this.quickInputText.trim()) {
      this.message.warning('Vui lòng nhập thông tin cần xử lý');
      return;
    }

    this.isProcessing = true;
    try {
      this.fillFormFromString(this.quickInputText);
      this.isQuickInputVisible = false;
    } catch (error) {
      this.message.error('Có lỗi xảy ra khi xử lý thông tin');
    } finally {
      this.isProcessing = false;
    }
  }

  // Thêm phương thức lấy token
  getAccessToken(): void {
    this.isLoginVisible = true;
    this.getCaptcha();
  }

  getCaptcha(): void {
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res) => {
        console.log('Captcha response:', res); // Log để debug
        if (res && res.data) {
          this.captchaImage = res.data.image;
          this.captchaCode = res.data.code;
        } else {
          this.message.error('Không nhận được dữ liệu captcha');
        }
      },
      error: (err) => {
        console.error('Captcha error:', err); // Log để debug
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

      this.ssmv2Service.authenticate(data).subscribe({
        next: (response) => {
          this.loadingLogin = false; // Reset loading khi có response thành công
          
          if (response.body?.access_token) {
            this.message.success('Xác thực thành công');
            this.isLoginVisible = false;
            
            if (this.form.get('ma_so_bhxh')?.value) {
              this.onSearchBHYT();
            }
          } else {
            this.message.error('Không nhận được token');
            this.getCaptcha();
          }
        },
        error: (err) => {
          console.log('Error details:', {
            error: err.error,
            status: err.status,
            message: err.message,
            fullError: err
          });

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
    this.loginForm.reset();
  }

  // Thêm phương thức checkPhuongAnDong
  private checkPhuongAnDong(hanTheCu: Date | null): string {
    // Nếu không có hạn thẻ cũ -> tăng mới
    if (!hanTheCu) return 'tang_moi';

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time về 00:00:00
    
    const hanTheCuDate = new Date(hanTheCu);
    hanTheCuDate.setHours(0, 0, 0, 0);

    // Tính số ngày từ hạn thẻ cũ đến hiện tại
    const diffTime = today.getTime() - hanTheCuDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Nếu hạn thẻ cũ hết hạn KHÔNG QUÁ 90 ngày -> đáo hạn
    // Ngược lại (quá 90 ngày hoặc không có hạn thẻ cũ) -> tăng mới
    return diffDays <= 90 ? 'dao_han' : 'tang_moi';
  }

  // Thêm phương thức xử lý input captcha
  onCaptchaInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Chỉ lấy 4 ký tự đầu tiên
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    // Chuyển đổi thành chữ hoa và cập nhật vào form
    this.loginForm.patchValue({
      text: value.toUpperCase()
    }, { emitEvent: false });
  }

  // Thêm phương thức mới để xử lý khi thay đổi chế độ
  onModeChange(isHoGiaDinh: boolean): void {
    this.isHoGiaDinh = isHoGiaDinh;
    // Nếu chuyển sang chế độ hộ gia đình, không cần chọn người thứ
    if (isHoGiaDinh) {
      this.multipleSearchNguoiThu = null as any;
    }
  }

  // Xử lý sự kiện khi người dùng nhập vào textarea
  onMultipleSearchTextInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    
    // Nếu người dùng nhập đủ 10 số và không có dấu xuống dòng ở cuối
    if (value.length > 0 && !value.endsWith('\n')) {
      const lines = value.split('\n');
      const lastLine = lines[lines.length - 1];
      
      // Nếu dòng cuối cùng đã đủ 10 ký tự (đủ 1 mã số BHXH), tự động thêm xuống dòng
      if (lastLine.length === 10 && /^\d+$/.test(lastLine)) {
        textarea.value = value + '\n';
        this.multipleSearchText = textarea.value;
      }
    }
  }

  // Xử lý sự kiện khi người dùng dán vào textarea
  onMultipleSearchTextPaste(event: ClipboardEvent): void {
    // Ngăn hành vi mặc định của trình duyệt
    event.preventDefault();
    
    // Lấy nội dung từ clipboard
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    
    const pastedText = clipboardData.getData('text');
    if (!pastedText) return;
    
    // Xử lý nội dung dán vào
    const textarea = event.target as HTMLTextAreaElement;
    const currentValue = textarea.value;
    const cursorPosition = textarea.selectionStart;
    
    // Tách nội dung dán thành các dòng
    let formattedText = pastedText
      .replace(/\s+/g, '') // Loại bỏ tất cả khoảng trắng
      .replace(/(.{10})/g, '$1\n'); // Thêm xuống dòng sau mỗi 10 ký tự
    
    // Nếu dòng cuối không đủ 10 ký tự và không phải là dòng trống, không thêm xuống dòng
    if (formattedText.endsWith('\n') && formattedText.length % 11 !== 0) {
      formattedText = formattedText.slice(0, -1);
    }
    
    // Chèn nội dung đã định dạng vào vị trí con trỏ
    const newValue = 
      currentValue.substring(0, cursorPosition) + 
      formattedText + 
      currentValue.substring(textarea.selectionEnd || cursorPosition);
    
    // Cập nhật giá trị của textarea
    textarea.value = newValue;
    this.multipleSearchText = newValue;
    
    // Di chuyển con trỏ đến cuối nội dung vừa dán
    const newCursorPosition = cursorPosition + formattedText.length;
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  inBienLai(keKhaiId: number): void {
    this.bienLaiService.getBienLaiByKeKhai(keKhaiId).subscribe({
      next: (bienLai: BienLai) => {
        this.bienLaiService.inBienLai(bienLai.id).subscribe(
          (response: Blob) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
          },
          (error: any) => {
            this.message.error('Lỗi khi in biên lai');
          }
        );
      },
      error: () => {
        this.message.error('Không tìm thấy biên lai');
      }
    });
  }

  // Thêm hàm xử lý khi blur khỏi ô ngày sinh
  onNgaySinhBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value) return;

    // Kiểm tra nếu chỉ nhập năm
    if (/^\d{4}$/.test(value)) {
      const year = parseInt(value);
      if (year >= 1900 && year <= new Date().getFullYear()) {
        // Giữ nguyên giá trị năm
        this.form.patchValue({
          ngay_sinh: value
        });
        return;
      }
    }

    // Kiểm tra nếu đã đúng định dạng dd/MM/yyyy
    if (/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Kiểm tra tính hợp lệ của ngày
      if (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year &&
        date.getFullYear() >= 1900 &&
        date.getFullYear() <= new Date().getFullYear()
      ) {
        return;
      }
    }

    // Nếu không hợp lệ, set lỗi
    const control = this.form.get('ngay_sinh');
    if (control) {
      control.setErrors({ invalidDate: true });
    }
  }

  // Thêm hàm mới để xử lý ngày sinh
  private formatNgaySinh(ngaySinhInput: any): Date {
    let date: Date;
    
    // Nếu không có giá trị, trả về ngày hiện tại
    if (!ngaySinhInput) {
      date = new Date();
    }
    // Xử lý trường hợp chỉ nhập năm
    else if (typeof ngaySinhInput === 'string' && /^\d{4}$/.test(ngaySinhInput)) {
      const year = parseInt(ngaySinhInput);
      if (year >= 1900 && year <= new Date().getFullYear()) {
        date = new Date(Date.UTC(year, 0, 1));
      } else {
        date = new Date();
      }
    } 
    // Xử lý trường hợp dd/MM/yyyy
    else if (typeof ngaySinhInput === 'string' && ngaySinhInput.includes('/')) {
      const [day, month, year] = ngaySinhInput.split('/').map(Number);
      // Sử dụng Date.UTC để đảm bảo múi giờ
      date = new Date(Date.UTC(year, month - 1, day));
      
      // Kiểm tra tính hợp lệ của ngày
      if (
        !(date.getUTCDate() === day &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCFullYear() === year &&
        date.getUTCFullYear() >= 1900 &&
        date.getUTCFullYear() <= new Date().getFullYear() &&
        !isNaN(date.getTime()))
      ) {
        date = new Date();
      }
    }
    // Trường hợp đã là đối tượng Date
    else if (ngaySinhInput instanceof Date && !isNaN(ngaySinhInput.getTime())) {
      // Tạo lại date với UTC để đảm bảo múi giờ
      date = new Date(Date.UTC(
        ngaySinhInput.getFullYear(),
        ngaySinhInput.getMonth(),
        ngaySinhInput.getDate()
      ));
    }
    else {
      date = new Date();
    }
    
    return date;
  }

  // Thêm phương thức tải trước dữ liệu địa chính
  async preloadAddressData(): Promise<void> {
    if (this.dataInitialized) return;
    
    try {
      console.log('Bắt đầu tải trước dữ liệu địa chính...');
      
      // Tải danh sách tỉnh
      await this.loadDanhMucTinh();
      
      // Tải trước danh sách huyện cho các tỉnh phổ biến
      const commonProvinces = ['01', '79', '48']; // Hà Nội, HCM, Đà Nẵng
      for (const province of commonProvinces) {
        await this.loadDanhMucHuyenByMaTinh(province);
        
        // Lấy các huyện đã tải
        const huyens = this.huyenCache.get(province) || [];
        
        // Tải trước xã cho một số huyện
        if (huyens.length > 0) {
          // Chỉ tải 2 huyện đầu tiên để không tải quá nhiều
          for (let i = 0; i < Math.min(2, huyens.length); i++) {
            await this.loadDanhMucXaByMaHuyen(huyens[i].ma);
          }
        }
      }
      
      this.dataInitialized = true;
      console.log('Đã tải xong dữ liệu địa chính!');
    } catch (error) {
      console.error('Lỗi khi tải trước dữ liệu địa chính:', error);
    }
  }

  // Thêm phương thức xóa cache (tùy chọn)
  private clearAddressCache(): void {
    // Xóa cache tỉnh
    localStorage.removeItem(this.TINH_CACHE_KEY);
    
    // Xóa cache huyện
    this.huyenCache.forEach((_, key) => {
      localStorage.removeItem(this.HUYEN_CACHE_PREFIX + key);
    });
    
    // Xóa cache xã
    this.xaCache.forEach((_, key) => {
      localStorage.removeItem(this.XA_CACHE_PREFIX + key);
    });
    
    // Xóa cache trong bộ nhớ
    this.huyenCache.clear();
    this.xaCache.clear();
  }

  // Thêm phương thức lưu cache vào localStorage
  private saveToLocalStorage(key: string, data: any[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Lỗi khi lưu cache vào localStorage:', error);
    }
  }

  // Thêm phương thức đọc cache từ localStorage
  private loadFromLocalStorage(key: string): any[] | null {
    try {
      const cachedData = localStorage.getItem(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Lỗi khi đọc cache từ localStorage:', error);
      return null;
    }
  }

  convertToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperCaseValue = input.value.toUpperCase();
    
    // Nếu giá trị đã thay đổi sau khi chuyển đổi
    if (input.value !== upperCaseValue) {
      input.value = upperCaseValue;
      this.loginForm.get('text')?.setValue(upperCaseValue, { emitEvent: false });
    }
  }

  // Thêm phương thức mới để format ngày sinh thành chuỗi dd/MM/yyyy
  private formatDateToString(date: Date): string {
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  guiDotKeKhai(): void {
    if (!this.dotKeKhai || this.dotKeKhai.trang_thai === 'cho_thanh_toan' || this.keKhaiBHYTs.length === 0) {
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận gửi',
      nzContent: 'Bạn có chắc chắn muốn gửi đợt kê khai này? Sau khi gửi sẽ không thể chỉnh sửa.',
      nzOkText: 'Gửi',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.loadingGui = true;
        this.dotKeKhaiService.guiDotKeKhai(this.dotKeKhaiId).subscribe({
          next: () => {
            this.message.success('Gửi đợt kê khai thành công.');
            this.loadDotKeKhai();
          },
          error: (error) => {
            console.error('Lỗi khi gửi đợt kê khai:', error);
            this.message.error('Có lỗi xảy ra khi gửi đợt kê khai');
          },
          complete: () => {
            this.loadingGui = false;
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  // Thêm phương thức để áp dụng bộ lọc
  applyFilters(): void {
    // Bắt đầu với tất cả dữ liệu
    this.filteredKeKhaiBHYTs = [...this.keKhaiBHYTs];
    
    // Áp dụng lọc theo số tháng đóng nếu có
    if (this.filterSoThangDong !== null) {
      this.filteredKeKhaiBHYTs = this.filteredKeKhaiBHYTs.filter(
        item => item.so_thang_dong === this.filterSoThangDong
      );
    }

    // Áp dụng lọc theo người thứ nếu có
    if (this.filterNguoiThu !== null) {
      this.filteredKeKhaiBHYTs = this.filteredKeKhaiBHYTs.filter(
        item => item.nguoi_thu === this.filterNguoiThu
      );
    }
  }

  // Phương thức để thay đổi bộ lọc số tháng đóng
  onFilterSoThangDongChange(value: number | null): void {
    this.filterSoThangDong = value;
    this.applyFilters();
    this.tinhThongKe();
  }

  // Phương thức để thay đổi bộ lọc người thứ
  onFilterNguoiThuChange(value: number | null): void {
    this.filterNguoiThu = value;
    this.applyFilters();
    this.tinhThongKe();
  }

  // Phương thức để xóa bộ lọc
  clearFilters(): void {
    this.filterSoThangDong = null;
    this.filterNguoiThu = null;
    this.applyFilters();
    this.tinhThongKe();
  }

  // Phương thức để kiểm tra xem có bộ lọc nào đang được áp dụng không
  hasActiveFilters(): boolean {
    return this.filterSoThangDong !== null || this.filterNguoiThu !== null;
  }

  /**
   * Kiểm tra họ tên hợp lệ
   */
  validateHoTen(): void {
    const hoTenControl = this.form.get('ho_ten');
    if (hoTenControl && hoTenControl.value) {
      const hoTen = hoTenControl.value.trim();
      
      // Kiểm tra độ dài
      if (hoTen.length < 3) {
        hoTenControl.setErrors({ invalidName: true });
        return;
      }
      
      // Kiểm tra ký tự đặc biệt không hợp lệ
      const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\-]+$/;
      if (!regex.test(hoTen)) {
        hoTenControl.setErrors({ invalidName: true });
        return;
      }
      
      // Kiểm tra khoảng trắng liên tiếp
      if (/\s\s/.test(hoTen)) {
        hoTenControl.setErrors({ invalidName: true });
        return;
      }
      
      // Nếu mọi kiểm tra đều thành công, xóa lỗi
      hoTenControl.setErrors(null);
    }
  }
} 