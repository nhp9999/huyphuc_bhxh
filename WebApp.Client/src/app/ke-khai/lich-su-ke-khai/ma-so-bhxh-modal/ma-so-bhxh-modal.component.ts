import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { D03Service } from '../../../bhyt/services/d03.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';

interface MaSoBHXHItem {
  maSoBHXH: string;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

@Component({
  selector: 'app-ma-so-bhxh-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzTagModule,
    NzMessageModule,
    NzModalModule
  ],
  templateUrl: './ma-so-bhxh-modal.component.html',
  styleUrls: ['./ma-so-bhxh-modal.component.scss']
})
export class MaSoBHXHModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() close = new EventEmitter<void>();

  currentMaSoBHXH = '';
  maSoBHXHList: MaSoBHXHItem[] = [];
  selectedFile: File | null = null;
  isProcessing = false;

  constructor(
    private modalRef: NzModalRef,
    private message: NzMessageService,
    private d03Service: D03Service,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  closeModal(): void {
    this.modalRef.close();
  }

  onlyNumber(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  addMaSoBHXH(): void {
    if (!this.currentMaSoBHXH || this.currentMaSoBHXH.trim() === '') {
      this.message.warning('Vui lòng nhập mã số BHXH');
      return;
    }

    // Kiểm tra định dạng mã số BHXH (10 số)
    if (!/^\d{10}$/.test(this.currentMaSoBHXH)) {
      this.message.warning('Mã số BHXH phải có đúng 10 chữ số');
      return;
    }

    // Kiểm tra trùng lặp
    const isDuplicate = this.maSoBHXHList.some(item => item.maSoBHXH === this.currentMaSoBHXH);
    if (isDuplicate) {
      this.message.warning(`Mã số BHXH ${this.currentMaSoBHXH} đã tồn tại trong danh sách`);
      return;
    }

    // Thêm vào danh sách
    const newItem: MaSoBHXHItem = {
      maSoBHXH: this.currentMaSoBHXH,
      status: 'pending'
    };

    // Tạo một bản sao mới của mảng để đảm bảo Angular phát hiện thay đổi
    this.maSoBHXHList = [...this.maSoBHXHList, newItem];

    console.log('Đã thêm mã số BHXH:', this.currentMaSoBHXH);
    console.log('Danh sách hiện tại:', this.maSoBHXHList);

    // Hiển thị thông báo thành công
    this.message.success(`Đã thêm mã số BHXH ${this.currentMaSoBHXH} vào danh sách`);

    // Reset input
    this.currentMaSoBHXH = '';
  }

  removeMaSoBHXH(index: number): void {
    // Tạo một bản sao mới của mảng để đảm bảo Angular phát hiện thay đổi
    const updatedList = [...this.maSoBHXHList];
    updatedList.splice(index, 1);
    this.maSoBHXHList = updatedList;

    console.log('Đã xóa mã số BHXH tại vị trí:', index);
    console.log('Danh sách hiện tại:', this.maSoBHXHList);

    // Hiển thị thông báo
    this.message.success('Đã xóa mã số BHXH khỏi danh sách');
  }

  clearList(): void {
    this.maSoBHXHList = [];
    this.message.success('Đã xóa tất cả mã số BHXH khỏi danh sách');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile = input.files[0];
    this.readExcelFile(this.selectedFile);
  }

  readExcelFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Lấy sheet đầu tiên
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Chuyển đổi sang JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Tìm và thêm các mã số BHXH từ file
      let count = 0;
      let newItems: MaSoBHXHItem[] = [];

      for (const row of jsonData) {
        if (Array.isArray(row) && row.length > 0) {
          // Duyệt qua từng cột trong hàng
          for (const cell of row) {
            if (cell && (typeof cell === 'string' || typeof cell === 'number')) {
              const cellValue = cell.toString().trim();
              // Kiểm tra nếu là mã số BHXH (10 chữ số)
              if (/^\d{10}$/.test(cellValue)) {
                // Kiểm tra trùng lặp
                const isDuplicate = this.maSoBHXHList.some(item => item.maSoBHXH === cellValue) ||
                                   newItems.some(item => item.maSoBHXH === cellValue);
                if (!isDuplicate) {
                  newItems.push({
                    maSoBHXH: cellValue,
                    status: 'pending'
                  });
                  count++;
                }
              }
            }
          }
        }
      }

      // Cập nhật danh sách với các mã số mới
      if (newItems.length > 0) {
        this.maSoBHXHList = [...this.maSoBHXHList, ...newItems];
        console.log('Đã thêm các mã số BHXH từ file Excel:', newItems);
        console.log('Danh sách hiện tại:', this.maSoBHXHList);
        this.message.success(`Đã thêm ${count} mã số BHXH từ file Excel`);
      } else {
        this.message.warning('Không tìm thấy mã số BHXH hợp lệ trong file');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'processing';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'success': return 'Thành công';
      case 'error': return 'Lỗi';
      default: return 'Chờ xử lý';
    }
  }

  exportD03(): void {
    if (this.maSoBHXHList.length === 0) {
      this.message.warning('Vui lòng thêm ít nhất một mã số BHXH');
      return;
    }

    this.isProcessing = true;
    const loadingId = this.message.loading('Đang xử lý dữ liệu...', { nzDuration: 0 }).messageId;

    // Tạo options cho D03
    const options = {
      tenCongTy: 'Đại lý thu BHXH Huy Phúc',
      nguoiLap: 'Người lập biểu',
      ngayLap: new Date()
    };

    // Lấy dữ liệu D03 cho tất cả các mã số BHXH
    const requests = this.maSoBHXHList.map(item =>
      this.d03Service.getD03DataByMaSoBHXH(item.maSoBHXH).pipe(
        catchError(error => {
          // Cập nhật trạng thái lỗi
          item.status = 'error';
          item.errorMessage = error.message || 'Không tìm thấy thông tin';
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        // Lọc kết quả null (lỗi) và cập nhật trạng thái thành công
        const validResults = results.filter((result, index) => {
          if (result) {
            this.maSoBHXHList[index].status = 'success';
            return true;
          }
          return false;
        });

        // Đóng thông báo loading
        this.message.remove(loadingId);
        this.isProcessing = false;

        if (validResults.length === 0) {
          this.message.error('Không thể lấy dữ liệu cho bất kỳ mã số BHXH nào');
          return;
        }

        // Xuất Excel với tất cả dữ liệu hợp lệ
        this.d03Service.xuatExcelMauD03TS(validResults as any[], options);
        this.message.success(`Đã xuất D03 cho ${validResults.length}/${this.maSoBHXHList.length} mã số BHXH`);
      },
      error: (error) => {
        this.message.remove(loadingId);
        this.isProcessing = false;
        this.message.error('Có lỗi xảy ra khi xử lý dữ liệu: ' + (error.message || 'Lỗi không xác định'));
        console.error('Lỗi khi xuất D03:', error);
      }
    });
  }
}
