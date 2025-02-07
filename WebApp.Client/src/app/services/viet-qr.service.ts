import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VietQRRequest {
  accountNo: string;
  accountName: string;
  acqId: number;
  amount: number;
  addInfo: string;
  format?: string;
  template?: string;
}

export interface VietQRResponse {
  code: string;
  desc: string;
  data: {
    qrCode: string;
    qrDataURL?: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VietQRService {
  private apiUrl = 'https://api.vietqr.io/v2/generate';

  constructor(private http: HttpClient) { }

  generateQR(request: VietQRRequest): Observable<VietQRResponse> {
    const headers = new HttpHeaders({
      'x-client-id': environment.vietQR.clientId,
      'x-api-key': environment.vietQR.apiKey
    });

    const body = {
      ...request,
      format: request.format || 'text',
      template: request.template || 'compact'
    };

    return this.http.post<VietQRResponse>(this.apiUrl, body, { headers });
  }
} 