import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DotKeKhai } from '../../../services/dot-ke-khai.service';
import { VietQRService, PaymentConfirmResponse } from '../../../services/viet-qr.service';
import { environment } from '../../../../environments/environment';
import { DownloadOutline, CheckCircleOutline } from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { UploadBillModalComponent } from '../upload-bill-modal/upload-bill-modal.component';
import { UserService, NguoiDung } from '../../../services/user.service';

@Component({
  selector: 'app-thanh-toan-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule
  ],
  template: `
    <div class="qr-container" *ngIf="!loading; else loadingTpl">      
      <div class="qr-content">
        <div class="payment-info">
          <div class="qr-section">
            <div class="qr-wrapper">
              <img [src]="qrDataUrl" *ngIf="qrDataUrl" alt="QR Code" />
              <div class="qr-actions">
                <button nz-button nzType="default" (click)="downloadQR()">
                  <i nz-icon nzType="download" nzTheme="outline"></i>
                  Tải mã QR
                </button>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="info-group">
              <div class="info-label">Tên đợt:</div>
              <div class="info-value">{{ dotKeKhai.ten_dot }}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Ngân hàng:</div>
              <div class="info-value">AGRIBANK</div>
            </div>
            <div class="info-group">
              <div class="info-label">Số tài khoản:</div>
              <div class="info-value">{{ environment.vietQR.accountNo }}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Tên tài khoản:</div>
              <div class="info-value">{{ environment.vietQR.accountName }}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Số tiền:</div>
              <div class="info-value amount">{{ dotKeKhai.tong_so_tien | number:'1.0-0' }} đ</div>
            </div>
            <div class="info-group">
              <div class="info-label">Nội dung:</div>
              <div class="info-value">{{ getTransferContent() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="qr-footer">
        <p>Vui lòng quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>
        <button 
          nz-button 
          nzType="primary" 
          [nzLoading]="isConfirming"
          (click)="confirmPayment()"
          class="confirm-button"
        >
          <i nz-icon nzType="check-circle" nzTheme="outline"></i>
          Xác nhận thanh toán
        </button>
      </div>
    </div>
    <ng-template #loadingTpl>
      <div class="loading-container">
        <nz-spin nzTip="Đang tạo mã QR..."></nz-spin>
      </div>
    </ng-template>
  `,
  styleUrls: ['./thanh-toan-modal.component.scss']
})
export class ThanhToanModalComponent implements OnInit {
  @Input() dotKeKhai!: DotKeKhai;
  loading = true;
  isConfirming = false;
  qrDataUrl: string = '';
  environment = environment;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  nguoiDungInfo?: NguoiDung;

  constructor(
    private modal: NzModalRef,
    private modalService: NzModalService,
    private vietQRService: VietQRService,
    private message: NzMessageService,
    private iconService: NzIconService,
    private userService: UserService
  ) {
    this.iconService.addIcon(DownloadOutline, CheckCircleOutline);
  }

  ngOnInit(): void {
    if (!this.dotKeKhai) {
      this.dotKeKhai = this.modal.getConfig().nzData?.dotKeKhai;
    }
    
    if (!this.dotKeKhai) {
      this.message.error('Không có thông tin đợt kê khai');
      this.modal.close();
      return;
    }

    if (!this.dotKeKhai.DonVi?.maSoBHXH) {
      this.message.error('Không có thông tin mã số BHXH của đơn vị');
      this.modal.close();
      return;
    }

    this.userService.getCurrentUserInfo().subscribe({
      next: (nguoiDung) => {
        this.nguoiDungInfo = nguoiDung;
        this.generateQRCode();
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        this.message.error('Không thể lấy thông tin người dùng');
        this.modal.close();
      }
    });
  }

  generateQRCode(): void {
    if (!this.dotKeKhai?.tong_so_tien) {
      this.message.error('Không có thông tin số tiền cần thanh toán');
      this.modal.close();
      return;
    }

    const request = {
      accountNo: environment.vietQR.accountNo,
      accountName: environment.vietQR.accountName,
      acqId: environment.vietQR.acqId,
      amount: this.dotKeKhai.tong_so_tien,
      addInfo: this.getTransferContent(),
      format: 'base64',
      template: 'compact2',
      bankName: 'AGRIBANK',
      displayAmount: true
    };

    this.vietQRService.generateQR(request).subscribe({
      next: (response) => {
        if (response.code === '00') {
          this.qrDataUrl = response.data.qrDataURL || '';
          this.loading = false;
        } else {
          this.message.error('Không thể tạo mã QR: ' + response.desc);
          this.modal.close();
        }
      },
      error: (error) => {
        console.error('Lỗi khi tạo mã QR:', error);
        this.message.error('Có lỗi xảy ra khi tạo mã QR');
        this.modal.close();
      }
    });
  }

  downloadQR(): void {
    if (!this.qrDataUrl) {
      this.message.warning('Chưa có mã QR để tải');
      return;
    }

    // Tạo một thẻ a ẩn để tải ảnh
    const link = document.createElement('a');
    link.href = this.qrDataUrl;
    link.download = `QR_${this.dotKeKhai.ten_dot.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  confirmPayment(): void {
    if (!this.dotKeKhai?.id) {
      this.message.error('Không có thông tin đợt kê khai');
      return;
    }

    // Mở modal upload bill
    const uploadModal = this.modalService.create({
      nzTitle: 'Upload bill thanh toán',
      nzContent: UploadBillModalComponent,
      nzWidth: 520,
      nzData: {
        dotKeKhaiId: this.dotKeKhai.id
      },
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false
    });

    // Xử lý kết quả sau khi upload bill
    uploadModal.afterClose.subscribe((result) => {
      if (result?.code === '00') {
        this.modal.close(true);
      }
    });
  }

  getTransferContent(): string {
    if (!this.dotKeKhai.DonVi?.maSoBHXH) {
      return 'Chưa có mã số BHXH của đơn vị';
    }
    const maBHXH = this.dotKeKhai.DonVi.maSoBHXH;
    const maNhanVien = this.nguoiDungInfo?.ma_nhan_vien || this.nguoiDungInfo?.maNhanVien || '';
    return `BHXH 103 00 ${maBHXH} 08907 DONG BHXH CTY HUY PHUC ${maNhanVien}`;
  }
} 