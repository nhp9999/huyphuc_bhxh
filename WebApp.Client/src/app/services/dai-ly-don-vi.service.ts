import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DonVi } from './don-vi.service';
import { DaiLy } from './user.service';

export interface DaiLyDonVi {
  id?: number;
  daiLyId: number;
  donViId: number;
  trangThai: boolean;
  nguoiTao: string;
  ngayTao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DaiLyDonViService {
  private apiUrl = `${environment.apiUrl}/dai-ly-don-vi`;

  constructor(private http: HttpClient) { }

  createDaiLyDonVi(data: DaiLyDonVi): Observable<DaiLyDonVi> {
    return this.http.post<DaiLyDonVi>(this.apiUrl, data);
  }

  getDaiLysByDonVi(donViId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/don-vi/${donViId}/dai-lys`);
  }

  getDonVisByDaiLy(daiLyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dai-ly/${daiLyId}/don-vis`);
  }

  addDaiLyDonVi(daiLyId: number, donViId: number, nguoiTao: string): Observable<any> {
    return this.http.post(this.apiUrl, { daiLyId, donViId, nguoiTao });
  }

  deleteDaiLyDonVi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 