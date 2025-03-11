import { Component, OnInit } from '@angular/core';
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
    NzTagModule
  ],
  templateUrl: './bao-cao-bien-lai.component.html',
  styleUrls: ['./bao-cao-bien-lai.component.scss']
})
export class BaoCaoBienLaiComponent implements OnInit {
  loading = false;
  bienLais: BaoCaoBienLai[] = [];
  thongKe: ThongKeBienLai = {
    tong_so_bien_lai: 0,
    tong_so_tien: 0,
    bien_lai_da_thu: 0,
    tien_da_thu: 0,
    bien_lai_chua_thu: 0,
    tien_chua_thu: 0
  };
  
  dateRange: Date[] = [];
  searchForm = {
    tuNgay: null as Date | null,
    denNgay: null as Date | null,
    quyenSo: null as string | null,
    maNhanVien: null as string | null,
    trangThai: null as string | null,
    donVi: null as string | null
  };

  trangThaiOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'da_thu', label: 'Đã thu' },
    { value: 'chua_thu', label: 'Chưa thu' },
    { value: 'huy', label: 'Đã hủy' }
  ];

  constructor(
    private bienLaiService: BienLaiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
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
      donVi: this.searchForm.donVi || undefined
    };

    this.bienLaiService.getBangKeBienLai(params).subscribe({
      next: (data) => {
        this.bienLais = data;
        this.tinhThongKe(data);
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
                         .reduce((sum, item) => sum + item.so_tien, 0)
    };
  }

  resetForm(): void {
    this.searchForm = {
      tuNgay: null,
      denNgay: null,
      quyenSo: null,
      maNhanVien: null,
      trangThai: null,
      donVi: null
    };
    this.dateRange = [];
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
      donVi: this.searchForm.donVi || undefined
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
      },
      error: (error) => {
        console.error('Lỗi khi xuất Excel:', error);
        this.message.error('Có lỗi xảy ra khi xuất Excel');
        this.loading = false;
      }
    });
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
} 