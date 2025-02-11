import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IdcardOutline, // Thêm icon CCCD
  SearchOutline  // Thêm icon Search
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
    NzRadioModule
  ],
  templateUrl: './ke-khai-bhyt.component.html',
  styleUrls: ['./ke-khai-bhyt.component.scss']
})
export class KeKhaiBHYTComponent implements OnInit, OnDestroy {
  keKhaiBHYTs: KeKhaiBHYT[] = [];
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

  // Thêm các biến thống kê
  thongKe = {
    daoHan: 0,
    tangMoi: 0,
    dungDong: 0,
    tongSoTien: 0
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
    private cccdService: CCCDService
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
      SearchOutline   // Thêm vào danh sách
    );
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.dotKeKhaiId = +params['id'];
      this.loadDotKeKhai();
      this.loadData();
      this.loadDanhMucTinh();
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

    this.form.get('so_thang_dong')?.valueChanges.subscribe(() => {
      this.capNhatSoTienCanDong();
    });

    // Subscribe to changes in ngay_bien_lai and han_the_cu
    this.form.get('ngay_bien_lai')?.valueChanges.subscribe(value => {
      console.log('=== BẮT ĐẦU TÍNH TOÁN NGÀY ===');
      console.log('1. Ngày biên lai thay đổi:', value);
      if (value) {
        const ngayBienLai = new Date(value);
        console.log('2. Ngày biên lai sau khi parse:', ngayBienLai);
        const hanTheCu = this.form.get('han_the_cu')?.value ? new Date(this.form.get('han_the_cu')?.value) : null;
        console.log('3. Hạn thẻ cũ:', hanTheCu);
        const hanTheMoiTu = this.tinhHanTheMoiTu(ngayBienLai, hanTheCu);
        console.log('4. Hạn thẻ mới từ được tính:', hanTheMoiTu);
        
        this.form.patchValue({
          han_the_moi_tu: hanTheMoiTu
        }, { emitEvent: false });

        // Tính lại hạn thẻ mới đến
        const soThangDong = this.form.get('so_thang_dong')?.value;
        console.log('5. Số tháng đóng:', soThangDong);
        if (soThangDong) {
          const hanTheMoiDen = this.tinhHanTheMoiDen(hanTheMoiTu, soThangDong);
          console.log('6. Hạn thẻ mới đến được tính:', hanTheMoiDen);
          this.form.patchValue({
            han_the_moi_den: hanTheMoiDen
          }, { emitEvent: false });
        }
        console.log('=== KẾT THÚC TÍNH TOÁN NGÀY ===');
      }
    });

    this.form.get('han_the_cu')?.valueChanges.subscribe(value => {
      const ngayBienLai = this.form.get('ngay_bien_lai')?.value;
      if (ngayBienLai) {
        const hanTheCu = value ? new Date(value) : null;
        const hanTheMoiTu = this.tinhHanTheMoiTu(new Date(ngayBienLai), hanTheCu);
        
        this.form.patchValue({
          han_the_moi_tu: hanTheMoiTu
        }, { emitEvent: false });
      }
    });

    // Subscribe to changes in so_thang_dong
    this.form.get('so_thang_dong')?.valueChanges.subscribe(soThangDong => {
      console.log('=== BẮT ĐẦU TÍNH TOÁN HẠN THẺ MỚI ĐẾN ===');
      console.log('1. Số tháng đóng thay đổi:', soThangDong);
      
      if (soThangDong) {
        const hanTheMoiTu = this.form.get('han_the_moi_tu')?.value;
        console.log('2. Hạn thẻ mới từ:', hanTheMoiTu);
        
        if (hanTheMoiTu) {
          const hanTheMoiDen = this.tinhHanTheMoiDen(new Date(hanTheMoiTu), soThangDong);
          console.log('3. Hạn thẻ mới đến được tính:', hanTheMoiDen);
          
          this.form.patchValue({
            han_the_moi_den: hanTheMoiDen
          }, { emitEvent: false });
        }
      }
      console.log('=== KẾT THÚC TÍNH TOÁN HẠN THẺ MỚI ĐẾN ===');
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('urgentItems');
  }

  initForm(): void {
    const today = new Date();
    console.log('Ngày biên lai mặc định:', today);
    
    this.form = this.fb.group({
      id: [null],
      thong_tin_the_id: [null],
      ma_so_bhxh: ['', [Validators.required]],
      cccd: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
      ho_ten: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      ngay_sinh: [null, [Validators.required]],
      gioi_tinh: [''],
      so_dien_thoai: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      ma_hgd: ['', [Validators.required, Validators.maxLength(20)]],
      ma_tinh_ks: [''],
      nguoi_thu: [null, [Validators.required]],
      so_thang_dong: [null, [Validators.required, Validators.min(1), Validators.max(36)]],
      phuong_an_dong: [''],
      han_the_cu: [null],
      han_the_moi_tu: [null],
      han_the_moi_den: [null],
      tinh_nkq: ['', [Validators.required]],
      huyen_nkq: ['', [Validators.required]],
      xa_nkq: ['', [Validators.required]],
      dia_chi_nkq: ['', [Validators.required]],
      benh_vien_kcb: [''],
      ma_huyen_ks: [''],
      ma_xa_ks: [''],
      ma_tinh_nkq: [''],
      ma_huyen_nkq: [''],
      ma_xa_nkq: [''],
      so_the_bhyt: [''],
      ma_dan_toc: [''],
      quoc_tich: [''],
      ma_benh_vien: [''],
      ngay_bien_lai: [today],
      so_tien_can_dong: [0, [Validators.required, Validators.min(0)]]
    });

    console.log('Form sau khi khởi tạo:', this.form.value);
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
        
        this.keKhaiBHYTs = data.map(item => ({
          ...item,
          is_urgent: urgentItems[item.id!] || false // Sử dụng giá trị từ localStorage hoặc false
        }));
        this.tinhThongKe();
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  loadDanhMucTinh(): void {
    this.diaChiService.getDanhMucTinh().subscribe({
      next: (data: DanhMucTinh[]) => {
        this.danhMucTinhs = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
      },
      error: (error: any) => {
        this.message.error('Có lỗi xảy ra khi tải danh sách tỉnh/thành phố');
      }
    });
  }

  loadDanhMucHuyenByMaTinh(maTinh: string): void {
    this.diaChiService.getDanhMucHuyenByMaTinh(maTinh).subscribe({
      next: (data: DanhMucHuyen[]) => {
        this.danhMucHuyens = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
        console.log('Loaded danh mục huyện:', this.danhMucHuyens); // Log để debug
      },
      error: (error: any) => {
        console.error('Lỗi khi load danh mục huyện:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách quận/huyện');
      }
    });
  }

  loadDanhMucXaByMaHuyen(maHuyen: string): void {
    this.diaChiService.getDanhMucXaByMaHuyen(maHuyen).subscribe({
      next: (data: DanhMucXa[]) => {
        this.danhMucXas = data.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
      },
      error: (error: any) => {
        this.message.error('Có lỗi xảy ra khi tải danh sách xã/phường');
      }
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
          benh_vien_kcb: data.thongTinThe.benh_vien_kcb || '',
          ma_benh_vien: data.thongTinThe.ma_benh_vien || '',
          so_the_bhyt: data.thongTinThe.so_the_bhyt,
          ma_dan_toc: data.thongTinThe.ma_dan_toc,
          quoc_tich: data.thongTinThe.quoc_tich
        });

        // Load danh sách huyện và xã dựa trên mã tỉnh/huyện đã chọn
        if (data.thongTinThe.ma_tinh_ks) {
          // Tạo một biến riên để lưu danh sách huyện KS
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

        // Sau đó patch các thông tin khác
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
          benh_vien_kcb: data.benh_vien_kcb,
          ma_benh_vien: data.ma_benh_vien,
          so_tien_can_dong: data.so_tien_can_dong,
        });

        // Log để kiểm tra
        console.log('Form values after patch:', this.form.value);
      }

      // Khi tạo mới, đặt ngày biên lai mặc định là ngày hôm nay
      this.form.patchValue({
        ngay_bien_lai: new Date()
      });
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

      if (this.isEdit) {
        const keKhaiBHYTId = formValue.id;
        const thongTinTheId = formValue.thong_tin_the_id;

        if (typeof keKhaiBHYTId !== 'number' || typeof thongTinTheId !== 'number') {
          this.message.error('Không tìm thấy ID kê khai hoặc thông tin thẻ');
          this.loading = false;
          return;
        }

        // Cập nhật ThongTinThe
        const updateData: ThongTinThe = {
          id: thongTinTheId,
          ma_so_bhxh: formValue.ma_so_bhxh,
          cccd: formValue.cccd,
          ho_ten: formValue.ho_ten,
          ngay_sinh: formValue.ngay_sinh ? new Date(formValue.ngay_sinh) : new Date(),
          gioi_tinh: formValue.gioi_tinh,
          so_dien_thoai: formValue.so_dien_thoai || '',
          ma_hgd: formValue.ma_hgd || '',
          ma_tinh_ks: formValue.ma_tinh_ks || '',
          ma_huyen_ks: formValue.ma_huyen_ks || '',
          ma_xa_ks: formValue.ma_xa_ks || '',
          ma_tinh_nkq: formValue.tinh_nkq || '',
          ma_huyen_nkq: formValue.huyen_nkq || '',
          ma_xa_nkq: formValue.xa_nkq || '',
          dia_chi_nkq: formValue.dia_chi_nkq,
          benh_vien_kcb: this.getBenhVienTen(formValue.benh_vien_kcb),
          ma_benh_vien: formValue.benh_vien_kcb || '',
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
          so_the_bhyt: formValue.so_the_bhyt || '', // Đảm bảo giá trị không null
          ma_dan_toc: formValue.ma_dan_toc || '',
          quoc_tich: formValue.quoc_tich || '',
          noiNhanHoSo: {
            tinh: this.getTinhTen(formValue.tinh_nkq),
            huyen: this.getHuyenTen(formValue.huyen_nkq),
            xa: this.getXaTen(formValue.xa_nkq),
            diaChi: formValue.dia_chi_nkq
          }
        };

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
          is_urgent: false // Thêm trường này
        };

        // Cập nhật cả hai đối tượng
        this.keKhaiBHYTService.updateThongTinThe(thongTinTheId, updateData).subscribe({
          next: () => {
            this.keKhaiBHYTService.update(this.dotKeKhaiId, keKhaiBHYTId, keKhaiBHYTData).subscribe({
              next: () => {
                this.message.success('Cập nhật thành công');
                this.isVisible = false;
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                console.error('Error updating KeKhaiBHYT:', error);
                this.message.error('Có lỗi xảy ra khi cập nhật kê khai');
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error updating ThongTinThe:', error);
            this.message.error('Có lỗi xảy ra khi cập nhật thông tin thẻ');
            this.loading = false;
          }
        });
      } else {
        // Tạo mới ThongTinThe
        const thongTinTheData: ThongTinThe = {
          id: undefined,
          ma_so_bhxh: formValue.ma_so_bhxh,
          cccd: formValue.cccd,
          ho_ten: formValue.ho_ten,
          ngay_sinh: formValue.ngay_sinh ? new Date(formValue.ngay_sinh) : new Date(),
          gioi_tinh: formValue.gioi_tinh,
          so_dien_thoai: formValue.so_dien_thoai || '',
          ma_hgd: formValue.ma_hgd || '',
          ma_tinh_ks: formValue.ma_tinh_ks || '',
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
          noiNhanHoSo: {
            tinh: this.getTinhTen(formValue.tinh_nkq),
            huyen: this.getHuyenTen(formValue.huyen_nkq),
            xa: this.getXaTen(formValue.xa_nkq),
            diaChi: formValue.dia_chi_nkq
          },
          ma_huyen_ks: formValue.ma_huyen_ks || '',
          ma_xa_ks: formValue.ma_xa_ks || '',
          ma_tinh_nkq: formValue.tinh_nkq || '',
          ma_huyen_nkq: formValue.huyen_nkq || '',
          ma_xa_nkq: formValue.xa_nkq || '',
          so_the_bhyt: formValue.so_the_bhyt || '',
          ma_dan_toc: formValue.ma_dan_toc || '',
          quoc_tich: formValue.quoc_tich || '',
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
          is_urgent: false // Thêm trường này
        };

        // Tạo mới KeKhaiBHYT
        this.keKhaiBHYTService.create(this.dotKeKhaiId, data).subscribe({
          next: (response) => {
            this.message.success('Thêm mới thành công');
            this.isVisible = false;
            this.loadData();
          },
          error: (error) => {
            if (error.error && error.error.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error('Có lỗi xảy ra khi tạo mới');
            }
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
    this.danhSachCCCD
      .filter(cccd => cccd.status === 'success')
      .forEach(item => item.checked = checked);
    this.refreshCheckStatus();
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
    
    try {
      // Kiểm tra nếu là định dạng dd/MM/yyyy
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Nếu là định dạng khác
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
      return null;
    }
  }

  onSearchBHYT(): void {
    if (this.loading) return;
    
    const maSoBHXH = this.form.get('ma_so_bhxh')?.value;
    if (maSoBHXH && maSoBHXH.length === 10) {
      this.loading = true;
      
      // Gọi API tra cứu BHYT
      this.keKhaiBHYTService.traCuuThongTinBHYT(maSoBHXH).subscribe({
        next: async (response) => {
          if (response.success) {
            // Xử lý dữ liệu từ API như cũ
            const data = response.data;
            console.log('BHYT search response:', data);

            // Kiểm tra hạn thẻ cũ và xử lý như cũ
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

            await this.processSearchResult(data);
          } else {
            // Nếu API không thành công, tìm trong bảng thong_tin_the
            this.searchInLocalDatabase(maSoBHXH);
          }
        },
        error: (error) => {
          console.error('Error searching BHYT from API:', error);
          // Khi có lỗi từ API, tìm trong bảng thong_tin_the
          this.searchInLocalDatabase(maSoBHXH);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.message.warning('Vui lòng nhập đủ 10 số BHXH');
    }
  }

  // Thêm phương thức mới để tìm kiếm trong database local
  private searchInLocalDatabase(maSoBHXH: string): void {
    this.keKhaiBHYTService.getThongTinTheByMaSoBHXH(maSoBHXH).subscribe({
      next: async (thongTinThe) => {
        if (thongTinThe) {
          console.log('Found in local database:', thongTinThe);
          
          // Chuyển đổi dữ liệu từ ThongTinThe sang format phù hợp
          const localData = {
            maSoBHXH: thongTinThe.ma_so_bhxh,
            cmnd: thongTinThe.cccd,
            hoTen: thongTinThe.ho_ten,
            ngaySinh: thongTinThe.ngay_sinh,
            gioiTinh: thongTinThe.gioi_tinh ? 1 : 2, // true = Nam (1), false = Nữ (2)
            soDienThoai: thongTinThe.so_dien_thoai,
            maHoGiaDinh: thongTinThe.ma_hgd,
            maTinhKS: thongTinThe.ma_tinh_ks,
            maHuyenKS: thongTinThe.ma_huyen_ks,
            maXaKS: thongTinThe.ma_xa_ks,
            maTinhNkq: thongTinThe.ma_tinh_nkq,
            maHuyenNkq: thongTinThe.ma_huyen_nkq,
            maXaNkq: thongTinThe.ma_xa_nkq,
            noiNhanHoSo: thongTinThe.noiNhanHoSo || {
              tinh: '',
              huyen: '',
              xa: '',
              diaChi: thongTinThe.dia_chi_nkq || ''
            },
            maBenhVien: thongTinThe.ma_benh_vien,
            danToc: thongTinThe.ma_dan_toc,
            quocTich: thongTinThe.quoc_tich,
            soTheBHYT: thongTinThe.so_the_bhyt
          };

          await this.processSearchResult(localData, true);
        } else {
          this.message.error('Không tìm thấy thông tin BHYT');
        }
      },
      error: (error) => {
        console.error('Error searching in local database:', error);
        this.message.error('Có lỗi xảy ra khi tìm kiếm thông tin BHYT');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Cập nhật hàm processSearchResult để nhận thêm tham số
  private async processSearchResult(data: any, isFromLocal: boolean = false): Promise<void> {
    let benhVienKCB = '';
    if (data.maBenhVien) {
      if (this.danhMucCSKCBs.length === 0) {
        await this.loadDanhMucCSKCB();
      }
      
      const benhVien = this.danhMucCSKCBs.find(bv => bv.value === data.maBenhVien);
      if (benhVien) {
        benhVienKCB = benhVien.value;
        console.log('Tìm thấy bệnh viện KCB:', benhVien);
      }
    }

    // Xử lý chuyển đổi ngày tháng an toàn
    const ngaySinh = this.parseDate(data.ngaySinh);
    const tuNgayTheCu = this.parseDate(data.tuNgayTheCu);
    const denNgayTheCu = this.parseDate(data.denNgayTheCu);

    // Log để debug
    console.log('Parsed dates:', {
      ngaySinh,
      tuNgayTheCu,
      denNgayTheCu
    });

    // Parse địa chỉ từ noiNhanHoSo
    let diaChiNKQ = '';
    if (data.noiNhanHoSo) {
      try {
        console.log('Raw noiNhanHoSo:', data.noiNhanHoSo);
        console.log('Type of noiNhanHoSo:', typeof data.noiNhanHoSo);

        if (typeof data.noiNhanHoSo === 'object' && data.noiNhanHoSo !== null) {
          const noiNhanHoSoObj = data.noiNhanHoSo as NoiNhanHoSo;
          diaChiNKQ = noiNhanHoSoObj.diaChi || '';
        } else {
          diaChiNKQ = data.noiNhanHoSo as string;
        }
        
        console.log('Extracted diaChi:', diaChiNKQ);
      } catch (e) {
        console.error('Error handling noiNhanHoSo:', e);
        diaChiNKQ = data.noiNhanHoSo as string;
      }
    }

    // Cập nhật form với dữ liệu từ API
    this.form.patchValue({
      ma_so_bhxh: data.maSoBHXH,
      cccd: data.cmnd,
      ho_ten: data.hoTen,
      ngay_sinh: ngaySinh,
      gioi_tinh: data.gioiTinh === 1 ? 'Nam' : 'Nữ',
      so_dien_thoai: data.soDienThoai,
      ma_hgd: data.maHoGiaDinh || '',
      ma_tinh_ks: data.maTinhKS,
      ma_huyen_ks: data.maHuyenKS || '',
      ma_xa_ks: data.maXaKS || '',
      tinh_nkq: data.maTinhNkq,
      huyen_nkq: data.maHuyenNkq,
      xa_nkq: data.maXaNkq,
      dia_chi_nkq: diaChiNKQ,
      benh_vien_kcb: benhVienKCB,
      ma_benh_vien: data.maBenhVien || '',
      han_the_cu: denNgayTheCu,
      ma_dan_toc: data.danToc || '',
      quoc_tich: data.quocTich || '',
      so_the_bhyt: data.soTheBHYT || '',
      ngay_bien_lai: data.ngayBienLai ? new Date(data.ngayBienLai) : new Date(),
      so_tien_can_dong: data.soTienCanDong,
    });

    // Log để kiểm tra
    console.log('Form data after update:', {
      ma_huyen_ks: data.maHuyenKS,
      ma_xa_ks: data.maXaKS
    });

    // Load danh mục huyện và xã tương ứng
    if (data.maTinhNkq) {
      this.loadDanhMucHuyenByMaTinh(data.maTinhNkq);
    }
    if (data.maHuyenNkq) {
      this.loadDanhMucXaByMaHuyen(data.maHuyenNkq);
    }

    // Chỉ hiển thị thông báo nếu dữ liệu không phải từ local
    if (!isFromLocal) {
      this.message.success('Đã tìm thấy thông tin BHYT');
    } else {
      this.message.success('Đã tìm thấy thông tin BHYT trong cơ sở dữ liệu');
    }
  }

  // Thêm hàm kiểm tra phương án đóng
  checkPhuongAnDong(hanTheCu: Date | null): string {
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

  // Thêm hàm tính hạn thẻ mới đến
  tinhHanTheMoiDen(hanTheMoiTu: Date, soThangDong: number): Date {
    // Log để debug
    console.log('Tính hạn thẻ mới đến với:', {
      hanTheMoiTu: hanTheMoiTu,
      soThangDong: soThangDong
    });

    // Tạo bản sao của hanTheMoiTu để không ảnh hưởng đến ngày gốc
    const result = new Date(hanTheMoiTu);
    
    // Cộng số tháng đóng vào hạn thẻ mới từ
    result.setMonth(result.getMonth() + soThangDong);

    // Log kết quả để debug
    console.log('Hạn thẻ mới đến được tính:', result);
    
    return result;
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
          ngaySinh = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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

      // Load danh mục tỉnh nếu chưa có
      if (this.danhMucTinhs.length === 0) {
        await new Promise<void>((resolve) => {
          this.diaChiService.getDanhMucTinh().subscribe({
            next: (tinhs) => {
              this.danhMucTinhs = tinhs.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
              console.log('Loaded danh mục tỉnh:', this.danhMucTinhs);
              resolve();
            },
            error: (error) => {
              console.error('Lỗi khi load danh mục tỉnh:', error);
              resolve();
            }
          });
        });
      }

      // Load danh mục huyện theo mã tỉnh
      if (data.maTinhNkq) {
        await new Promise<void>((resolve) => {
          this.diaChiService.getDanhMucHuyenByMaTinh(data.maTinhNkq).subscribe({
            next: (huyens) => {
              this.danhMucHuyens = huyens.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
              console.log('Loaded danh mục huyện cho tỉnh', data.maTinhNkq, ':', this.danhMucHuyens);
              resolve();
            },
            error: (error) => {
              console.error('Lỗi khi load danh mục huyện:', error);
              resolve();
            }
          });
        });
      }

      // Load danh mục xã theo mã huyện
      if (data.maHuyenNkq) {
        await new Promise<void>((resolve) => {
          this.diaChiService.getDanhMucXaByMaHuyen(data.maHuyenNkq).subscribe({
            next: (xas) => {
              this.danhMucXas = xas.sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
              console.log('Loaded danh mục xã cho huyện', data.maHuyenNkq, ':', this.danhMucXas);
              resolve();
            },
            error: (error) => {
              console.error('Lỗi khi load danh mục xã:', error);
              resolve();
            }
          });
        });
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
        ma_tinh_ks: data.maTinhKS || '',
        ma_huyen_ks: data.maHuyenKS || '',
        ma_xa_ks: data.maXaKS || '',
        ma_tinh_nkq: data.maTinhNkq || '',
        ma_huyen_nkq: data.maHuyenNkq || '',
        ma_xa_nkq: data.maXaNkq || '',
        dia_chi_nkq: diaChiNKQ,
        benh_vien_kcb: this.getBenhVienTen(maBenhVien),
        ma_benh_vien: maBenhVien,
        so_the_bhyt: data.soTheBHYT || '',
        ma_dan_toc: data.danToc || '',
        quoc_tich: data.quocTich || '',
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
            hanTheCu = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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
        const soTienCanDong = this.tinhSoTienCanDong(this.multipleSearchNguoiThu, this.multipleSearchSoThangDong);

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
          nguoi_thu: this.multipleSearchNguoiThu,
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
          is_urgent: false // Thêm trường này
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

    if (!this.multipleSearchNguoiThu) {
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

      for (const maSoBHXH of maSoBHXHList) {
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
            const result = await this.createKeKhaiFromApiData(response.data);
            if (result.success) {
              successCount++;
              this.searchResults.push({
                maSoBHXH,
                status: 'success',
                message: 'Tạo kê khai thành công'
              });
            } else {
              failedCount++;
              this.searchResults.push({
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
    this.thongKe = {
      daoHan: this.keKhaiBHYTs.filter(item => item.phuong_an_dong === 'dao_han').length,
      tangMoi: this.keKhaiBHYTs.filter(item => item.phuong_an_dong === 'tang_moi').length,
      dungDong: this.keKhaiBHYTs.filter(item => item.phuong_an_dong === 'dung_dong').length,
      tongSoTien: this.keKhaiBHYTs.reduce((total, item) => total + (item.so_tien_can_dong || 0), 0)
    };
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
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`; // Chuyển về định dạng YYYY-MM-DD
  }

  // Thêm phương thức cập nhật các trường địa chỉ
  private async updateAddressFields(province: string, district: string, ward: string) {
    try {
      // Tìm mã tỉnh
      const tinh = this.danhMucTinhs.find(t => 
        t.ten.toUpperCase().includes(province.toUpperCase())
      );
      
      if (tinh) {
        // Cập nhật mã tỉnh
        this.form.patchValue({ tinh_nkq: tinh.ma });
        
        // Đợi load danh mục huyện
        await new Promise<void>((resolve) => {
          this.diaChiService.getDanhMucHuyenByMaTinh(tinh.ma).subscribe({
            next: (huyens) => {
              this.danhMucHuyens = huyens.sort((a, b) => 
                a.ten.localeCompare(b.ten, 'vi')
              );
              
              // Tìm mã huyện
              const huyen = this.danhMucHuyens.find(h => 
                h.ten.toUpperCase().includes(district.toUpperCase())
              );
              
              if (huyen) {
                // Cập nhật mã huyện
                this.form.patchValue({ huyen_nkq: huyen.ma });
                
                // Load danh mục xã
                this.diaChiService.getDanhMucXaByMaHuyen(huyen.ma).subscribe({
                  next: (xas) => {
                    this.danhMucXas = xas.sort((a, b) => 
                      a.ten.localeCompare(b.ten, 'vi')
                    );
                    
                    // Tìm mã xã
                    const xa = this.danhMucXas.find(x => 
                      x.ten.toUpperCase().includes(ward.toUpperCase())
                    );
                    
                    if (xa) {
                      // Cập nhật mã xã
                      this.form.patchValue({ xa_nkq: xa.ma });
                    }
                    resolve();
                  },
                  error: (error) => {
                    console.error('Error loading xã:', error);
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            },
            error: (error) => {
              console.error('Error loading huyện:', error);
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Error in updateAddressFields:', error);
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
      this.form.patchValue({
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

      // ... phần code còn lại giữ nguyên ...
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
      ngay_bien_lai: data.ngay_bien_lai || new Date()
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
} 