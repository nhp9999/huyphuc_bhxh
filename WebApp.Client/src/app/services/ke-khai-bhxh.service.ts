import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeKhaiBHXHService {
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;

  constructor(private http: HttpClient) { }

  create(keKhaiBHXH: any): Observable<any> {
    console.log('Gọi API tạo kê khai BHXH:', this.apiUrl);
    console.log('Dữ liệu gửi đi:', keKhaiBHXH);
    return this.http.post<any>(`${this.apiUrl}/ke-khai-bhxh`, keKhaiBHXH);
  }

  update(id: number, keKhaiBHXH: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, keKhaiBHXH);
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
    // Lấy token từ localStorage
    const token = localStorage.getItem('ssmv2_token');
    if (!token) {
      throw new Error('Chưa đăng nhập SSMV2');
    }

    const headers = new HttpHeaders()
      .set('Accept', 'application/json, text/plain, */*')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .set('Origin', 'https://ssmv2.vnpost.vn')
      .set('Referer', 'https://ssmv2.vnpost.vn/')
      .set('Host', 'ssmv2.vnpost.vn')
      .set('sec-ch-ua', '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"')
      .set('sec-ch-ua-mobile', '?0')
      .set('sec-ch-ua-platform', '"Windows"')
      .set('Sec-Fetch-Dest', 'empty')
      .set('Sec-Fetch-Mode', 'cors')
      .set('Sec-Fetch-Site', 'same-origin');

    // Gọi trực tiếp đến API SSMV2
    return this.http.post<any>('https://ssmv2.vnpost.vn/connect/tracuu/thongtinbhxhtnforkekhai', {
      maSoBHXH: maSoBHXH
    }, { 
      headers,
      withCredentials: true 
    });
  }
} 