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
import { LichSuKeKhaiService } from '../../services/lich-su-ke-khai.service';

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
    NzGridModule
  ],
  templateUrl: './lich-su-ke-khai.component.html',
  styleUrls: ['./lich-su-ke-khai.component.scss']
})
export class LichSuKeKhaiComponent implements OnInit {
  keKhaiBHYTs: any[] = [];
  loading = false;
  searchForm = {
    maSoBHXH: '',
    cccd: '',
    hoTen: '',
    tuNgay: null,
    denNgay: null
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
    this.lichSuKeKhaiService.getAllKeKhaiBHYT(this.searchForm).subscribe({
      next: (data) => {
        this.keKhaiBHYTs = data.map(item => ({
          ...item,
          dotKeKhaiInfo: `Đợt ${item.dotKeKhai?.so_dot} tháng ${item.dotKeKhai?.thang} năm ${item.dotKeKhai?.nam}`
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
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
    this.lichSuKeKhaiService.exportToExcel(this.searchForm).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lich-su-ke-khai-${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi xuất Excel:', error);
        this.message.error('Có lỗi xảy ra khi xuất Excel');
        this.loading = false;
      }
    });
  }
} 