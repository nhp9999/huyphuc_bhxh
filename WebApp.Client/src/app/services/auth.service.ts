import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    // Lấy IP trước khi đăng nhập
    return this.http.get<{ip: string}>('https://api.ipify.org/?format=json')
      .pipe(
        switchMap(ipResponse => {
          // Gửi request đăng nhập kèm IP
          return this.http.post(`${this.apiUrl}/auth/login`, { 
            username, 
            password,
            ip: ipResponse.ip 
          });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setSession(authResult: any): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
} 