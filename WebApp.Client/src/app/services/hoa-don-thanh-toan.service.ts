import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HoaDonThanhToan {
  id?: number;
  dot_ke_khai_id: number;
  ngay_thanh_toan?: Date;
  so_tien: number;
  noi_dung_thanh_toan: string;
  url_bill: string;
  public_id: string;
  trang_thai: string;
  nguoi_tao: string;
  ngay_tao?: Date;
  ghi_chu?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HoaDonThanhToanService {
  private apiUrl = `${environment.apiUrl}/HoaDonThanhToan`;

  constructor(private http: HttpClient) { }

  create(hoaDon: HoaDonThanhToan): Observable<HoaDonThanhToan> {
    return this.http.post<HoaDonThanhToan>(this.apiUrl, hoaDon);
  }
} 