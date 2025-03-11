import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { BienLaiService, BangKeBienLai } from '../../services/bien-lai.service';

interface BaoCaoBienLai {
  quyen_so: string;
  so_bien_lai: string;
  ten_nguoi_dong: string;
  ma_so_bhxh: string;
  so_tien: number;
  ngay_bien_lai: Date;
  ma_nhan_vien: string;
  ten_nhan_vien?: string;
  ghi_chu?: string;
  trang_thai: string;
  tinh_chat: string;
  don_vi?: string;
  ma_ho_so?: string;
}

interface ThongKeBienLai {
  tong_so_bien_lai: number;
  tong_so_tien: number;
  bien_lai_da_thu: number;
  tien_da_thu: number;
  bien_lai_chua_thu: number;
  tien_chua_thu: number;
  bien_lai_huy: number;
  tien_huy: number;
}

interface ThongKeNhanVien {
  ma_nhan_vien: string;
  ten_nhan_vien: string;
  so_bien_lai: number;
  tong_tien: number;
}

interface ThongKeDonVi {
  don_vi: string;
  so_bien_lai: number;
  tong_tien: number;
}

interface BieuDoData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-bao-cao-bien-lai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzDatePickerModule,
    NzInputModule,
    NzGridModule,
    NzFormModule,
    NzSelectModule,
    NzCardModule,
    NzTagModule,
    NzTabsModule,
    NzDividerModule,
    NzProgressModule,
    NzEmptyModule,
    NzDrawerModule,
    NzDescriptionsModule,
    NzToolTipModule,
    NzRadioModule,
    NzAvatarModule,
    NzBadgeModule,
    NzSpinModule,
    NzAlertModule,
    NzPopoverModule,
    NzListModule,
    NzPaginationModule
  ],
  templateUrl: './bao-cao-bien-lai.component.html',
  styleUrls: ['./bao-cao-bien-lai.component.scss']
})
export class BaoCaoBienLaiComponent implements OnInit, AfterViewInit {
  loading = false;
  bienLais: BaoCaoBienLai[] = [];
  thongKe: ThongKeBienLai = {
    tong_so_bien_lai: 0,
    tong_so_tien: 0,
    bien_lai_da_thu: 0,
    tien_da_thu: 0,
    bien_lai_chua_thu: 0,
    tien_chua_thu: 0,
    bien_lai_huy: 0,
    tien_huy: 0
  };
  
  dateRange: Date[] = [];
  searchForm = {
    tuNgay: null as Date | null,
    denNgay: null as Date | null,
    quyenSo: null as string | null,
    maNhanVien: null as string | null,
    trangThai: null as string | null,
    donVi: null as string | null,
    tinhChat: null as string | null,
    maHoSo: null as string | null
  };

  trangThaiOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'da_thu', label: 'Đã thu' },
    { value: 'chua_thu', label: 'Chưa thu' },
    { value: 'huy', label: 'Đã hủy' }
  ];

  tinhChatOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bhyt', label: 'BHYT' },
    { value: 'bhxh', label: 'BHXH' },
    { value: 'bhtn', label: 'BHTN' }
  ];

  bieuDoTrangThai: BieuDoData[] = [];
  bieuDoTheoNgay: BieuDoData[] = [];

  // Thống kê theo nhân viên và đơn vị
  thongKeNhanVien: ThongKeNhanVien[] = [];
  thongKeDonVi: ThongKeDonVi[] = [];

  // Hiển thị bộ lọc nâng cao
  showAdvancedFilter = false;

  // Tab hiện tại
  activeTab = 0;

  // Chế độ xem
  viewMode = 'table'; // 'table', 'card', 'compact'

  // Chi tiết biên lai
  selectedBienLai: BaoCaoBienLai | null = null;
  showBienLaiDetail = false;

  constructor(
    private bienLaiService: BienLaiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Khởi tạo ngày mặc định (30 ngày gần nhất)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.dateRange = [thirtyDaysAgo, today];
    this.searchForm.tuNgay = thirtyDaysAgo;
    this.searchForm.denNgay = today;
    
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Khởi tạo biểu đồ sau khi view đã được tạo
    setTimeout(() => {
      this.initCharts();
    }, 500);
  }

  onDateRangeChange(dates: Date[]): void {
    if (dates && dates.length === 2) {
      this.searchForm.tuNgay = dates[0];
      this.searchForm.denNgay = dates[1];
    } else {
      this.searchForm.tuNgay = null;
      this.searchForm.denNgay = null;
    }
  }

  loadData(): void {
    this.loading = true;
    const params = {
      ...this.searchForm,
      quyenSo: this.searchForm.quyenSo || undefined,
      maNhanVien: this.searchForm.maNhanVien || undefined,
      trangThai: this.searchForm.trangThai === 'all' ? undefined : this.searchForm.trangThai,
      donVi: this.searchForm.donVi || undefined,
      tinhChat: this.searchForm.tinhChat === 'all' ? undefined : this.searchForm.tinhChat,
      maHoSo: this.searchForm.maHoSo || undefined
    };

    this.bienLaiService.getBangKeBienLai(params).subscribe({
      next: (data) => {
        this.bienLais = data;
        this.tinhThongKe(data);
        this.tinhThongKeNhanVien(data);
        this.tinhThongKeDonVi(data);
        this.taoDataBieuDo(data);
        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  tinhThongKe(data: BangKeBienLai[]): void {
    this.thongKe = {
      tong_so_bien_lai: data.length,
      tong_so_tien: data.reduce((sum, item) => sum + item.so_tien, 0),
      bien_lai_da_thu: data.filter(item => item.trang_thai === 'da_thu').length,
      tien_da_thu: data.filter(item => item.trang_thai === 'da_thu')
                       .reduce((sum, item) => sum + item.so_tien, 0),
      bien_lai_chua_thu: data.filter(item => item.trang_thai === 'chua_thu').length,
      tien_chua_thu: data.filter(item => item.trang_thai === 'chua_thu')
                         .reduce((sum, item) => sum + item.so_tien, 0),
      bien_lai_huy: data.filter(item => item.trang_thai === 'huy').length,
      tien_huy: data.filter(item => item.trang_thai === 'huy')
                    .reduce((sum, item) => sum + item.so_tien, 0)
    };
  }

  tinhThongKeNhanVien(data: BangKeBienLai[]): void {
    // Nhóm dữ liệu theo mã nhân viên
    const nhanVienMap = new Map<string, ThongKeNhanVien>();
    
    data.forEach(item => {
      if (!item.ma_nhan_vien) return;
      
      if (nhanVienMap.has(item.ma_nhan_vien)) {
        const nv = nhanVienMap.get(item.ma_nhan_vien)!;
        nv.so_bien_lai += 1;
        nv.tong_tien += item.so_tien;
      } else {
        nhanVienMap.set(item.ma_nhan_vien, {
          ma_nhan_vien: item.ma_nhan_vien,
          ten_nhan_vien: item.ten_nhan_vien || 'Không xác định',
          so_bien_lai: 1,
          tong_tien: item.so_tien
        });
      }
    });
    
    // Chuyển Map thành mảng và sắp xếp theo tổng tiền giảm dần
    this.thongKeNhanVien = Array.from(nhanVienMap.values())
      .sort((a, b) => b.tong_tien - a.tong_tien);
  }

  tinhThongKeDonVi(data: BangKeBienLai[]): void {
    // Nhóm dữ liệu theo đơn vị
    const donViMap = new Map<string, ThongKeDonVi>();
    
    data.forEach(item => {
      const donVi = item.don_vi || 'Không xác định';
      
      if (donViMap.has(donVi)) {
        const dv = donViMap.get(donVi)!;
        dv.so_bien_lai += 1;
        dv.tong_tien += item.so_tien;
      } else {
        donViMap.set(donVi, {
          don_vi: donVi,
          so_bien_lai: 1,
          tong_tien: item.so_tien
        });
      }
    });
    
    // Chuyển Map thành mảng và sắp xếp theo tổng tiền giảm dần
    this.thongKeDonVi = Array.from(donViMap.values())
      .sort((a, b) => b.tong_tien - a.tong_tien);
  }

  taoDataBieuDo(data: BangKeBienLai[]): void {
    // Dữ liệu cho biểu đồ trạng thái
    this.bieuDoTrangThai = [
      { name: 'Đã thu', value: this.thongKe.tien_da_thu },
      { name: 'Chưa thu', value: this.thongKe.tien_chua_thu },
      { name: 'Đã hủy', value: this.thongKe.tien_huy }
    ];
    
    // Dữ liệu cho biểu đồ theo ngày
    const ngayMap = new Map<string, number>();
    
    data.forEach(item => {
      const ngay = new Date(item.ngay_bien_lai).toISOString().split('T')[0];
      
      if (ngayMap.has(ngay)) {
        ngayMap.set(ngay, ngayMap.get(ngay)! + item.so_tien);
      } else {
        ngayMap.set(ngay, item.so_tien);
      }
    });
    
    // Chuyển Map thành mảng và sắp xếp theo ngày
    this.bieuDoTheoNgay = Array.from(ngayMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  initCharts(): void {
    // Khởi tạo biểu đồ (sẽ được triển khai bằng thư viện biểu đồ)
    console.log('Khởi tạo biểu đồ');
  }

  updateCharts(): void {
    // Cập nhật dữ liệu biểu đồ
    console.log('Cập nhật biểu đồ');
  }

  resetForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.searchForm = {
      tuNgay: thirtyDaysAgo,
      denNgay: today,
      quyenSo: null,
      maNhanVien: null,
      trangThai: null,
      donVi: null,
      tinhChat: null,
      maHoSo: null
    };
    this.dateRange = [thirtyDaysAgo, today];
    this.loadData();
  }

  onSearch(): void {
    this.loadData();
  }

  exportToExcel(): void {
    this.loading = true;
    const params = {
      ...this.searchForm,
      quyenSo: this.searchForm.quyenSo || undefined,
      maNhanVien: this.searchForm.maNhanVien || undefined,
      trangThai: this.searchForm.trangThai === 'all' ? undefined : this.searchForm.trangThai,
      donVi: this.searchForm.donVi || undefined,
      tinhChat: this.searchForm.tinhChat === 'all' ? undefined : this.searchForm.tinhChat,
      maHoSo: this.searchForm.maHoSo || undefined
    };

    this.bienLaiService.exportBangKeBienLai(params).subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-cao-bien-lai-${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.loading = false;
        this.message.success('Xuất Excel thành công');
      },
      error: (error) => {
        console.error('Lỗi khi xuất Excel:', error);
        this.message.error('Có lỗi xảy ra khi xuất Excel');
        this.loading = false;
      }
    });
  }

  exportBC01(): void {
    this.loading = true;
    const params = {
      ...this.searchForm,
      quyenSo: this.searchForm.quyenSo || undefined,
      maNhanVien: this.searchForm.maNhanVien || undefined,
      trangThai: this.searchForm.trangThai === 'all' ? undefined : this.searchForm.trangThai,
      donVi: this.searchForm.donVi || undefined,
      tinhChat: this.searchForm.tinhChat === 'all' ? undefined : this.searchForm.tinhChat,
      maHoSo: this.searchForm.maHoSo || undefined,
      mauBaoCao: 'BC01'
    };

    this.bienLaiService.exportBaoCaoBC01(params).subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        const monthYear = this.getMonthYearString();
        a.download = `BC01-Bang-Ke-BHYT-BHXH-${monthYear}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.loading = false;
        this.message.success('Xuất báo cáo BC01 thành công');
      },
      error: (error: any) => {
        console.error('Lỗi khi xuất báo cáo BC01:', error);
        this.message.error('Có lỗi xảy ra khi xuất báo cáo BC01. Tính năng này đang được phát triển.');
        this.loading = false;
      }
    });
  }

  private getMonthYearString(): string {
    const now = this.dateRange.length > 0 && this.dateRange[0] 
      ? new Date(this.dateRange[0]) 
      : new Date();
    
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    return `${month}-${year}`;
  }

  exportToPdf(): void {
    this.message.info('Tính năng đang được phát triển');
    // Triển khai xuất PDF
  }

  printReport(): void {
    this.message.info('Tính năng đang được phát triển');
    // Triển khai in báo cáo
  }

  toggleAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  changeViewMode(mode: string): void {
    this.viewMode = mode;
  }

  showBienLaiDetails(bienLai: BaoCaoBienLai): void {
    this.selectedBienLai = bienLai;
    this.showBienLaiDetail = true;
  }

  closeBienLaiDetail(): void {
    this.showBienLaiDetail = false;
    this.selectedBienLai = null;
  }

  changeTab(tabIndex: number): void {
    this.activeTab = tabIndex;
    
    // Cập nhật biểu đồ khi chuyển tab
    if (tabIndex === 1) {
      setTimeout(() => this.updateCharts(), 100);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'da_thu':
        return 'Đã thu';
      case 'chua_thu':
        return 'Chưa thu';
      case 'huy':
        return 'Đã hủy';
      default:
        return trangThai;
    }
  }

  getTinhChatText(tinhChat: string): string {
    switch (tinhChat) {
      case 'bhyt':
        return 'BHYT';
      case 'bhxh':
        return 'BHXH';
      case 'bhtn':
        return 'BHTN';
      default:
        return tinhChat;
    }
  }

  getTrangThaiColor(trangThai: string): string {
    switch (trangThai) {
      case 'da_thu':
        return 'success';
      case 'chua_thu':
        return 'warning';
      case 'huy':
        return 'error';
      default:
        return 'default';
    }
  }
  
  getRandomColor(): string {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  getProgressPercent(): number {
    if (this.thongKe.tong_so_tien === 0) return 0;
    return Math.round((this.thongKe.tien_da_thu / this.thongKe.tong_so_tien) * 100);
  }
} 