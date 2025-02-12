import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  user: any;
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

    // Lưu token riêng
    localStorage.setItem('token', authResult.token);

    // Lưu thông tin user (không bao gồm token)
    localStorage.setItem('user', JSON.stringify(authResult.user));

    console.log('Saved auth data:', {
      token: authResult.token,
      user: authResult.user
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