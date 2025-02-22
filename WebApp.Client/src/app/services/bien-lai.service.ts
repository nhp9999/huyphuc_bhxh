import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
} 