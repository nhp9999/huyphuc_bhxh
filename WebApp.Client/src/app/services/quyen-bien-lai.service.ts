import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuyenBienLai {
  id?: number;
  quyen_so: string;
  tu_so: string;
  den_so: string;
  so_hien_tai?: string;
  nhan_vien_thu: number;
  nguoi_cap: string;
  ngay_cap?: Date;
  trang_thai: string;
  NguoiThu?: any;
}

@Injectable({
  providedIn: 'root'
})
export class QuyenBienLaiService {
  private apiUrl = `${environment.apiUrl}/quyen-bien-lai`;

  constructor(private http: HttpClient) { }

  getQuyenBienLais(): Observable<QuyenBienLai[]> {
    return this.http.get<QuyenBienLai[]>(this.apiUrl);
  }

  createQuyenBienLai(quyenBienLai: Partial<QuyenBienLai>): Observable<QuyenBienLai> {
    return this.http.post<QuyenBienLai>(this.apiUrl, quyenBienLai);
  }

  updateQuyenBienLai(id: number, quyenBienLai: Partial<QuyenBienLai>): Observable<QuyenBienLai> {
    return this.http.put<QuyenBienLai>(`${this.apiUrl}/${id}`, quyenBienLai);
  }

  deleteQuyenBienLai(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getNextSoBienLai(nguoiThuId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/next-so-bien-lai/${nguoiThuId}`);
  }

  capNhatSoBienLai(quyenBienLaiId: number, soBienLai: string): Observable<QuyenBienLai> {
    return this.http.patch<QuyenBienLai>(`${this.apiUrl}/${quyenBienLaiId}/cap-nhat-so-bien-lai`, {
      so_hien_tai: soBienLai
    });
  }

  kiemTraSoBienLaiHopLe(quyenBienLaiId: number, soBienLai: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/kiem-tra-so-bien-lai`, {
      quyen_bien_lai_id: quyenBienLaiId,
      so_bien_lai: soBienLai
    });
  }
} 