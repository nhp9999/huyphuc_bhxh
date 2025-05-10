import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DanhMucTinh {
  id: number;
  ma: string;
  ten: string;
  text: string;
  created_at: Date;
}

export interface DanhMucHuyen {
  id: number;
  ma: string;
  ten: string;
  text: string;
  ma_tinh: string;
  created_at: Date;
}

export interface DanhMucXa {
  id: number;
  ma: string;
  ten: string;
  text: string;
  ma_huyen: string;
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DiaChiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getDanhMucTinh(): Observable<DanhMucTinh[]> {
    return this.http.get<DanhMucTinh[]>(`${this.baseUrl}/danh-muc-tinh`);
  }

  getDanhMucTinhByMa(ma: string): Observable<DanhMucTinh> {
    return this.http.get<DanhMucTinh>(`${this.baseUrl}/danh-muc-tinh/ma/${ma}`);
  }

  getDanhMucHuyen(): Observable<DanhMucHuyen[]> {
    return this.http.get<DanhMucHuyen[]>(`${this.baseUrl}/danh-muc-huyen`);
  }

  getDanhMucHuyenByMaTinh(maTinh: string): Observable<DanhMucHuyen[]> {
    return this.http.get<DanhMucHuyen[]>(`${this.baseUrl}/danh-muc-huyen/ma-tinh/${maTinh}`);
  }

  getDanhMucHuyenByMa(ma: string): Observable<DanhMucHuyen> {
    return this.http.get<DanhMucHuyen>(`${this.baseUrl}/danh-muc-huyen/ma/${ma}`);
  }

  getDanhMucXa(): Observable<DanhMucXa[]> {
    return this.http.get<DanhMucXa[]>(`${this.baseUrl}/danh-muc-xa`);
  }

  getDanhMucXaByMaHuyen(maHuyen: string): Observable<DanhMucXa[]> {
    return this.http.get<DanhMucXa[]>(`${this.baseUrl}/danh-muc-xa/ma-huyen/${maHuyen}`);
  }

  getDanhMucXaByMa(ma: string): Observable<DanhMucXa> {
    return this.http.get<DanhMucXa>(`${this.baseUrl}/danh-muc-xa/ma/${ma}`);
  }
}