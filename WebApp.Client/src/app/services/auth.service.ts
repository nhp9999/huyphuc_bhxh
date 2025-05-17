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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password
    };
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData);
  }

  logout(): void {
    // Only need to remove the user object since it contains the token
    localStorage.removeItem('user');
  }

  setSession(authResult: any): void {
    if (!authResult) return;

    // Create a single user object with all necessary data
    const userData = {
      ...authResult.user,
      token: authResult.token,
      ma_nhan_vien: authResult.user.username // Use username as employee code
    };

    // Store only in user object to avoid redundancy
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('Authentication data saved successfully');
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return !!user?.token;
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
    const user = this.getCurrentUser();
    return user?.token || null;
  }
}