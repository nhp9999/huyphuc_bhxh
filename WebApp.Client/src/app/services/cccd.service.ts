import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CCCDService {
  private apiKey = 'uirFFYOFABU0nptBPTCvk4Ddseh2LF92';
  private apiUrl = 'https://api.fpt.ai/vision/idr/vnm';

  constructor(private http: HttpClient) { }

  quetCCCD(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    const headers = new HttpHeaders()
      .set('api-key', this.apiKey);

    console.log('Sending request to FPT.AI with file:', file);

    return this.http.post(this.apiUrl, formData, { headers }).pipe(
      tap(response => {
        console.log('FPT.AI Response:', response);
      }),
      catchError(error => {
        console.error('FPT.AI Error:', error);
        return throwError(() => error);
      })
    );
  }
} 