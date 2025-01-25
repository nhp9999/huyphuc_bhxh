import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface ThongTinThe {
  id?: number;
  ma_so_bhxh: string;
  cccd: string;
  ho_ten: string;
  ngay_sinh: Date;
  gioi_tinh: boolean;
  so_dien_thoai: string;
  nguoi_tao: string;
  ngay_tao?: Date;
}

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

export interface KeKhaiBHYT {
  id?: number;
  dot_ke_khai_id: number;
  thong_tin_the_id: number;
  dotKeKhai?: DotKeKhai;
  thongTinThe?: ThongTinThe;
  nguoi_thu: number;
  so_thang_dong: number;
  phuong_an_dong: string;
  han_the_cu?: Date | null;
  han_the_moi_tu: Date;
  han_the_moi_den: Date;
  tinh_nkq: string;
  huyen_nkq: string;
  xa_nkq: string;
  dia_chi_nkq: string;
  benh_vien_kcb: string;
  nguoi_tao: string;
  ngay_tao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class KeKhaiBHYTService {
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;
  private thongTinTheUrl = `${environment.apiUrl}/thong-tin-the`;

  constructor(private http: HttpClient) { }

  getByDotKeKhai(dotKeKhaiId: number): Observable<KeKhaiBHYT[]> {
    return this.http.get<KeKhaiBHYT[]>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt`).pipe(
      map(data => {
        return data.map(item => ({
          ...item,
          thongTinThe: item.thongTinThe ? {
            ...item.thongTinThe,
            ngay_sinh: item.thongTinThe.ngay_sinh ? new Date(item.thongTinThe.ngay_sinh) : new Date(),
            ngay_tao: item.thongTinThe.ngay_tao ? new Date(item.thongTinThe.ngay_tao) : undefined
          } : undefined,
          dotKeKhai: item.dotKeKhai ? {
            ...item.dotKeKhai,
            ngay_tao: item.dotKeKhai.ngay_tao ? new Date(item.dotKeKhai.ngay_tao) : undefined
          } : undefined,
          han_the_cu: item.han_the_cu ? new Date(item.han_the_cu) : null,
          han_the_moi_tu: item.han_the_moi_tu ? new Date(item.han_the_moi_tu) : new Date(),
          han_the_moi_den: item.han_the_moi_den ? new Date(item.han_the_moi_den) : new Date(),
          ngay_tao: item.ngay_tao ? new Date(item.ngay_tao) : undefined
        })) as KeKhaiBHYT[];
      })
    );
  }

  getById(dotKeKhaiId: number, id: number): Observable<KeKhaiBHYT> {
    return this.http.get<KeKhaiBHYT>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}`);
  }

  create(dotKeKhaiId: number, data: KeKhaiBHYT): Observable<KeKhaiBHYT> {
    return this.http.post<KeKhaiBHYT>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt`, data);
  }

  update(dotKeKhaiId: number, id: number, data: KeKhaiBHYT): Observable<KeKhaiBHYT> {
    return this.http.put<KeKhaiBHYT>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}`, data);
  }

  delete(dotKeKhaiId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}`);
  }

  deleteMultiple(dotKeKhaiId: number, ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/delete-multiple`, { ids });
  }

  // Thêm các phương thức cho ThongTinThe
  getAllThongTinThe(): Observable<ThongTinThe[]> {
    return this.http.get<ThongTinThe[]>(this.thongTinTheUrl);
  }

  getThongTinTheById(id: number): Observable<ThongTinThe> {
    return this.http.get<ThongTinThe>(`${this.thongTinTheUrl}/${id}`);
  }

  getThongTinTheByCCCD(cccd: string): Observable<ThongTinThe> {
    return this.http.get<ThongTinThe>(`${this.thongTinTheUrl}/cccd/${cccd}`);
  }

  getThongTinTheByMaSoBHXH(maSoBHXH: string): Observable<ThongTinThe> {
    return this.http.get<ThongTinThe>(`${this.thongTinTheUrl}/ma-so-bhxh/${maSoBHXH}`);
  }

  createThongTinThe(data: ThongTinThe): Observable<ThongTinThe> {
    return this.http.post<ThongTinThe>(this.thongTinTheUrl, data);
  }

  updateThongTinThe(id: number, data: ThongTinThe): Observable<ThongTinThe> {
    return this.http.put<ThongTinThe>(`${this.thongTinTheUrl}/${id}`, data);
  }

  // Thêm method để lấy thông tin đợt kê khai
  getDotKeKhai(id: number): Observable<DotKeKhai> {
    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}`);
  }
} 