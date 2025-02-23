import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { KeKhaiBHYT } from './ke-khai-bhyt.service';

export interface LichSuKeKhaiSearchParams {
  maSoBHXH?: string;
  cccd?: string;
  hoTen?: string;
  tuNgay?: Date | null;
  denNgay?: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class LichSuKeKhaiService {
  private apiUrl = `${environment.apiUrl}/ke-khai-bhyt`;

  constructor(private http: HttpClient) {}

  // Lấy tất cả lịch sử kê khai BHYT với các tham số tìm kiếm
  getAllKeKhaiBHYT(params?: LichSuKeKhaiSearchParams): Observable<KeKhaiBHYT[]> {
    let queryParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof LichSuKeKhaiSearchParams];
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'tuNgay' || key === 'denNgay') {
            queryParams = queryParams.append(key, (value as Date).toISOString());
          } else {
            queryParams = queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    return this.http.get<KeKhaiBHYT[]>(`${this.apiUrl}/lich-su`, { params: queryParams }).pipe(
      map(data => {
        return data.map(item => ({
          ...item,
          thongTinThe: {
            ...item.thongTinThe,
            ngay_sinh: new Date(item.thongTinThe.ngay_sinh),
            ngay_tao: item.thongTinThe.ngay_tao ? new Date(item.thongTinThe.ngay_tao) : undefined
          },
          dotKeKhai: item.dotKeKhai ? {
            ...item.dotKeKhai,
            ngay_tao: item.dotKeKhai.ngay_tao ? new Date(item.dotKeKhai.ngay_tao) : undefined
          } : undefined,
          han_the_cu: item.han_the_cu ? new Date(item.han_the_cu) : null,
          han_the_moi_tu: new Date(item.han_the_moi_tu),
          han_the_moi_den: new Date(item.han_the_moi_den),
          ngay_tao: new Date(item.ngay_tao),
          ngay_bien_lai: item.ngay_bien_lai ? new Date(item.ngay_bien_lai) : null
        }));
      })
    );
  }

  // Lấy chi tiết một kê khai BHYT
  getKeKhaiBHYTDetail(id: number): Observable<KeKhaiBHYT> {
    return this.http.get<KeKhaiBHYT>(`${this.apiUrl}/lich-su/${id}`).pipe(
      map(item => ({
        ...item,
        thongTinThe: {
          ...item.thongTinThe,
          ngay_sinh: new Date(item.thongTinThe.ngay_sinh),
          ngay_tao: item.thongTinThe.ngay_tao ? new Date(item.thongTinThe.ngay_tao) : undefined
        },
        dotKeKhai: item.dotKeKhai ? {
          ...item.dotKeKhai,
          ngay_tao: item.dotKeKhai.ngay_tao ? new Date(item.dotKeKhai.ngay_tao) : undefined
        } : undefined,
        han_the_cu: item.han_the_cu ? new Date(item.han_the_cu) : null,
        han_the_moi_tu: new Date(item.han_the_moi_tu),
        han_the_moi_den: new Date(item.han_the_moi_den),
        ngay_tao: new Date(item.ngay_tao),
        ngay_bien_lai: item.ngay_bien_lai ? new Date(item.ngay_bien_lai) : null
      }))
    );
  }

  // Xuất dữ liệu lịch sử kê khai ra Excel
  exportToExcel(params?: LichSuKeKhaiSearchParams): Observable<Blob> {
    let queryParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof LichSuKeKhaiSearchParams];
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'tuNgay' || key === 'denNgay') {
            queryParams = queryParams.append(key, (value as Date).toISOString());
          } else {
            queryParams = queryParams.append(key, value.toString());
          }
        }
      });
    }

    return this.http.get(`${this.apiUrl}/lich-su/export`, {
      params: queryParams,
      responseType: 'blob'
    });
  }
} 