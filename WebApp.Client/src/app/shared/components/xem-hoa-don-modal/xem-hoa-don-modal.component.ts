import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
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
  
  // Xử lý sự kiện phím ESC để thoát chế độ toàn màn hình
  @HostListener('document:keydown.escape', ['$event'])
  handleEscKey(event: KeyboardEvent): void {
    if (this.isFullscreen) {
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