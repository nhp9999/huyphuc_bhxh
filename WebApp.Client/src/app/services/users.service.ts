import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  ho_ten: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/nguoi-dung`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/nguoi-dung/${id}`);
  }

  createUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/nguoi-dung`, user);
  }

  updateUser(id: number, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/nguoi-dung/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/nguoi-dung/${id}`);
  }
} 