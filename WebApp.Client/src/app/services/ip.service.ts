import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IpService {
  constructor(private http: HttpClient) {}

  getIpAddress(): Observable<string> {
    // Sửa lại đường dẫn API, bỏ /api dư thừa
    return this.http.get<string>(`${environment.apiUrl}/ip`).pipe(
      catchError(() => of('unknown')) // Trả về 'unknown' nếu có lỗi
    );
  }
} 