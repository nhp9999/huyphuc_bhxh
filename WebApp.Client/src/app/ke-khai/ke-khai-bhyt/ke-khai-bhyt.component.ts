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
  CalendarOutline
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { DonViService, DonVi } from '../../services/don-vi.service';

registerLocaleData(vi);

interface NoiNhanHoSo {
  diaChi?: string;
  tinh?: string;
  huyen?: string;
  xa?: string;
}

// Thêm interface để định nghĩa kiểu dữ liệu cho giới tính
type GioiTinh = 'Nam' | 'Nữ';

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
  form!: FormGroup;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  selectedIds: number[] = [];
  dotKeKhaiId: number = 0;
  isAllChecked = false;
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
    private donViService: DonViService
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
      CalendarOutline
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
        // Tạo một biến riêng để lưu danh sách huyện KS
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
        // Tạo một biến riêng để lưu danh sách xã KS
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
          // Tạo một biến riêng để lưu danh sách huyện KS
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
          ma_benh_vien: formValue.ma_benh_vien || '',
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
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
          ma_benh_vien: formValue.ma_benh_vien || '',
          nguoi_tao: this.currentUser.username,
          ngay_tao: new Date(),
          ngay_bien_lai: formValue.ngay_bien_lai ? new Date(formValue.ngay_bien_lai) : null,
          so_tien_can_dong: formValue.so_tien_can_dong || 0,
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

  toggleUrgent(id: number): void {
    this.keKhaiBHYTService.toggleUrgent(this.dotKeKhaiId, id).subscribe({
      next: () => {
        // Cập nhật lại trạng thái trong danh sách
        const item = this.keKhaiBHYTs.find(x => x.id === id);
        if (item) {
          item.is_urgent = !item.is_urgent;
        }
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
  private async createKeKhaiFromApiData(data: any): Promise<boolean> {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!data || !data.maSoBHXH || !data.hoTen || !data.ngaySinh) {
        console.error('Dữ liệu không hợp lệ:', data);
        this.message.error('Dữ liệu không đầy đủ hoặc không hợp lệ');
        return false;
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
          console.error('Ngày sinh không hợp lệ:', data.ngaySinh);
          this.message.error('Ngày sinh không hợp lệ');
          return false;
        }

        // Log để debug
        console.log('Ngày sinh sau khi parse:', {
          raw: data.ngaySinh,
          parsed: ngaySinh,
          iso: ngaySinh.toISOString()
        });

      } catch (error) {
        console.error('Lỗi khi parse ngày sinh:', error);
        this.message.error('Ngày sinh không đúng định dạng');
        return false;
      }

      // Chuyển đổi giới tính sang kiểu GioiTinh
      const gioiTinh: GioiTinh = data.gioiTinh === 1 ? 'Nam' : 'Nữ';

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

      console.log('Thông tin địa chỉ:', {
        maTinh: data.maTinhNkq,
        maHuyen: data.maHuyenNkq,
        maXa: data.maXaNkq,
        tenTinh: tinhNKQ,
        tenHuyen: huyenNKQ,
        tenXa: xaNKQ,
        danhMucXas: this.danhMucXas
      });

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
          this.message.error('Không thể tạo thông tin thẻ');
          return false;
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
          so_tien_can_dong: soTienCanDong
        };

        // Tạo mới kê khai
        await this.keKhaiBHYTService.create(this.dotKeKhaiId, keKhaiBHYTData).toPromise();
        return true;

      } catch (error: any) {
        if (error?.status === 400) {
          this.message.error('Dữ liệu không hợp lệ: ' + (error?.error?.message || 'Vui lòng kiểm tra lại thông tin'));
        } else {
          this.message.error('Có lỗi xảy ra khi tạo kê khai');
        }
        console.error('Chi tiết lỗi:', error);
        return false;
      }

    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu:', error);
      this.message.error('Có lỗi xảy ra khi xử lý dữ liệu');
      return false;
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

      // Hiển thị loading message ban đầu
      loadingMessageId = this.message.loading(
        `Đang xử lý 0/${totalCount} mã số BHXH...`, 
        { nzDuration: 0 }
      ).messageId;

      for (const maSoBHXH of maSoBHXHList) {
        try {
          // Cập nhật thông báo tiến trình
          processedCount++;

          // Cập nhật nội dung loading message
          if (loadingMessageId) {
            this.message.remove(loadingMessageId);
            loadingMessageId = this.message.loading(
              `Đang xử lý ${processedCount}/${totalCount} mã số BHXH...`,
              { nzDuration: 0 }
            ).messageId;
          }

          const response = await this.keKhaiBHYTService.traCuuThongTinBHYT(maSoBHXH).toPromise();
          if (response && response.success) {
            const success = await this.createKeKhaiFromApiData(response.data);
            if (success) {
              successCount++;
            } else {
              failedCount++;
              console.warn(`Không thể tạo kê khai cho mã số ${maSoBHXH}`);
            }
          } else {
            failedCount++;
            console.warn(`Không tìm thấy thông tin cho mã số ${maSoBHXH}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`Lỗi khi xử lý mã số BHXH ${maSoBHXH}:`, error);
        }
      }

      // Đóng loading message cuối cùng
      if (loadingMessageId) {
        this.message.remove(loadingMessageId);
      }

      // Hiển thị thông báo kết quả
      if (successCount > 0 && failedCount > 0) {
        this.message.warning(
          `Đã tạo ${successCount}/${totalCount} kê khai BHYT thành công, ` +
          `${failedCount} mã số không thể tạo`
        );
      } else if (successCount > 0) {
        this.message.success(
          `Đã tạo thành công ${successCount} kê khai BHYT`
        );
      } else if (failedCount > 0) {
        this.message.error(
          `Không thể tạo kê khai cho ${failedCount} mã số BHXH`
        );
      }

      if (successCount > 0) {
        this.loadData();
      }

      this.isSearchMultipleVisible = false;
    } catch (error) {
      console.error('Lỗi khi xử lý tìm kiếm nhiều:', error);
      this.message.error('Có lỗi xảy ra khi tạo kê khai');
      // Đảm bảo đóng loading message nếu có lỗi
      if (loadingMessageId) {
        this.message.remove(loadingMessageId);
      }
    } finally {
      this.isSearchingMultiple = false;
      // Đảm bảo đóng loading message trong mọi trường hợp
      if (loadingMessageId) {
        this.message.remove(loadingMessageId);
      }
    }
  }
} 