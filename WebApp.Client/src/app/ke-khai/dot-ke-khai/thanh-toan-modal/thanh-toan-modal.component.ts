import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DotKeKhai } from '../../../services/dot-ke-khai.service';
import { VietQRService } from '../../../services/viet-qr.service';
import { environment } from '../../../../environments/environment';

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
      <nz-card>
        <div class="qr-header">
          <h2>Quét mã để thanh toán</h2>
          <div class="bank-info">
            <p class="bank-name">AGRIBANK - Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam</p>
            <p class="account-number">Số tài khoản: <strong>{{ environment.vietQR.accountNo }}</strong></p>
            <p class="account-name">Tên tài khoản: <strong>{{ environment.vietQR.accountName }}</strong></p>
          </div>
          <p class="amount">Số tiền: <strong>{{ dotKeKhai.tong_so_tien | number:'1.0-0' }} đ</strong></p>
          <p class="note">Nội dung: <strong>{{ dotKeKhai.ten_dot }}</strong></p>
        </div>
        <div class="qr-content">
          <img [src]="qrDataUrl" *ngIf="qrDataUrl" alt="QR Code" />
        </div>
        <div class="qr-footer">
          <p>Vui lòng quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>
        </div>
      </nz-card>
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
  qrDataUrl: string = '';
  environment = environment;

  constructor(
    private modal: NzModalRef,
    private vietQRService: VietQRService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Lấy dữ liệu từ modal data
    if (!this.dotKeKhai) {
      this.dotKeKhai = this.modal.getConfig().nzData?.dotKeKhai;
    }
    
    if (!this.dotKeKhai) {
      this.message.error('Không có thông tin đợt kê khai');
      this.modal.close();
      return;
    }

    this.generateQRCode();
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
      addInfo: 'Thanh toan ' + this.dotKeKhai.ten_dot,
      format: 'base64',
      template: 'compact'
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
} 