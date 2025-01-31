import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  user: any;
}

interface LoginRequest {
  username: string;
  password: string;
  ip?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string, ip?: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password,
      ip
    };
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData);
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