import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface NguoiDung {
  id: number;
  user_name: string;
  username?: string;
  userName?: string;
  ho_ten?: string;
  hoTen?: string;
  email?: string;
  so_dien_thoai?: string;
  soDienThoai?: string;
  sdt?: string;
  don_vi_cong_tac?: string;
  donViCongTac?: string;
  chuc_danh?: string;
  chucDanh?: string;
  roles?: string[];
  status?: number;
  trang_thai?: boolean;
  ma_nhan_vien?: string;
  maNhanVien?: string;
  isSuperAdmin?: boolean;
  typeMangLuoi?: number;
  created_at?: Date;
  updated_at?: Date;
  isStatusLoading?: boolean;
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

  updateNguoiDung(id: number, nguoiDung: any): Observable<any> {
    console.log(`Updating user ${id}:`, nguoiDung);
    
    return this.http.put(`${this.apiUrl}/${id}`, nguoiDung).pipe(
      tap(response => console.log('Update response:', response)),
      catchError(error => {
        console.error('Update error:', error);
        return throwError(() => error);
      })
    );
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
    if (!currentUser.id) {
      return throwError(() => new Error('Không tìm thấy thông tin người dùng'));
    }
    
    return this.http.get<NguoiDung>(`${this.apiUrl}/info/${currentUser.id}`).pipe(
      tap(user => {
        console.log('Thông tin người dùng từ API:', user);
      }),
      catchError(error => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        return throwError(() => error);
      })
    );
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