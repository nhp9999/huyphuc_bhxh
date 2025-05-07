import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateCustomerRequest {
  tenNguoiDong: string;
  maSoBHXH: string;
  diaChi: string;
  email: string;
  soDienThoai: string;
  loaiKhachHang: number; // 0: Cá nhân, 1: Doanh nghiệp
}

export interface PublishInvoiceRequest {
  bienLaiId: number;
  tenNguoiDong: string;
  maSoBHXH: string;
  soTien: number;
  ghiChu: string;
  isBHYT: boolean;
  isBHXH: boolean;
}

export interface AdjustInvoiceRequest {
  fKey: string;
  tenNguoiDong: string;
  maSoBHXH: string;
  soTien: number;
  ghiChu: string;
  loaiDieuChinh: number; // 2-Điều chỉnh tăng, 3-Điều chỉnh giảm, 4- Biên lai điều chỉnh thông tin
  isBHYT: boolean;
  isBHXH: boolean;
}

export interface ReplaceInvoiceRequest {
  fKey: string;
  tenNguoiDong: string;
  maSoBHXH: string;
  soTien: number;
  ghiChu: string;
  isBHYT: boolean;
  isBHXH: boolean;
}

export interface CancelInvoiceRequest {
  fKey: string;
}

export interface VNPTBienLaiResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class VNPTBienLaiService {
  private apiUrl = `${environment.apiUrl}/vnpt-bien-lai`;

  constructor(private http: HttpClient) { }

  createCustomer(request: CreateCustomerRequest): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${this.apiUrl}/create-customer`, request);
  }

  publishInvoice(request: PublishInvoiceRequest): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${this.apiUrl}/publish-invoice`, request);
  }

  adjustInvoice(request: AdjustInvoiceRequest): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${this.apiUrl}/adjust-invoice`, request);
  }

  replaceInvoice(request: ReplaceInvoiceRequest): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${this.apiUrl}/replace-invoice`, request);
  }

  cancelInvoice(request: CancelInvoiceRequest): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${this.apiUrl}/cancel-invoice`, request);
  }

  /**
   * Phát hành biên lai điện tử lên VNPT (phương thức hợp nhất)
   * @param bienLaiId ID biên lai cần phát hành
   * @returns Kết quả phát hành biên lai
   */
  publishBienLaiToVNPTWithLink(bienLaiId: number): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/publish-to-vnpt-with-link`, {});
  }

  /**
   * Phương thức này được giữ lại để tương thích ngược, sử dụng publishBienLaiToVNPTWithLink thay thế
   */
  publishBienLaiToVNPT(bienLaiId: number): Observable<VNPTBienLaiResponse> {
    return this.publishBienLaiToVNPTWithLink(bienLaiId);
  }

  /**
   * Phương thức này được giữ lại để tương thích ngược, sử dụng publishBienLaiToVNPTWithLink thay thế
   */
  publishBienLaiToVNPTDirect(bienLaiId: number): Observable<VNPTBienLaiResponse> {
    return this.publishBienLaiToVNPTWithLink(bienLaiId);
  }

  /**
   * Hủy biên lai điện tử trên VNPT
   * @param bienLaiId ID biên lai cần hủy
   * @returns Kết quả hủy biên lai
   */
  cancelBienLaiVNPT(bienLaiId: number): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/cancel-vnpt`, {});
  }

  // PortalService methods

  /**
   * Xem nội dung biên lai điện tử
   * @param bienLaiId ID biên lai
   * @returns URL để xem biên lai
   */
  viewBienLai(bienLaiId: number): string {
    return `${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/view`;
  }

  /**
   * Lấy nội dung HTML của biên lai điện tử
   * @param bienLaiId ID biên lai
   * @returns Observable với nội dung HTML của biên lai
   *
   * Lưu ý: Phương thức này sẽ tự động thử hiển thị biên lai từ XML nếu biên lai chưa được phát hành
   */
  getBienLaiContent(bienLaiId: number): Observable<string> {
    return this.http.get(`${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/view`, { responseType: 'text' });
  }

  /**
   * Tải biên lai điện tử dưới dạng PDF
   * @param bienLaiId ID biên lai
   * @returns URL để tải file PDF
   *
   * Lưu ý: Phương thức này sẽ tự động thử tải biên lai từ XML nếu biên lai chưa được phát hành
   */
  downloadBienLaiPdf(bienLaiId: number): string {
    return `${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/download-pdf`;
  }
}
