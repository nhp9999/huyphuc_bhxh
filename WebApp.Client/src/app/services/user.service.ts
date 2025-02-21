import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NguoiDung {
  id: number;
  username: string;
  userName?: string;
  ho_ten?: string;
  hoTen?: string;
  email?: string;
  sdt?: string;
  soDienThoai?: string;
  trang_thai: boolean;
  status?: number;
  roles?: string[];
  maNhanVien?: string;
  donViCongTac?: string;
  isSuperAdmin?: boolean;
  typeMangLuoi?: number;
  chucDanh?: string;
}

export interface DaiLy {
  id: number;
  ma: string;
  ten: string;
  diaChi: string;
  soDienThoai?: string;
  email?: string;
  nguoiDaiDien?: string;
  trangThai: boolean;
  ngayTao: string;
  nguoiTao: string;
  loading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/nguoi-dung`;

  constructor(private http: HttpClient) { }

  getIpAddress(): Observable<{ip: string}> {
    return this.http.get<{ip: string}>('https://api.ipify.org/?format=json');
  }

  getUsers(): Observable<NguoiDung[]> {
    return this.http.get<NguoiDung[]>(this.apiUrl);
  }

  getNguoiDungs(): Observable<NguoiDung[]> {
    return this.getUsers();
  }

  getNguoiDung(id: number): Observable<NguoiDung> {
    return this.http.get<NguoiDung>(`${this.apiUrl}/${id}`);
  }

  createNguoiDung(nguoiDung: Partial<NguoiDung>): Observable<NguoiDung> {
    return this.http.post<NguoiDung>(this.apiUrl, nguoiDung);
  }

  updateNguoiDung(id: number, nguoiDung: Partial<NguoiDung>): Observable<NguoiDung> {
    return this.http.put<NguoiDung>(`${this.apiUrl}/${id}`, nguoiDung);
  }

  deleteNguoiDung(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<NguoiDung> {
    return this.http.patch<NguoiDung>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  resetPassword(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reset-password`, {});
  }

  getCurrentUserInfo(): Observable<NguoiDung> {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return this.http.get<NguoiDung>(`${this.apiUrl}/${currentUser.id}`);
  }

  getDaiLys(): Observable<DaiLy[]> {
    return this.http.get<DaiLy[]>(`${environment.apiUrl}/dai-ly`);
  }

  createDaiLy(daiLy: Partial<DaiLy>): Observable<DaiLy> {
    return this.http.post<DaiLy>(`${environment.apiUrl}/dai-ly`, daiLy);
  }

  updateDaiLy(id: number, daiLy: Partial<DaiLy>): Observable<DaiLy> {
    return this.http.put<DaiLy>(`${environment.apiUrl}/dai-ly/${id}`, daiLy);
  }

  deleteDaiLy(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/dai-ly/${id}`);
  }
} 