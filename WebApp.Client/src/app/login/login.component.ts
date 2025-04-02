import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IpService } from '../services/ip.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  loginData = {
    username: '',
    password: '',
    remember: false
  };
  errorMessage = '';
  isLoading = false;
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router,
    private ipService: IpService
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    // Validate input
    if (!this.loginData.username.trim()) {
      this.errorMessage = 'Vui lòng nhập tên đăng nhập';
      return;
    }
    if (!this.loginData.password) {
      this.errorMessage = 'Vui lòng nhập mật khẩu';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.ipService.getIpAddress().subscribe({
      next: (ip) => {
        this.authService.login(this.loginData.username, this.loginData.password, ip).subscribe({
          next: (response) => {
            if (this.loginData.remember) {
              localStorage.setItem('remember_username', this.loginData.username);
            } else {
              localStorage.removeItem('remember_username');
            }
            localStorage.setItem('user', JSON.stringify({
              ...response.user,
              token: response.token
            }));
            this.authService.setSession(response);
            this.isLoading = false;
            this.router.navigate(['/dot-ke-khai']);
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            if (error.status === 401) {
              this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
            } else {
              this.errorMessage = 'Có lỗi xảy ra, vui lòng thử lại sau';
            }
          }
        });
      },
      error: () => {
        // Nếu không lấy được IP, vẫn tiếp tục login
        this.authService.login(this.loginData.username, this.loginData.password).subscribe({
          next: (response) => {
            if (this.loginData.remember) {
              localStorage.setItem('remember_username', this.loginData.username);
            } else {
              localStorage.removeItem('remember_username');
            }
            localStorage.setItem('user', JSON.stringify({
              ...response.user,
              token: response.token
            }));
            this.authService.setSession(response);
            this.isLoading = false;
            this.router.navigate(['/dot-ke-khai']);
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            if (error.status === 401) {
              this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
            } else {
              this.errorMessage = 'Có lỗi xảy ra, vui lòng thử lại sau';
            }
          }
        });
      }
    });
  }

  forgotPassword(): void {
    // Xử lý quên mật khẩu
    alert('Tính năng đang được phát triển');
  }

  ngOnInit(): void {
    // Kiểm tra xem có thông tin đăng nhập đã lưu không
    const savedUsername = localStorage.getItem('remember_username');
    if (savedUsername) {
      this.loginData.username = savedUsername;
      this.loginData.remember = true;
    }
  }
} 