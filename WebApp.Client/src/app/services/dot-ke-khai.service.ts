import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface KeKhaiBHYT {
  ho_ten: string;
  cccd: string;
  ngay_sinh: Date;
  gioi_tinh: string;
  dia_chi: string;
  so_dien_thoai: string;
  email: string;
  so_tien: number;
  ghi_chu?: string;
  so_the_bhyt: string;
  ma_so_bhxh?: string;
  nguoi_thu: number;
  phuong_an_dong?: string;
  ngay_bien_lai?: Date;
  ma_tinh_nkq?: string;
}

// Interface cho việc tạo mới
export interface CreateDotKeKhai {
  ten_dot: string;
  so_dot: number;
  thang: number;
  nam: number;
  dich_vu?: string;
  ghi_chu: string;
  trang_thai: string;
  nguoi_tao: string;
  don_vi_id: number;
  ma_ho_so?: string;
  dai_ly_id: number;
  KeKhaiBHYTs?: any[];
}

// Interface cho việc cập nhật
export interface UpdateDotKeKhai extends CreateDotKeKhai {
  id: number; // id bắt buộc phải có khi cập nhật
}

// Interface chung
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
  don_vi_id: number;
  ngay_tao?: Date;
  ngay_gui?: Date;
  checked?: boolean;
  tong_so_tien?: number;
  tong_so_the?: number;
  ma_ho_so?: string;
  url_bill?: string;
  dai_ly_id: number;
  KeKhaiBHYTs?: any[];
  DonVi?: {
    id: number;
    tenDonVi: string;
    maCoQuanBHXH: string;
    maSoBHXH: string;
  };
  // Thêm các thuộc tính thay thế để tương thích với dữ liệu API
  donVi?: {
    id: number;
    tenDonVi: string;
    maCoQuanBHXH: string;
    maSoBHXH: string;
  };
  don_vi?: {
    id: number;
    tenDonVi: string;
    maCoQuanBHXH: string;
    maSoBHXH: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DotKeKhaiService {
  private apiUrl = `${environment.apiUrl}/DotKeKhai`;
  private dotKeKhaisSubject = new BehaviorSubject<DotKeKhai[]>([]);
  dotKeKhais$ = this.dotKeKhaisSubject.asObservable();

  constructor(private http: HttpClient) { }

  getDotKeKhais(): Observable<DotKeKhai[]> {
    const username = JSON.parse(localStorage.getItem('user') || '{}').username;
    return this.http.get<DotKeKhai[]>(`${this.apiUrl}/?includeTongSoTien=true&includeTongSoThe=true&includeDonVi=true&nguoi_tao=${username}`);
  }

  getDotKeKhai(id: number): Observable<DotKeKhai> {
    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}?includeTongSoTien=true&includeTongSoThe=true&includeDonVi=true`);
  }

  createDotKeKhai(dotKeKhai: CreateDotKeKhai): Observable<DotKeKhai> {
    return this.http.post<DotKeKhai>(this.apiUrl, dotKeKhai).pipe(
      tap(newDotKeKhai => {
        const username = JSON.parse(localStorage.getItem('user') || '{}').username;
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const filteredData = currentData.filter(item => item.nguoi_tao === username);
        this.dotKeKhaisSubject.next([...filteredData, newDotKeKhai]);
      })
    );
  }

  updateDotKeKhai(id: number, dotKeKhai: UpdateDotKeKhai): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dotKeKhai).pipe(
      tap(() => {
        const username = JSON.parse(localStorage.getItem('user') || '{}').username;
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const filteredData = currentData.filter(item => item.nguoi_tao === username);
        const updatedData = filteredData.map(item => 
          item.id === id ? { ...item, ...dotKeKhai } : item
        );
        this.dotKeKhaisSubject.next(updatedData);
      })
    );
  }

  deleteDotKeKhai(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const username = JSON.parse(localStorage.getItem('user') || '{}').username;
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const filteredData = currentData
          .filter(item => item.nguoi_tao === username)
          .filter(item => item.id !== id);
        this.dotKeKhaisSubject.next(filteredData);
      })
    );
  }

  getNextSoDot(donViId: number, thang: number, nam: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/next-so-dot`, {
      params: {
        donViId: donViId.toString(),
        thang: thang.toString(),
        nam: nam.toString()
      }
    });
  }

  updateTongSoTien(id: number): Observable<DotKeKhai> {
    // Thay vì gọi API update-tong-so-tien, ta sẽ lấy tổng số tiền từ bảng ke_khai_bhyt
    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}`).pipe(
      tap(dotKeKhai => {
        const username = JSON.parse(localStorage.getItem('user') || '{}').username;
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const updatedData = currentData
          .filter(item => item.nguoi_tao === username)
          .map(item => item.id === id ? { ...item, tong_so_tien: dotKeKhai.tong_so_tien } : item);
        this.dotKeKhaisSubject.next(updatedData);
      })
    );
  }

  getKeKhaiBHYTsByDotKeKhaiId(dotKeKhaiId: number): Observable<KeKhaiBHYT[]> {
    return this.http.get<KeKhaiBHYT[]>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt`);
  }

  updateTrangThai(id: number, trangThai: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/trang-thai`, { trang_thai: trangThai })
      .pipe(
        tap(() => {
          // Cập nhật lại danh sách đợt kê khai
          const username = JSON.parse(localStorage.getItem('user') || '{}').username;
          this.getDotKeKhais().subscribe(data => {
            // Lọc dữ liệu theo người dùng hiện tại trước khi cập nhật dotKeKhaisSubject
            const filteredData = data.filter(dot => dot.nguoi_tao === username);
            this.dotKeKhaisSubject.next(filteredData);
          });
        })
      );
  }

  guiDotKeKhai(id: number): Observable<any> {
    // Cập nhật trạng thái đợt kê khai và các kê khai BHYT sang chờ thanh toán
    return this.http.patch(`${this.apiUrl}/${id}/gui`, {}).pipe(
      tap(() => {
        // Cập nhật lại danh sách đợt kê khai
        const username = JSON.parse(localStorage.getItem('user') || '{}').username;
        this.getDotKeKhais().subscribe(data => {
          // Lọc dữ liệu theo người dùng hiện tại trước khi cập nhật dotKeKhaisSubject
          const filteredData = data.filter(dot => dot.nguoi_tao === username);
          this.dotKeKhaisSubject.next(filteredData);
        });
      })
    );
  }

  // Phương thức duyệt đợt kê khai
  duyetDotKeKhai(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/trang-thai`, { trang_thai: 'cho_thanh_toan' }).pipe(
      tap(() => {
        // Cập nhật lại danh sách đợt kê khai
        const username = JSON.parse(localStorage.getItem('user') || '{}').username;
        this.getDotKeKhais().subscribe(data => {
          // Lọc dữ liệu theo người dùng hiện tại trước khi cập nhật dotKeKhaisSubject
          const filteredData = data.filter(dot => dot.nguoi_tao === username);
          this.dotKeKhaisSubject.next(filteredData);
        });
      })
    );
  }
} 