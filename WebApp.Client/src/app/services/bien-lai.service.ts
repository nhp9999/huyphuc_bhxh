import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BienLai {
  id: number;
  quyen_so: string;
  so_bien_lai: string;
  ten_nguoi_dong: string;
  so_tien: number;
  ghi_chu?: string;
  trang_thai: string;
  ngay_tao: Date;
  ke_khai_bhyt_id: number;
}

export interface BangKeBienLaiSearchParams {
  tuNgay?: Date | null;
  denNgay?: Date | null;
  quyenSo?: string | null | undefined;
  maNhanVien?: string | null | undefined;
  trangThai?: string | null | undefined;
  donVi?: string | null | undefined;
  tinhChat?: string | null | undefined;
  maHoSo?: string | null | undefined;
  mauBaoCao?: string;
}

export interface BangKeBienLai {
  quyen_so: string;
  so_bien_lai: string;
  ten_nguoi_dong: string;
  ma_so_bhxh: string;
  so_tien: number;
  ngay_bien_lai: Date;
  ma_nhan_vien: string;
  ten_nhan_vien?: string;
  ghi_chu?: string;
  trang_thai: string;
  tinh_chat: string;
  don_vi?: string;
  ma_ho_so?: string;
  so_thang_dong?: number;
  nguoi_thu?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BienLaiService {
  private apiUrl = `${environment.apiUrl}/bien-lai`;

  constructor(private http: HttpClient) {}

  getBienLaiByKeKhai(keKhaiId: number): Observable<BienLai> {
    return this.http.get<BienLai>(`${this.apiUrl}/ke-khai/${keKhaiId}`);
  }

  inBienLai(bienLaiId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${bienLaiId}/print`, {
      responseType: 'blob'
    });
  }

  getBangKeBienLai(params?: BangKeBienLaiSearchParams): Observable<BangKeBienLai[]> {
    let queryParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof BangKeBienLaiSearchParams];
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'tuNgay' || key === 'denNgay') {
            queryParams = queryParams.append(key, (value as Date).toISOString());
          } else {
            queryParams = queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    return this.http.get<BangKeBienLai[]>(`${this.apiUrl}/bang-ke`, { params: queryParams });
  }

  exportBangKeBienLai(params?: BangKeBienLaiSearchParams): Observable<Blob> {
    let queryParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof BangKeBienLaiSearchParams];
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'tuNgay' || key === 'denNgay') {
            queryParams = queryParams.append(key, (value as Date).toISOString());
          } else {
            queryParams = queryParams.append(key, value.toString());
          }
        }
      });
    }

    return this.http.get(`${this.apiUrl}/bang-ke/export`, {
      params: queryParams,
      responseType: 'blob'
    });
  }

  exportBaoCaoBC01(params?: BangKeBienLaiSearchParams): Observable<Blob> {
    let queryParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof BangKeBienLaiSearchParams];
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'tuNgay' || key === 'denNgay') {
            queryParams = queryParams.append(key, (value as Date).toISOString());
          } else {
            queryParams = queryParams.append(key, value.toString());
          }
        }
      });
    }

    return this.http.get(`${this.apiUrl}/bang-ke/bao-cao/bc01`, {
      params: queryParams,
      responseType: 'blob'
    });
  }
} 