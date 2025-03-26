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

    // Đảm bảo token có prefix Bearer
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    console.log('Bearer token SSMV2 được tạo:', bearerToken.substring(0, 50) + '...');

    // Tạo XMLHttpRequest thay vì dùng HttpClient
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://ssmv2.vnpost.vn/connect/tracuu/thongtinthe', true);
      
      // Set only safe headers
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
      xhr.setRequestHeader('Accept-Language', 'vi-VN,vi;q=0.9,fr;q=0.7,en-US;q=0.6,en;q=0.5');
      xhr.setRequestHeader('Authorization', bearerToken);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Pragma', 'no-cache');

      xhr.withCredentials = true;

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Response success:', response);
            observer.next(response);
            observer.complete();
          } catch (error) {
            observer.error({
              error: 'Lỗi xử lý dữ liệu',
              error_description: 'Không thể xử lý dữ liệu phản hồi từ server.',
              type: 'default'
            });
          }
        } else {
          console.error('API Error details:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            token: bearerToken.substring(0, 50) + '...'
          });

          if (xhr.status === 406) {
            observer.error({
              error: 'Lỗi định dạng request',
              error_description: 'Không thể xử lý yêu cầu, vui lòng thử lại.',
              type: 'default'
            });
          } else if (xhr.status === 401 || xhr.status === 403) {
            observer.error({
              error: 'Lỗi xác thực',
              error_description: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.',
              type: 'default'
            });
          } else {
            observer.error({
              error: 'Lỗi không xác định',
              error_description: 'Có lỗi xảy ra, vui lòng thử lại.',
              type: 'default'
            });
          }
        }
      };

      xhr.onerror = () => {
        observer.error({
          error: 'Lỗi kết nối',
          error_description: 'Không thể kết nối đến server.',
          type: 'default'
        });
      };

      console.log('Request URL:', 'https://ssmv2.vnpost.vn/connect/tracuu/thongtinthe');
      console.log('Request Headers:', {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'vi-VN,vi;q=0.9,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'Authorization': bearerToken.substring(0, 50) + '...',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Pragma': 'no-cache'
      });
      console.log('Request Body:', request);

      xhr.send(JSON.stringify(request));
    });
  }
} 