import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface LichSuKeKhaiSearchParams {
  maSoBHXH?: string;
  cccd?: string;
  hoTen?: string;
  tuNgay?: Date | null;
  denNgay?: Date | null;
  donViId?: number | null;
}

export interface DonVi {
  id: number;
  tenDonVi: string;
}

export interface DotKeKhai {
  so_dot: number;
  thang: number;
  nam: number;
  trang_thai: string;
  ngay_tao?: Date;
  donVi?: DonVi;
}

export interface ThongTinThe {
  ma_so_bhxh: string;
  ho_ten: string;
  cccd: string;
  ngay_sinh: Date;
  gioi_tinh: string;
  ngay_tao?: Date;
}

export interface KeKhaiBHYT {
  id: number;
  dotKeKhai?: DotKeKhai;
  thongTinThe: ThongTinThe;
  nguoi_thu: number;
  phuong_an_dong: string;
  so_thang_dong: number;
  so_tien_can_dong: number;
  ngay_tao: Date;
  han_the_cu?: Date | null;
  han_the_moi_tu: Date;
  han_the_moi_den: Date;
  ngay_bien_lai?: Date | null;
  dotKeKhaiInfo?: string;
  ma_ho_so?: string;
}

export interface KeKhaiBHXH {
  id: number;
  dotKeKhai?: DotKeKhai;
  thongTinThe: ThongTinThe;
  muc_luong: number;
  phuong_an_dong: string;
  so_thang_dong: number;
  so_tien_can_dong: number;
  ngay_tao: Date;
  dotKeKhaiInfo?: string;
  ma_ho_so?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LichSuKeKhaiService {
  private apiUrl = `${environment.apiUrl}/ke-khai-bhyt`;

  constructor(private http: HttpClient) {}

  private formatParams(params?: LichSuKeKhaiSearchParams): HttpParams {
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

    return queryParams;
  }

  private convertDates(item: any): any {
    return {
      ...item,
      thongTinThe: {
        ...item.thongTinThe,
        ngay_sinh: new Date(item.thongTinThe.ngay_sinh),
        ngay_tao: item.thongTinThe.ngay_tao ? new Date(item.thongTinThe.ngay_tao) : undefined
      },
      dotKeKhai: item.dotKeKhai ? {
        ...item.dotKeKhai,
        ngay_tao: item.dotKeKhai.ngay_tao ? new Date(item.dotKeKhai.ngay_tao) : undefined,
        donVi: item.dotKeKhai.donVi ? {
          ...item.dotKeKhai.donVi
        } : undefined
      } : undefined,
      han_the_cu: item.han_the_cu ? new Date(item.han_the_cu) : null,
      han_the_moi_tu: item.han_the_moi_tu ? new Date(item.han_the_moi_tu) : undefined,
      han_the_moi_den: item.han_the_moi_den ? new Date(item.han_the_moi_den) : undefined,
      ngay_tao: new Date(item.ngay_tao),
      ngay_bien_lai: item.ngay_bien_lai ? new Date(item.ngay_bien_lai) : null
    };
  }

  getAllKeKhaiBHYT(params?: LichSuKeKhaiSearchParams): Observable<KeKhaiBHYT[]> {
    const queryParams = this.formatParams(params);
    return this.http.get<KeKhaiBHYT[]>(`${this.apiUrl}/lich-su`, { params: queryParams }).pipe(
      map(data => data.map(item => this.convertDates(item)))
    );
  }

  getKeKhaiBHYTDetail(id: number): Observable<KeKhaiBHYT> {
    return this.http.get<KeKhaiBHYT>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.convertDates(item))
    );
  }

  getAllKeKhaiBHXH(params?: LichSuKeKhaiSearchParams): Observable<KeKhaiBHXH[]> {
    const queryParams = this.formatParams(params);
    return this.http.get<KeKhaiBHXH[]>(`${this.apiUrl}/lich-su-bhxh`, { params: queryParams }).pipe(
      map(data => data.map(item => this.convertDates(item)))
    );
  }

  exportBHYTToExcel(params?: LichSuKeKhaiSearchParams): Observable<Blob> {
    const queryParams = this.formatParams(params);
    return this.http.get(`${this.apiUrl}/export`, {
      params: queryParams,
      responseType: 'blob'
    });
  }

  exportBHXHToExcel(params?: LichSuKeKhaiSearchParams): Observable<Blob> {
    const queryParams = this.formatParams(params);
    return this.http.get(`${this.apiUrl}/lich-su-bhxh/export`, {
      params: queryParams,
      responseType: 'blob'
    });
  }
}