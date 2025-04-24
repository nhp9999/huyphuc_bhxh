import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BienLaiDienTu,
  BienLaiDienTuResponse,
  QuyenBienLaiDienTu,
  QuyenBienLaiDienTuResponse
} from '../bien-lai/models/bien-lai-dien-tu.model';

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
  getBienLais(): Observable<BienLaiDienTu[]> {
    return this.http.get<BienLaiDienTu[]>(`${this.apiUrl}/bien-lai-dien-tu`);
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
}