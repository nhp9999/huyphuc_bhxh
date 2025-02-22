import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiODg0MDAwX3hhX3RsaV9waHVvY2x0IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoidXNlciIsInN1YiI6IjEwMDkxNyIsInNpZCI6IkVHdTNMX2VYR0RmQ2s1RFMwMTRrX3RjemJGQXhFcWc3eklxU21QaW9aWUUiLCJuYW1lIjoiTMOqIFRo4buLIFBoxrDhu5tjIiwibmlja25hbWUiOiI4ODQwMDBfeGFfdGxpX3BodW9jbHQiLCJjbGllbnRfaWQiOiJaalJpWW1JNVpUZ3RaRGN5T0MwME9EUmtMVGt5T1RZdE1ETmpZbVV6TTJVNFlqYzUiLCJtYW5nTHVvaSI6Ijc2MjU1IiwiZG9uVmlDb25nVGFjIjoixJBp4buDbSB0aHUgeMOjIFTDom4gTOG7o2kiLCJjaHVjRGFuaCI6IkPhu5luZyB0w6FjIHZpw6puIHRodSIsImVtYWlsIjoibmd1eWVudGFuZHVuZzI3MTE4OUBnbWFpbC5jb20iLCJzb0RpZW5UaG9haSI6IiIsImlzU3VwZXJBZG1pbiI6IkZhbHNlIiwiaXNDYXMiOiJGYWxzZSIsIm5iZiI6MTc0MDA5NzcwOSwiZXhwIjoxNzQwMTE1NzA5LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjQyMDAifQ.UhsxXa2zz_JVOqjYPyNbz1UqEDiqk7PwD1BumvGa-_w';

@Injectable()
export class ApiTokenInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Chỉ thêm token API cho request đến API tra cứu BHYT
    if (request.url.includes('ssmv2.vnpost.vn/connect/tracuu/thongtinbhytforkekhai')) {
      request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
    }
    return next.handle(request);
  }
}

// Thêm export instance của interceptor
export const apiTokenInterceptor = new ApiTokenInterceptor(); 