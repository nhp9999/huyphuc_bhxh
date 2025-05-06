import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { SSMV2Service } from './ssmv2.service';

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
  gioi_tinh: 'Nam' | 'Nữ';
  so_dien_thoai: string;
  ma_hgd?: string;
  ma_tinh_ks?: string;
  ma_huyen_ks?: string;
  ma_xa_ks?: string;
  ma_tinh_nkq?: string;
  ma_huyen_nkq?: string;
  ma_xa_nkq?: string;
  dia_chi_nkq?: string;
  benh_vien_kcb?: string;
  ma_benh_vien?: string;
  so_the_bhyt?: string;
  ma_dan_toc?: string;
  quoc_tich: string;
  nguoi_tao: string;
  ngay_tao?: Date;
  noiNhanHoSo?: NoiNhanHoSo;
  ngaySinhFormatted?: string;
  ngaySinh?: Date;
}

export interface DotKeKhai {
  id?: number;
  ten_dot: string;
  so_dot: number;
  thang: number;
  nam: number;
  dich_vu: string;
  ghi_chu: string;
  trang_thai: string;
  nguoi_tao: string;
  ngay_tao?: Date;
}

export interface KeKhaiBHYT {
  id?: number;
  dot_ke_khai_id: number;
  thong_tin_the_id: number;
  dotKeKhai?: DotKeKhai;
  thongTinThe: ThongTinThe;
  nguoi_thu: number;
  so_thang_dong: number;
  phuong_an_dong: string;
  han_the_cu?: Date | null;
  han_the_moi_tu: Date;
  han_the_moi_den: Date;
  tinh_nkq: string;
  huyen_nkq: string;
  huyen_nkq_ten?: string;
  xa_nkq: string;
  xa_nkq_ten?: string;
  dia_chi_nkq: string;
  benh_vien_kcb: string;
  ma_benh_vien: string;
  nguoi_tao: string;
  ngay_tao: Date;
  ngay_bien_lai?: Date | null;
  so_tien_can_dong: number;
  is_urgent: boolean;
  so_bien_lai?: string;
  quyen_bien_lai_id?: number;
  ma_ho_so?: string;
  trang_thai?: string;
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
    ngayBienLai?: string;
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
  value: string;  // Mã bệnh viện
  text: string;
  ten: string;    // Tên bệnh viện
  ma: string | null;
  created_at: Date;
  ma_tinh_kcb: string;
}

export interface BHYTSearchResponse {
  success: boolean;
  message?: string;
  data?: {
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
    noiNhanHoSo: string | NoiNhanHoSo;
    maHoGiaDinh: string;
    maBenhVien: string;
    soTheBHYT: string;
    tuNgayTheCu: string;
    denNgayTheCu: string;
    ngayBienLai?: string;
    isThamGiaBb: number;
  };
}

interface BienLai {
  id: number;
  quyen_so: string;
  so_bien_lai: string;
  ten_nguoi_dong: string;
  so_tien: number;
  ghi_chu?: string;
  trang_thai: string;
  ngay_tao: Date;
}

@Injectable({
  providedIn: 'root'
})
export class KeKhaiBHYTService {
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;
  private thongTinTheUrl = `${environment.apiUrl}/thong-tin-the`;
  private danhMucCSKCBUrl = `${environment.apiUrl}/danh-muc-cskcb`;
  private currentUser: any = {};
  private apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiODg0MDAwX3hhX3RsaV9waHVvY2x0IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoidXNlciIsInN1YiI6IjEwMDkxNyIsInNpZCI6Im5NemstdmRPa2xhcE1oeE9PQ1JrR3NjZGZGME5wTkU2NUVNTU9XcFpXcmsiLCJuYW1lIjoiTMOqIFRo4buLIFBoxrDhu5tjIiwibmlja25hbWUiOiI4ODQwMDBfeGFfdGxpX3BodW9jbHQiLCJjbGllbnRfaWQiOiJaalJpWW1JNVpUZ3RaRGN5T0MwME9EUmtMVGt5T1RZdE1ETmpZbVV6TTJVNFlqYzUiLCJtYW5nTHVvaSI6Ijc2MjU1IiwiZG9uVmlDb25nVGFjIjoixJBp4buDbSB0aHUgeMOjIFTDom4gTOG7o2kiLCJjaHVjRGFuaCI6IkPhu5luZyB0w6FjIHZpw6puIHRodSIsImVtYWlsIjoibmd1eWVudGFuZHVuZzI3MTE4OUBnbWFpbC5jb20iLCJzb0RpZW5UaG9haSI6IiIsImlzU3VwZXJBZG1pbiI6IkZhbHNlIiwiaXNDYXMiOiJGYWxzZSIsIm5iZiI6MTczNzkzODE0NywiZXhwIjoxNzM3OTU2MTQ3LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjQyMDAifQ.bmD-4c3M8BUCQ_ovcJdnwDBCNMGaZ6qcu_A_Z4P39Oc';
  private baseUrl = 'https://ssmv2.vnpost.vn/connect/tracuu';

  constructor(
    private http: HttpClient,
    private ssmv2Service: SSMV2Service
  ) {
    // Lấy thông tin user từ localStorage khi service được khởi tạo
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      console.log('currentUser trong service:', this.currentUser);
    }
  }

  getByDotKeKhai(dotKeKhaiId: number): Observable<KeKhaiBHYT[]> {
    return this.http.get<KeKhaiBHYT[]>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt`).pipe(
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
          ngay_tao: item.ngay_tao ? new Date(item.ngay_tao) : undefined
        })) as KeKhaiBHYT[];
      })
    );
  }

  getById(dotKeKhaiId: number, id: number): Observable<KeKhaiBHYT> {
    return this.http.get<KeKhaiBHYT>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}`);
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatDateISO(date: Date | string | null): string {
    if (!date) return '';

    let dateObj: Date;

    // Kiểm tra nếu date là chuỗi
    if (typeof date === 'string') {
      // Xử lý chuỗi ngày tháng theo định dạng dd/MM/yyyy
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateObj = new Date(date);
        }
      } else {
        // Thử parse trực tiếp
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      console.error('Kiểu dữ liệu không hợp lệ cho ngày tháng:', date);
      return '';
    }

    // Kiểm tra tính hợp lệ của đối tượng Date
    if (isNaN(dateObj.getTime())) {
      console.error('Ngày tháng không hợp lệ:', date);
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  }

  create(dotKeKhaiId: number, data: KeKhaiBHYT): Observable<any> {
    // Tạo bản sao của dữ liệu để tránh thay đổi dữ liệu gốc
    console.log('Dữ liệu gốc trước khi format:', JSON.stringify(data));
    console.log('currentUser:', JSON.stringify(this.currentUser));

    // Xử lý trường hợp userName không tồn tại
    const userName = this.currentUser.userName || this.currentUser.name || 'unknown_user';
    console.log('userName được sử dụng:', userName);

    const formattedData = {
      ...data,
      nguoi_tao: data.nguoi_tao || userName,
      thongTinThe: {
        ...data.thongTinThe,
        nguoi_tao: data.thongTinThe.nguoi_tao || userName,
        ngay_sinh: this.formatDateISO(data.thongTinThe.ngay_sinh)
      },
      han_the_cu: data.han_the_cu ? this.formatDateISO(data.han_the_cu) : null,
      han_the_moi_tu: this.formatDateISO(data.han_the_moi_tu),
      han_the_moi_den: this.formatDateISO(data.han_the_moi_den),
      ngay_tao: this.formatDateISO(data.ngay_tao),
      ngay_bien_lai: data.ngay_bien_lai ? this.formatDateISO(data.ngay_bien_lai) : null
    };

    console.log('Dữ liệu đã format trước khi gửi:', JSON.stringify(formattedData));

    // Thay đổi kiểu trả về thành any để xử lý cả trường hợp tạo mới và cập nhật
    return this.http.post<any>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt`, formattedData);
  }

  update(dotKeKhaiId: number, id: number, data: KeKhaiBHYT): Observable<KeKhaiBHYT> {
    // Xử lý trường hợp userName không tồn tại
    const userName = this.currentUser.userName || this.currentUser.name || 'unknown_user';

    const formattedData = {
      ...data,
      nguoi_tao: data.nguoi_tao || userName,
      thongTinThe: {
        ...data.thongTinThe,
        nguoi_tao: data.thongTinThe.nguoi_tao || userName,
        ngay_sinh: this.formatDateISO(data.thongTinThe.ngay_sinh)
      },
      han_the_cu: data.han_the_cu ? this.formatDateISO(data.han_the_cu) : null,
      han_the_moi_tu: this.formatDateISO(data.han_the_moi_tu),
      han_the_moi_den: this.formatDateISO(data.han_the_moi_den),
      ngay_tao: this.formatDateISO(data.ngay_tao),
      ngay_bien_lai: data.ngay_bien_lai ? this.formatDateISO(data.ngay_bien_lai) : null
    };
    return this.http.put<KeKhaiBHYT>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}`, formattedData);
  }

  delete(dotKeKhaiId: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}`);
  }

  deleteMultiple(dotKeKhaiId: number, ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/delete-multiple`, { ids });
  }

  /**
   * Kiểm tra xem mã số BHXH đã được kê khai trong 7 ngày gần đây hay chưa
   * @param maSoBHXH Mã số BHXH cần kiểm tra
   * @returns Thông tin về việc mã số BHXH đã được kê khai trong 7 ngày gần đây hay chưa
   */
  checkMaSoBHXH(maSoBHXH: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-ma-so-bhxh`, { ma_so_bhxh: maSoBHXH });
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
    // Xử lý trường hợp userName không tồn tại
    const userName = this.currentUser.userName || this.currentUser.name || 'unknown_user';

    const formattedData = {
      ...data,
      nguoi_tao: data.nguoi_tao || userName
    };
    return this.http.post<ThongTinThe>(this.thongTinTheUrl, formattedData);
  }

  updateThongTinThe(id: number, data: ThongTinThe): Observable<ThongTinThe> {
    // Xử lý trường hợp userName không tồn tại
    const userName = this.currentUser.userName || this.currentUser.name || 'unknown_user';

    const formattedData = {
      ...data,
      nguoi_tao: data.nguoi_tao || userName
    };
    return this.http.put<ThongTinThe>(`${this.thongTinTheUrl}/${id}`, formattedData);
  }

  // Thêm method để lấy thông tin đợt kê khai
  getDotKeKhai(id: number): Observable<DotKeKhai> {
    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}`);
  }

  traCuuThongTinBHYT(maSoBHXH: string): Observable<any> {
    const token = this.ssmv2Service.getToken();
    if (!token) {
      throw new Error('Chưa có token SSMV2');
    }

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://ssmv2.vnpost.vn',
      'Referer': 'https://ssmv2.vnpost.vn/',
      'Host': 'ssmv2.vnpost.vn'
    });

    // Tạo body request theo yêu cầu API
    const body = {
      maSoBHXH: maSoBHXH,
      mangLuoiId: 76255,
      ma: 'BI0110G',
      maCoQuanBHXH: '08907'
    };

    // Sửa lại URL và method thành POST
    return this.http.post(
      'https://ssmv2.vnpost.vn/connect/tracuu/thongtinbhytforkekhai',
      body,
      { headers }
    );
  }

  // Thêm method để lấy danh sách bệnh viện
  getDanhMucCSKCB(): Observable<DanhMucCSKCB[]> {
    return this.http.get<DanhMucCSKCB[]>(this.danhMucCSKCBUrl);
  }

  toggleUrgent(dotKeKhaiId: number, id: number): Observable<{success: boolean; is_urgent: boolean}> {
    return this.http.patch<{success: boolean; is_urgent: boolean}>(
      `${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt/${id}/toggle-urgent`,
      {}
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class BienLaiService {
  constructor(private http: HttpClient) {}

  // Tạo biên lai mới
  createBienLai(data: Partial<BienLai>): Observable<BienLai> {
    return this.http.post<BienLai>('/api/bien-lai', data);
  }

  // Lấy thông tin biên lai
  getBienLai(id: number): Observable<BienLai> {
    return this.http.get<BienLai>(`/api/bien-lai/${id}`);
  }
}