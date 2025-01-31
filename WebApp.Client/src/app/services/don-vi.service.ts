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
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DonViService {
  private apiUrl = `${environment.apiUrl}/DonVi`;

  constructor(private http: HttpClient) { }

  getDonVis(): Observable<DonVi[]> {
    return this.http.get<DonVi[]>(this.apiUrl);
  }

  getDonViById(id: number): Observable<DonVi> {
    return this.http.get<DonVi>(`${this.apiUrl}/${id}`);
  }
} 