import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('vnpost_token') || ''
    });

    return this.http.post<TraCuuVNPostResponse>(`${this.apiUrl}/tra-cuu-vnpost`, request, { headers });
  }
} 