import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeKhaiBHXHService {
  private apiUrl = `${environment.apiUrl}/dot-ke-khai`;

  constructor(private http: HttpClient) { }

  create(keKhaiBHXH: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, keKhaiBHXH);
  }

  update(id: number, keKhaiBHXH: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, keKhaiBHXH);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getByDotKeKhaiId(dotKeKhaiId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${dotKeKhaiId}/ke-khai-bhxh`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
} 