import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TraCuuBHXHRequest {
  maSoBHXH?: string;
  hoTen?: string;
  soCCCD?: string;
}

export interface TraCuuBHXHResponse {
  success: boolean;
  message?: string;
  data?: {
    maSoBHXH: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    soCCCD: string;
    diaChi: string;
    trangThai: string;
    ngayCap: string;
  };
}

export interface TraCuuVNPostRequest {
  maTinh: string;
  maHuyen: string;
  maXa: string;
  hoTen: string;
  isCoDau: boolean;
  ngaySinh: string;
  soCMND: string;
}

export interface TraCuuVNPostResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BHXHService {
  private apiUrl = '/api/bhxh';

  constructor(private http: HttpClient) { }

  traCuuMaSoBHXH(request: TraCuuBHXHRequest): Observable<TraCuuBHXHResponse> {
    return this.http.post<TraCuuBHXHResponse>(`${this.apiUrl}/tra-cuu`, request);
  }

  traCuuMaSoBHXHVNPost(request: TraCuuVNPostRequest): Observable<TraCuuVNPostResponse> {
    const token = localStorage.getItem('ssmv2_token');
    if (!token) {
      throw new Error('Chưa có token VNPost');
    }

    const headers = new HttpHeaders({
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://ssmv2.vnpost.vn',
      'Referer': 'https://ssmv2.vnpost.vn/',
      'Host': 'ssmv2.vnpost.vn',
      'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    });

    console.log('Request VNPost:', request);
    console.log('Headers VNPost:', headers);

    return this.http.post<TraCuuVNPostResponse>(
      'https://ssmv2.vnpost.vn/connect/tracuu/thongtinbhxhtnforkekhai',
      { maSoBHXH: request.soCMND },
      { headers }
    ).pipe(
      tap(
        response => console.log('Response VNPost:', response),
        error => console.error('Error VNPost:', error)
      )
    );
  }
} 