import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    ma_nhan_vien: string;
    hoTen: string;
    roles: string[];
    donViCongTac: string;
    chucDanh: string;
    clientId: string;
    email: string | null;
    soDienThoai: string | null;
    status: number;
    isSuperAdmin: boolean;
    typeMangLuoi: string | null;
  }
}

interface LoginRequest {
  username: string;
  password: string;
  ip?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string, ip?: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password,
      ip
    };
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  setSession(authResult: any): void {
    if (!authResult) return;

    // Lưu token vào localStorage
    localStorage.setItem('token', authResult.token);
    
    // Lưu thông tin user riêng
    const userData = {
      ...authResult.user,
      token: authResult.token, // Thêm token vào object user
      ma_nhan_vien: authResult.user.username // Sử dụng username làm mã nhân viên
    };
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('Saved auth data:', {
      token: authResult.token,
      user: userData
    });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
} 