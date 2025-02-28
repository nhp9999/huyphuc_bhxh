import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { LichSuKeKhaiService, KeKhaiBHYT, KeKhaiBHXH } from '../../services/lich-su-ke-khai.service';

@Component({
  selector: 'app-lich-su-ke-khai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzDatePickerModule,
    NzSelectModule,
    NzFormModule,
    NzInputModule,
    NzCardModule,
    NzGridModule,
    NzTabsModule
  ],
  templateUrl: './lich-su-ke-khai.component.html',
  styleUrls: ['./lich-su-ke-khai.component.scss']
})
export class LichSuKeKhaiComponent implements OnInit {
  keKhaiBHYTs: KeKhaiBHYT[] = [];
  keKhaiBHXHs: KeKhaiBHXH[] = [];
  loading = false;
  selectedTab = 'bhyt';
  selectedTabIndex = 0;
  searchForm = {
    maSoBHXH: '',
    cccd: '',
    hoTen: '',
    tuNgay: null as Date | null,
    denNgay: null as Date | null
  };

  constructor(
    private lichSuKeKhaiService: LichSuKeKhaiService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    if (this.selectedTab === 'bhyt') {
      this.loadKeKhaiBHYT();
    } else {
      this.loadKeKhaiBHXH();
    }
  }

  loadKeKhaiBHYT(): void {
    this.lichSuKeKhaiService.getAllKeKhaiBHYT(this.searchForm).subscribe({
      next: (data) => {
        this.keKhaiBHYTs = data.map(item => ({
          ...item,
          dotKeKhaiInfo: `Đợt ${item.dotKeKhai?.so_dot} tháng ${item.dotKeKhai?.thang} năm ${item.dotKeKhai?.nam}`
        }));
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Lỗi khi tải dữ liệu BHYT:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu BHYT');
        this.loading = false;
      }
    });
  }

  loadKeKhaiBHXH(): void {
    this.lichSuKeKhaiService.getAllKeKhaiBHXH(this.searchForm).subscribe({
      next: (data) => {
        this.keKhaiBHXHs = data.map(item => ({
          ...item,
          dotKeKhaiInfo: `Đợt ${item.dotKeKhai?.so_dot} tháng ${item.dotKeKhai?.thang} năm ${item.dotKeKhai?.nam}`
        }));
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Lỗi khi tải dữ liệu BHXH:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu BHXH');
        this.loading = false;
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTab = index === 0 ? 'bhyt' : 'bhxh';
    this.loadData();
  }

  search(): void {
    this.loadData();
  }

  resetForm(): void {
    this.searchForm = {
      maSoBHXH: '',
      cccd: '',
      hoTen: '',
      tuNgay: null,
      denNgay: null
    };
    this.loadData();
  }

  getPhuongAnDongText(phuongAnDong: string): string {
    const map: { [key: string]: string } = {
      'dao_han': 'Đáo hạn',
      'tang_moi': 'Tăng mới',
      'dung_dong': 'Dừng đóng'
    };
    return map[phuongAnDong] || phuongAnDong;
  }

  exportToExcel(): void {
    this.loading = true;
    const exportService = this.selectedTab === 'bhyt' 
      ? this.lichSuKeKhaiService.exportBHYTToExcel(this.searchForm)
      : this.lichSuKeKhaiService.exportBHXHToExcel(this.searchForm);

    exportService.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lich-su-ke-khai-${this.selectedTab}-${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Lỗi khi xuất Excel:', error);
        this.message.error('Có lỗi xảy ra khi xuất Excel');
        this.loading = false;
      }
    });
  }
} 