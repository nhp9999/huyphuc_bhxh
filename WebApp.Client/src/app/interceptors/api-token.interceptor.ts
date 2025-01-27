import { HttpInterceptorFn } from '@angular/common/http';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiODg0MDAwX3hhX3RsaV9waHVvY2x0IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoidXNlciIsInN1YiI6IjEwMDkxNyIsInNpZCI6InBEQ2tUVzVKazgxU1laNGVFdEcxWGhOYklleEh2X183N1NLYzdkNEdud3MiLCJuYW1lIjoiTMOqIFRo4buLIFBoxrDhu5tjIiwibmlja25hbWUiOiI4ODQwMDBfeGFfdGxpX3BodW9jbHQiLCJjbGllbnRfaWQiOiJaalJpWW1JNVpUZ3RaRGN5T0MwME9EUmtMVGt5T1RZdE1ETmpZbVV6TTJVNFlqYzUiLCJtYW5nTHVvaSI6Ijc2MjU1IiwiZG9uVmlDb25nVGFjIjoixJBp4buDbSB0aHUgeMOjIFTDom4gTOG7o2kiLCJjaHVjRGFuaCI6IkPhu5luZyB0w6FjIHZpw6puIHRodSIsImVtYWlsIjoibmd1eWVudGFuZHVuZzI3MTE4OUBnbWFpbC5jb20iLCJzb0RpZW5UaG9haSI6IiIsImlzU3VwZXJBZG1pbiI6IkZhbHNlIiwiaXNDYXMiOiJGYWxzZSIsIm5iZiI6MTczNzk5MjM2MSwiZXhwIjoxNzM4MDEwMzYxLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjQyMDAifQ.qz3jF0N_N-yL58ucP7zpme0LwEUt_MadaCu58jVAV_c';

export const apiTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Chỉ thêm token API cho request đến API tra cứu BHYT
  if (req.url.includes('ssmv2.vnpost.vn/connect/tracuu/thongtinbhytforkekhai')) {
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }
  return next(req);
}; 