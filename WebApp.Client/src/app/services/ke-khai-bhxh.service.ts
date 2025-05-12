import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SSMV2Service } from './ssmv2.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KeKhaiBHXHService {
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;
  private baseUrl = 'https://ssmv2.vnpost.vn/connect/tracuu';

  constructor(
    private http: HttpClient,
    private ssmv2Service: SSMV2Service
  ) { }

  create(keKhaiBHXH: any): Observable<any> {
    console.log('Gọi API tạo kê khai BHXH:', this.apiUrl);
    console.log('Dữ liệu gửi đi:', keKhaiBHXH);
    return this.http.post<any>(`${this.apiUrl}/ke-khai-bhxh`, keKhaiBHXH);
  }

  update(dotKeKhaiId: number, id: number, keKhaiBHXH: any): Observable<any> {
    console.log('Gọi API cập nhật kê khai BHXH:', `${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhxh/${id}`);

    // Đảm bảo ID và dot_ke_khai_id khớp với URL
    const updatedData = { ...keKhaiBHXH };
    updatedData.id = Number(id); // Đảm bảo ID là số
    updatedData.dot_ke_khai_id = Number(dotKeKhaiId); // Đảm bảo dot_ke_khai_id là số

    // Đảm bảo thông tin thẻ có ID nếu có
    if (updatedData.thong_tin_the && updatedData.thong_tin_the.id) {
      updatedData.thong_tin_the.id = Number(updatedData.thong_tin_the.id);
    }

    // Log chi tiết để debug
    console.log('Dữ liệu gửi đi khi cập nhật (đã điều chỉnh):', JSON.stringify(updatedData, null, 2));
    console.log('ID trong URL:', id, 'Kiểu:', typeof id);
    console.log('ID trong dữ liệu:', updatedData.id, 'Kiểu:', typeof updatedData.id);
    console.log('dotKeKhaiId trong URL:', dotKeKhaiId, 'Kiểu:', typeof dotKeKhaiId);
    console.log('dot_ke_khai_id trong dữ liệu:', updatedData.dot_ke_khai_id, 'Kiểu:', typeof updatedData.dot_ke_khai_id);

    // Thử sử dụng POST thay vì PUT để cập nhật
    const url = `${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhxh/${id}`;

    // Thêm xử lý lỗi để xem chi tiết lỗi từ server
    return this.http.put<any>(url, updatedData)
      .pipe(
        catchError(error => {
          console.error('Chi tiết lỗi từ server:', error);
          if (error.error && error.error.message) {
            console.error('Thông báo lỗi từ server:', error.error.message);
          }

          // Thử một cách khác nếu PUT không hoạt động
          console.log('Thử sử dụng phương thức khác để cập nhật...');

          // Tạo một URL mới để cập nhật
          const alternativeUrl = `${this.apiUrl}/ke-khai-bhxh/update`;
          console.log('Sử dụng URL thay thế:', alternativeUrl);

          // Thêm thông tin ID vào dữ liệu
          const alternativeData = { ...updatedData, id: Number(id), dot_ke_khai_id: Number(dotKeKhaiId) };
          console.log('Dữ liệu thay thế:', alternativeData);

          // Thử sử dụng POST thay vì PUT
          return this.http.post<any>(alternativeUrl, alternativeData)
            .pipe(
              catchError(innerError => {
                console.error('Chi tiết lỗi từ server (phương thức thay thế):', innerError);
                return throwError(() => innerError);
              })
            );
        })
      );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getByDotKeKhaiId(dotKeKhaiId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhxh`);
  }

  delete(dotKeKhaiId: number, id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhxh/${id}`);
  }

  searchBHXH(maSoBHXH: string): Observable<any> {
    // Kiểm tra token từ SSMV2Service
    const token = this.ssmv2Service.getToken();
    console.log('Current SSMV2 token:', token);

    if (!token) {
      console.log('Không tìm thấy token SSMV2 khi tìm kiếm BHXH');
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
      xhr.open('POST', `${this.baseUrl}/thongtinbhxhtnforkekhai`, true);

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
            this.ssmv2Service.clearToken();
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

      const requestBody = {
        maSoBHXH: maSoBHXH
      };

      console.log('Request URL:', `${this.baseUrl}/thongtinbhxhtnforkekhai`);
      console.log('Request Headers:', {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'vi-VN,vi;q=0.9,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'Authorization': bearerToken,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Pragma': 'no-cache'
      });
      console.log('Request Body:', requestBody);

      xhr.send(JSON.stringify(requestBody));
    });
  }
}