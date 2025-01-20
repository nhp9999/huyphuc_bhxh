import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };
  errorMessage = '';
  isLoading = false;
  rememberMe = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
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

    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: (response) => {
        if (this.rememberMe) {
          localStorage.setItem('remember_username', this.loginData.username);
        }
        this.authService.setSession(response);
        this.isLoading = false;
        // Chuyển hướng đến trang dashboard sau khi đăng nhập thành công
        this.router.navigate(['/dashboard']);
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

  ngOnInit(): void {
    // Kiểm tra xem có thông tin đăng nhập đã lưu không
    const savedUsername = localStorage.getItem('remember_username');
    if (savedUsername) {
      this.loginData.username = savedUsername;
      this.rememberMe = true;
    }
  }
} 