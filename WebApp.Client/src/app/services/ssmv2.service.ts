import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

// Thêm interface cho response
interface AuthResponse {
  access_token: string;
  expires_in: number;
  as_client_id: string;
  userName: string;
  name: string;
  mangLuoi: string;
  donViCongTac: string;
  chucDanh: string;
  email: string;
  soDienThoai: string | null;
  isSuperAdmin: boolean;
  cap: string | null;
  typeMangLuoi: number;
  userId: number;
  status: number;
  expires_at: number;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SSMV2Service {
  private baseUrl = 'https://ssmv2.vnpost.vn';
  private tokenKey = 'ssmv2_token';
  private tokenExpireKey = 'ssmv2_token_expire';
  private refreshingToken = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    // Khôi phục token từ localStorage khi khởi tạo service
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  getCaptcha(): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      'Content-Type': 'application/json',
      'Origin': 'https://ssmv2.vnpost.vn',
      'Referer': 'https://ssmv2.vnpost.vn/',
      'Host': 'ssmv2.vnpost.vn'
    });

    return this.http.get(`${this.baseUrl}/oauth2/Captcha`, { headers });
  }

  authenticate(data: {
    grant_type: string;
    userName: string;
    password: string;
    text: string;
    code: string;
    clientId: string;
    isWeb: boolean;
  }): Observable<any> {
    // Chuyển đổi data thành x-www-form-urlencoded format
    const body = new URLSearchParams();
    for (const key in data) {
      body.set(key, data[key as keyof typeof data].toString());
    }

    const headers = new HttpHeaders({
      'Accept': '*/*', 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://ssmv2.vnpost.vn',
      'Referer': 'https://ssmv2.vnpost.vn/',
      'Host': 'ssmv2.vnpost.vn'
    });

    return this.http.post<AuthResponse>(`${this.baseUrl}/oauth2/Authenticate`, body.toString(), {
      headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        if (response.body) {
          this.saveToken(response.body.access_token, response.body.expires_in);
        }
      })
    );
  }

  // Lưu token và thời gian hết hạn
  private saveToken(token: string, expiresIn: number): void {
    const expiresAt = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.tokenExpireKey, expiresAt.toString());
    this.tokenSubject.next(token);
  }

  // Kiểm tra token có hết hạn không
  isTokenExpired(): boolean {
    const expireTime = localStorage.getItem(this.tokenExpireKey);
    if (!expireTime) return true;

    const now = new Date().getTime();
    return now >= parseInt(expireTime);
  }

  // Lấy token hiện tại
  getToken(): string | null {
    if (this.isTokenExpired()) {
      this.clearToken();
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  // Xóa token
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpireKey);
    this.tokenSubject.next(null);
  }

  // Thêm token vào header
  addTokenToHeader(headers: HttpHeaders): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
} 