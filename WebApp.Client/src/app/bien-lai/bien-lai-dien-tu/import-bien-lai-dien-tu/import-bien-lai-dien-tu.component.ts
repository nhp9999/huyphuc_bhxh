import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-import-bien-lai-dien-tu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzUploadModule,
    NzButtonModule,
    NzMessageModule,
    NzTableModule,
    NzDividerModule,
    NzIconModule,
    NzSpinModule,
    NzAlertModule
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Import biên lai điện tử từ Excel</h2>
        <div class="button-group">
          <button nz-button [routerLink]="['/bien-lai/bien-lai-dien-tu/quan-ly']">
            <i nz-icon nzType="arrow-left"></i> Quay lại
          </button>
        </div>
      </div>

      <div class="import-container">
        <div class="upload-section">
          <nz-upload
            [(nzFileList)]="fileList"
            [nzBeforeUpload]="beforeUpload"
            [nzAccept]="'.xlsx'"
            [nzMultiple]="false"
            [nzShowUploadList]="true"
          >
            <button nz-button>
              <i nz-icon nzType="upload"></i> Chọn file Excel
            </button>
          </nz-upload>
          <div class="upload-hint">
            <p>Hỗ trợ file Excel (.xlsx) theo mẫu</p>
            <p>Dung lượng tối đa: 5MB</p>
          </div>
          <div class="action-buttons">
            <button
              nz-button
              nzType="primary"
              [disabled]="fileList.length === 0 || isUploading"
              (click)="uploadFile()"
              [nzLoading]="isUploading"
            >
              <i nz-icon nzType="import"></i> Import dữ liệu
            </button>
            <button nz-button (click)="downloadTemplate()">
              <i nz-icon nzType="download"></i> Tải mẫu Excel
            </button>
          </div>
        </div>

        <nz-divider></nz-divider>

        <div *ngIf="importResult">
          <nz-alert
            *ngIf="importResult.errors && importResult.errors.length > 0"
            nzType="warning"
            nzMessage="Có lỗi xảy ra khi import"
            [nzDescription]="errorTpl"
            nzShowIcon
          ></nz-alert>
          <ng-template #errorTpl>
            <ul>
              <li *ngFor="let error of importResult.errors">{{ error }}</li>
            </ul>
          </ng-template>

          <nz-alert
            *ngIf="importResult.message"
            nzType="success"
            [nzMessage]="importResult.message"
            nzShowIcon
            class="mb-3"
          ></nz-alert>

          <h3 *ngIf="importResult.data && importResult.data.length > 0">Kết quả import</h3>
          <nz-table
            *ngIf="importResult.data && importResult.data.length > 0"
            #basicTable
            [nzData]="importResult.data"
            [nzPageSize]="10"
            [nzShowPagination]="true"
          >
            <thead>
              <tr>
                <th>Dòng</th>
                <th>Tên người đóng</th>
                <th>Mã số BHXH</th>
                <th>Số biên lai</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of basicTable.data">
                <td>{{ item.row }}</td>
                <td>{{ item.ten_nguoi_dong }}</td>
                <td>{{ item.ma_so_bhxh }}</td>
                <td>{{ item.so_bien_lai }}</td>
                <td>{{ item.so_tien | number:'1.0-0' }} đ</td>
                <td>
                  <span
                    [ngClass]="{'success-status': item.status === 'success', 'error-status': item.status !== 'success'}"
                  >
                    {{ item.status === 'success' ? 'Thành công' : 'Lỗi' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .import-container {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }
    .upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border: 1px dashed #d9d9d9;
      border-radius: 5px;
      background: #fafafa;
    }
    .upload-hint {
      margin-top: 10px;
      color: #888;
      text-align: center;
    }
    .action-buttons {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    .success-status {
      color: #52c41a;
    }
    .error-status {
      color: #f5222d;
    }
    .mb-3 {
      margin-bottom: 15px;
    }
  `]
})
export class ImportBienLaiDienTuComponent implements OnInit {
  fileList: NzUploadFile[] = [];
  isUploading = false;
  importResult: any = null;

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // Kiểm tra định dạng file
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXlsx) {
      this.message.error('Chỉ hỗ trợ file Excel (.xlsx)!');
      return false;
    }

    // Kiểm tra kích thước file
    const isLt5M = (file.size || 0) / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('File phải nhỏ hơn 5MB!');
      return false;
    }

    // Chỉ cho phép 1 file
    this.fileList = [file];
    return false;
  };

  uploadFile(): void {
    if (this.fileList.length === 0) {
      this.message.warning('Vui lòng chọn file Excel để import!');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.fileList[0] as any);

    this.http.post(`${environment.apiUrl}/bien-lai-dien-tu/import`, formData)
      .subscribe({
        next: (response: any) => {
          this.isUploading = false;
          this.importResult = response;
          this.message.success(response.message || 'Import thành công!');
        },
        error: (error) => {
          this.isUploading = false;
          this.message.error(error.error?.message || 'Lỗi khi import dữ liệu!');
          console.error('Import error:', error);
        }
      });
  }

  downloadTemplate(): void {
    // Sử dụng đường dẫn trực tiếp đến file mẫu trong thư mục assets
    const templateUrl = '/assets/templates/mau-import-bien-lai-dien-tu.xlsx';

    // Tạo link tải xuống
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'mau-import-bien-lai-dien-tu.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.message.success('Tải mẫu Excel thành công!');
  }
}
