import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
}

@Injectable({
  providedIn: 'root'
})
export class DonViService {
  private apiUrl = `${environment.apiUrl}/don-vi`;

  constructor(private http: HttpClient) { }

  getDonVis(): Observable<DonVi[]> {
    return this.http.get<DonVi[]>(this.apiUrl);
  }

  getDonVi(id: number): Observable<DonVi> {
    return this.http.get<DonVi>(`${this.apiUrl}/${id}`);
  }

  createDonVi(donVi: Partial<DonVi>): Observable<DonVi> {
    return this.http.post<DonVi>(this.apiUrl, donVi);
  }

  updateDonVi(id: number, donVi: Partial<DonVi>): Observable<DonVi> {
    return this.http.put<DonVi>(`${this.apiUrl}/${id}`, donVi);
  }

  deleteDonVi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDonVisByDaiLy(daiLyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-dai-ly/${daiLyId}`);
  }
} 