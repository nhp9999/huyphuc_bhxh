import { Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-xem-hoa-don-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule,
    NzDescriptionsModule,
    NzAlertModule,
    NzToolTipModule
  ],
  templateUrl: './xem-hoa-don-modal.component.html',
  styleUrls: ['./xem-hoa-don-modal.component.scss']
})
export class XemHoaDonModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() dotKeKhai: any = null;
  @Input() urlBill: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() viewKeKhaiBHYT = new EventEmitter<number>();
  @Output() uploadBill = new EventEmitter<void>();
  @Output() downloadBill = new EventEmitter<void>();

  @ViewChild('billImage') billImageElement!: ElementRef<HTMLImageElement>;

  // Biến cho trạng thái ảnh
  isImageLoading = true;
  selectedHoaDon: string | null = null;

  // Biến cho các tính năng của ảnh hóa đơn
  imageZoom = 1;
  imageRotation = 0;
  isFullscreen = false;

  // Biến cho chức năng kéo ảnh
  isDragging = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;

  // Cache hóa đơn đã tải
  private imageCache: Map<string, string> = new Map();

  // Biến cho trạng thái sao chép
  isCopying = false;

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    // Khởi tạo modal
  }

  ngOnChanges(): void {
    if (this.isVisible && this.urlBill) {
      this.loadImage();
    }
  }

  loadImage(): void {
    // Reset các biến
    this.imageZoom = 1;
    this.imageRotation = 0;
    this.isFullscreen = false;
    this.translateX = 0;
    this.translateY = 0;
    this.isImageLoading = true;

    // Xử lý URL ảnh
    let imageUrl = this.urlBill as string;
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      try {
        const baseUrl = environment.apiUrl.replace('/api', '');
        imageUrl = `${baseUrl}/${imageUrl}`;
      } catch (error) {
        console.error('Lỗi khi xử lý URL:', error);
      }
    }

    // Tải ảnh
    const img = new Image();
    img.onload = () => {
      // Cập nhật URL ảnh sau khi tải thành công
      this.selectedHoaDon = imageUrl;
      this.isImageLoading = false;

      // Điều chỉnh kích thước zoom nếu cần
      if (img.naturalWidth > 1200 || img.naturalHeight > 800) {
        this.imageZoom = 0.9;
      }

      // Lưu vào cache
      this.imageCache.set(imageUrl, imageUrl);
    };

    img.onerror = () => {
      this.isImageLoading = false;
      this.message.error('Không thể tải ảnh hóa đơn');
      console.error('Lỗi tải ảnh:', imageUrl);
    };

    img.src = imageUrl;
  }

  // Xử lý đóng modal
  handleCancel(): void {
    // Thoát chế độ toàn màn hình nếu đang ở chế độ đó
    if (this.isFullscreen) {
      this.toggleFullscreen();
    }

    this.closeModal.emit();
    this.selectedHoaDon = null;
    this.imageZoom = 1;
    this.imageRotation = 0;
    this.translateX = 0;
    this.translateY = 0;
  }

  // Các phương thức cho ảnh
  zoomIn(): void {
    if (this.imageZoom < 3) {
      this.imageZoom += 0.2;
    }
  }

  zoomOut(): void {
    if (this.imageZoom > 0.5) {
      this.imageZoom -= 0.2;
    }
  }

  rotateImage(): void {
    this.imageRotation = (this.imageRotation + 90) % 360;

    // Reset vị trí khi xoay ảnh
    this.translateX = 0;
    this.translateY = 0;
  }

  resetImage(): void {
    this.imageZoom = 1;
    this.imageRotation = 0;
    this.translateX = 0;
    this.translateY = 0;
  }

  // Các phương thức xử lý kéo thả ảnh
  startDrag(event: MouseEvent): void {
    if (this.imageZoom > 1) {
      this.isDragging = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
    event.preventDefault();
  }

  endDrag(): void {
    this.isDragging = false;
  }

  // Xử lý touch events cho thiết bị di động
  startTouchDrag(event: TouchEvent): void {
    if (this.imageZoom > 1 && event.touches.length === 1) {
      this.isDragging = true;
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
    }
  }

  onTouchDrag(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;

    this.translateX = event.touches[0].clientX - this.startX;
    this.translateY = event.touches[0].clientY - this.startY;
    event.preventDefault();
  }

  endTouchDrag(): void {
    this.isDragging = false;
  }

  // Xác định transform tổng hợp cho ảnh
  getImageTransform(): string {
    // Điều chỉnh vị trí dựa trên zoom
    const posX = this.translateX / this.imageZoom;
    const posY = this.translateY / this.imageZoom;

    return `scale(${this.imageZoom}) rotate(${this.imageRotation}deg) translate(${posX}px, ${posY}px)`;
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;

    // Thêm hoặc xóa class cho body để ngăn cuộn khi ở chế độ toàn màn hình
    if (this.isFullscreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Xử lý sự kiện lăn chuột để zoom
  handleMouseWheel(event: WheelEvent): void {
    event.preventDefault();

    if (event.deltaY < 0) {
      // Lăn lên: phóng to
      this.zoomIn();
    } else {
      // Lăn xuống: thu nhỏ
      this.zoomOut();
    }
  }

  // Phương thức lấy tên file từ URL
  getFileName(): string {
    if (!this.selectedHoaDon) return 'Không có file';

    try {
      const url = new URL(this.selectedHoaDon);
      const pathSegments = url.pathname.split('/');
      return pathSegments[pathSegments.length - 1] || 'hoa-don.jpg';
    } catch (e) {
      const pathSegments = this.selectedHoaDon.split('/');
      return pathSegments[pathSegments.length - 1] || 'hoa-don.jpg';
    }
  }

  // Tải hóa đơn
  taiHoaDon(): void {
    this.downloadBill.emit();
  }

  // Xem thông tin kê khai BHYT
  xemKeKhaiBHYT(): void {
    if (this.dotKeKhai && this.dotKeKhai.id) {
      this.viewKeKhaiBHYT.emit(this.dotKeKhai.id);
    }
  }

  // Upload thay thế hóa đơn
  uploadThayThe(): void {
    this.uploadBill.emit();
  }

  // In ảnh hóa đơn
  printImage(): void {
    if (!this.selectedHoaDon) {
      this.message.warning('Không có ảnh hóa đơn để in');
      return;
    }

    // Tạo một iframe ẩn để in ảnh
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      this.message.error('Không thể tạo khung in');
      document.body.removeChild(printFrame);
      return;
    }

    // Tạo nội dung HTML cho iframe
    const fileName = this.getFileName();
    const dotKeKhaiInfo = this.dotKeKhai ?
      `<p><strong>Đợt kê khai:</strong> ${this.dotKeKhai.ten_dot}</p>
       <p><strong>Mã hồ sơ:</strong> ${this.dotKeKhai.ma_ho_so || 'Không có'}</p>
       <p><strong>Loại dịch vụ:</strong> ${this.dotKeKhai.dich_vu}</p>
       <p><strong>Tổng số tiền:</strong> ${this.dotKeKhai.tong_so_tien?.toLocaleString() || 0} đ</p>` : '';

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>In hóa đơn - ${fileName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .image-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .image-container img {
            max-width: 100%;
            max-height: 650px;
            border: 1px solid #ddd;
          }
          .info {
            margin-bottom: 20px;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 30px;
          }
          @media print {
            @page {
              size: auto;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Hóa đơn</h2>
        </div>
        <div class="info">
          ${dotKeKhaiInfo}
          <p><strong>Tên file:</strong> ${fileName}</p>
          <p><strong>Ngày in:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="image-container">
          <img src="${this.selectedHoaDon}" alt="Hóa đơn" />
        </div>
        <div class="footer">
          <p>Hóa đơn được in từ hệ thống quản lý BHXH/BHYT</p>
        </div>
      </body>
      </html>
    `);
    frameDoc.close();

    // Đợi ảnh tải xong rồi mới in
    const img = frameDoc.querySelector('img');
    if (img) {
      img.onload = () => {
        // Đợi một chút để đảm bảo CSS đã được áp dụng
        setTimeout(() => {
          printFrame.contentWindow?.print();
          // Xóa iframe sau khi in xong
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        }, 500);
      };
    } else {
      this.message.error('Không thể tải ảnh để in');
      document.body.removeChild(printFrame);
    }
  }

  // Sao chép ảnh vào clipboard
  copyImageToClipboard(): void {
    if (!this.selectedHoaDon || !this.billImageElement) {
      this.message.warning('Không có ảnh hóa đơn để sao chép');
      return;
    }

    this.isCopying = true;
    const loadingMsg = this.message.loading('Đang sao chép ảnh...', { nzDuration: 0 });

    // Tạo canvas để vẽ ảnh
    const canvas = document.createElement('canvas');
    const img = this.billImageElement.nativeElement;

    // Đảm bảo ảnh đã tải xong
    if (img.complete) {
      this.performCopy(img, canvas, loadingMsg);
    } else {
      img.onload = () => {
        this.performCopy(img, canvas, loadingMsg);
      };
      img.onerror = () => {
        this.message.remove(loadingMsg.messageId);
        this.message.error('Không thể sao chép ảnh');
        this.isCopying = false;
      };
    }
  }

  // Thực hiện sao chép ảnh
  private performCopy(img: HTMLImageElement, canvas: HTMLCanvasElement, loadingMsg: any): void {
    try {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Không thể tạo context 2D');
      }

      // Vẽ ảnh lên canvas
      ctx.drawImage(img, 0, 0);

      // Chuyển canvas thành blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Không thể tạo blob từ canvas');
        }

        // Tạo ClipboardItem và sao chép vào clipboard
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item])
          .then(() => {
            this.message.remove(loadingMsg.messageId);
            this.message.success('Đã sao chép ảnh vào clipboard');
          })
          .catch((error) => {
            console.error('Lỗi khi sao chép ảnh:', error);
            this.message.remove(loadingMsg.messageId);
            this.message.error('Không thể sao chép ảnh vào clipboard');
          })
          .finally(() => {
            this.isCopying = false;
          });
      }, 'image/png');
    } catch (error) {
      console.error('Lỗi khi xử lý ảnh:', error);
      this.message.remove(loadingMsg.messageId);
      this.message.error('Không thể xử lý ảnh để sao chép');
      this.isCopying = false;
    }
  }

  // Xử lý các phím tắt
  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Chỉ xử lý khi modal đang hiển thị
    if (!this.isVisible) return;

    // Ctrl + các phím tắt
    if (event.ctrlKey) {
      switch (event.key) {
        case '+':
        case '=': // Phím + thường cùng phím với =
          this.zoomIn();
          event.preventDefault();
          break;
        case '-':
          this.zoomOut();
          event.preventDefault();
          break;
        case '0':
          this.resetImage();
          event.preventDefault();
          break;
        case 'r':
        case 'R':
          this.rotateImage();
          event.preventDefault();
          break;
        case 'p':
        case 'P':
          this.printImage();
          event.preventDefault();
          break;
        case 'c':
        case 'C':
          // Chỉ sao chép khi không có text nào đang được chọn
          if (!window.getSelection()?.toString()) {
            this.copyImageToClipboard();
            event.preventDefault();
          }
          break;
      }
    }

    // F11 để toàn màn hình
    if (event.key === 'F11' && !this.isFullscreen) {
      this.toggleFullscreen();
      event.preventDefault();
    }

    // ESC để thoát chế độ toàn màn hình
    if (event.key === 'Escape' && this.isFullscreen) {
      this.toggleFullscreen();
      event.preventDefault();
    }
  }

  // Lấy màu tag dựa trên trạng thái
  getTrangThaiType(trangThai: string): string {
    switch (trangThai) {
      case 'chua_gui':
        return 'default';
      case 'da_gui':
        return 'processing';
      case 'da_duyet':
        return 'success';
      case 'da_tu_choi':
        return 'error';
      default:
        return 'default';
    }
  }

  // Lấy text hiển thị cho trạng thái
  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'chua_gui':
        return 'Chưa gửi';
      case 'da_gui':
        return 'Đã gửi';
      case 'da_duyet':
        return 'Đã duyệt';
      case 'da_tu_choi':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  }
}