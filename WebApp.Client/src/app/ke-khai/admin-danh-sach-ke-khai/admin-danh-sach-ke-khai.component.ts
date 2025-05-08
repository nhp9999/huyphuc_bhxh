import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { DotKeKhaiService, DotKeKhai } from '../../services/dot-ke-khai.service';
import { KeKhaiBHYTService } from '../../services/ke-khai-bhyt.service';
import { UserService } from '../../services/user.service';
import { DonViService, DonVi } from '../../services/don-vi.service';
import { ExportVnptService } from '../../services/export-vnpt.service';
import * as XLSX from 'xlsx';
import {
  ExportOutline,
  EyeOutline,
  EditOutline,
  DeleteOutline,
  FileExcelOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  SearchOutline,
  FilterOutline,
  ReloadOutline,
  SendOutline,
  FileOutline,
  DatabaseOutline,
  FileImageOutline,
  DownloadOutline,
  DollarOutline
} from '@ant-design/icons-angular/icons';
import { environment } from '../../../environments/environment';
import { XemHoaDonModalComponent } from '../../shared/components/xem-hoa-don-modal/xem-hoa-don-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-danh-sach-ke-khai',
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
    NzSelectModule,
    NzCardModule,
    NzDividerModule,
    NzDropDownModule,
    NzToolTipModule,
    NzBadgeModule,
    NzSpinModule,
    NzStatisticModule,
    NzTabsModule,
    NzAlertModule,
    NzCheckboxModule,
    XemHoaDonModalComponent,
    NzMenuModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-danh-sach-ke-khai.component.html',
  styleUrls: ['./admin-danh-sach-ke-khai.component.scss']
})
export class AdminDanhSachKeKhaiComponent implements OnInit {
  dotKeKhaiList: DotKeKhai[] = [];
  originalDotKeKhaiList: DotKeKhai[] = []; // Lưu trữ dữ liệu gốc
  loading = false;
  searchText = '';

  // Biến cho modal chi tiết
  isModalChiTietVisible = false;
  danhSachKeKhai: any[] = [];
  loadingKeKhai = false;

  // Biến lưu danh sách id đợt kê khai đã được chọn
  danhSachDaChon = new Set<number>();

  // Biến cho modal hiển thị hóa đơn
  isModalVisible = false;
  selectedDotKeKhai: DotKeKhai | null = null;
  selectedHoaDonUrl: string | null = null;

  // Cache hóa đơn đã tải
  private imageCache: Map<string, string> = new Map();

  // Cache số lượng theo trạng thái
  private statusCountCache: Map<string, number> = new Map();

  // Biến cho tab
  tabTrangThaiIndex = 0;

  danhSachFilters = {
    dichVu: null as string | null,
    trangThai: null as string | null,
    donVi: null as number | null,
    nam: null as number | null,
    thang: null as number | null,
    maNhanVien: null as string | null,
    ngayGuiTu: null as Date | null, // Ngày gửi từ
    ngayGuiDen: null as Date | null // Ngày gửi đến
  };
  danhSachDichVu = [
    { text: 'BHYT', value: 'BHYT' },
    { text: 'BHXH TN', value: 'BHXH TN' }
  ];
  danhSachTrangThai = [
    { text: 'Chưa gửi', value: 'chua_gui' },
    { text: 'Đã gửi', value: 'da_gui' },
    { text: 'Đã duyệt', value: 'da_duyet' },
    { text: 'Đã từ chối', value: 'da_tu_choi' },
    { text: 'Chờ thanh toán', value: 'cho_thanh_toan' },
    { text: 'Chờ xử lý', value: 'cho_xu_ly' },
    { text: 'Hoàn thành', value: 'hoan_thanh' },
    { text: 'Đang xử lý', value: 'dang_xu_ly' }
  ];
  danhSachThang = Array.from({ length: 12 }, (_, i) => ({
    text: `Tháng ${i + 1}`,
    value: i + 1
  }));
  danhSachNam = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { text: `Năm ${year}`, value: year };
  });
  danhSachDonVi: { text: string; value: number }[] = [];

  // Form và modal nhập mã nhân viên
  maNhanVienForm!: FormGroup;
  isModalNhapMaNhanVienVisible = false;

  // Biến cho modal xác nhận xóa đợt kê khai
  isModalXoaVisible = false;
  dotKeKhaiToDelete: DotKeKhai | null = null;

  // Biến cho chế độ chỉnh sửa
  editingId: number | null = null;
  maHoSoTemp: string = '';

  // Biến cho chế độ chỉnh sửa trạng thái
  editingTrangThaiId: number | null = null;
  trangThaiTemp: string = '';

  // Định dạng số tiền VND
  formatterVND = (value: number): string => `${value.toLocaleString('vi-VN')}`;

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private keKhaiBHYTService: KeKhaiBHYTService,
    private userService: UserService,
    private donViService: DonViService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private iconService: NzIconService,
    private exportVnptService: ExportVnptService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.iconService.addIcon(...[
      ExportOutline,
      EyeOutline,
      EditOutline,
      DeleteOutline,
      FileExcelOutline,
      CheckCircleOutline,
      CloseCircleOutline,
      SearchOutline,
      FilterOutline,
      ReloadOutline,
      SendOutline,
      FileOutline,
      DatabaseOutline,
      FileImageOutline,
      DownloadOutline,
      DollarOutline
    ]);

    // Khởi tạo form
    this.maNhanVienForm = this.fb.group({
      maNhanVien: ['', [Validators.required]],
      luuMaNhanVien: [true]
    });
  }

  ngOnInit(): void {
    this.loadDotKeKhaiList();
    this.loadDonViList();

    // Tải mã nhân viên từ localStorage nếu có
    const savedMaNhanVien = localStorage.getItem('maNhanVienThu');
    if (savedMaNhanVien) {
      this.maNhanVienForm.patchValue({
        maNhanVien: savedMaNhanVien
      });
    }
  }

  // Phương thức đếm số lượng đợt kê khai theo trạng thái với cache
  getCountByStatus(status: string): number {
    // Kiểm tra cache trước
    if (this.statusCountCache.has(status)) {
      return this.statusCountCache.get(status) || 0;
    }

    if (!this.originalDotKeKhaiList || this.originalDotKeKhaiList.length === 0) return 0;

    // Tính và cache kết quả từ dữ liệu gốc
    const count = this.originalDotKeKhaiList.filter(item => item.trang_thai === status).length;
    this.statusCountCache.set(status, count);
    return count;
  }

  // Cập nhật cache số lượng
  private updateStatusCountCache(): void {
    this.statusCountCache.clear();
    this.danhSachTrangThai.forEach(status => {
      const count = this.originalDotKeKhaiList.filter(item => item.trang_thai === status.value).length;
      this.statusCountCache.set(status.value, count);
    });
  }

  // Filter theo trạng thái khi click vào thẻ thống kê
  filterByStatus(status: string): void {
    this.danhSachFilters.trangThai = status;

    // Cập nhật tab tương ứng với trạng thái
    switch (status) {
      case 'cho_thanh_toan':
        this.tabTrangThaiIndex = 1;
        break;
      case 'cho_xu_ly':
        this.tabTrangThaiIndex = 2;
        break;
      case 'dang_xu_ly':
        this.tabTrangThaiIndex = 3;
        break;
      case 'hoan_thanh':
        this.tabTrangThaiIndex = 4;
        break;
      case 'da_tu_choi':
        this.tabTrangThaiIndex = 5;
        break;
      default:
        this.tabTrangThaiIndex = 0;
        break;
    }

    this.applyFilters();
  }

  loadDotKeKhaiList(): void {
    this.loading = true;
    this.danhSachDaChon.clear(); // Xóa danh sách đã chọn khi tải dữ liệu mới

    // Hiển thị thông báo đang tải
    const loadingMsg = this.message.loading('Đang tải danh sách đợt kê khai...', { nzDuration: 0 });

    this.dotKeKhaiService.getDotKeKhais().subscribe({
      next: (data: DotKeKhai[]) => {
        // Đóng thông báo loading
        this.message.remove(loadingMsg.messageId);

        // Sắp xếp danh sách theo ngày tạo mới nhất
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.ngay_tao || '');
          const dateB = new Date(b.ngay_tao || '');
          return dateB.getTime() - dateA.getTime();
        });

        this.originalDotKeKhaiList = sortedData; // Lưu bản sao của dữ liệu gốc đã sắp xếp
        this.dotKeKhaiList = sortedData;
        this.updateStatusCountCache(); // Cập nhật cache khi có dữ liệu mới

        // Debug: Kiểm tra cấu trúc dữ liệu
        if (data && data.length > 0) {
          console.log('Dữ liệu DotKeKhai từ API:', data[0]);
          console.log('Thuộc tính DonVi:', data[0].DonVi);
          console.log('Thuộc tính don_vi:', data[0].don_vi);
          console.log('Tất cả các thuộc tính:', Object.keys(data[0]));
        }

        this.loading = false;
      },
      error: (error: any) => {
        // Đóng thông báo loading
        this.message.remove(loadingMsg.messageId);

        console.error('Lỗi khi tải danh sách đợt kê khai:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách đợt kê khai');
        this.loading = false;
      }
    });
  }

  loadDonViList(): void {
    // Gọi API để lấy danh sách đơn vị
    this.donViService.getDonVis().subscribe({
      next: (data: DonVi[]) => {
        if (data && data.length > 0) {
          this.danhSachDonVi = data.map(donVi => ({
            text: donVi.tenDonVi || 'Không có tên',
            value: donVi.id
          }));
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đơn vị:', error);
        this.message.error('Có lỗi khi tải danh sách đơn vị');
      }
    });
  }

  refreshData(): void {
    this.danhSachDaChon.clear(); // Xóa danh sách đã chọn khi làm mới dữ liệu
    this.searchText = '';
    this.danhSachFilters = {
      dichVu: null,
      trangThai: null,
      donVi: null,
      nam: null,
      thang: null,
      maNhanVien: null,
      ngayGuiTu: null, // Đặt lại bộ lọc ngày gửi từ
      ngayGuiDen: null  // Đặt lại bộ lọc ngày gửi đến
    };
    this.tabTrangThaiIndex = 0;
    this.loadDotKeKhaiList();
  }

  // Áp dụng bộ lọc vào dữ liệu gốc
  applyFilters(): void {
    this.loading = true;

    let filteredData = [...this.originalDotKeKhaiList];

    // Lọc theo từ khóa tìm kiếm
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      filteredData = filteredData.filter(item =>
        item.ten_dot.toLowerCase().includes(searchLower) ||
        (item.ma_ho_so && item.ma_ho_so.toLowerCase().includes(searchLower)) ||
        (item.ghi_chu && item.ghi_chu.toLowerCase().includes(searchLower))
      );
    }

    // Lọc theo loại dịch vụ
    if (this.danhSachFilters.dichVu) {
      filteredData = filteredData.filter(item => item.dich_vu === this.danhSachFilters.dichVu);
    }

    // Lọc theo trạng thái
    if (this.danhSachFilters.trangThai) {
      filteredData = filteredData.filter(item => item.trang_thai === this.danhSachFilters.trangThai);
    }

    // Lọc theo tháng
    if (this.danhSachFilters.thang) {
      filteredData = filteredData.filter(item => item.thang === this.danhSachFilters.thang);
    }

    // Lọc theo năm
    if (this.danhSachFilters.nam) {
      filteredData = filteredData.filter(item => item.nam === this.danhSachFilters.nam);
    }

    // Lọc theo đơn vị
    if (this.danhSachFilters.donVi) {
      filteredData = filteredData.filter(item => item.don_vi_id === this.danhSachFilters.donVi);
    }

    // Lọc theo mã nhân viên
    if (this.danhSachFilters.maNhanVien && this.danhSachFilters.maNhanVien.trim() !== '') {
      const maNhanVienLower = this.danhSachFilters.maNhanVien.toLowerCase().trim();
      filteredData = filteredData.filter(item =>
        item.nguoi_tao && item.nguoi_tao.toLowerCase().includes(maNhanVienLower)
      );
    }

    // Lọc theo ngày gửi từ
    if (this.danhSachFilters.ngayGuiTu) {
      filteredData = filteredData.filter(item => {
        if (!item.ngay_gui) return false;
        const ngayGui = new Date(item.ngay_gui);
        return ngayGui >= (this.danhSachFilters.ngayGuiTu as Date);
      });
    }

    // Lọc theo ngày gửi đến
    if (this.danhSachFilters.ngayGuiDen) {
      filteredData = filteredData.filter(item => {
        if (!item.ngay_gui) return false;
        const ngayGui = new Date(item.ngay_gui);
        return ngayGui <= (this.danhSachFilters.ngayGuiDen as Date);
      });
    }

    this.dotKeKhaiList = filteredData;
    // Không cập nhật cache số lượng sau khi lọc vì chúng ta muốn hiển thị thống kê theo dữ liệu gốc

    this.loading = false;

    // Hiển thị thông báo kết quả tìm kiếm
    if (filteredData.length === 0) {
      this.message.info('Không tìm thấy kết quả phù hợp');
    } else if (filteredData.length < this.originalDotKeKhaiList.length) {
      this.message.success(`Tìm thấy ${filteredData.length} kết quả phù hợp`);
    }
  }

  // Gọi phương thức này thay vì searchData (đổi tên để rõ ý đồ)
  searchData(): void {
    this.danhSachDaChon.clear(); // Xóa danh sách đã chọn khi lọc dữ liệu
    this.applyFilters();
  }

  xemChiTiet(dotKeKhai: DotKeKhai): void {
    if (!dotKeKhai || !dotKeKhai.id) {
      this.message.warning('Không tìm thấy thông tin đợt kê khai');
      return;
    }

    this.selectedDotKeKhai = dotKeKhai;
    this.isModalChiTietVisible = true;

    // Tải danh sách kê khai
    this.loadDanhSachKeKhai(dotKeKhai.id);
  }

  // Xử lý khi đóng modal chi tiết
  handleModalChiTietCancel(): void {
    this.isModalChiTietVisible = false;
    this.danhSachKeKhai = [];
  }

  // Tải danh sách kê khai
  loadDanhSachKeKhai(dotKeKhaiId: number): void {
    this.loadingKeKhai = true;
    this.danhSachKeKhai = [];

    this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(dotKeKhaiId).subscribe({
      next: (data: any[]) => {
        this.danhSachKeKhai = data;
        this.loadingKeKhai = false;
      },
      error: (error: any) => {
        console.error('Lỗi khi tải danh sách kê khai:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách kê khai');
        this.loadingKeKhai = false;
      }
    });
  }

  // Tính tổng tiền từ danh sách kê khai
  tinhTongTien(): number {
    return this.danhSachKeKhai.reduce((sum, item) => sum + item.so_tien, 0);
  }

  duyetDotKeKhai(dotKeKhai: DotKeKhai): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận duyệt',
      nzContent: `Bạn có chắc chắn muốn duyệt đợt kê khai "${dotKeKhai.ten_dot}" không?`,
      nzOkText: 'Duyệt',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        // Hiển thị loading
        const loadingMsg = this.message.loading('Đang duyệt đợt kê khai...', { nzDuration: 0 });

        // Gọi API để duyệt đợt kê khai
        if (dotKeKhai.id) {
          this.dotKeKhaiService.duyetDotKeKhai(dotKeKhai.id).subscribe({
            next: () => {
              this.message.remove(loadingMsg.messageId);
              this.message.success(`Đã duyệt thành công đợt kê khai "${dotKeKhai.ten_dot}"`);
              this.refreshData(); // Làm mới dữ liệu
            },
            error: (error) => {
              this.message.remove(loadingMsg.messageId);
              console.error('Lỗi khi duyệt đợt kê khai:', error);
              this.message.error('Có lỗi xảy ra khi duyệt đợt kê khai');
            }
          });
        }
      }
    });
  }

  tuChoiDotKeKhai(dotKeKhai: DotKeKhai): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận từ chối',
      nzContent: `Bạn có chắc chắn muốn từ chối đợt kê khai "${dotKeKhai.ten_dot}" không?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        // Gọi API để từ chối đợt kê khai
        this.message.info('Chức năng từ chối đợt kê khai đang được phát triển');
      }
    });
  }

  batDauXuLy(dotKeKhai: DotKeKhai): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận bắt đầu xử lý',
      nzContent: `Bạn có chắc chắn muốn bắt đầu xử lý đợt kê khai "${dotKeKhai.ten_dot}" không?`,
      nzOkText: 'Xác nhận',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        // Hiển thị loading
        const loadingMsg = this.message.loading('Đang cập nhật trạng thái...', { nzDuration: 0 });

        // Gọi API để cập nhật trạng thái sang đang xử lý
        if (dotKeKhai.id) {
          this.dotKeKhaiService.updateTrangThai(dotKeKhai.id, 'dang_xu_ly').subscribe({
            next: () => {
              this.message.remove(loadingMsg.messageId);
              this.message.success(`Đã chuyển đợt kê khai "${dotKeKhai.ten_dot}" sang trạng thái đang xử lý`);
              this.refreshData(); // Làm mới dữ liệu
            },
            error: (error) => {
              this.message.remove(loadingMsg.messageId);
              console.error('Lỗi khi cập nhật trạng thái:', error);
              this.message.error('Có lỗi xảy ra khi cập nhật trạng thái đợt kê khai');
            }
          });
        }
      }
    });
  }

  xuatExcelDotKeKhai(dotKeKhai: DotKeKhai): void {
    if (!dotKeKhai || !dotKeKhai.id) {
      this.message.warning('Không tìm thấy thông tin đợt kê khai');
      return;
    }

    this.loading = true;
    this.exportVnptService.xuatExcelDotKeKhai(dotKeKhai).subscribe({
      next: (success) => {
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi xuất Excel:', err);
        this.message.error('Có lỗi xảy ra khi xuất dữ liệu kê khai');
        this.loading = false;
      }
    });
  }

  getTrangThaiText(trangThai: string): string {
    // Sử dụng ExportVnptService
    return this.exportVnptService.getTrangThaiText(trangThai);
  }

  getTrangThaiType(trangThai: string): string {
    switch (trangThai) {
      case 'chua_gui':
        return 'default';
      case 'da_gui':
        return 'processing';
      case 'da_duyet':
        return 'success';
      case 'da_tu_choi':
        return 'error';
      case 'cho_thanh_toan':
        return 'warning';
      case 'cho_xu_ly':
        return 'blue';
      case 'hoan_thanh':
        return 'success';
      case 'tu_choi':
        return 'error';
      case 'dang_xu_ly':
        return 'cyan';
      default:
        return 'default';
    }
  }

  // Hàm xử lý xem hóa đơn
  xemHoaDon(dotKeKhai: DotKeKhai): void {
    if (!dotKeKhai.url_bill) {
      this.message.warning('Không có ảnh hóa đơn');
      return;
    }

    this.selectedDotKeKhai = dotKeKhai;
    this.selectedHoaDonUrl = dotKeKhai.url_bill;
    this.isModalVisible = true;
  }

  // Hàm xử lý đóng modal
  handleModalCancel(): void {
    this.isModalVisible = false;
    this.selectedDotKeKhai = null;
    this.selectedHoaDonUrl = null;
  }

  // Phương thức lấy tên file từ URL
  getFileName(): string {
    if (!this.selectedHoaDonUrl) return 'Không có file';

    try {
      const url = new URL(this.selectedHoaDonUrl);
      const pathSegments = url.pathname.split('/');
      return pathSegments[pathSegments.length - 1] || 'hoa-don.jpg';
    } catch (e) {
      const pathSegments = this.selectedHoaDonUrl.split('/');
      return pathSegments[pathSegments.length - 1] || 'hoa-don.jpg';
    }
  }

  // Xem thông tin kê khai BHYT
  xemKeKhaiBHYT(dotKeKhaiId: number): void {
    if (!dotKeKhaiId) {
      this.message.warning('Không có thông tin kê khai BHYT');
      return;
    }

    // Hiển thị loading
    const loadingMsg = this.message.loading('Đang tải thông tin kê khai BHYT...', { nzDuration: 0 });

    // Gọi service để lấy dữ liệu
    this.dotKeKhaiService.getKeKhaiBHYTsByDotKeKhaiId(dotKeKhaiId).subscribe({
      next: (data: any[]) => {
        this.message.remove(loadingMsg.messageId);

        if (!data || data.length === 0) {
          this.message.info('Không có thông tin kê khai BHYT');
          return;
        }

        // Mở modal hiển thị bản kê
        this.modalService.create({
          nzTitle: `Bản kê BHYT - ${this.selectedDotKeKhai?.ten_dot}`,
          nzContent: `
            <div style="max-height: 500px; overflow: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 8px; border: 1px solid #f0f0f0; background-color: #fafafa;">STT</th>
                    <th style="padding: 8px; border: 1px solid #f0f0f0; background-color: #fafafa;">Họ tên</th>
                    <th style="padding: 8px; border: 1px solid #f0f0f0; background-color: #fafafa;">CCCD/CMND</th>
                    <th style="padding: 8px; border: 1px solid #f0f0f0; background-color: #fafafa;">Số thẻ BHYT</th>
                    <th style="padding: 8px; border: 1px solid #f0f0f0; background-color: #fafafa;">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.map((item: any, index: number) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #f0f0f0;">${index + 1}</td>
                      <td style="padding: 8px; border: 1px solid #f0f0f0;">${item.ho_ten}</td>
                      <td style="padding: 8px; border: 1px solid #f0f0f0;">${item.cccd || ''}</td>
                      <td style="padding: 8px; border: 1px solid #f0f0f0;">${item.so_the_bhyt || ''}</td>
                      <td style="padding: 8px; border: 1px solid #f0f0f0; text-align: right;">${item.so_tien.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 8px; border: 1px solid #f0f0f0; text-align: right; font-weight: bold;">Tổng cộng:</td>
                    <td style="padding: 8px; border: 1px solid #f0f0f0; text-align: right; font-weight: bold;">${data.reduce((sum: number, item: any) => sum + item.so_tien, 0).toLocaleString('vi-VN')} đ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          `,
          nzWidth: 800,
          nzFooter: null
        });
      },
      error: (error: any) => {
        this.message.remove(loadingMsg.messageId);
        console.error('Lỗi khi tải thông tin kê khai BHYT:', error);
        this.message.error('Có lỗi khi tải thông tin kê khai BHYT');
      }
    });
  }

  // Phương thức tải hóa đơn cho nhiều đợt kê khai
  taiHoaDonNhieuDot(): void {
    if (this.danhSachDaChon.size === 0) {
      this.message.warning('Vui lòng chọn ít nhất một đợt kê khai để tải hóa đơn');
      return;
    }

    // Lấy danh sách đợt kê khai đã chọn
    const dotKeKhaiDaChonList = this.dotKeKhaiList.filter(d => this.danhSachDaChon.has(d.id!));

    if (dotKeKhaiDaChonList.length === 0) {
      this.message.warning('Không tìm thấy dữ liệu cho các đợt kê khai đã chọn');
      return;
    }

    // Hiển thị loading
    const loadingMsg = this.message.loading('Đang tải hóa đơn...', { nzDuration: 0 });

    // Tạo một mảng Promise để tải tất cả hóa đơn
    const downloadPromises = dotKeKhaiDaChonList.map(dotKeKhai => {
      if (!dotKeKhai.url_bill) {
        return Promise.reject(`Đợt kê khai ${dotKeKhai.ten_dot} không có hóa đơn`);
      }

      // Tạo tên file theo format mới
      const maHoSo = dotKeKhai.ma_ho_so || 'khong-co-ma';
      const maNhanVien = dotKeKhai.nguoi_tao || 'khong-co-ma';
      const thangNam = `${dotKeKhai.thang.toString().padStart(2, '0')}_${dotKeKhai.nam}`;
      const extension = dotKeKhai.url_bill.split('.').pop() || 'jpg';
      const fileName = `${maHoSo}_${maNhanVien}_${thangNam}.${extension}`;

      return fetch(dotKeKhai.url_bill)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
    });

    // Thực hiện tải tất cả hóa đơn
    Promise.allSettled(downloadPromises)
      .then(results => {
        this.message.remove(loadingMsg.messageId);

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failureCount = results.filter(r => r.status === 'rejected').length;

        if (successCount > 0) {
          this.message.success(`Đã tải thành công ${successCount} hóa đơn`);
        }
        if (failureCount > 0) {
          this.message.error(`Có ${failureCount} hóa đơn không thể tải`);
        }

        // Reset danh sách đã chọn sau khi tải xong
        this.danhSachDaChon.clear();
      })
      .catch(error => {
        this.message.remove(loadingMsg.messageId);
        this.message.error('Có lỗi xảy ra khi tải hóa đơn');
        console.error('Lỗi khi tải hóa đơn:', error);
      });
  }

  // Phương thức tải hóa đơn đơn lẻ
  taiHoaDon(): void {
    if (!this.selectedDotKeKhai || !this.selectedHoaDonUrl) {
      this.message.warning('Không có thông tin hóa đơn để tải');
      return;
    }

    // Tạo tên file theo format mới
    const maHoSo = this.selectedDotKeKhai.ma_ho_so || 'khong-co-ma';
    const maNhanVien = this.selectedDotKeKhai.nguoi_tao || 'khong-co-ma';
    const thangNam = `${this.selectedDotKeKhai.thang.toString().padStart(2, '0')}_${this.selectedDotKeKhai.nam}`;
    const extension = this.selectedHoaDonUrl.split('.').pop() || 'jpg';
    const fileName = `${maHoSo}_${maNhanVien}_${thangNam}.${extension}`;

    // Hiển thị loading
    const loadingMsg = this.message.loading('Đang tải hóa đơn...', { nzDuration: 0 });

    fetch(this.selectedHoaDonUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.message.remove(loadingMsg.messageId);
        this.message.success('Đã tải hóa đơn thành công');
      })
      .catch(error => {
        this.message.remove(loadingMsg.messageId);
        this.message.error('Có lỗi xảy ra khi tải hóa đơn');
        console.error('Lỗi khi tải hóa đơn:', error);
      });
  }

  // Upload thay thế hóa đơn
  uploadThayThe(): void {
    if (!this.selectedDotKeKhai || !this.selectedDotKeKhai.id) {
      this.message.warning('Không thể tải lại hóa đơn');
      return;
    }

    // Mở modal tải lên hóa đơn mới
    this.modalService.confirm({
      nzTitle: 'Tải lại hóa đơn',
      nzContent: 'Bạn có chắc chắn muốn tải lại hóa đơn mới?',
      nzOkText: 'Tải lên',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        // Tạo input type file ẩn
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.onchange = (event: any) => {
          const file = event.target.files[0];
          if (!file) return;

          // Kiểm tra kích thước file (tối đa 5MB)
          if (file.size > 5 * 1024 * 1024) {
            this.message.error('Kích thước file quá lớn, tối đa 5MB');
            return;
          }

          // Hiển thị loading
          const loadingMessage = this.message.loading('Đang tải lên hóa đơn mới...', { nzDuration: 0 });

          // Tạo FormData
          const formData = new FormData();
          formData.append('file', file);
          formData.append('dotKeKhaiId', this.selectedDotKeKhai!.id!.toString());

          // Gọi API upload hóa đơn
          this.http.post(`${environment.apiUrl}/DotKeKhai/${this.selectedDotKeKhai!.id}/upload-bill`, formData)
            .subscribe({
              next: (response: any) => {
                this.message.remove(loadingMessage.messageId);
                this.message.success('Tải lên hóa đơn thành công');

                // Cập nhật URL hóa đơn mới nếu có
                if (response && response.url) {
                  this.selectedHoaDonUrl = response.url;
                  if (this.selectedDotKeKhai) {
                    this.selectedDotKeKhai.url_bill = response.url;
                  }
                }

                // Cập nhật trạng thái sang "chờ xử lý"
                if (this.selectedDotKeKhai && this.selectedDotKeKhai.id) {
                  this.dotKeKhaiService.updateTrangThai(this.selectedDotKeKhai.id, 'cho_xu_ly')
                    .subscribe({
                      next: () => {
                        this.message.success('Đã cập nhật trạng thái sang "Chờ xử lý"');
                        // Cập nhật trạng thái trong đối tượng đã chọn
                        if (this.selectedDotKeKhai) {
                          this.selectedDotKeKhai.trang_thai = 'cho_xu_ly';
                        }
                        // Làm mới dữ liệu
                        this.refreshData();
                      },
                      error: (err) => {
                        console.error('Lỗi khi cập nhật trạng thái:', err);
                        this.message.error('Có lỗi xảy ra khi cập nhật trạng thái');
                      }
                    });
                }
              },
              error: (error) => {
                this.message.remove(loadingMessage.messageId);
                console.error('Lỗi khi tải lên hóa đơn:', error);
                this.message.error('Có lỗi xảy ra khi tải lên hóa đơn');
              }
            });
        };

        // Kích hoạt sự kiện click
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
      }
    });
  }

  // Xử lý khi thay đổi tab
  onTabChange(index: number): void {
    // Cập nhật danhSachFilters.trangThai dựa vào tab được chọn
    switch (index) {
      case 0: // Tất cả
        this.danhSachFilters.trangThai = null;
        break;
      case 1: // Chờ thanh toán
        this.danhSachFilters.trangThai = 'cho_thanh_toan';
        break;
      case 2: // Chờ xử lý
        this.danhSachFilters.trangThai = 'cho_xu_ly';
        break;
      case 3: // Đang xử lý
        this.danhSachFilters.trangThai = 'dang_xu_ly';
        break;
      case 4: // Hoàn thành
        this.danhSachFilters.trangThai = 'hoan_thanh';
        break;
      case 5: // Đã từ chối
        this.danhSachFilters.trangThai = 'da_tu_choi';
        break;
      default:
        this.danhSachFilters.trangThai = null;
    }

    this.tabTrangThaiIndex = index;
    this.applyFilters();
  }

  // Phương thức trợ giúp để lấy tên đơn vị từ bất kỳ định dạng nào
  getDonViName(data: DotKeKhai): string {
    // Sử dụng ExportVnptService
    return this.exportVnptService.getDonViName(data);
  }

  // Lấy text cho phương án đóng BHYT
  getPhuongAnDongText(phuongAnDong: string): string {
    // Sử dụng ExportVnptService
    return this.exportVnptService.getPhuongAnDongText(phuongAnDong);
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

  // Xuất Excel cho nhiều đợt kê khai cùng lúc
  xuatExcelNhieuDotKeKhai(): void {
    if (this.dotKeKhaiList.length === 0) {
      this.message.warning('Không có dữ liệu để xuất');
      return;
    }

    this.loading = true;
    const success = this.exportVnptService.xuatExcelNhieuDotKeKhai(this.dotKeKhaiList);
    this.loading = false;
  }

  // Xử lý xuất VNPT nhiều đợt kê khai
  xuatVNPTNhieuDot(): void {
    if (this.danhSachDaChon.size === 0) {
      this.message.warning('Vui lòng chọn ít nhất một đợt kê khai để xuất');
      return;
    }

    // Lấy danh sách đợt kê khai đã chọn
    const dotKeKhaiDaChonList = this.dotKeKhaiList.filter(d => this.danhSachDaChon.has(d.id!));

    if (dotKeKhaiDaChonList.length === 0) {
      this.message.warning('Không tìm thấy dữ liệu cho các đợt kê khai đã chọn');
      return;
    }

    // Hiển thị loading
    this.loading = true;

    // Gọi service để xuất file, truyền danh sách đợt kê khai đã chọn
    // Mã nhân viên sẽ được lấy trực tiếp từ mỗi đợt kê khai (nguoi_tao)
    this.exportVnptService.xuatVNPTNhieuDot(dotKeKhaiDaChonList)
      .subscribe(
        (success: boolean) => {
          this.loading = false;
          if (success) {
            // Reset danh sách đã chọn sau khi xuất thành công
            this.danhSachDaChon.clear();
          }
        },
        (error: any) => {
          this.loading = false;
          console.error('Lỗi khi xuất VNPT:', error);
          this.message.error('Có lỗi xảy ra khi xuất dữ liệu VNPT');
        }
      );
  }

  // Xử lý khi xác nhận mã nhân viên
  handleModalOk(): void {
    if (this.maNhanVienForm.invalid) {
      this.message.error('Vui lòng nhập mã nhân viên hợp lệ');
      return;
    }

    // Lấy mã nhân viên từ form
    const maNhanVien = this.maNhanVienForm.get('maNhanVien')?.value;

    // Lưu mã nhân viên vào localStorage nếu đã chọn
    if (this.maNhanVienForm.get('luuMaNhanVien')?.value) {
      localStorage.setItem('maNhanVienThu', maNhanVien);
    }

    // Đóng modal
    this.isModalNhapMaNhanVienVisible = false;

    // Lấy danh sách đợt kê khai đã chọn
    const dotKeKhaiDaChonList = this.dotKeKhaiList.filter(d => this.danhSachDaChon.has(d.id!));

    // Gọi service để xuất file với mã nhân viên
    this.exportVnptService.xuatVNPTNhieuDotVoiMaNhanVien(dotKeKhaiDaChonList, maNhanVien)
      .subscribe(
        (success: boolean) => {
          if (success) {
            // Reset danh sách đã chọn sau khi xuất thành công
            this.danhSachDaChon.clear();
          }
        },
        (error: any) => {
          console.error('Lỗi khi xuất VNPT:', error);
          this.message.error('Có lỗi xảy ra khi xuất dữ liệu VNPT');
        }
      );
  }

  // Xử lý khi hủy nhập mã nhân viên (không hiển thị hóa đơn)
  handleModalNhapMaNhanVienCancel(): void {
    this.isModalNhapMaNhanVienVisible = false;
  }

  // PHƯƠNG THỨC XỬ LÝ CHECKBOX

  // Kiểm tra xem tất cả các đợt kê khai hiện tại đã được chọn hết chưa
  isTatCaDaChon(): boolean {
    if (this.dotKeKhaiList.length === 0) return false;
    return this.dotKeKhaiList.every(item => item.id && this.danhSachDaChon.has(item.id));
  }

  // Kiểm tra trạng thái indeterminate (khi chỉ chọn một số, không phải tất cả)
  isIndeterminate(): boolean {
    const checkedCount = this.dotKeKhaiList.filter(item => item.id && this.danhSachDaChon.has(item.id)).length;
    return checkedCount > 0 && checkedCount < this.dotKeKhaiList.length;
  }

  // Xử lý khi checkbox của một đợt kê khai được chọn/bỏ chọn
  onCheckDotKeKhai(id: number | undefined, checked: boolean): void {
    if (!id) return; // Bỏ qua nếu id không tồn tại

    if (checked) {
      this.danhSachDaChon.add(id);
    } else {
      this.danhSachDaChon.delete(id);
    }
  }

  // Xử lý khi checkbox "Chọn tất cả" được chọn/bỏ chọn
  onCheckTatCa(checked: boolean): void {
    if (checked) {
      // Chọn tất cả các đợt kê khai hiện tại
      this.dotKeKhaiList.forEach(item => {
        if (item.id) {
          this.danhSachDaChon.add(item.id);
        }
      });
    } else {
      // Bỏ chọn tất cả
      this.danhSachDaChon.clear();
    }
  }

  // Lấy số lượng đợt kê khai đã chọn
  getSoDotKeKhaiDaChon(): number {
    return this.danhSachDaChon.size;
  }

  // Lấy danh sách các đợt kê khai đã chọn
  getDanhSachDotKeKhaiDaChon(): DotKeKhai[] {
    return this.dotKeKhaiList.filter(item => item.id && this.danhSachDaChon.has(item.id));
  }

  chinhSuaDotKeKhai(dotKeKhai: DotKeKhai): void {
    if (!dotKeKhai || !dotKeKhai.id) {
      this.message.warning('Không tìm thấy thông tin đợt kê khai');
      return;
    }

    // Chuyển hướng đến trang kê khai tương ứng với loại dịch vụ
    if (dotKeKhai.dich_vu === 'BHYT') {
      this.router.navigate(['/dot-ke-khai', dotKeKhai.id, 'ke-khai-bhyt']);
    } else if (dotKeKhai.dich_vu === 'BHXH TN') {
      this.router.navigate(['/dot-ke-khai', dotKeKhai.id, 'ke-khai-bhxh']);
    } else {
      this.message.warning('Không xác định được loại dịch vụ');
    }
  }

  // Phương thức xử lý hiển thị modal xác nhận xóa
  xoaDotKeKhai(dotKeKhai: DotKeKhai): void {
    this.dotKeKhaiToDelete = dotKeKhai;
    this.selectedDotKeKhai = dotKeKhai;
    this.isModalXoaVisible = true;
  }

  // Phương thức hủy xóa
  handleModalXoaCancel(): void {
    this.isModalXoaVisible = false;
    this.dotKeKhaiToDelete = null;
  }

  // Phương thức xác nhận xóa
  confirmXoaDotKeKhai(): void {
    if (!this.dotKeKhaiToDelete || !this.dotKeKhaiToDelete.id) {
      return;
    }

    this.loading = true;

    this.dotKeKhaiService.deleteDotKeKhai(this.dotKeKhaiToDelete.id).subscribe({
      next: () => {
        this.message.success('Xóa đợt kê khai thành công');
        this.loadDotKeKhaiList(); // Tải lại danh sách
        this.isModalXoaVisible = false;
        this.dotKeKhaiToDelete = null;
      },
      error: (error) => {
        console.error('Lỗi khi xóa đợt kê khai:', error);
        this.message.error('Có lỗi xảy ra khi xóa đợt kê khai');
        this.loading = false;
      }
    });
  }

  // Bắt đầu chỉnh sửa
  startEdit(data: DotKeKhai): void {
    this.editingId = data.id || null;
    this.maHoSoTemp = data.ma_ho_so || '';
  }

  // Hủy chỉnh sửa
  cancelEdit(): void {
    this.editingId = null;
  }

  // Lưu nội dung chỉnh sửa
  saveEdit(data: DotKeKhai): void {
    if (!data.id || this.editingId !== data.id) {
      return;
    }

    // Hiển thị loading
    const loadingMsg = this.message.loading('Đang cập nhật mã hồ sơ...', { nzDuration: 0 });

    // Gọi API cập nhật mã hồ sơ
    const apiUrl = `${environment.apiUrl}/DotKeKhai/${data.id}/update-ma-ho-so`;
    this.http.post(apiUrl, { ma_ho_so: this.maHoSoTemp }).subscribe({
      next: (_response: any) => {
        this.message.remove(loadingMsg.messageId);
        this.message.success('Cập nhật mã hồ sơ thành công');

        // Cập nhật lại dữ liệu trong danh sách
        this.dotKeKhaiList = this.dotKeKhaiList.map(d => {
          if (d.id === data.id) {
            return { ...d, ma_ho_so: this.maHoSoTemp };
          }
          return d;
        });

        // Cập nhật trong danh sách gốc
        this.originalDotKeKhaiList = this.originalDotKeKhaiList.map(d => {
          if (d.id === data.id) {
            return { ...d, ma_ho_so: this.maHoSoTemp };
          }
          return d;
        });

        // Kết thúc chế độ chỉnh sửa
        this.editingId = null;
      },
      error: (error: any) => {
        this.message.remove(loadingMsg.messageId);
        this.message.error('Có lỗi xảy ra khi cập nhật mã hồ sơ');
        console.error('Lỗi khi cập nhật mã hồ sơ:', error);
        // Vẫn kết thúc chế độ chỉnh sửa
        this.editingId = null;
      }
    });
  }

  // Tính tổng số tiền của các đợt kê khai có trạng thái đang xử lý
  getTotalAmount(): number {
    return this.dotKeKhaiList.reduce((total, dot) => {
      if (dot.trang_thai === 'dang_xu_ly') {
        return total + (dot.tong_so_tien || 0);
      }
      return total;
    }, 0);
  }

  // Tính tổng số tiền của tất cả các đợt kê khai gốc có trạng thái đang xử lý
  getTotalAmountOriginal(): number {
    return this.originalDotKeKhaiList.reduce((total, dot) => {
      if (dot.trang_thai === 'dang_xu_ly') {
        return total + (dot.tong_so_tien || 0);
      }
      return total + (dot.tong_so_tien || 0);
    }, 0);
  }

  // Bắt đầu chỉnh sửa trạng thái
  startEditTrangThai(data: DotKeKhai): void {
    this.editingTrangThaiId = data.id || null;
    this.trangThaiTemp = data.trang_thai;
  }

  // Hủy chỉnh sửa trạng thái
  cancelEditTrangThai(): void {
    this.editingTrangThaiId = null;
  }

  // Lưu trạng thái mới
  saveTrangThai(data: DotKeKhai): void {
    if (!data.id || this.editingTrangThaiId !== data.id) {
      return;
    }

    // Hiển thị loading
    const loadingMsg = this.message.loading('Đang cập nhật trạng thái...', { nzDuration: 0 });

    // Gọi API cập nhật trạng thái
    const apiUrl = `${environment.apiUrl}/DotKeKhai/${data.id}/trang-thai`;
    this.http.patch(apiUrl, { trang_thai: this.trangThaiTemp }).subscribe({
      next: (_response: any) => {
        this.message.remove(loadingMsg.messageId);
        this.message.success('Cập nhật trạng thái thành công');

        // Cập nhật lại dữ liệu trong danh sách
        this.dotKeKhaiList = this.dotKeKhaiList.map(d => {
          if (d.id === data.id) {
            return { ...d, trang_thai: this.trangThaiTemp };
          }
          return d;
        });

        // Cập nhật trong danh sách gốc
        this.originalDotKeKhaiList = this.originalDotKeKhaiList.map(d => {
          if (d.id === data.id) {
            return { ...d, trang_thai: this.trangThaiTemp };
          }
          return d;
        });

        // Cập nhật cache số lượng
        this.updateStatusCountCache();

        // Kết thúc chế độ chỉnh sửa
        this.editingTrangThaiId = null;
      },
      error: (error: any) => {
        this.message.remove(loadingMsg.messageId);
        this.message.error('Có lỗi xảy ra khi cập nhật trạng thái');
        console.error('Lỗi khi cập nhật trạng thái:', error);
        // Vẫn kết thúc chế độ chỉnh sửa
        this.editingTrangThaiId = null;
      }
    });
  }

  // Phương thức duyệt nhiều đợt kê khai cùng lúc
  duyetNhieuDotKeKhai(): void {
    if (this.danhSachDaChon.size === 0) {
      this.message.warning('Vui lòng chọn ít nhất một đợt kê khai để duyệt');
      return;
    }

    // Lấy danh sách đợt kê khai đã chọn
    const dotKeKhaiDaChonList = this.dotKeKhaiList.filter(d => this.danhSachDaChon.has(d.id!));

    // Lọc ra những đợt có trạng thái "chờ thanh toán"
    const dotKeKhaiDaGuiList = dotKeKhaiDaChonList.filter(d => d.trang_thai === 'cho_thanh_toan');

    if (dotKeKhaiDaGuiList.length === 0) {
      this.message.warning('Không có đợt kê khai nào ở trạng thái "Chờ thanh toán" để duyệt');
      return;
    }

    // Hiển thị modal xác nhận
    this.modalService.confirm({
      nzTitle: 'Xác nhận duyệt nhiều đợt kê khai',
      nzContent: `Bạn có chắc chắn muốn duyệt ${dotKeKhaiDaGuiList.length} đợt kê khai đã chọn không?`,
      nzOkText: 'Duyệt',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        // Hiển thị loading
        this.loading = true;
        const loadingMsg = this.message.loading('Đang duyệt đợt kê khai...', { nzDuration: 0 });

        // Tạo một mảng Observable để duyệt tất cả đợt kê khai
        const duyetObservables = dotKeKhaiDaGuiList.map(dotKeKhai =>
          this.dotKeKhaiService.duyetDotKeKhai(dotKeKhai.id!)
        );

        // Import và sử dụng forkJoin
        import('rxjs').then(rxjs => {
          if (duyetObservables.length === 0) {
            this.loading = false;
            this.message.remove(loadingMsg.messageId);
            this.message.info('Không có đợt kê khai nào để duyệt');
            return;
          }

          rxjs.forkJoin(duyetObservables).subscribe({
            next: () => {
              this.message.remove(loadingMsg.messageId);
              this.message.success(`Đã duyệt thành công ${dotKeKhaiDaGuiList.length} đợt kê khai`);
              this.refreshData(); // Làm mới dữ liệu
              this.danhSachDaChon.clear(); // Xóa danh sách đã chọn
            },
            error: (error) => {
              this.message.remove(loadingMsg.messageId);
              console.error('Lỗi khi duyệt đợt kê khai:', error);
              this.message.error('Có lỗi xảy ra khi duyệt đợt kê khai');
              this.loading = false;
            },
            complete: () => {
              this.loading = false;
            }
          });
        });
      }
    });
  }
}