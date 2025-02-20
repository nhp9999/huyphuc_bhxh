import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export interface DaiLy {
  id: number;
  ma: string;
  ten: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  nguoiDaiDien: string;
  trangThai: boolean;
  ngayTao?: Date;
  nguoiTao?: string;
  loading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DaiLyService {
  private apiUrl = `${environment.apiUrl}/dai-ly`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getDaiLys(): Observable<DaiLy[]> {
    return this.http.get<DaiLy[]>(this.apiUrl);
  }

  createDaiLy(daiLy: Partial<DaiLy>): Observable<DaiLy> {
    const currentUser = this.authService.getCurrentUser();
    const data = {
      ...daiLy,
      nguoiTao: currentUser?.username || 'system',
      ngayTao: new Date()
    };
    return this.http.post<DaiLy>(this.apiUrl, data);
  }

  updateDaiLy(id: number, daiLy: Partial<DaiLy>): Observable<DaiLy> {
    const data = {
      id: id,
      ma: daiLy.ma,
      ten: daiLy.ten,
      dia_chi: daiLy.diaChi || '',
      so_dien_thoai: daiLy.soDienThoai || '',
      email: daiLy.email || '',
      nguoi_dai_dien: daiLy.nguoiDaiDien || '',
      trang_thai: daiLy.trangThai,
      nguoi_tao: daiLy.nguoiTao || '',
      ngay_tao: daiLy.ngayTao
    };

    return this.http.put<DaiLy>(`${this.apiUrl}/${id}`, data);
  }

  deleteDaiLy(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, daiLy: DaiLy): Observable<DaiLy> {
    const data = {
      id: id,
      ma: daiLy.ma,
      ten: daiLy.ten,
      dia_chi: daiLy.diaChi || '',
      so_dien_thoai: daiLy.soDienThoai || '',
      email: daiLy.email || '',
      nguoi_dai_dien: daiLy.nguoiDaiDien || '',
      trang_thai: daiLy.trangThai,
      nguoi_tao: daiLy.nguoiTao || '',
      ngay_tao: daiLy.ngayTao
    };

    return this.http.put<DaiLy>(`${this.apiUrl}/${id}`, data);
  }
} 