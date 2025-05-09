import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { LichSuKeKhaiService, KeKhaiBHYT, KeKhaiBHXH } from '../../services/lich-su-ke-khai.service';
import { DonViService, DonVi } from '../../services/don-vi.service';
import { D03Service } from '../../bhyt/services/d03.service';
import { forkJoin } from 'rxjs';
import { MaSoBHXHModalComponent } from './ma-so-bhxh-modal/ma-so-bhxh-modal.component';

@Component({
  selector: 'app-lich-su-ke-khai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzMessageModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTabsModule,
    NzCheckboxModule,
    MaSoBHXHModalComponent
  ],
  templateUrl: './lich-su-ke-khai.component.html',
  styleUrls: ['./lich-su-ke-khai.component.scss']
})
export class LichSuKeKhaiComponent implements OnInit {
  keKhaiBHYTs: any[] = [];
  keKhaiBHXHs: any[] = [];
  loading = false;
  selectedTab = 'bhyt';
  selectedTabIndex = 0;
  dateRange: Date[] | null = null;
  searchForm = {
    maSoBHXH: '',
    cccd: '',
    hoTen: '',
    tuNgay: null as Date | null,
    denNgay: null as Date | null,
    donViId: null as number | null
  };

  donVis: DonVi[] = [];

  // Biến cho checkbox
  isAllBHYTChecked = false;
  isIndeterminateBHYT = false;
  isAllBHXHChecked = false;
  isIndeterminateBHXH = false;

  constructor(
    private lichSuKeKhaiService: LichSuKeKhaiService,
    private message: NzMessageService,
    private d03Service: D03Service,
    private donViService: DonViService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadDonVis();
    this.loadData();
  }

  loadDonVis(): void {
    this.donViService.getDonVis().subscribe({
      next: (data) => {
        this.donVis = data;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đơn vị:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách đơn vị');
      }
    });
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      bhyt: this.lichSuKeKhaiService.getAllKeKhaiBHYT(this.searchForm),
      bhxh: this.lichSuKeKhaiService.getAllKeKhaiBHXH(this.searchForm)
    }).subscribe({
      next: (data) => {
        this.keKhaiBHYTs = data.bhyt.map((item: KeKhaiBHYT) => ({
          ...item,
          checked: false,
          dotKeKhaiInfo: `Đợt ${item.dotKeKhai?.so_dot} tháng ${item.dotKeKhai?.thang} năm ${item.dotKeKhai?.nam}`
        }));
        this.keKhaiBHXHs = data.bhxh.map((item: KeKhaiBHXH) => ({
          ...item,
          checked: false,
          dotKeKhaiInfo: `Đợt ${item.dotKeKhai?.so_dot} tháng ${item.dotKeKhai?.thang} năm ${item.dotKeKhai?.nam}`
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.loading = false;
      }
    });
  }

  // Phương thức xử lý checkbox BHYT
  checkAllBHYT(value: boolean): void {
    this.keKhaiBHYTs.forEach(item => item.checked = value);
    this.refreshBHYTCheckedStatus();
  }

  refreshBHYTCheckedStatus(): void {
    const checkedItems = this.keKhaiBHYTs.filter(item => item.checked);
    this.isAllBHYTChecked = checkedItems.length === this.keKhaiBHYTs.length && this.keKhaiBHYTs.length > 0;
    this.isIndeterminateBHYT = checkedItems.length > 0 && checkedItems.length < this.keKhaiBHYTs.length;
  }

  getSelectedBHYTCount(): number {
    return this.keKhaiBHYTs.filter(item => item.checked).length;
  }

  // Phương thức xử lý checkbox BHXH
  checkAllBHXH(value: boolean): void {
    this.keKhaiBHXHs.forEach(item => item.checked = value);
    this.refreshBHXHCheckedStatus();
  }

  refreshBHXHCheckedStatus(): void {
    const checkedItems = this.keKhaiBHXHs.filter(item => item.checked);
    this.isAllBHXHChecked = checkedItems.length === this.keKhaiBHXHs.length && this.keKhaiBHXHs.length > 0;
    this.isIndeterminateBHXH = checkedItems.length > 0 && checkedItems.length < this.keKhaiBHXHs.length;
  }

  getSelectedBHXHCount(): number {
    return this.keKhaiBHXHs.filter(item => item.checked).length;
  }

  getTotalSelectedCount(): number {
    return this.getSelectedBHYTCount() + this.getSelectedBHXHCount();
  }

  xuatD03TuHeaderButton(): void {
    // Xác định tab hiện tại và gọi phương thức xuất tương ứng
    if (this.selectedTabIndex === 0 && this.getSelectedBHYTCount() > 0) {
      this.xuatD03TuNhieuBangGhi('bhyt');
    } else if (this.selectedTabIndex === 1 && this.getSelectedBHXHCount() > 0) {
      this.xuatD03TuNhieuBangGhi('bhxh');
    } else {
      this.message.warning('Vui lòng chọn ít nhất một bảng ghi để xuất D03');
    }
  }

  // Phương thức xuất D03 cho nhiều bảng ghi đã chọn
  xuatD03TuNhieuBangGhi(loaiKeKhai: 'bhyt' | 'bhxh'): void {
    const selectedItems = loaiKeKhai === 'bhyt'
      ? this.keKhaiBHYTs.filter(item => item.checked)
      : this.keKhaiBHXHs.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một bảng ghi để xuất D03');
      return;
    }

    // Hiển thị thông báo đang xử lý
    const loadingId = this.message.loading('Đang chuẩn bị dữ liệu xuất D03...', { nzDuration: 0 }).messageId;

    // Lấy dữ liệu D03 cho tất cả các bảng ghi đã chọn
    const requests = selectedItems.map(item =>
      this.d03Service.getD03DataForRecord(item.id, loaiKeKhai)
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        // Đóng thông báo loading
        this.message.remove(loadingId);

        // Xuất Excel với tất cả dữ liệu đã lấy
        this.d03Service.xuatExcelMauD03TS(results);

        this.message.success(`Đã xuất D03 cho ${results.length} bảng ghi thành công`);
      },
      error: (error) => {
        this.message.remove(loadingId);
        this.message.error('Lỗi khi xuất D03: ' + (error.message || 'Không xác định'));
        console.error('Lỗi khi xuất D03:', error);
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.selectedTab = index === 0 ? 'bhyt' : 'bhxh';
    this.loadData();
  }

  onDateRangeChange(dateRange: Date[]): void {
    if (dateRange && dateRange.length === 2) {
      this.searchForm.tuNgay = dateRange[0];
      this.searchForm.denNgay = dateRange[1];
    } else {
      this.searchForm.tuNgay = null;
      this.searchForm.denNgay = null;
    }
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
      denNgay: null,
      donViId: null
    };
    this.dateRange = null;
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

  xuatD03TuBangGhi(keKhaiId: number, loaiKeKhai: 'bhyt' | 'bhxh'): void {
    this.loading = true;

    // Tạo options cho D03
    const options = {
      tenCongTy: 'Đại lý thu BHXH Huy Phúc',
      nguoiLap: 'Người lập biểu',
      ngayLap: new Date()
    };

    // Gọi service để xuất D03
    this.d03Service.xuatExcelMauD03TSTuBangGhi(keKhaiId, loaiKeKhai, options);

    // Đặt loading = false sau 1 giây (để cho phép thời gian xử lý)
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  xuatD03TuMaSoBHXH(): void {
    // Kiểm tra mã số BHXH đã được nhập chưa
    if (!this.searchForm.maSoBHXH || this.searchForm.maSoBHXH.trim() === '') {
      this.message.warning('Vui lòng nhập mã số BHXH để xuất D03');
      return;
    }

    // Kiểm tra định dạng mã số BHXH (10 số)
    if (!/^\d{10}$/.test(this.searchForm.maSoBHXH)) {
      this.message.warning('Mã số BHXH phải có đúng 10 chữ số');
      return;
    }

    this.loading = true;
    const loadingId = this.message.loading('Đang chuẩn bị dữ liệu xuất D03...', { nzDuration: 0 }).messageId;

    // Tạo options cho D03
    const options = {
      tenCongTy: 'Đại lý thu BHXH Huy Phúc',
      nguoiLap: 'Người lập biểu',
      ngayLap: new Date()
    };

    try {
      // Gọi service để xuất D03 từ mã số BHXH
      this.d03Service.xuatExcelMauD03TSTuMaSoBHXH(this.searchForm.maSoBHXH, options);

      // Đóng thông báo loading sau 2 giây
      setTimeout(() => {
        this.message.remove(loadingId);
        this.loading = false;
        this.message.success(`Đã xuất D03 cho mã số BHXH ${this.searchForm.maSoBHXH} thành công`);
      }, 2000);
    } catch (error) {
      this.message.remove(loadingId);
      this.loading = false;
      this.message.error('Có lỗi xảy ra khi xuất D03');
      console.error('Lỗi khi xuất D03:', error);
    }
  }

  openMaSoBHXHModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: '',
      nzContent: MaSoBHXHModalComponent,
      nzFooter: null,
      nzWidth: 800,
      nzBodyStyle: { padding: '0' },
      nzMaskClosable: false,
      nzClassName: 'ma-so-bhxh-modal'
    });
  }
}