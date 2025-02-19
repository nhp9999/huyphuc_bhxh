import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DonVi } from './don-vi.service';
import { DaiLy } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DaiLyDonViService {
  private apiUrl = `${environment.apiUrl}/dai-ly-don-vi`;

  constructor(private http: HttpClient) { }

  getDonVisByDaiLy(daiLyId: number): Observable<DonVi[]> {
    return this.http.get<DonVi[]>(`${this.apiUrl}/dai-ly/${daiLyId}`);
  }

  getDaiLysByDonVi(donViId: number): Observable<DaiLy[]> {
    return this.http.get<DaiLy[]>(`${this.apiUrl}/don-vi/${donViId}`);
  }

  addDaiLyDonVi(daiLyId: number, donViId: number, nguoiTao: string): Observable<any> {
    return this.http.post(this.apiUrl, { daiLyId, donViId, nguoiTao });
  }

  deleteDaiLyDonVi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 