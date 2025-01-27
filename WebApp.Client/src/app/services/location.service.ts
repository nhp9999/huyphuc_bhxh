import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Province {
  id: number;
  ma: string;
  ten: string;
  text: string;
}

export interface District {
  id: number;
  ma: string;
  ten: string;
  ma_tinh: string;
}

export interface Commune {
  id: number;
  ma: string;
  ten: string;
  text: string;
  ma_huyen: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string | null;
  errors: any | null;
  status: number;
  traceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) { }

  getProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.apiUrl}/provinces`);
  }

  getDistricts(provinceCode: string): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiUrl}/districts/${provinceCode}`);
  }

  getCommunes(districtCode: string): Observable<ApiResponse<Commune[]>> {
    return this.http.get<ApiResponse<Commune[]>>(`${this.apiUrl}/communes/${districtCode}`);
  }
} 