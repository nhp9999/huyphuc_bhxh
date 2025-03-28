import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, shareReplay, tap } from 'rxjs/operators';

export interface DonVi {
  id: number;
  maCoQuanBHXH: string;
  maSoBHXH: string;
  tenDonVi: string;
  isBHXHTN: boolean;
  isBHYT: boolean;
  dmKhoiKcbId?: number;
  type: number;
  trangThai: boolean;
  createdAt: string;
  updatedAt: string;
  daiLyId: number;
  daiLy?: any;
  loading?: boolean;
  isActive?: boolean;
  ma_co_quan_bhxh?: string;
  ma_so_bhxh?: string;
  ten_don_vi?: string;
  is_bhxhtn?: boolean;
  is_bhyt?: boolean;
}

// Interface cho cache item
interface CacheItem<T> {
  data: T;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class DonViService {
  private apiUrl = `${environment.apiUrl}/don-vi`;
  
  // Cache cho dữ liệu của service
  private cache: Map<string, CacheItem<any>> = new Map();
  // Thời gian cache mặc định (5 phút)
  private DEFAULT_CACHE_TTL = 5 * 60 * 1000;

  constructor(private http: HttpClient) { }

  // Hàm kiểm tra cache và lấy dữ liệu
  private getFromCache<T>(key: string): T | null {
    if (this.cache.has(key)) {
      const cacheItem = this.cache.get(key) as CacheItem<T>;
      // Kiểm tra xem cache còn hạn không
      if (cacheItem.expiry > Date.now()) {
        return cacheItem.data;
      } else {
        // Xóa cache hết hạn
        this.cache.delete(key);
      }
    }
    return null;
  }

  // Hàm lưu dữ liệu vào cache
  private saveToCache<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  // Xóa cache
  clearCache(): void {
    this.cache.clear();
  }

  // Xóa cache theo tiền tố
  private clearCacheByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  getDonVis(): Observable<DonVi[]> {
    const cacheKey = 'donVis';
    
    // Kiểm tra cache
    const cachedData = this.getFromCache<DonVi[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }
    
    return this.http.get<DonVi[]>(this.apiUrl).pipe(
      tap(data => {
        // Lưu vào cache
        this.saveToCache(cacheKey, data);
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Lỗi khi tải danh sách đơn vị:', error);
        return of([]);
      })
    );
  }

  getDonVi(id: number): Observable<DonVi> {
    const cacheKey = `donVi_${id}`;
    
    // Kiểm tra cache
    const cachedData = this.getFromCache<DonVi>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }
    
    return this.http.get<DonVi>(`${this.apiUrl}/${id}`).pipe(
      tap(data => {
        // Lưu vào cache
        this.saveToCache(cacheKey, data);
      }),
      catchError(error => {
        console.error(`Lỗi khi tải đơn vị id=${id}:`, error);
        throw error;
      })
    );
  }

  getDonVisByDaiLy(daiLyId: number): Observable<DonVi[]> {
    const cacheKey = `donVisByDaiLy_${daiLyId}`;
    
    // Kiểm tra cache
    const cachedData = this.getFromCache<DonVi[]>(cacheKey);
    if (cachedData) {
      console.log(`[Cache] Sử dụng dữ liệu cache cho donVisByDaiLy_${daiLyId}`);
      return of(cachedData);
    }
    
    return this.http.get<DonVi[]>(`${this.apiUrl}/by-dai-ly/${daiLyId}`).pipe(
      tap(data => {
        // Lưu vào cache
        this.saveToCache(cacheKey, data);
        console.log(`[API] Lưu dữ liệu vào cache cho donVisByDaiLy_${daiLyId}`);
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Lỗi khi tải danh sách đơn vị theo điểm thu id=${daiLyId}:`, error);
        return of([]);
      })
    );
  }

  createDonVi(donVi: Partial<DonVi>): Observable<DonVi> {
    // Xóa tất cả cache liên quan
    this.clearCacheByPrefix('donVi');
    
    return this.http.post<DonVi>(this.apiUrl, donVi).pipe(
      tap(() => {
        // Xóa cache danh sách đơn vị
        this.cache.delete('donVis');
      }),
      catchError(error => {
        console.error('Lỗi khi tạo đơn vị mới:', error);
        throw error;
      })
    );
  }

  updateDonVi(id: number, donVi: Partial<DonVi>): Observable<void> {
    // Xóa tất cả cache liên quan
    this.clearCacheByPrefix('donVi');
    
    return this.http.put<void>(`${this.apiUrl}/${id}`, donVi).pipe(
      tap(() => {
        // Xóa cache danh sách đơn vị và đơn vị cụ thể
        this.cache.delete('donVis');
        this.cache.delete(`donVi_${id}`);
      }),
      catchError(error => {
        console.error(`Lỗi khi cập nhật đơn vị id=${id}:`, error);
        throw error;
      })
    );
  }

  deleteDonVi(id: number): Observable<void> {
    // Xóa tất cả cache liên quan
    this.clearCacheByPrefix('donVi');
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Xóa cache danh sách đơn vị và đơn vị cụ thể
        this.cache.delete('donVis');
        this.cache.delete(`donVi_${id}`);
      }),
      catchError(error => {
        console.error(`Lỗi khi xóa đơn vị id=${id}:`, error);
        throw error;
      })
    );
  }

  updateStatus(id: number, trangThai: boolean): Observable<DonVi> {
    return this.http.patch<DonVi>(`${this.apiUrl}/${id}/status`, { trangThai });
  }
} 