import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DotKeKhai {
  id?: number;
  nam: number;
  thang: number;
  so_dot: number;
  ten_dot: string;
  ghi_chu: string;
  dich_vu: string;
  trang_thai: boolean;
  nguoi_tao: string;
  ngay_tao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DotKeKhaiService {
  private apiUrl = `${environment.apiUrl}/DotKeKhai`;

  constructor(private http: HttpClient) { }

  getDotKeKhais(): Observable<DotKeKhai[]> {
    return this.http.get<DotKeKhai[]>(this.apiUrl);
  }

  getDotKeKhai(id: number): Observable<DotKeKhai> {
    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}`);
  }

  createDotKeKhai(dotKeKhai: DotKeKhai): Observable<DotKeKhai> {
    return this.http.post<DotKeKhai>(this.apiUrl, dotKeKhai);
  }

  updateDotKeKhai(id: number, dotKeKhai: DotKeKhai): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dotKeKhai);
  }

  deleteDotKeKhai(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 