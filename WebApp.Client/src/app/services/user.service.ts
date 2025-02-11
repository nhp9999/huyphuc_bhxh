import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NguoiDung {
  id: number;
  user_name: string;
  ho_ten: string;
  mang_luoi: string;
  don_vi_cong_tac: string;
  chuc_danh: string;
  email: string;
  so_dien_thoai: string;
  is_super_admin: boolean;
  cap: string;
  type_mang_luoi: number;
  user_id: number;
  status: number;
  client_id: string;
  roles: string[];
  created_at: string;
  updated_at: string;
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

  getNguoiDungs(): Observable<NguoiDung[]> {
    return this.http.get<NguoiDung[]>(this.apiUrl);
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
} 