import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VNPTAccount, VNPTAccountResponse } from '../bien-lai/models/vnpt-account.model';

@Injectable({
  providedIn: 'root'
})
export class VNPTAccountService {
  private apiUrl = `${environment.apiUrl}/vnpt-accounts`;

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả tài khoản VNPT
   */
  getAccounts(): Observable<VNPTAccount[]> {
    return this.http.get<VNPTAccount[]>(this.apiUrl);
  }

  /**
   * Lấy thông tin tài khoản VNPT theo ID
   * @param id ID tài khoản VNPT
   */
  getAccountById(id: number): Observable<VNPTAccount> {
    return this.http.get<VNPTAccount>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy thông tin tài khoản VNPT theo mã nhân viên
   * @param maNhanVien Mã nhân viên
   */
  getAccountByMaNhanVien(maNhanVien: string): Observable<VNPTAccount> {
    return this.http.get<VNPTAccount>(`${this.apiUrl}/ma-nhan-vien/${maNhanVien}`);
  }

  /**
   * Tạo mới tài khoản VNPT
   * @param account Thông tin tài khoản VNPT
   */
  createAccount(account: VNPTAccount): Observable<VNPTAccountResponse> {
    return this.http.post<VNPTAccountResponse>(this.apiUrl, account);
  }

  /**
   * Cập nhật thông tin tài khoản VNPT
   * @param id ID tài khoản VNPT
   * @param account Thông tin tài khoản VNPT
   */
  updateAccount(id: number, account: VNPTAccount): Observable<VNPTAccountResponse> {
    return this.http.put<VNPTAccountResponse>(`${this.apiUrl}/${id}`, account);
  }

  /**
   * Xóa tài khoản VNPT
   * @param id ID tài khoản VNPT
   */
  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Tạo bản sao tài khoản VNPT
   * @param id ID tài khoản VNPT gốc
   * @param maNhanVien Mã nhân viên mới
   */
  cloneAccount(id: number, maNhanVien: string): Observable<VNPTAccountResponse> {
    return this.http.post<VNPTAccountResponse>(`${this.apiUrl}/${id}/clone`, { maNhanVien });
  }
}
