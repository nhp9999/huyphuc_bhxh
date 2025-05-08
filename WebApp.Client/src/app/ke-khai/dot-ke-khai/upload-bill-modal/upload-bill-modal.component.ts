import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadModule, NzUploadFile, NzUploadChangeParam, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UploadOutline } from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { VietQRService } from '../../../services/viet-qr.service';
import { DotKeKhaiService } from '../../../services/dot-ke-khai.service';
import { HoaDonThanhToanService } from '../../../services/hoa-don-thanh-toan.service';
import { Observable, Observer, Subscription, finalize, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-upload-bill-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule
  ],
  template: `
    <div class="upload-container">
      <nz-upload
        [(nzFileList)]="fileList"
        [nzBeforeUpload]="beforeUpload"
        [nzCustomRequest]="customRequest"
        [nzShowUploadList]="true"
        [nzMultiple]="false"
        [nzAccept]="'.jpg,.jpeg,.png'"
        [nzRemove]="handleRemove"
        (nzChange)="handleChange($event)"
      >
        <button nz-button [disabled]="fileList.length > 0">
          <i nz-icon nzType="upload"></i>
          Chọn file
        </button>
      </nz-upload>
      <div class="upload-hint">
        <p>Hỗ trợ upload file: JPG, PNG</p>
        <p>Dung lượng tối đa: 5MB</p>
      </div>
    </div>
    <div *nzModalFooter>
      <button nz-button nzType="default" [disabled]="isUploading" (click)="handleCancel()">Hủy</button>
      <button
        nz-button
        nzType="primary"
        [nzLoading]="isUploading"
        [disabled]="!hasFile || isUploading"
        (click)="handleOk()"
      >
        Xác nhận
      </button>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 24px;
      text-align: center;
    }
    .upload-hint {
      margin-top: 16px;
      color: #8c8c8c;
      font-size: 14px;

      p {
        margin: 4px 0;
      }
    }
    :host ::ng-deep {
      .ant-upload-list {
        width: 100%;
        max-width: 360px;
        margin: 16px auto 0;
        text-align: left;
      }
      .ant-upload-list-item {
        margin-top: 8px;
        padding: 8px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
      }
      .ant-upload-list-item-name {
        color: #262626;
      }
    }
  `]
})
export class UploadBillModalComponent implements OnInit {
  dotKeKhaiId: number;
  fileList: NzUploadFile[] = [];
  isUploading = false;
  hasFile = false;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(
    private modal: NzModalRef,
    private message: NzMessageService,
    private iconService: NzIconService,
    private cloudinaryService: CloudinaryService,
    private vietQRService: VietQRService,
    private dotKeKhaiService: DotKeKhaiService,
    private hoaDonService: HoaDonThanhToanService,
    private ngZone: NgZone
  ) {
    this.iconService.addIcon(UploadOutline);
    const modalData = this.modal.getConfig().nzData || {};
    this.dotKeKhaiId = modalData.dotKeKhaiId;
  }

  ngOnInit(): void {
    if (!this.dotKeKhaiId) {
      this.message.error('Không có thông tin đợt kê khai');
      setTimeout(() => this.modal.close(), 0);
    }
  }

  customRequest = (item: NzUploadXHRArgs): Subscription => {
    const formData = new FormData();
    formData.append('file', item.file as any);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);

    // Format timestamp theo giờ Việt Nam
    const now = new Date();
    const timestamp = now.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh'
    }).replace(/[/:]/g, '').replace(/,/g, '_').replace(/ /g, '');

    const fileName = `bill_${this.dotKeKhaiId}_${timestamp}`;
    formData.append('public_id', fileName);
    formData.append('folder', 'bills');

    const req = new XMLHttpRequest();
    req.open('POST', `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`);

    req.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded * 100) / e.total);
        item.onProgress!({ percent }, item.file);
      }
    };

    req.onload = () => {
      if (req.status === 200) {
        const response = JSON.parse(req.response);
        item.onSuccess!(response, item.file, req);

        // Lưu thông tin response vào file
        const currentFile = this.fileList[0];
        if (currentFile) {
          currentFile.url = response.secure_url;
          currentFile.status = 'done';
          currentFile['cloudinaryResponse'] = response;
        }
      } else {
        item.onError!(new Error('Upload failed'), item.file);
        this.message.error('Upload thất bại');
      }
    };

    req.onerror = () => {
      item.onError!(new Error('Upload failed'), item.file);
      this.message.error('Upload thất bại');
    };

    req.send(formData);

    // Tạo một Subscription mới
    const subscription = new Subscription();
    subscription.add(() => {
      if (req && req.readyState !== 4) {
        req.abort();
      }
    });

    return subscription;
  };

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status === 'uploading') {
      this.isUploading = true;
      return;
    }
    if (info.file.status === 'done') {
      this.isUploading = false;
      this.hasFile = true;

      const response = info.file.response;

      // Tạo hóa đơn thanh toán
      const hoaDon = {
        dot_ke_khai_id: this.dotKeKhaiId,
        so_tien: 0, // Số tiền sẽ được cập nhật sau
        noi_dung_thanh_toan: 'Upload bill thanh toán',
        url_bill: response.secure_url,
        public_id: response.public_id,
        trang_thai: 'cho_duyet',
        nguoi_tao: this.currentUser.username || ''
      };

      this.hoaDonService.create(hoaDon).subscribe({
        next: () => {
          // Cập nhật trạng thái sang chờ xử lý
          this.dotKeKhaiService.updateTrangThai(this.dotKeKhaiId, 'cho_xu_ly').subscribe({
            next: () => {
              this.message.success('Xác nhận thanh toán thành công');
              // Đóng modal hiện tại
              this.modal.close({
                code: '00',
                data: {
                  billUrl: response.secure_url,
                  publicId: response.public_id
                }
              });
            },
            error: (error) => {
              console.error('Lỗi khi cập nhật trạng thái:', error);
              this.message.error('Có lỗi xảy ra khi cập nhật trạng thái đợt kê khai');
            }
          });
        },
        error: (error) => {
          console.error('Lỗi khi lưu hóa đơn:', error);
          this.message.error('Có lỗi xảy ra khi lưu thông tin hóa đơn');
        }
      });
    } else if (info.file.status === 'error') {
      this.isUploading = false;
      this.message.error(`${info.file.name} không thể upload.`);
    }
    if (info.type === 'removed') {
      this.hasFile = false;
      this.fileList = [];
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // Kiểm tra định dạng file
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isValidType) {
      this.message.error('Chỉ hỗ trợ file JPG hoặc PNG!');
      return false;
    }

    // Kiểm tra dung lượng file (5MB)
    const isLt5M = file.size! / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('File phải nhỏ hơn 5MB!');
      return false;
    }

    return true; // Cho phép upload
  };

  handleRemove = (): boolean => {
    this.hasFile = false;
    this.fileList = [];
    return true;
  };

  handleOk(): void {
    if (this.fileList.length === 0) {
      this.message.warning('Vui lòng chọn file bill thanh toán');
      return;
    }

    const currentFile = this.fileList[0];
    if (!currentFile || !currentFile['cloudinaryResponse']) {
      this.message.error('Vui lòng đợi upload hoàn tất');
      return;
    }

    const response = currentFile['cloudinaryResponse'];

    // Xác nhận thanh toán với URL của bill
    this.vietQRService.confirmPayment(
      this.dotKeKhaiId,
      response.secure_url,
      response.public_id
    ).subscribe({
      next: (confirmResponse) => {
        if (confirmResponse.code === '00' && confirmResponse.data.status === 'success') {
          this.message.success('Xác nhận thanh toán thành công');
          this.ngZone.run(() => {
            // Đóng modal hiện tại
            this.modal.close({
              code: '00',
              data: {
                billUrl: response.secure_url,
                publicId: response.public_id
              }
            });
          });
        } else {
          this.message.error('Xác nhận thanh toán thất bại');
        }
      },
      error: (error) => {
        console.error('Lỗi khi xác nhận thanh toán:', error);
        this.message.error('Có lỗi xảy ra khi xác nhận thanh toán');
      }
    });
  }

  handleCancel(): void {
    if (this.isUploading) {
      return;
    }
    this.modal.close();
  }
}