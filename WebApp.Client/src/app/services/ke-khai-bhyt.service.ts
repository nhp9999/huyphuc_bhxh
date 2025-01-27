import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface NoiNhanHoSo {
  tinh: string;
  huyen: string;
  xa: string;
  diaChi: string;
}

export interface ThongTinThe {
  id?: number;
  ma_so_bhxh: string;
  cccd: string;
  ho_ten: string;
  ngay_sinh: Date;
  gioi_tinh: boolean;
  so_dien_thoai: string;
  ma_hgd?: string;
  ma_tinh_ks?: string;
  nguoi_tao: string;
  ngay_tao?: Date;
  noiNhanHoSo?: NoiNhanHoSo;
  ma_huyen_ks?: string;
  ma_xa_ks?: string;
  ma_tinh_nkq?: string;
  ma_huyen_nkq?: string;
  ma_xa_nkq?: string;
  so_the_bhyt?: string;
  ma_dan_toc?: string;
  quoc_tich?: string;
  ma_benh_vien?: string;
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

export interface ThongTinBHYTResponse {
  data: {
    maSoBHXH: string;
    hoTen: string;
    soDienThoai: string;
    ccns: string;
    ngaySinh: string;
    gioiTinh: number;
    quocTich: string;
    danToc: string;
    cmnd: string;
    maTinhKS: string;
    maHuyenKS: string;
    maXaKS: string;
    maTinhNkq: string;
    maHuyenNkq: string;
    maXaNkq: string;
    tinhKCB: string;
    noiNhanHoSo: string;
    maBenhVien: string;
    maHoGiaDinh: string;
    soTheBHYT: string;
    tuNgayTheCu: string;
    denNgayTheCu: string;
    typeId: string | null;
    phuongAn: string;
    mucLuongNsTw: number;
    tyLeNsdp: number;
    tienNsdp: number;
    tyLeNsKhac: number;
    tienNsKhac: number;
    tyLeNsnn: number;
    tyLeNsTw: number;
    trangThai: string;
    maLoi: string;
    moTa: string;
    giaHanThe: number;
    isThamGiaBb: number;
  };
  success: boolean;
  message: string | null;
  errors: any | null;
  status: number;
  traceId: string;
}

export interface DanhMucCSKCB {
  id: number;
  value: string;
  text: string;
  ten: string;
  ma: string | null;
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class KeKhaiBHYTService {
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;
  private thongTinTheUrl = `${environment.apiUrl}/thong-tin-the`;
  private danhMucCSKCBUrl = `${environment.apiUrl}/danh-muc-cskcb`;
  private currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  private apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiODg0MDAwX3hhX3RsaV9waHVvY2x0IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoidXNlciIsInN1YiI6IjEwMDkxNyIsInNpZCI6Im5NemstdmRPa2xhcE1oeE9PQ1JrR3NjZGZGME5wTkU2NUVNTU9XcFpXcmsiLCJuYW1lIjoiTMOqIFRo4buLIFBoxrDhu5tjIiwibmlja25hbWUiOiI4ODQwMDBfeGFfdGxpX3BodW9jbHQiLCJjbGllbnRfaWQiOiJaalJpWW1JNVpUZ3RaRGN5T0MwME9EUmtMVGt5T1RZdE1ETmpZbVV6TTJVNFlqYzUiLCJtYW5nTHVvaSI6Ijc2MjU1IiwiZG9uVmlDb25nVGFjIjoixJBp4buDbSB0aHUgeMOjIFTDom4gTOG7o2kiLCJjaHVjRGFuaCI6IkPhu5luZyB0w6FjIHZpw6puIHRodSIsImVtYWlsIjoibmd1eWVudGFuZHVuZzI3MTE4OUBnbWFpbC5jb20iLCJzb0RpZW5UaG9haSI6IiIsImlzU3VwZXJBZG1pbiI6IkZhbHNlIiwiaXNDYXMiOiJGYWxzZSIsIm5iZiI6MTczNzkzODE0NywiZXhwIjoxNzM3OTU2MTQ3LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjQyMDAifQ.bmD-4c3M8BUCQ_ovcJdnwDBCNMGaZ6qcu_A_Z4P39Oc';

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

  traCuuThongTinBHYT(maSoBHXH: string): Observable<ThongTinBHYTResponse> {
    const url = 'https://ssmv2.vnpost.vn/connect/tracuu/thongtinbhytforkekhai';
    const body = {
      maSoBHXH: maSoBHXH,
      mangLuoiId: 76255,
      ma: 'BI0110G',
      maCoQuanBHXH: '08907'
    };
    return this.http.post<ThongTinBHYTResponse>(url, body);
  }

  // Thêm method để lấy danh sách bệnh viện
  getDanhMucCSKCB(): Observable<DanhMucCSKCB[]> {
    return this.http.get<DanhMucCSKCB[]>(this.danhMucCSKCBUrl);
  }
} 