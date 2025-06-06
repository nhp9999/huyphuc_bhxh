import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, map, catchError, shareReplay, finalize } from 'rxjs/operators';
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
  is_bien_lai_dien_tu?: boolean;
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
  bien_lai_dien_tu?: boolean;
  is_bien_lai_dien_tu?: boolean;
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

// Interface for paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tạo interface cho cache item
interface CacheItem<T> {
  data: T;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class DotKeKhaiService {
  private apiUrl = `${environment.apiUrl}/DotKeKhai`;
  private dotKeKhaisSubject = new BehaviorSubject<DotKeKhai[]>([]);
  dotKeKhais$ = this.dotKeKhaisSubject.asObservable();

  // Cache cho dữ liệu của service
  private cache: Map<string, CacheItem<any>> = new Map();
  // Thời gian cache mặc định (5 phút)
  private DEFAULT_CACHE_TTL = 5 * 60 * 1000;

  constructor(private http: HttpClient) { }

  // Lấy username hiện tại
  private getCurrentUsername(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || '';
  }

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

  getDotKeKhais(page: number = 1, pageSize: number = 10): Observable<DotKeKhai[]> {
    const username = this.getCurrentUsername();
    const cacheKey = `dotKeKhais_${username}_${page}_${pageSize}`;

    // Kiểm tra cache
    const cachedData = this.getFromCache<DotKeKhai[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Thêm query params bằng HttpParams để tránh vấn đề mã hóa URL
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('includeTongSoTien', 'true')
      .set('includeTongSoThe', 'true')
      .set('includeDonVi', 'true')
      .set('nguoi_tao', username);

    return this.http.get<PaginatedResponse<DotKeKhai>>(this.apiUrl, { params }).pipe(
      map(response => response.data as DotKeKhai[]),
      tap(data => {
        // Lưu vào cache
        this.saveToCache(cacheKey, data);
        // Cập nhật BehaviorSubject
        this.dotKeKhaisSubject.next(data);
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Lỗi khi tải danh sách đợt kê khai:', error);
        return of([]);
      })
    );
  }

  // Phương thức mới để lấy tất cả đợt kê khai không lọc theo người dùng (dành cho admin)
  getAllDotKeKhais(page: number = 1, pageSize: number = 10): Observable<DotKeKhai[]> {
    const cacheKey = `allDotKeKhais_${page}_${pageSize}`;

    // Kiểm tra cache
    const cachedData = this.getFromCache<DotKeKhai[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Thêm query params bằng HttpParams để tránh vấn đề mã hóa URL
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('includeTongSoTien', 'true')
      .set('includeTongSoThe', 'true')
      .set('includeDonVi', 'true');
    // Không thêm nguoi_tao để lấy tất cả dữ liệu

    return this.http.get<PaginatedResponse<DotKeKhai>>(this.apiUrl, { params }).pipe(
      map(response => response.data as DotKeKhai[]),
      tap(data => {
        // Lưu vào cache
        this.saveToCache(cacheKey, data);
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Lỗi khi tải danh sách tất cả đợt kê khai:', error);
        return of([]);
      })
    );
  }

  // New method to get paginated data
  getDotKeKhaisPaginated(page: number = 1, pageSize: number = 10, trangThai?: string): Observable<PaginatedResponse<DotKeKhai>> {
    const username = this.getCurrentUsername();
    const cacheKey = `dotKeKhaisPaginated_${username}_${page}_${pageSize}_${trangThai || 'all'}`;

    // Kiểm tra cache
    const cachedData = this.getFromCache<PaginatedResponse<DotKeKhai>>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Thêm query params bằng HttpParams để tránh vấn đề mã hóa URL
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('includeTongSoTien', 'true')
      .set('includeTongSoThe', 'true')
      .set('includeDonVi', 'true')
      .set('nguoi_tao', username);

    // Add trang_thai filter if provided
    if (trangThai) {
      params = params.set('trang_thai', trangThai);
    }

    return this.http.get<PaginatedResponse<DotKeKhai>>(this.apiUrl, { params }).pipe(
      tap(response => {
        // Lưu vào cache
        this.saveToCache(cacheKey, response);
        // Cập nhật BehaviorSubject với dữ liệu mới
        this.dotKeKhaisSubject.next(response.data as DotKeKhai[]);
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Lỗi khi tải danh sách đợt kê khai phân trang:', error);
        throw error;
      })
    );
  }

  // Method to load initial data in parallel
  loadInitialData(): Observable<any> {
    const username = this.getCurrentUsername();

    // Create params for the first page of data
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '10')
      .set('includeTongSoTien', 'true')
      .set('includeTongSoThe', 'true')
      .set('includeDonVi', 'true')
      .set('nguoi_tao', username);

    // Return a forkJoin of parallel requests
    return forkJoin({
      dotKeKhais: this.http.get<PaginatedResponse<DotKeKhai>>(this.apiUrl, { params })
    }).pipe(
      tap(results => {
        // Cache the results
        this.saveToCache(`dotKeKhaisPaginated_${username}_1_10`, results.dotKeKhais);
        // Update the BehaviorSubject
        this.dotKeKhaisSubject.next(results.dotKeKhais.data as DotKeKhai[]);
      }),
      catchError(error => {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error);
        return of({ dotKeKhais: { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 } });
      })
    );
  }

  getDotKeKhai(id: number): Observable<DotKeKhai> {
    const cacheKey = `dotKeKhai_${id}`;

    // Kiểm tra cache
    const cachedData = this.getFromCache<DotKeKhai>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    const params = new HttpParams()
      .set('includeTongSoTien', 'true')
      .set('includeTongSoThe', 'true')
      .set('includeDonVi', 'true');

    console.log(`Gọi API lấy đợt kê khai ID=${id} với params:`, params.toString());

    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}`, { params }).pipe(
      tap(data => {
        // Lưu vào cache với thời gian ngắn hơn (2 phút)
        this.saveToCache(cacheKey, data, 2 * 60 * 1000);
        console.log(`Đã lưu đợt kê khai ID=${id} vào cache`);
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Lỗi khi tải đợt kê khai id=${id}:`, error);
        // Xóa cache nếu có lỗi để tránh lưu dữ liệu không hợp lệ
        this.cache.delete(cacheKey);

        // Thêm thông tin chi tiết về lỗi
        if (error.status === 404) {
          console.warn(`Đợt kê khai với ID=${id} không tồn tại trong hệ thống`);
        } else if (error.status === 500) {
          console.error(`Lỗi server khi tải đợt kê khai id=${id}:`, error.error?.message || error.message);
        }

        throw error;
      })
    );
  }

  createDotKeKhai(dotKeKhai: CreateDotKeKhai): Observable<DotKeKhai> {
    return this.http.post<DotKeKhai>(this.apiUrl, dotKeKhai).pipe(
      tap(newDotKeKhai => {
        // Xóa cache để đảm bảo dữ liệu mới nhất
        this.clearCacheByPrefix('dotKeKhais_');

        const username = this.getCurrentUsername();
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const filteredData = currentData.filter(item => item.nguoi_tao === username);
        this.dotKeKhaisSubject.next([...filteredData, newDotKeKhai]);
      }),
      catchError(error => {
        console.error('Lỗi khi tạo đợt kê khai mới:', error);
        throw error;
      })
    );
  }

  updateDotKeKhai(id: number, dotKeKhai: UpdateDotKeKhai): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dotKeKhai).pipe(
      tap(() => {
        // Xóa cache liên quan
        this.clearCacheByPrefix('dotKeKhais_');
        this.cache.delete(`dotKeKhai_${id}`);

        const username = this.getCurrentUsername();
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const filteredData = currentData.filter(item => item.nguoi_tao === username);
        const updatedData = filteredData.map(item =>
          item.id === id ? { ...item, ...dotKeKhai } : item
        );
        this.dotKeKhaisSubject.next(updatedData);
      }),
      catchError(error => {
        console.error(`Lỗi khi cập nhật đợt kê khai id=${id}:`, error);
        throw error;
      })
    );
  }

  deleteDotKeKhai(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Xóa cache liên quan
        this.clearCacheByPrefix('dotKeKhais_');
        this.cache.delete(`dotKeKhai_${id}`);

        const username = this.getCurrentUsername();
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const filteredData = currentData
          .filter(item => item.nguoi_tao === username)
          .filter(item => item.id !== id);
        this.dotKeKhaisSubject.next(filteredData);
      }),
      catchError(error => {
        console.error(`Lỗi khi xóa đợt kê khai id=${id}:`, error);
        throw error;
      })
    );
  }

  getNextSoDot(donViId: number, thang: number, nam: number): Observable<number> {
    const cacheKey = `nextSoDot_${donViId}_${thang}_${nam}`;

    // Cache thấp hơn vì số đợt có thể thay đổi nhanh
    const cachedData = this.getFromCache<number>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    const params = new HttpParams()
      .set('donViId', donViId.toString())
      .set('thang', thang.toString())
      .set('nam', nam.toString());

    return this.http.get<number>(`${this.apiUrl}/next-so-dot`, { params }).pipe(
      tap(data => {
        // Lưu vào cache với thời gian ngắn hơn (1 phút)
        this.saveToCache(cacheKey, data, 60 * 1000);
      }),
      catchError(error => {
        console.error('Lỗi khi lấy số đợt tiếp theo:', error);
        throw error;
      })
    );
  }

  updateTongSoTien(id: number): Observable<DotKeKhai> {
    // Xóa cache cho đợt kê khai này
    this.cache.delete(`dotKeKhai_${id}`);

    return this.http.get<DotKeKhai>(`${this.apiUrl}/${id}`).pipe(
      tap(dotKeKhai => {
        const username = this.getCurrentUsername();
        const currentData = this.dotKeKhaisSubject.value;
        // Chỉ cập nhật dữ liệu của người dùng hiện tại
        const updatedData = currentData
          .filter(item => item.nguoi_tao === username)
          .map(item => item.id === id ? { ...item, tong_so_tien: dotKeKhai.tong_so_tien } : item);
        this.dotKeKhaisSubject.next(updatedData);
      }),
      catchError(error => {
        console.error(`Lỗi khi cập nhật tổng số tiền cho đợt kê khai id=${id}:`, error);
        throw error;
      })
    );
  }

  getKeKhaiBHYTsByDotKeKhaiId(dotKeKhaiId: number): Observable<KeKhaiBHYT[]> {
    const cacheKey = `keKhaiBHYTs_${dotKeKhaiId}`;

    // Kiểm tra cache
    const cachedData = this.getFromCache<KeKhaiBHYT[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    return this.http.get<KeKhaiBHYT[]>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhyt`).pipe(
      tap(data => {
        // Lưu vào cache
        this.saveToCache(cacheKey, data);
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Lỗi khi lấy danh sách kê khai BHYT cho đợt id=${dotKeKhaiId}:`, error);
        throw error;
      })
    );
  }

  updateTrangThai(id: number, trangThai: string): Observable<any> {
    // Xóa tất cả cache liên quan
    this.clearCacheByPrefix('dotKeKhai');

    return this.http.patch(`${this.apiUrl}/${id}/trang-thai`, { trang_thai: trangThai })
      .pipe(
        tap(() => {
          // Cập nhật lại danh sách đợt kê khai
          const username = this.getCurrentUsername();
          this.getDotKeKhais().subscribe({
            next: (data) => {
              // Lọc dữ liệu theo người dùng hiện tại trước khi cập nhật dotKeKhaisSubject
              const filteredData = data.filter(dot => dot.nguoi_tao === username);
              this.dotKeKhaisSubject.next(filteredData);
            },
            error: (error) => {
              console.error('Lỗi khi cập nhật trạng thái đợt kê khai:', error);
            }
          });
        }),
        catchError(error => {
          console.error(`Lỗi khi cập nhật trạng thái đợt kê khai id=${id}:`, error);
          throw error;
        })
      );
  }

  guiDotKeKhai(id: number, bienLaiDienTu: boolean = false): Observable<any> {
    // Xóa tất cả cache liên quan
    this.clearCacheByPrefix('dotKeKhai');

    console.log(`Gửi đợt kê khai ${id} với biên lai điện tử:`, bienLaiDienTu);

    // Cập nhật trạng thái đợt kê khai và các kê khai BHYT sang chờ thanh toán
    return this.http.patch(`${this.apiUrl}/${id}/gui`, { bien_lai_dien_tu: bienLaiDienTu }).pipe(
      tap((response) => {
        console.log('Kết quả gửi đợt kê khai:', response);
        // Cập nhật lại danh sách đợt kê khai
        const username = this.getCurrentUsername();
        this.getDotKeKhais().subscribe({
          next: (data) => {
            // Lọc dữ liệu theo người dùng hiện tại trước khi cập nhật dotKeKhaisSubject
            const filteredData = data.filter(dot => dot.nguoi_tao === username);
            this.dotKeKhaisSubject.next(filteredData);
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật sau khi gửi đợt kê khai:', error);
          }
        });
      }),
      catchError(error => {
        console.error(`Lỗi khi gửi đợt kê khai id=${id}:`, error);
        throw error;
      })
    );
  }

  // Phương thức duyệt đợt kê khai
  duyetDotKeKhai(id: number): Observable<any> {
    // Xóa tất cả cache liên quan
    this.clearCacheByPrefix('dotKeKhai');

    return this.http.patch(`${this.apiUrl}/${id}/trang-thai`, { trang_thai: 'cho_thanh_toan' }).pipe(
      tap(() => {
        // Cập nhật lại danh sách đợt kê khai
        const username = this.getCurrentUsername();
        this.getDotKeKhais().subscribe({
          next: (data) => {
            // Lọc dữ liệu theo người dùng hiện tại trước khi cập nhật dotKeKhaisSubject
            const filteredData = data.filter(dot => dot.nguoi_tao === username);
            this.dotKeKhaisSubject.next(filteredData);
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật sau khi duyệt đợt kê khai:', error);
          }
        });
      }),
      catchError(error => {
        console.error(`Lỗi khi duyệt đợt kê khai id=${id}:`, error);
        throw error;
      })
    );
  }

  // Hàm xóa cache theo tiền tố
  private clearCacheByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Method to get counts for each trang_thai
  getStatusCounts(): Observable<Record<string, number>> {
    const username = this.getCurrentUsername();
    const cacheKey = `statusCounts_${username}`;

    // Kiểm tra cache
    const cachedData = this.getFromCache<Record<string, number>>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    const params = new HttpParams()
      .set('nguoi_tao', username);

    return this.http.get<Record<string, number>>(`${this.apiUrl}/status-counts`, { params }).pipe(
      tap(data => {
        // Lưu vào cache với thời gian ngắn hơn (2 phút)
        this.saveToCache(cacheKey, data, 2 * 60 * 1000);
      }),
      catchError(error => {
        console.error('Lỗi khi lấy số lượng theo trạng thái:', error);
        return of({
          'chua_gui': 0,
          'da_gui': 0,
          'dang_xu_ly': 0,
          'cho_thanh_toan': 0,
          'hoan_thanh': 0,
          'tu_choi': 0,
          'total': 0
        });
      })
    );
  }
}