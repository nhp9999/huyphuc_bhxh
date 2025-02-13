import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Không xử lý nếu là request đến API tra cứu BHYT
  if (req.url.includes('ssmv2.vnpost.vn/connect/tracuu/thongtinbhytforkekhai')) {
    return next(req);
  }

  // Xử lý token cho tất cả các request khác
  try {
    const user = localStorage.getItem('user');

    if (user) {
      const userData = JSON.parse(user);
      
      if (userData && userData.token) {
        console.log('Token being sent:', userData.token);
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${userData.token}`
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in auth interceptor:', error);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('401 error occurred:', error);
        // Clear localStorage và chuyển về trang login
        localStorage.clear();
        window.location.href = '/login';
      }
      return throwError(() => error);
    })
  );
}; 