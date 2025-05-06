import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BienLaiDienTu,
  BienLaiDienTuResponse,
  QuyenBienLaiDienTu,
  QuyenBienLaiDienTuResponse
} from '../bien-lai/models/bien-lai-dien-tu.model';

// Interface cho tham số tìm kiếm
export interface BienLaiDienTuSearchParams {
  ky_hieu?: string;
  so_bien_lai?: string;
  ten_nguoi_dong?: string;
  ma_so_bhxh?: string;
  ma_nhan_vien?: string;
  is_bhyt?: boolean;
  is_bhxh?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BienLaiDienTuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Quyển biên lai điện tử
  getQuyenBienLais(): Observable<QuyenBienLaiDienTu[]> {
    return this.http.get<QuyenBienLaiDienTu[]>(`${this.apiUrl}/quyen-bien-lai-dien-tu`);
  }

  getQuyenBienLaiById(id: number): Observable<QuyenBienLaiDienTu> {
    return this.http.get<QuyenBienLaiDienTu>(`${this.apiUrl}/quyen-bien-lai-dien-tu/${id}`);
  }

  createQuyenBienLai(quyenBienLai: QuyenBienLaiDienTu): Observable<QuyenBienLaiDienTuResponse> {
    return this.http.post<QuyenBienLaiDienTuResponse>(`${this.apiUrl}/quyen-bien-lai-dien-tu`, quyenBienLai);
  }

  updateQuyenBienLai(id: number, quyenBienLai: QuyenBienLaiDienTu): Observable<any> {
    return this.http.put(`${this.apiUrl}/quyen-bien-lai-dien-tu/${id}`, quyenBienLai);
  }

  deleteQuyenBienLai(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/quyen-bien-lai-dien-tu/${id}`);
  }

  // Biên lai điện tử
  getBienLais(searchParams?: BienLaiDienTuSearchParams): Observable<BienLaiDienTu[]> {
    let params = new HttpParams();

    if (searchParams) {
      if (searchParams.ky_hieu) {
        params = params.set('ky_hieu', searchParams.ky_hieu);
      }
      if (searchParams.so_bien_lai) {
        params = params.set('so_bien_lai', searchParams.so_bien_lai);
      }
      if (searchParams.ten_nguoi_dong) {
        params = params.set('ten_nguoi_dong', searchParams.ten_nguoi_dong);
      }
      if (searchParams.ma_so_bhxh) {
        params = params.set('ma_so_bhxh', searchParams.ma_so_bhxh);
      }
      if (searchParams.ma_nhan_vien) {
        params = params.set('ma_nhan_vien', searchParams.ma_nhan_vien);
      }
      if (searchParams.is_bhyt !== undefined) {
        params = params.set('is_bhyt', searchParams.is_bhyt.toString());
      }
      if (searchParams.is_bhxh !== undefined) {
        params = params.set('is_bhxh', searchParams.is_bhxh.toString());
      }
    }

    return this.http.get<BienLaiDienTu[]>(`${this.apiUrl}/bien-lai-dien-tu`, { params });
  }

  getBienLaiById(id: number): Observable<BienLaiDienTu> {
    return this.http.get<BienLaiDienTu>(`${this.apiUrl}/bien-lai-dien-tu/${id}`);
  }

  createBienLai(bienLai: BienLaiDienTu): Observable<BienLaiDienTuResponse> {
    return this.http.post<BienLaiDienTuResponse>(`${this.apiUrl}/bien-lai-dien-tu`, bienLai);
  }

  updateBienLai(id: number, bienLai: BienLaiDienTu): Observable<any> {
    return this.http.put(`${this.apiUrl}/bien-lai-dien-tu/${id}`, bienLai);
  }

  deleteBienLai(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bien-lai-dien-tu/${id}`);
  }

  deleteMultiple(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bien-lai-dien-tu/delete-multiple`, { ids });
  }

  /**
   * Phát hành nhiều biên lai điện tử lên VNPT theo thứ tự số biên lai từ bé đến lớn
   * @param ids Danh sách ID biên lai cần phát hành
   * @returns Kết quả phát hành
   */
  publishMultiple(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bien-lai-dien-tu/publish-multiple`, { ids });
  }
}