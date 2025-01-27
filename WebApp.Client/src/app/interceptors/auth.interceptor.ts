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
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
      const user = JSON.parse(currentUser);
      
      if (user && user.accessToken) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.accessToken}`
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
        // Có thể thêm logic refresh token hoặc logout ở đây
      }
      return throwError(() => error);
    })
  );
}; 