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

    return this.http.get(`${this.baseUrl}/oauth2/Captcha`, { headers })
      .pipe(
        catchError(error => {
          console.error('Lỗi khi lấy captcha:', error);
          return throwError(() => new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'));
        }),
        tap(response => {
          console.log('Captcha response raw:', response);
        })
      );
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
          // Lưu token với thời gian hết hạn ngắn hơn một chút để đảm bảo an toàn
          const safeExpiresIn = Math.max(0, (response.body.expires_in || 0) - 60); // Trừ đi 60 giây
          this.saveToken(response.body.access_token, safeExpiresIn);
          
          // Lưu thông tin user nếu có
          if (response.body.userName) {
            const userInfo = {
              userName: response.body.userName,
              name: response.body.name,
              mangLuoi: response.body.mangLuoi,
              donViCongTac: response.body.donViCongTac,
              chucDanh: response.body.chucDanh
            };
            localStorage.setItem('ssmv2_user_info', JSON.stringify(userInfo));
          }
        }
      })
    );
  }

  // Lưu token và thời gian hết hạn
  private saveToken(token: string, expiresIn: number): void {
    try {
      // Tính thời gian hết hạn
      const expiresAt = new Date().getTime() + (expiresIn * 1000);
      
      // Lưu token và thời gian hết hạn
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.tokenExpireKey, expiresAt.toString());
      
      // Lưu thời gian tạo token
      localStorage.setItem('ssmv2_token_created', new Date().getTime().toString());
      
      console.log('Token đã được lưu:', {
        token: token.substring(0, 20) + '...',
        expiresIn: `${expiresIn} giây`,
        expiresAt: new Date(expiresAt).toLocaleString()
      });
      
      this.tokenSubject.next(token);
    } catch (error) {
      console.error('Lỗi khi lưu token:', error);
      this.clearToken();
    }
  }

  // Kiểm tra token có hết hạn không
  isTokenExpired(): boolean {
    try {
      const expireTime = localStorage.getItem(this.tokenExpireKey);
      const createdTime = localStorage.getItem('ssmv2_token_created');
      
      if (!expireTime || !createdTime) {
        console.log('Không tìm thấy thông tin token');
        return true;
      }

      const now = new Date().getTime();
      const expireTimeNum = parseInt(expireTime);
      const createdTimeNum = parseInt(createdTime);
      
      // Kiểm tra xem token đã tồn tại quá lâu chưa (ví dụ: 4 tiếng)
      const maxTokenAge = 4 * 60 * 60 * 1000; // 4 tiếng
      const tokenAge = now - createdTimeNum;
      
      if (tokenAge > maxTokenAge) {
        console.log('Token đã tồn tại quá lâu:', Math.round(tokenAge / (60 * 1000)), 'phút');
        return true;
      }
      
      // Thêm buffer 5 phút để tránh token hết hạn đột ngột
      const bufferTime = 5 * 60 * 1000; // 5 phút
      const isExpired = now >= (expireTimeNum - bufferTime);
      
      if (isExpired) {
        console.log('Token sẽ hết hạn vào:', new Date(expireTimeNum).toLocaleString());
      }
      
      return isExpired;
    } catch (error) {
      console.error('Lỗi khi kiểm tra hạn token:', error);
      return true;
    }
  }

  // Lấy token hiện tại
  getToken(): string | null {
    try {
      const token = localStorage.getItem(this.tokenKey);
      
      if (!token) {
        console.log('Không tìm thấy token trong localStorage');
        return null;
      }
      
      // Kiểm tra thời gian hết hạn
      const expireTime = localStorage.getItem(this.tokenExpireKey);
      if (!expireTime) {
        console.log('Không tìm thấy thời gian hết hạn token');
        return token; // Vẫn trả về token nếu không tìm thấy thời gian hết hạn
      }

      const now = new Date().getTime();
      const expireTimeNum = parseInt(expireTime);
      
      // Chỉ xóa token khi đã thực sự hết hạn (không tính buffer time)
      if (now >= expireTimeNum) {
        console.log('Token đã hết hạn hoàn toàn, xóa token');
        this.clearToken();
        return null;
      }
      
      // Log thông tin token
      const timeLeft = Math.round((expireTimeNum - now) / 1000);
      console.log('Thông tin token:', {
        expiresAt: new Date(expireTimeNum).toLocaleString(),
        timeLeft: `${timeLeft} giây`
      });
      
      return token;
    } catch (error) {
      console.error('Lỗi khi lấy token:', error);
      return null;
    }
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