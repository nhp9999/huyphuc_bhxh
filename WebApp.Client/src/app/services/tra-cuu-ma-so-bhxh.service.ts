import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface TraCuuBHXHRequest {
  maTinh: string;
  maHuyen: string;
  maXa: string;
  hoTen: string;
  isCoDau: boolean;
  ngaySinh: string;
  soCMND: string;
}

export interface TraCuuBHXHResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  type?: string;
}

export interface TraCuuVNPostRequest {
  maTinh: string;
  maHuyen: string;
  maXa: string;
  hoTen: string;
  isCoDau?: boolean;
  ngaySinh: string;
  soCMND: string;
}

export interface TraCuuVNPostResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface TraCuuMaSoBHXHByInfoRequest {
  maTinh: string;
  maHuyen: string;
  maXa: string;
  hoTen: string;
  isCoDau: boolean;
  ngaySinh: string;
  soCMND: string;
}

export interface TraCuuHoGiaDinhRequest {
  maTinh: string;
  maHuyen: string;
  maXa?: string;
  maHo?: string;
  tenChuHo?: string;
}

export interface TraCuuHoGiaDinhResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface TraCuuThongTinBHXHRequest {
  maSoBHXH: string;
}

export interface TraCuuThongTinBHXHResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BHXHService {
  constructor(private http: HttpClient) { }

  traCuuBHXH(request: TraCuuBHXHRequest): Observable<TraCuuBHXHResponse> {
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

    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://ssmv2.vnpost.vn/connect/tracuu/masobhxh', true);
      
      // Set headers theo request mẫu chính xác
      xhr.setRequestHeader('Host', 'ssmv2.vnpost.vn');
      xhr.setRequestHeader('sec-ch-ua-platform', '"Windows"');
      xhr.setRequestHeader('Authorization', bearerToken);
      xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
      xhr.setRequestHeader('sec-ch-ua', '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('sec-ch-ua-mobile', '?0');
      xhr.setRequestHeader('Sec-Fetch-Site', 'same-origin');
      xhr.setRequestHeader('Sec-Fetch-Mode', 'cors');
      xhr.setRequestHeader('Sec-Fetch-Dest', 'empty');

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
          let errorResponse;
          try {
            errorResponse = JSON.parse(xhr.responseText);
            console.error('API Error details:', {
              status: xhr.status,
              statusText: xhr.statusText,
              response: errorResponse
            });
          } catch (e) {
            errorResponse = {
              error: 'Lỗi không xác định',
              type: 'default'
            };
          }

          switch (xhr.status) {
            case 406:
              observer.error({
                error: 'Lỗi định dạng request',
                error_description: 'Không thể xử lý yêu cầu, vui lòng thử lại.',
                type: 'default'
              });
              break;
            case 401:
            case 403:
              observer.error({
                error: 'Lỗi xác thực',
                error_description: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.',
                type: 'default'
              });
              break;
            case 500:
              observer.error({
                error: errorResponse.error || 'Lỗi server',
                error_description: errorResponse.error || 'Có lỗi xảy ra từ phía server.',
                type: errorResponse.type || 'default'
              });
              break;
            default:
              observer.error({
                error: errorResponse.error || 'Lỗi không xác định',
                error_description: errorResponse.error || 'Có lỗi xảy ra, vui lòng thử lại.',
                type: errorResponse.type || 'default'
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

      // Log thông tin request
      console.log('Request URL:', 'https://ssmv2.vnpost.vn/connect/tracuu/masobhxh');
      console.log('Request Headers:', {
        'Host': 'ssmv2.vnpost.vn',
        'sec-ch-ua-platform': '"Windows"',
        'Authorization': `${bearerToken.substring(0, 50)}...`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?0',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
      });
      console.log('Request Body:', request);

      xhr.send(JSON.stringify(request));
    });
  }

  traCuuMaSoBHXHVNPost(request: TraCuuVNPostRequest): Observable<TraCuuVNPostResponse> {
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
      xhr.open('POST', 'https://ssmv2.vnpost.vn/connect/tracuu/masobhxh', true);
      
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

      console.log('Request URL:', 'https://ssmv2.vnpost.vn/connect/tracuu/masobhxh');
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

  traCuuMaSoBHXHVNPostByInfo(request: TraCuuMaSoBHXHByInfoRequest): Observable<TraCuuVNPostResponse> {
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

    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://ssmv2.vnpost.vn/connect/tracuu/masobhxh', true);
      
      // Set headers theo request mẫu chính xác
      xhr.setRequestHeader('Host', 'ssmv2.vnpost.vn');
      xhr.setRequestHeader('sec-ch-ua-platform', '"Windows"');
      xhr.setRequestHeader('Authorization', bearerToken);
      xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
      xhr.setRequestHeader('sec-ch-ua', '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('sec-ch-ua-mobile', '?0');
      xhr.setRequestHeader('Sec-Fetch-Site', 'same-origin');
      xhr.setRequestHeader('Sec-Fetch-Mode', 'cors');
      xhr.setRequestHeader('Sec-Fetch-Dest', 'empty');

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
            response: xhr.responseText
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

      // Log thông tin request
      console.log('Request URL:', 'https://ssmv2.vnpost.vn/connect/tracuu/masobhxh');
      console.log('Request Headers:', {
        'Host': 'ssmv2.vnpost.vn',
        'sec-ch-ua-platform': '"Windows"',
        'Authorization': `${bearerToken.substring(0, 50)}...`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'Content-Type': 'application/json',
        'sec-ch-ua-mobile': '?0',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty'
      });
      console.log('Request Body:', request);

      xhr.send(JSON.stringify(request));
    });
  }

  traCuuHoGiaDinh(request: TraCuuHoGiaDinhRequest): Observable<TraCuuHoGiaDinhResponse> {
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
      xhr.open('POST', 'https://ssmv2.vnpost.vn/connect/tracuu/getthongtinhgd', true);
      
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

      // Log thông tin request
      console.log('Request URL:', 'https://ssmv2.vnpost.vn/connect/tracuu/getthongtinhgd');
      console.log('Request Body:', request);

      xhr.send(JSON.stringify(request));
    });
  }

  traCuuThongTinBHXH(request: TraCuuThongTinBHXHRequest): Observable<TraCuuThongTinBHXHResponse> {
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
      xhr.open('POST', 'https://ssmv2.vnpost.vn/connect/tracuu/thongtinbhxh', true);
      
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

      console.log('Request URL:', 'https://ssmv2.vnpost.vn/connect/tracuu/thongtinbhxh');
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