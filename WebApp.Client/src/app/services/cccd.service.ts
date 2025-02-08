import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CCCDService {
  private apiKey = 'BSUqB9AgPEQSGgkAohKbgWEKYqu5HjL9';
  private apiUrl = 'https://api.fpt.ai/vision/idr/vnm';

  constructor(private http: HttpClient) { }

  quetCCCD(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers = new HttpHeaders()
      .set('api-key', this.apiKey);

    return this.http.post(this.apiUrl, formData, { headers });
  }
} 