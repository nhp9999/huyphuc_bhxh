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
    localStorage.removeItem('currentUser');
  }

  setSession(authResult: any): void {
    if (!authResult) return;

    // Tạo object user với token
    const user = {
      ...authResult.user,
      accessToken: authResult.token 
    };

    // Lưu vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    console.log('Saved user to localStorage:', user);
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem('currentUser');
    if (!user) return false;
    
    try {
      const userData = JSON.parse(user);
      return !!userData.accessToken;
    } catch {
      return false;
    }
  }
} 