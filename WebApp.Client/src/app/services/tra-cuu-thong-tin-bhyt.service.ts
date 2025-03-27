import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface TraCuuThongTinBHYTRequest {
  maSoBHXH: string;
}

export interface TraCuuThongTinBHYTResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BHYTService {
  constructor(private http: HttpClient) { }

  traCuuThongTinBHYT(request: TraCuuThongTinBHYTRequest): Observable<TraCuuThongTinBHYTResponse> {
    const token = localStorage.getItem('ssmv2_token');
    if (!token) {
      return throwError(() => ({
        error: 'Lỗi xác thực',
        error_description: 'Không tìm thấy thông tin phiên đăng nhập trong token.',
        type: 'default'
      }));
    }

    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://ssmv2.vnpost.vn/connect/tracuu/thongtinthe?maSoBHXH=${request.maSoBHXH}`, true);
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
      xhr.setRequestHeader('Authorization', bearerToken);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            observer.next(response);
            observer.complete();
          } catch (error) {
            observer.error({ error: 'Lỗi xử lý dữ liệu' });
          }
        } else {
          observer.error({ error: 'Lỗi không xác định' });
        }
      };

      xhr.onerror = () => {
        observer.error({ error: 'Lỗi kết nối' });
      };

      xhr.send();
    });
  }
} 