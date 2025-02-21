import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuyenBienLai {
  id?: number;
  quyen_so: string;
  tu_so: string;
  den_so: string;
  nguoi_thu: number;
  ngay_cap?: Date;
  nguoi_cap?: string;
  trang_thai: string;
  so_hien_tai?: string;
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
} 