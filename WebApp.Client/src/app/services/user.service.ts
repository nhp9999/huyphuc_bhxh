import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  ho_ten?: string;
  email?: string;
  so_dien_thoai?: string;
  role?: string;
  department_code?: string;
  unit?: string;
  unit_id?: number;
  status: string;
  province?: string;
  district?: string;
  commune?: string;
  hamlet?: string;
  address?: string;
  last_login_at?: Date;
  last_login_ip?: string;
  last_login_location?: string;
  first_login: boolean;
  password_changed: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  is_deleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getIpAddress(): Observable<{ip: string}> {
    return this.http.get<{ip: string}>('https://api.ipify.org/?format=json');
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleUserStatus(id: number, status: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { status });
  }

  resetPassword(id: number): Observable<{ password: string }> {
    return this.http.post<{ password: string }>(`${this.apiUrl}/${id}/reset-password`, {});
  }
} 