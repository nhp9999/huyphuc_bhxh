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
import { BienLaiService, BangKeBienLai } from '../../services/bien-lai.service';

@Component({
  selector: 'app-bang-ke-bien-lai',
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
    NzFormModule
  ],
  templateUrl: './bang-ke-bien-lai.component.html',
  styleUrls: ['./bang-ke-bien-lai.component.scss']
})
export class BangKeBienLaiComponent implements OnInit {
  loading = false;
  bienLais: BangKeBienLai[] = [];
  dateRange: Date[] = [];
  searchForm = {
    tuNgay: null as Date | null,
    denNgay: null as Date | null,
    quyenSo: null as string | null,
    maNhanVien: null as string | null
  };

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
      maNhanVien: this.searchForm.maNhanVien || undefined
    };

    this.bienLaiService.getBangKeBienLai(params).subscribe({
      next: (data) => {
        this.bienLais = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.searchForm = {
      tuNgay: null,
      denNgay: null,
      quyenSo: null,
      maNhanVien: null
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
      maNhanVien: this.searchForm.maNhanVien || undefined
    };

    this.bienLaiService.exportBangKeBienLai(params).subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bang-ke-bien-lai-${new Date().getTime()}.xlsx`;
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

  // Hàm chuyển đổi số người thứ sang text
  getNguoiThuText(nguoiThu: number | undefined): string {
    if (!nguoiThu) return '';
    
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
} 