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

  publishBienLaiToVNPT(bienLaiId: number): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/publish-to-vnpt`, {});
  }

  cancelBienLaiVNPT(bienLaiId: number): Observable<VNPTBienLaiResponse> {
    return this.http.post<VNPTBienLaiResponse>(`${environment.apiUrl}/bien-lai-dien-tu/${bienLaiId}/cancel-vnpt`, {});
  }
}
