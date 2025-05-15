import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DotKeKhai, CreateDotKeKhai, UpdateDotKeKhai, DotKeKhaiService } from '../../services/dot-ke-khai.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { D03Service } from '../../bhyt/services/d03.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { XemHoaDonModalComponent } from '../../shared/components/xem-hoa-don-modal/xem-hoa-don-modal.component';
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
  SendOutline,
  ZoomInOutline,
  ZoomOutOutline,
  FullscreenExitOutline,
  RotateLeftOutline,
  RotateRightOutline,
  DownloadOutline
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
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface QuyenBienLai {
  id: number;
  quyen_so: string;
  tu_so: string;
  den_so: string;
  so_hien_tai?: string;
  nhan_vien_thu: number;
  nguoi_cap: string;
  ngay_cap?: Date;
  trang_thai: string;
}

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
  ma_nhan_vien?: string;
  QuyenBienLai?: QuyenBienLai;
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
    NzToolTipModule,
    NzDescriptionsModule,
    XemHoaDonModalComponent
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
  // API Url từ environment
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;
  // Cache cho danh sách đơn vị theo đại lý
  private donVisByDaiLyCache: Map<number, any[]> = new Map();

  // Thêm các thuộc tính cho modal xem hóa đơn
  isViewBillModalVisible = false;
  selectedBillUrl: string = '';
  selectedDotKeKhai: DotKeKhai | null = null;
  bienLaiDienTu: boolean = false;
  willUseBienLaiDienTu: boolean = false;

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

  // Trong phần khai báo các thuộc tính của class DotKeKhaiComponent
  isLoadingDonVis = false;
  dotKeKhai: any = null;
  donViSelected: any = null;
  dotKeKhaiForm: any = null;

  @ViewChild('modalGuiDotKeKhai') modalGuiDotKeKhaiTpl!: TemplateRef<any>;

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private router: Router,
    private iconService: NzIconService,
    private donViService: DonViService,
    private userService: UserService,
    private http: HttpClient,
    private d03Service: D03Service
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
      SendOutline,
      ZoomInOutline,
      ZoomOutOutline,
      FullscreenExitOutline,
      RotateLeftOutline,
      RotateRightOutline,
      DownloadOutline
    );

    const currentDate = new Date();
    this.form = this.fb.group({
      id: [null],
      ten_dot: [{value: '', disabled: true}],
      so_dot: [1, [Validators.required, Validators.min(1)]],
      thang: [currentDate.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      nam: [currentDate.getFullYear(), [Validators.required, Validators.min(2000)]],
      ghi_chu: [null],
      trang_thai: ['chua_gui'],
      nguoi_tao: [this.currentUser.username || '', [Validators.required]],
      don_vi_id: [null, [Validators.required]],
      ma_ho_so: [null],
      is_bien_lai_dien_tu: [false],
      dai_ly_id: [null, [Validators.required]]
    });

    this.form.get('so_dot')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('thang')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('nam')?.valueChanges.subscribe(() => this.updateTenDot());

    // Thêm sự kiện lắng nghe khi thay đổi đại lý
    this.form.get('dai_ly_id')?.valueChanges.subscribe(daiLyId => {
      if (daiLyId) {
        // Reset giá trị đơn vị khi thay đổi đại lý
        this.form.patchValue({ don_vi_id: null }, { emitEvent: false });
        // Load danh sách đơn vị theo đại lý mới
        this.loadDonVisByDaiLy(daiLyId);
      } else {
        // Xóa danh sách đơn vị nếu không có đại lý
        this.donVis = [];
      }
    });

    // Subscribe to dotKeKhais stream
    this.dotKeKhaiService.dotKeKhais$.subscribe(data => {
      this.dotKeKhais = this.sortDotKeKhais(data);
      this.filterData();
    });
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
    this.loadDaiLys();
    this.updateTenDot();

    // Theo dõi thay đổi của don_vi_id
    this.form.get('don_vi_id')?.valueChanges.subscribe(() => {
      this.updateSoDot();
    });

    // Theo dõi thay đổi của thang và nam
    this.form.get('thang')?.valueChanges.subscribe(() => {
      this.updateSoDot();
    });

    this.form.get('nam')?.valueChanges.subscribe(() => {
      this.updateSoDot();
    });

    // Không đăng ký sự kiện valueChanges của dai_ly_id ở đây
    // Sự kiện này sẽ được đăng ký trong phương thức showModal
  }

  private updateSoDot(): void {
    const donViId = this.form.get('don_vi_id')?.value;
    const thang = this.form.get('thang')?.value;
    const nam = this.form.get('nam')?.value;

    if (donViId && thang && nam) {
      this.loading = true;
      // Gọi API để lấy số đợt tiếp theo
      this.dotKeKhaiService.getNextSoDot(donViId, thang, nam).subscribe({
        next: (nextSoDot) => {
          this.form.patchValue({
            so_dot: nextSoDot,
            ten_dot: `Đợt ${nextSoDot} Tháng ${thang} năm ${nam}`
          }, { emitEvent: false });
          this.loading = false;
        },
        error: (error) => {
          console.error('Lỗi khi lấy số đợt:', error);
          this.message.error('Có lỗi xảy ra khi lấy số đợt');
          this.loading = false;
        }
      });
    }
  }

  loadData(): void {
    this.loading = true;
    // Lấy danh sách đợt kê khai
    this.dotKeKhaiService.getDotKeKhais().subscribe({
      next: (data) => {
        console.log('Danh sách đợt kê khai:', data);

        // Lọc theo người tạo
        const filteredData = data.filter(dot => dot.nguoi_tao === this.currentUser.username);

        // Kiểm tra thông tin đơn vị
        filteredData.forEach(dot => {
          if (!dot.DonVi) {
            console.warn(`Đợt kê khai ${dot.ten_dot} không có thông tin đơn vị`);
          } else if (!dot.DonVi.maSoBHXH) {
            console.warn(`Đơn vị của đợt kê khai ${dot.ten_dot} chưa có mã số BHXH`);
          }
        });

        this.dotKeKhais = this.sortDotKeKhais(filteredData);
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

  loadDaiLys(): void {
    this.loading = true;
    this.userService.getDaiLys().subscribe({
      next: (data) => {
        // Nếu user có donViCongTac, lọc theo đại lý của user
        if (this.currentUser.donViCongTac) {
          this.daiLys = data.filter(daiLy => daiLy.ma === this.currentUser.donViCongTac);
        } else {
          // Nếu không có donViCongTac, lấy tất cả đại lý
          this.daiLys = data;
        }

        // Nếu có đại lý và form chưa có giá trị đại lý, tự động set vào form
        // Sử dụng emitEvent: false để tránh kích hoạt sự kiện valueChanges
        if (this.daiLys.length === 1 && !this.form.get('dai_ly_id')?.value) {
          this.form.patchValue({
            dai_ly_id: this.daiLys[0].id
          }, { emitEvent: false });

          // Gọi trực tiếp loadDonVisByDaiLy thay vì thông qua sự kiện valueChanges
          this.loadDonVisByDaiLy(this.daiLys[0].id);
        }
        this.loading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
        this.loading = false;
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

    // Tạm thởi hủy đăng ký sự kiện valueChanges của dai_ly_id để tránh gọi API nhiều lần
    const subscription = this.form.get('dai_ly_id')?.valueChanges.subscribe();
    if (subscription) {
      subscription.unsubscribe();
    }

    // Load danh sách đại lý trước
    this.loading = true;
    this.userService.getDaiLys().subscribe({
      next: (daiLyData) => {
        // Nếu user có donViCongTac, lọc theo đại lý của user
        if (this.currentUser.donViCongTac) {
          this.daiLys = daiLyData.filter(daiLy => daiLy.ma === this.currentUser.donViCongTac);
        } else {
          // Nếu không có donViCongTac, lấy tất cả đại lý
          this.daiLys = daiLyData;
        }

        if (data) {
          // Kiểm tra xem đại lý của đợt kê khai có tồn tại trong danh sách đại lý không
          const daiLyExists = this.daiLys.some(daiLy => daiLy.id === data.dai_ly_id);

          // Nếu không tồn tại và chỉ có một đại lý, sử dụng đại lý đó
          if (!daiLyExists && this.daiLys.length === 1) {
            data.dai_ly_id = this.daiLys[0].id;
          }

          // Disable các control khi cập nhật
          this.disableFormControls();

          // Đầu tiên, load danh sách đơn vị dựa trên đại lý của đợt kê khai
          this.donViService.getDonVisByDaiLy(data.dai_ly_id).subscribe({
            next: (donViData) => {
              this.donVis = donViData;

              // Sau khi có danh sách đơn vị, mới patch giá trị vào form
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
                is_bien_lai_dien_tu: data.is_bien_lai_dien_tu,
                dai_ly_id: data.dai_ly_id
              }, { emitEvent: false });

              this.loading = false;
              this.isVisible = true;

              // Đăng ký lại sự kiện valueChanges của dai_ly_id sau khi đã cập nhật form
              this.form.get('dai_ly_id')?.valueChanges.subscribe(daiLyId => {
                if (daiLyId) {
                  // Reset giá trị đơn vị khi thay đổi đại lý
                  this.form.patchValue({ don_vi_id: null }, { emitEvent: false });
                  // Load danh sách đơn vị theo đại lý mới
                  this.loadDonVisByDaiLy(daiLyId);
                } else {
                  // Xóa danh sách đơn vị nếu không có đại lý
                  this.donVis = [];
                }
              });
            },
            error: (error) => {
              console.error('Lỗi khi tải danh sách đơn vị:', error);
              this.message.error('Có lỗi xảy ra khi tải danh sách đơn vị');
              this.loading = false;
            }
          });
        } else {
          // Enable lại các control khi thêm mới
          this.enableFormControls();

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
            is_bien_lai_dien_tu: true, // Tự động chọn sử dụng biên lai điện tử
            dai_ly_id: this.daiLys.length === 1 ? this.daiLys[0].id : null
          }, { emitEvent: false });

          // Nếu có đại lý được chọn, load danh sách đơn vị
          const daiLyId = this.form.get('dai_ly_id')?.value;
          if (daiLyId) {
            this.loadDonVisByDaiLy(daiLyId);
          }

          this.loading = false;
          this.isVisible = true;

          // Đăng ký lại sự kiện valueChanges của dai_ly_id sau khi đã cập nhật form
          this.form.get('dai_ly_id')?.valueChanges.subscribe(daiLyId => {
            if (daiLyId) {
              // Reset giá trị đơn vị khi thay đổi đại lý
              this.form.patchValue({ don_vi_id: null }, { emitEvent: false });
              // Load danh sách đơn vị theo đại lý mới
              this.loadDonVisByDaiLy(daiLyId);
            } else {
              // Xóa danh sách đơn vị nếu không có đại lý
              this.donVis = [];
            }
          });
        }
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
        this.loading = false;
      }
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextSoDot = this.getNextSoDot(currentYear);

    // Enable lại các controls
    this.enableFormControls();

    this.form.reset({
      so_dot: nextSoDot,
      thang: currentDate.getMonth() + 1,
      nam: currentYear,
      ghi_chu: '',
      trang_thai: 'chua_gui',
      nguoi_tao: this.currentUser.username || '',
      don_vi_id: null,
      ma_ho_so: '',
      is_bien_lai_dien_tu: false,
      dai_ly_id: this.daiLys.length === 1 ? this.daiLys[0].id : null
    }, { emitEvent: false });

    this.updateTenDot();
  }

  handleOk(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      // Kiểm tra đại lý trước khi tạo/cập nhật
      const daiLyId = formValue.dai_ly_id;
      if (daiLyId === undefined || daiLyId === null) {
        // Nếu đang cập nhật, lấy giá trị dai_ly_id từ đợt kê khai hiện tại
        if (this.isEdit && formValue.id) {
          const currentDotKeKhai = this.dotKeKhais.find(d => d.id === formValue.id);
          if (currentDotKeKhai && currentDotKeKhai.dai_ly_id) {
            formValue.dai_ly_id = currentDotKeKhai.dai_ly_id;
          } else if (this.daiLys.length === 1) {
            // Nếu chỉ có một đại lý, sử dụng đại lý đó
            formValue.dai_ly_id = this.daiLys[0].id;
          } else {
            // Nếu không tìm thấy đại lý, hiển thị thông báo lỗi
            this.message.error('Không tìm thấy thông tin đại lý. Vui lòng thử lại.');
            return;
          }
        } else if (this.daiLys.length === 1) {
          // Nếu chỉ có một đại lý, sử dụng đại lý đó
          formValue.dai_ly_id = this.daiLys[0].id;
        } else {
          // Nếu không tìm thấy đại lý, hiển thị thông báo lỗi
          this.message.error('Vui lòng chọn đại lý');
          return;
        }
      }

      // Kiểm tra đơn vị trước khi tạo/cập nhật
      const donViId = formValue.don_vi_id;
      const donVi = this.donVis.find(d => d.id === donViId);

      if (!donVi) {
        this.message.warning('Vui lòng chọn đơn vị');
        return;
      }

      if (!donVi.maSoBHXH) {
        this.modal.confirm({
          nzTitle: 'Cảnh báo',
          nzContent: 'Đơn vị chưa có mã số BHXH. Bạn có muốn tiếp tục?',
          nzOkText: 'Tiếp tục',
          nzCancelText: 'Hủy',
          nzOnOk: () => this.submitForm(formValue)
        });
      } else {
        this.submitForm(formValue);
      }
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  private submitForm(formValue: any): void {
    // Đảm bảo dai_ly_id luôn có giá trị
    if (formValue.dai_ly_id === undefined || formValue.dai_ly_id === null) {
      // Nếu đang cập nhật, lấy giá trị dai_ly_id từ đợt kê khai hiện tại
      if (this.isEdit && formValue.id) {
        const currentDotKeKhai = this.dotKeKhais.find(d => d.id === formValue.id);
        if (currentDotKeKhai && currentDotKeKhai.dai_ly_id) {
          formValue.dai_ly_id = currentDotKeKhai.dai_ly_id;
        } else if (this.daiLys.length === 1) {
          // Nếu chỉ có một đại lý, sử dụng đại lý đó
          formValue.dai_ly_id = this.daiLys[0].id;
        } else {
          // Nếu không tìm thấy đại lý, hiển thị thông báo lỗi
          this.message.error('Không tìm thấy thông tin đại lý. Vui lòng thử lại.');
          return;
        }
      } else if (this.daiLys.length === 1) {
        // Nếu chỉ có một đại lý, sử dụng đại lý đó
        formValue.dai_ly_id = this.daiLys[0].id;
      } else {
        // Nếu không tìm thấy đại lý, hiển thị thông báo lỗi
        this.message.error('Vui lòng chọn đại lý');
        return;
      }
    }

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
        is_bien_lai_dien_tu: formValue.is_bien_lai_dien_tu,
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
        is_bien_lai_dien_tu: formValue.is_bien_lai_dien_tu,
        dai_ly_id: formValue.dai_ly_id,
        dich_vu: formValue.dich_vu || 'BHYT' // Thêm trường dich_vu với giá trị mặc định là BHYT
      };

      this.dotKeKhaiService.createDotKeKhai(createData).subscribe({
        next: (response) => {
          this.message.success('Thêm mới đợt kê khai thành công');
          this.isVisible = false;
          this.loadData();

          // Chuyển hướng dựa trên loại dịch vụ
          if (response && response.id) {
            if (response.dich_vu === 'BHYT') {
              this.router.navigate(['/dot-ke-khai', response.id, 'ke-khai-bhyt']);
            } else if (response.dich_vu === 'BHXH TN') {
              this.router.navigate(['/dot-ke-khai', response.id, 'ke-khai-bhxh']);
            }
          }
        },
        error: (error) => {
          if (error.status === 400 && error.error?.message?.includes('unique constraint')) {
            // Nếu bị trùng, tự động lấy số đợt mới và thử lại
            this.updateSoDot();
            this.message.warning('Đã tự động tăng số đợt do trùng lặp');
          } else {
            this.message.error('Có lỗi xảy ra khi thêm mới đợt kê khai');
          }
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
    } else if (data.dich_vu === 'BHXH TN') {
      this.router.navigate(['/dot-ke-khai', data.id, 'ke-khai-bhxh']);
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

    // Kiểm tra và load thông tin đơn vị nếu cần
    if (!this.donVis.length) {
      this.loadDonVisByDaiLy(data.dai_ly_id);
    }

    // Lấy thông tin đợt kê khai với đầy đủ thông tin đơn vị
    this.loading = true;
    this.dotKeKhaiService.getDotKeKhai(data.id!).subscribe({
      next: (dotKeKhai) => {
        this.loading = false;

        // Kiểm tra thông tin đơn vị từ cache trước
        const donVi = this.donVis.find(d => d.id === dotKeKhai.don_vi_id);
        if (!donVi) {
          // Nếu không có trong cache, load lại danh sách đơn vị
          this.loadDonVisByDaiLy(dotKeKhai.dai_ly_id);
          this.message.warning('Đang tải lại thông tin đơn vị, vui lòng thử lại sau');
          return;
        }

        if (!donVi.maSoBHXH) {
          this.message.warning('Đơn vị chưa có mã số BHXH');
          return;
        }

        // Mở modal thanh toán
        const modalRef = this.modal.create({
          nzTitle: 'QR Thanh toán',
          nzContent: ThanhToanModalComponent,
          nzWidth: 800,
          nzData: {
            dotKeKhai: {
              ...dotKeKhai,
              DonVi: donVi // Gán thông tin đơn vị từ cache
            }
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
      },
      error: (error) => {
        this.loading = false;
        console.error('Lỗi khi lấy thông tin đợt kê khai:', error);
        this.message.error('Có lỗi xảy ra khi lấy thông tin đợt kê khai');
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

    const dotKeKhaiId = data.id;

    // Lấy thông tin user từ service
    this.userService.getCurrentUserInfo().subscribe({
      next: (user) => {
        const maNhanVien = user.maNhanVien || '';
        this.loading = true;
        this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(dotKeKhaiId).subscribe({
          next: (keKhaiBHYTs: any[]) => {
            console.log('Dữ liệu từ API:', keKhaiBHYTs);

            // Sắp xếp dữ liệu theo số biên lai tăng dần
            keKhaiBHYTs.sort((a, b) => {
              // Nếu một trong hai bản ghi không có số biên lai, đặt nó ở cuối
              if (!a.so_bien_lai && !b.so_bien_lai) return 0;
              if (!a.so_bien_lai) return 1;
              if (!b.so_bien_lai) return -1;

              // Nếu cùng quyển biên lai, so sánh số biên lai
              if (a.QuyenBienLai?.quyen_so === b.QuyenBienLai?.quyen_so) {
                return parseInt(a.so_bien_lai) - parseInt(b.so_bien_lai);
              }

              // Nếu khác quyển biên lai, so sánh quyển biên lai
              return (a.QuyenBienLai?.quyen_so || '').localeCompare(b.QuyenBienLai?.quyen_so || '');
            });

            // Cập nhật lại STT sau khi sắp xếp
            keKhaiBHYTs = keKhaiBHYTs.map((item, index) => ({
              ...item,
              stt: index + 1
            }));

            // In ra console để kiểm tra dữ liệu sau khi sắp xếp
            console.log('Dữ liệu sau khi sắp xếp theo số biên lai:', keKhaiBHYTs.map(item => ({
              stt: item.stt,
              ngay_tao: item.ngay_tao,
              ho_ten: item.ho_ten,
              so_bien_lai: item.so_bien_lai || 'N/A',
              quyen_so: item.QuyenBienLai?.quyen_so || 'N/A'
            })));

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
              'MaNhanvienThu', // Cột BL - Mã nhân viên thu
            ];

            // Thêm 2 dòng trống trước header
            const emptyRows = [
              Array(13).fill(''),  // Dòng 1 trống với 13 cột
              Array(13).fill('')   // Dòng 2 trống với 13 cột
            ];

            const keKhaiData = keKhaiBHYTs.map((item: any) => [
              item.stt, // Sử dụng STT từ API
              item.ho_ten,
              item.ma_so_bhxh || '',
              maNhanVien, // Sử dụng mã nhân viên từ API
              '1', // Cột E giá trị mặc định là 1
              this.getPhuongAnDongText(item.phuong_an_dong || ''),
              '', // Cột G trống
              item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : '',
              item.so_bien_lai ? (item.QuyenBienLai ?
                `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
                item.so_bien_lai
              ) : '',
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
              // Cột Y - Thêm "nghỉ học" nếu người tham gia có tuổi nhỏ hơn 18
              this.isUnder18(item.ngay_sinh) ? 'Nghỉ học' : (item.is_urgent ? 'Thẻ Gấp' : ''),
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
              item.quoc_tich || 'VN', // Cột AK hiển thị quốc tịch, mặc định là VN
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
              item.so_bien_lai ? (item.QuyenBienLai ?
                `${item.QuyenBienLai.quyen_so}${item.so_bien_lai.padStart(5, '0')}` :
                item.so_bien_lai
              ) : '', // Cột BJ - Số biên lai
              item.ngay_bien_lai ? new Date(item.ngay_bien_lai).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : '', // Cột BK - Ngày biên lai
              item.ma_nhan_vien || '', // Cột BL - Mã nhân viên thu từ API
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
              { wch: 10 }, // Cột L
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
              { wch: 15 }, // Cột BL trống
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
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        this.message.error('Có lỗi xảy ra khi lấy thông tin người dùng');
        this.loading = false;
      }
    });
  }

  // Thêm hàm chuyển đổi giới tính
  getGioiTinhValue(gioiTinh: string): string {
    return gioiTinh?.toLowerCase() === 'nam' ? '1' : '0';
  }

  // Thêm hàm kiểm tra tuổi
  isUnder18(ngaySinh: string | Date | null | undefined): boolean {
    if (!ngaySinh) return false;

    const birthDate = new Date(ngaySinh);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Nếu chưa tới tháng sinh nhật hoặc tới tháng sinh nhật nhưng chưa tới ngày sinh nhật
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 18;
  }

  showViewBillModal(url: string): void {
    // Tìm đợt kê khai tương ứng với hóa đơn này
    const dotKeKhai = this.dotKeKhais.find(d => d.url_bill === url);

    this.selectedBillUrl = url;
    this.selectedDotKeKhai = dotKeKhai || null;
    this.isViewBillModalVisible = true;
  }

  handleViewBillModalCancel(): void {
    this.isViewBillModalVisible = false;
    this.selectedBillUrl = '';
    this.selectedDotKeKhai = null;
  }

  downloadBill(): void {
    if (!this.selectedBillUrl) {
      this.message.error('Không có hình ảnh hóa đơn để tải xuống');
      return;
    }

    if (!this.selectedDotKeKhai) {
      this.message.error('Không có thông tin đợt kê khai');
      return;
    }

    // Lấy mã hồ sơ và mã nhân viên
    const maHoSo = this.selectedDotKeKhai.ma_ho_so || 'unknown';
    const maNhanVien = this.currentUser.username || 'unknown';

    // Tạo một thẻ a ẩn để tải xuống hình ảnh
    const link = document.createElement('a');
    link.href = this.selectedBillUrl;
    link.download = `${maHoSo}_${maNhanVien}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.message.success('Đang tải xuống hóa đơn');
  }

  downloadAllBills(): void {
    // Lấy danh sách các đợt kê khai đã chọn
    const selectedDotKeKhais = this.dotKeKhais.filter(item => this.checkedSet.has(item.id!));

    // Kiểm tra nếu không có đợt kê khai nào được chọn
    if (selectedDotKeKhais.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một đợt kê khai có hóa đơn');
      return;
    }

    // Lọc các đợt kê khai có hóa đơn
    const dotKeKhaisWithBill = selectedDotKeKhais.filter(item => item.url_bill);

    if (dotKeKhaisWithBill.length === 0) {
      this.message.warning('Không có hóa đơn nào trong các đợt kê khai đã chọn');
      return;
    }

    // Hiển thị thông báo đang tải
    const loadingMessageId = this.message.loading(`Đang chuẩn bị tải ${dotKeKhaisWithBill.length} hóa đơn...`, { nzDuration: 0 }).messageId;

    // Lấy mã nhân viên
    const maNhanVien = this.currentUser.username || 'unknown';

    // Tạo một mảng để lưu trữ các blob của ảnh
    const imageBlobs: { fileName: string, blob: Blob }[] = [];

    // Hàm tải ảnh từ URL
    const downloadImage = (dotKeKhai: DotKeKhai) => {
      return new Promise<void>((resolve, reject) => {
        if (!dotKeKhai.url_bill) {
          resolve();
          return;
        }

        // Tải ảnh từ URL
        fetch(dotKeKhai.url_bill)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Không thể tải ảnh: ${response.statusText}`);
            }
            return response.blob();
          })
          .then(blob => {
            // Lấy mã hồ sơ và đảm bảo không có ký tự đặc biệt
            const maHoSo = (dotKeKhai.ma_ho_so || 'unknown').replace(/[\/\\:*?"<>|]/g, '_');

            // Tạo tên file theo cú pháp "mã hồ sơ_mã nhân viên.jpg"
            // Đảm bảo không có ký tự đặc biệt trong tên file
            const fileName = `${maHoSo}_${maNhanVien.replace(/[\/\\:*?"<>|]/g, '_')}.jpg`;

            // Thêm vào mảng imageBlobs
            imageBlobs.push({ fileName, blob });

            resolve();
          })
          .catch(error => {
            console.error(`Lỗi khi tải ảnh cho đợt kê khai ${dotKeKhai.id}:`, error);
            reject(error);
          });
      });
    };

    // Tải tất cả ảnh
    const downloadPromises = dotKeKhaisWithBill.map(dotKeKhai => downloadImage(dotKeKhai));

    Promise.all(downloadPromises)
      .then(() => {
        try {
          // Tạo file ZIP mới
          const zip = new JSZip();

          // Thêm các ảnh vào ZIP
          imageBlobs.forEach(item => {
            // Đảm bảo tên file không chứa đường dẫn
            const simpleName = item.fileName.split(/[\/\\]/).pop() || item.fileName;
            zip.file(simpleName, item.blob);
          });

          // Tạo file ZIP
          return zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
          });
        } catch (error) {
          throw error;
        }
      })
      .then(content => {
        // Tải xuống file ZIP
        saveAs(content, `hoa-don.zip`);

        // Đóng thông báo loading và hiển thị thông báo thành công
        this.message.remove(loadingMessageId);
        this.message.success(`Đã tải xuống ${imageBlobs.length} hóa đơn thành công`);
      })
      .catch(error => {
        // Đóng thông báo loading và hiển thị thông báo lỗi
        this.message.remove(loadingMessageId);
        console.error('Lỗi khi tạo file ZIP:', error);
        this.message.error('Có lỗi xảy ra khi tải xuống hóa đơn');
      });
  }

  getSelectedBillCount(): number {
    // Lấy danh sách các đợt kê khai đã chọn
    const selectedDotKeKhais = this.dotKeKhais.filter(item => this.checkedSet.has(item.id!));

    // Đếm số lượng đợt kê khai có hóa đơn
    return selectedDotKeKhais.filter(item => item.url_bill).length;
  }

  guiDotKeKhai(data: DotKeKhai): void {
    // Kiểm tra cả hai thuộc tính liên quan đến biên lai điện tử
    console.log('Đợt kê khai cần gửi:', data);
    const useBienLaiDienTu = !!(data.is_bien_lai_dien_tu || data.bien_lai_dien_tu);
    console.log('Sử dụng biên lai điện tử:', useBienLaiDienTu);

    // Cập nhật biến willUseBienLaiDienTu để hiển thị thông báo trong modal
    this.willUseBienLaiDienTu = useBienLaiDienTu;

    // Hiển thị modal xác nhận gửi đợt kê khai
    this.modal.confirm({
      nzTitle: 'Xác nhận gửi',
      nzContent: this.modalGuiDotKeKhaiTpl,
      nzOkText: 'Gửi',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.loading = true;
        this.dotKeKhaiService.guiDotKeKhai(data.id!, useBienLaiDienTu).subscribe({
          next: () => {
            if (useBienLaiDienTu) {
              this.message.success('Gửi đợt kê khai thành công với biên lai điện tử');
            } else {
              this.message.success('Gửi đợt kê khai thành công');
            }
            this.loading = false;
            this.loadData(); // Tải lại dữ liệu sau khi gửi thành công
          },
          error: (error) => {
            console.error('Lỗi khi gửi đợt kê khai:', error);
            // Hiển thị thông báo lỗi từ server nếu có
            if (error.error && error.error.message) {
              this.message.error(error.error.message);
            } else {
              this.message.error('Có lỗi xảy ra khi gửi đợt kê khai');
            }
            this.loading = false;
          }
        });
      }
    });
  }

  // Thêm hàm loadDonVisByDaiLy
  loadDonVisByDaiLy(daiLyId?: number): void {
    this.isLoadingDonVis = true;

    if (!daiLyId) {
      this.donVis = [];
      this.isLoadingDonVis = false;
      return;
    }

    // Gọi service method đã được tối ưu hóa với caching
    this.donViService.getDonVisByDaiLy(daiLyId).subscribe({
      next: (donVis) => {
        this.donVis = donVis;

        // Kiểm tra nếu có đơn vị nào không có mã số BHXH thì hiển thị cảnh báo
        const donVisWithoutMaSoBHXH = donVis.filter(donVi => !donVi.maSoBHXH);
        if (donVisWithoutMaSoBHXH.length > 0) {
          console.warn('Có đơn vị không có mã số BHXH:', donVisWithoutMaSoBHXH);
        }

        // Nếu đợt kê khai đã có đơn vị, thì chọn đơn vị đó
        if (this.dotKeKhai && this.dotKeKhai.don_vi_id) {
          const donVi = this.donVis.find(dv => dv.id === this.dotKeKhai.don_vi_id);
          if (donVi) {
            this.donViSelected = donVi;
            this.dotKeKhaiForm.patchValue({
              don_vi_id: donVi.id
            });
          }
        }

        this.isLoadingDonVis = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đơn vị:', error);
        this.isLoadingDonVis = false;
      }
    });
  }

  // Thêm hàm để disable form controls
  private disableFormControls(): void {
    this.form.get('so_dot')?.disable();
    this.form.get('thang')?.disable();
    this.form.get('nam')?.disable();
    this.form.get('dai_ly_id')?.disable();
    this.form.get('ten_dot')?.disable();
  }

  // Thêm hàm để enable form controls
  private enableFormControls(): void {
    this.form.get('so_dot')?.enable();
    this.form.get('thang')?.enable();
    this.form.get('nam')?.enable();
    this.form.get('dai_ly_id')?.enable();
    this.form.get('ten_dot')?.disable(); // ten_dot luôn bị disable
  }

  // Sửa lại hàm loadDonVis
  loadDonVis(): void {
    // Nếu có đại lý được chọn, load đơn vị theo đại lý đó
    const daiLyId = this.form.get('dai_ly_id')?.value;
    if (daiLyId) {
      this.loadDonVisByDaiLy(daiLyId);
    }
  }

  // Hàm xuất BHXH VNPT
  exportBHXHVNPT(data: DotKeKhai): void {
    if (!data || !data.id) {
      this.message.error('Không tìm thấy thông tin đợt kê khai');
      return;
    }

    this.loading = true;
    this.message.loading('Đang xuất dữ liệu BHXH VNPT...', { nzDuration: 0 });

    // Gọi API mới để lấy dữ liệu JSON thay vì file Excel
    this.http.get(`${this.apiUrl}/${data.id}/ke-khai-bhxh-export-vnpt-sheetjs`).subscribe({
      next: (response: any) => {
        try {
          // Tạo workbook mới
          const wb = XLSX.utils.book_new();

          // Thêm 2 dòng trống
          const emptyRows = [
            Array(13).fill(''),  // Dòng 1 trống với 13 cột
            Array(13).fill('')   // Dòng 2 trống với 13 cột
          ];

          // Tạo header cho worksheet
          const headers = [
            'STT',
            'HoTen',
            'MasoBHXH',
            'Loai',
            'PA',
            'MucTien',
            'Tuthang',
            'Sothang',
            'Tyle',
            'TyleNSNN',
            'TienHotro',
            'TyleNSDP',
            'TienNSDP',
            'TyleHotroKhac',
            'TienHotroKhac',
            'TienTudong',
            'Tongtien',
            'TenTinhDangSS',
            'Matinh_DangSS',
            'TenhuyenDangSS',
            'Mahuyen_DangSS',
            'TenxaDangSS',
            'Maxa_DangSS',
            'Diachi_DangSS',
            'Ghichu',
            'Phuongthuc',
            'Heso',
            'SoCCCD',
            'SoBienLai',
            'NgayBienLai',
            'MaNhanvienThu',
            'Tk1_Save',
            'CMND',
            'Maho_Giadinh',
            'NgaySinh',
            'GioiTinh',
            'TenQuocTich',
            'QuocTich',
            'TenDanToc',
            'DanToc',
            'TenTinhBenhVien',
            'MaTinhBenhVien',
            'TenBenhVien',
            'MaBenhVien',
            'TenTinhKS',
            'Matinh_KS',
            'TenHuyenKS',
            'Mahuyen_KS',
            'TenXaKS',
            'Maxa_KS',
            'TenTinhNN',
            'Matinh_NN',
            'TenHuyenNN',
            'Mahuyen_NN',
            'TenXaNN',
            'Maxa_NN',
            'Diachi_NN'
          ];

          // Chuyển đổi dữ liệu từ JSON sang định dạng mảng 2 chiều cho XLSX
          const keKhaiBHXHs = response.keKhaiBHXHs || [];
          const keKhaiData = keKhaiBHXHs.map((item: any) => {
            // Giữ nguyên phương án đóng
            const phuongAn = item.phuong_an;

            return [
              item.stt,
              item.ho_ten,
              item.ma_so_bhxh,
              1, // Cột loại mặc định là 1
              phuongAn, // Sử dụng giá trị đã được xử lý
              item.muc_tien,
              item.tu_thang,
              item.so_thang,
              item.ty_le,
              item.ty_le_nsnn,
              item.tien_ho_tro,
              item.ty_le_nsdp,
              item.tien_nsdp,
              item.ty_le_ho_tro_khac,
              item.tien_ho_tro_khac,
              item.so_tien_can_dong, // Sử dụng so_tien_can_dong thay vì tien_tu_dong
              item.tong_tien,
              item.ten_tinh_dang_ss,
              item.ma_tinh_dang_ss,
              item.ten_huyen_dang_ss,
              item.ma_huyen_dang_ss,
              item.ten_xa_dang_ss,
              item.ma_xa_dang_ss,
              item.dia_chi_dang_ss || ".",
              item.ghi_chu,
              item.phuong_thuc_dong, // Sử dụng phuong_thuc_dong cho cột phương thức
              item.he_so,
              item.so_cccd,
              item.so_bien_lai,
              item.ngay_bien_lai,
              item.ma_nhan_vien_thu,
              item.tk1_save,
              item.cmnd,
              item.ma_ho_gia_dinh,
              item.ngay_sinh,
              item.gioi_tinh,
              item.ten_quoc_tich,
              item.quoc_tich,
              item.ten_dan_toc,
              item.dan_toc,
              item.ten_tinh_benh_vien,
              item.ma_tinh_benh_vien,
              item.ten_benh_vien,
              item.ma_benh_vien,
              item.ten_tinh_ks,
              item.ma_tinh_ks,
              item.ten_huyen_ks,
              item.ma_huyen_ks,
              item.ten_xa_ks,
              item.ma_xa_ks,
              item.ten_tinh_nn,
              item.ma_tinh_nn,
              item.ten_huyen_nn,
              item.ma_huyen_nn,
              item.ten_xa_nn,
              item.ma_xa_nn,
              item.dia_chi_nn
            ];
          });

          // Tạo worksheet từ dữ liệu
          const ws = XLSX.utils.aoa_to_sheet([...emptyRows, headers, ...keKhaiData]);

          // Thiết lập độ rộng cột
          ws['!cols'] = [
            { wch: 5 },     // STT
            { wch: 30 },    // Họ tên
            { wch: 15 },    // Mã số BHXH
            { wch: 8 },     // Loại
            { wch: 8 },     // PA
            { wch: 15 },    // Mức tiền
            { wch: 10 },    // Từ tháng
            { wch: 8 },     // Số tháng
            { wch: 8 },     // Tỷ lệ
            { wch: 10 },    // Tỷ lệ NSNN
            { wch: 15 },    // Tiền hỗ trợ
            { wch: 10 },    // Tỷ lệ NSDP
            { wch: 15 },    // Tiền NSDP
            { wch: 15 },    // Tỷ lệ hỗ trợ khác
            { wch: 15 },    // Tiền hỗ trợ khác
            { wch: 15 },    // Tiền tự đóng
            { wch: 15 },    // Tổng tiền
            { wch: 20 },    // Tên tỉnh đăng ký
            { wch: 15 },    // Mã tỉnh đăng ký
            { wch: 20 },    // Tên huyện đăng ký
            { wch: 15 },    // Mã huyện đăng ký
            { wch: 20 },    // Tên xã đăng ký
            { wch: 15 },    // Mã xã đăng ký
            { wch: 40 },    // Địa chỉ đăng ký
            { wch: 20 },    // Ghi chú
            { wch: 15 },    // Phương thức
            { wch: 8 },     // Hệ số
            { wch: 15 },    // Số CCCD
            { wch: 15 },    // Số biên lai
            { wch: 15 },    // Ngày biên lai
            { wch: 15 },    // Mã nhân viên thu
          ];

          // Thêm worksheet vào workbook
          XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu');

          // Tạo tên file với timestamp
          const fileName = `BHXH_VNPT_${data.ten_dot?.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;

          // Xuất file Excel
          XLSX.writeFile(wb, fileName);

          this.message.remove();
          this.message.success('Đã xuất dữ liệu BHXH VNPT thành công');
        } catch (error) {
          console.error('Lỗi khi tạo file Excel:', error);
          this.message.remove();
          this.message.error('Có lỗi xảy ra khi tạo file Excel');
        } finally {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu BHXH VNPT:', error);
        this.message.remove();
        this.message.error('Có lỗi xảy ra khi lấy dữ liệu BHXH VNPT');
        this.loading = false;
      }
    });
  }

  // Hàm xuất D03-TS
  exportD03TS(data: DotKeKhai): void {
    // Kiểm tra data và ID
    if (!data) {
      this.message.error('Không có dữ liệu đợt kê khai');
      return;
    }

    if (!data.id) {
      this.message.error('Không tìm thấy ID của đợt kê khai');
      return;
    }

    // Kiểm tra trạng thái đợt kê khai
    if (['chua_gui', 'tu_choi'].includes(data.trang_thai)) {
      this.modal.confirm({
        nzTitle: 'Thông báo',
        nzContent: `Đợt kê khai này có trạng thái "${this.getTagText(data.trang_thai)}". Bạn có chắc chắn muốn xuất dữ liệu D03-TS không?`,
        nzOkText: 'Đồng ý',
        nzCancelText: 'Hủy',
        nzOnOk: () => this.processExportD03TS(data)
      });
      return;
    }

    // Tiến hành xuất bình thường cho các trạng thái khác
    this.processExportD03TS(data);
  }

  // Hàm xử lý xuất D03-TS sau khi kiểm tra
  private processExportD03TS(data: DotKeKhai): void {
    // Chỉ cho phép xuất D03-TS đối với dịch vụ BHYT
    if (data.dich_vu !== 'BHYT') {
      this.message.warning('Chức năng xuất D03-TS chỉ áp dụng cho đợt kê khai BHYT');
      return;
    }

    try {
      this.loading = true;
      const messageId = this.message.loading('Đang chuẩn bị xuất D03-TS...', { nzDuration: 0 }).messageId;

      // Kiểm tra thông tin đơn vị
      const donVi = this.donVis.find(d => d.id === data.don_vi_id);
      if (!donVi) {
        this.message.remove(messageId);
        this.message.error('Không tìm thấy thông tin đơn vị');
        this.loading = false;
        return;
      }

      // Kiểm tra mã số BHXH của đơn vị
      if (!donVi.maSoBHXH) {
        this.message.remove(messageId);
        this.message.warning('Đơn vị chưa có mã số BHXH, dữ liệu xuất có thể không đầy đủ');
      }

      // Lấy thông tin đại lý
      const daiLy = this.daiLys.find(d => d.id === data.dai_ly_id);

      // Chuẩn bị options cho D03
      const options = {
        tenCongTy: donVi.tenDonVi || '',
        maDonVi: donVi.maSoBHXH || '',
        diaChi: donVi.diaChi || '',
        nguoiLap: this.currentUser?.username || data.nguoi_tao || '',
        ngayLap: new Date(),
        tenDaiLy: daiLy?.ten || '',
        dotKeKhaiId: data.id,
        tenDotKeKhai: data.ten_dot || ''
      };

      // Gọi service để xuất D03-TS và xử lý kết quả
      this.d03Service.getD03Data(data.id!).subscribe({
        next: (d03Data) => {
          if (!d03Data || (Array.isArray(d03Data) && d03Data.length === 0)) {
            this.message.remove(messageId);
            this.message.warning('Không tìm thấy dữ liệu D03-TS cho đợt kê khai này');
            this.loading = false;
            return;
          }

          try {
            // Xuất dữ liệu ra Excel
            this.d03Service.xuatExcelMauD03TS(d03Data, options);
            this.message.remove(messageId);
            // Thông báo thành công đã được xử lý trong d03.service.ts
          } catch (error) {
            console.error('Lỗi khi xuất Excel D03-TS:', error);
            this.message.remove(messageId);
            this.message.error('Lỗi khi tạo file Excel D03-TS');
          } finally {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy dữ liệu D03-TS:', error);
          this.message.remove(messageId);

          if (error.status === 404) {
            this.message.error(`Không tìm thấy dữ liệu D03-TS cho đợt kê khai ID: ${data.id}`);
          } else if (error.status === 403) {
            this.message.error('Bạn không có quyền truy cập dữ liệu D03-TS');
          } else if (error.status === 0) {
            this.message.error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng');
          } else {
            this.message.error('Có lỗi xảy ra khi lấy dữ liệu D03-TS: ' + (error.message || 'Lỗi không xác định'));
          }

          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Lỗi khi xuất D03-TS:', error);
      this.message.error('Có lỗi không xác định xảy ra khi xuất D03-TS');
      this.loading = false;
    }
  }

  // Hàm kiểm tra xem có đợt kê khai BHYT nào được chọn không
  hasBHYTSelected(): boolean {
    if (this.selectedIds.length === 0) return false;

    // Kiểm tra xem có ít nhất một đợt kê khai BHYT được chọn
    return this.dotKeKhais.some(dot =>
      this.selectedIds.includes(dot.id!) && dot.dich_vu === 'BHYT'
    );
  }

  // Hàm đếm số lượng đợt kê khai BHYT đã chọn
  getSelectedBHYTCount(): number {
    return this.dotKeKhais.filter(dot =>
      this.selectedIds.includes(dot.id!) && dot.dich_vu === 'BHYT'
    ).length;
  }

  // Hàm xuất D03-TS cho nhiều đợt kê khai đã chọn
  exportD03TSForSelected(): void {
    // Lọc ra các đợt kê khai BHYT đã chọn
    const selectedBHYTDots = this.dotKeKhais.filter(dot =>
      this.selectedIds.includes(dot.id!) && dot.dich_vu === 'BHYT'
    );

    if (selectedBHYTDots.length === 0) {
      this.message.warning('Không có đợt kê khai BHYT nào được chọn');
      return;
    }

    // Hiển thị modal xác nhận nếu có đợt kê khai không phải trạng thái hoàn thành
    const nonCompletedDots = selectedBHYTDots.filter(dot => dot.trang_thai !== 'hoan_thanh');
    if (nonCompletedDots.length > 0) {
      this.modal.confirm({
        nzTitle: 'Thông báo',
        nzContent: `Có ${nonCompletedDots.length} đợt kê khai chưa hoàn thành. Bạn có chắc chắn muốn xuất dữ liệu D03-TS không?`,
        nzOkText: 'Đồng ý',
        nzCancelText: 'Hủy',
        nzOnOk: () => this.processExportD03TSForSelected(selectedBHYTDots)
      });
      return;
    }

    // Nếu tất cả đều hoàn thành, tiến hành xuất luôn
    this.processExportD03TSForSelected(selectedBHYTDots);
  }

  // Hàm xử lý xuất D03-TS cho nhiều đợt kê khai
  private processExportD03TSForSelected(selectedDots: DotKeKhai[]): void {
    if (selectedDots.length === 0) return;

    this.loading = true;
    const messageId = this.message.loading(`Đang chuẩn bị xuất D03-TS cho ${selectedDots.length} đợt kê khai...`, { nzDuration: 0 }).messageId;

    // Tạo mảng các Observable để lấy dữ liệu D03 cho từng đợt kê khai
    const observables = selectedDots.map(dot => {
      return this.d03Service.getD03Data(dot.id!);
    });

    // Sử dụng forkJoin để chờ tất cả các request hoàn thành
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(observables).subscribe({
        next: (results) => {
          // Gộp tất cả dữ liệu từ các đợt kê khai
          let allD03Data: any[] = [];
          let hasData = false;

          results.forEach((d03Data, index) => {
            if (d03Data && Array.isArray(d03Data) && d03Data.length > 0) {
              hasData = true;
              // Thêm thông tin đợt kê khai vào mỗi bản ghi
              const dotKeKhai = selectedDots[index];
              const donVi = this.donVis.find(d => d.id === dotKeKhai.don_vi_id);
              const daiLy = this.daiLys.find(d => d.id === dotKeKhai.dai_ly_id);

              // Thêm thông tin đợt kê khai vào ghi chú của mỗi bản ghi
              const enhancedData = d03Data.map(item => ({
                ...item,
                ghiChu: `${item.ghiChu || ''} - Đợt: ${dotKeKhai.ten_dot}`.trim()
              }));

              allD03Data = [...allD03Data, ...enhancedData];
            }
          });

          if (!hasData || allD03Data.length === 0) {
            this.message.remove(messageId);
            this.message.warning('Không tìm thấy dữ liệu D03-TS cho các đợt kê khai đã chọn');
            this.loading = false;
            return;
          }

          try {
            // Lấy thông tin đơn vị từ đợt kê khai đầu tiên để làm thông tin chung
            const firstDot = selectedDots[0];
            const donVi = this.donVis.find(d => d.id === firstDot.don_vi_id);
            const daiLy = this.daiLys.find(d => d.id === firstDot.dai_ly_id);

            if (!donVi) {
              this.message.remove(messageId);
              this.message.error('Không tìm thấy thông tin đơn vị');
              this.loading = false;
              return;
            }

            // Chuẩn bị options cho D03
            const options = {
              tenCongTy: donVi.tenDonVi || '',
              maDonVi: donVi.maSoBHXH || '',
              diaChi: donVi.diaChi || '',
              nguoiLap: this.currentUser?.username || '',
              ngayLap: new Date(),
              tenDaiLy: daiLy?.ten || '',
              tenDotKeKhai: `Nhiều đợt kê khai (${selectedDots.length})`
            };

            // Xuất dữ liệu ra Excel
            this.d03Service.xuatExcelMauD03TS(allD03Data, options);
            this.message.remove(messageId);
            this.message.success(`Đã xuất D03-TS cho ${selectedDots.length} đợt kê khai thành công`);
          } catch (error) {
            console.error('Lỗi khi xuất Excel D03-TS:', error);
            this.message.remove(messageId);
            this.message.error('Lỗi khi tạo file Excel D03-TS');
          } finally {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy dữ liệu D03-TS:', error);
          this.message.remove(messageId);
          this.message.error('Có lỗi xảy ra khi lấy dữ liệu D03-TS: ' + (error.message || 'Lỗi không xác định'));
          this.loading = false;
        }
      });
    }).catch(error => {
      console.error('Lỗi khi import rxjs:', error);
      this.message.remove(messageId);
      this.message.error('Có lỗi xảy ra khi xử lý dữ liệu');
      this.loading = false;
    });
  }
}