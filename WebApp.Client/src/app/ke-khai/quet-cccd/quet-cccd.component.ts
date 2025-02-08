import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { CCCDService } from '../../services/cccd.service';

@Component({
  selector: 'app-quet-cccd',
  templateUrl: './quet-cccd.component.html',
  styleUrls: ['./quet-cccd.component.scss']
})
export class QuetCCCDComponent implements OnInit {
  loading = false;
  avatarUrl?: string;
  thongTinCCCD: any;

  constructor(
    private msg: NzMessageService,
    private cccdService: CCCDService
  ) { }

  ngOnInit(): void { }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.msg.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    const isLt2M = (file.size || 0) / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.msg.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    this.quetCCCD(file as any);
    return false;
  };

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.loading = true;
        break;
      case 'done':
        this.getBase64(info.file.originFileObj!, (img: string) => {
          this.loading = false;
          this.avatarUrl = img;
        });
        break;
      case 'error':
        this.msg.error('Tải ảnh lên thất bại!');
        this.loading = false;
        break;
    }
  }

  quetCCCD(file: File): void {
    this.loading = true;
    this.cccdService.quetCCCD(file).subscribe({
      next: (response) => {
        this.thongTinCCCD = response.data[0];
        this.loading = false;
        this.msg.success('Quét CCCD thành công!');
      },
      error: (error) => {
        this.loading = false;
        this.msg.error('Quét CCCD thất bại!');
        console.error('Lỗi khi quét CCCD:', error);
      }
    });
  }
} 