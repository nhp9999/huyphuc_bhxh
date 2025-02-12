import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    // Kiểm tra quyền admin
    const isAdmin = currentUser?.roles?.some((role: string) => 
      ['admin', 'super_admin'].includes(role)
    ) || currentUser?.isSuperAdmin;

    if (isAdmin) {
      return true;
    }

    // Nếu không có quyền admin, chuyển hướng về trang chủ
    this.router.navigate(['/dashboard']);
    return false;
  }
} 