import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  checked?: boolean;
  tong_so_tien?: number;
  DonVi?: {
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
    return this.http.get<DotKeKhai[]>(`${this.apiUrl}?includeTongSoTien=true`).pipe(
      tap(data => {
        console.log('Response from API:', {
          total: data.length,
          data: data.map(d => ({
            id: d.id,
            ten_dot: d.ten_dot,
            tong_so_tien: d.tong_so_tien
          }))
        });
        this.dotKeKhaisSubject.next(data);
      })
    );
  }

  getDotKeKhai(id: number): Observable<DotKeKhai> {
    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}?includeTongSoTien=true`);
  }

  createDotKeKhai(dotKeKhai: CreateDotKeKhai): Observable<DotKeKhai> {
    return this.http.post<DotKeKhai>(this.apiUrl, dotKeKhai).pipe(
      tap(newDotKeKhai => {
        const currentData = this.dotKeKhaisSubject.value;
        this.dotKeKhaisSubject.next([...currentData, newDotKeKhai]);
      })
    );
  }

  updateDotKeKhai(id: number, dotKeKhai: UpdateDotKeKhai): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dotKeKhai).pipe(
      tap(() => {
        const currentData = this.dotKeKhaisSubject.value;
        const updatedData = currentData.map(item => 
          item.id === id ? { ...item, ...dotKeKhai } : item
        );
        this.dotKeKhaisSubject.next(updatedData);
      })
    );
  }

  deleteDotKeKhai(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentData = this.dotKeKhaisSubject.value;
        this.dotKeKhaisSubject.next(currentData.filter(item => item.id !== id));
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
        const currentData = this.dotKeKhaisSubject.value;
        const updatedData = currentData.map(item => 
          item.id === id ? { ...item, tong_so_tien: dotKeKhai.tong_so_tien } : item
        );
        this.dotKeKhaisSubject.next(updatedData);
      })
    );
  }
} 