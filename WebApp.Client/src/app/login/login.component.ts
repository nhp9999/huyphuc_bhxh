import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DotKeKhaiService } from '../services/dot-ke-khai.service';
import { finalize } from 'rxjs/operators';

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
    private dotKeKhaiService: DotKeKhaiService
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

    // Handle remember me preference
    if (this.loginData.remember) {
      localStorage.setItem('remember_username', this.loginData.username);
    } else {
      localStorage.removeItem('remember_username');
    }

    // Directly authenticate without IP address
    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          // Store authentication data
          this.authService.setSession(response);

          // Pre-load initial data in parallel before navigating
          this.dotKeKhaiService.loadInitialData()
            .pipe(
              finalize(() => {
                this.isLoading = false;
                // Navigate to the main page after data is loaded
                this.router.navigate(['/dot-ke-khai']);
              })
            )
            .subscribe({
              next: (result) => {
                console.log('Initial data loaded successfully');
              },
              error: (error) => {
                console.error('Error loading initial data:', error);
                // Still navigate even if data loading fails
                this.router.navigate(['/dot-ke-khai']);
              }
            });
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