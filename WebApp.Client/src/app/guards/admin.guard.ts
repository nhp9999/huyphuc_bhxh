import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'admin') {
      return true;
    }

    // Nếu không phải admin, chuyển hướng về trang chủ
    this.router.navigate(['/']);
    return false;
  }
} 