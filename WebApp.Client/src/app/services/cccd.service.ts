import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Define interfaces for the API response
interface CCCDField {
  id?: string;
  name?: string;
  dob?: string;
  sex?: string;
  nationality?: string;
  home_address?: any;
  permanent_address?: any;
  address?: string;
  issue_date?: string;
  issue_place?: string;
  origin_location?: any;
  place_of_origin?: any;
  que_quan?: any;
  current_address?: any;
  residence_address?: any;
  noi_thuong_tru?: any;
  origin?: any;
  hometown?: any;
  [key: string]: any; // Allow any other fields
}

interface CCCDResponse {
  data?: CCCDField[];
  errorCode?: number;
  errorMessage?: string;
  [key: string]: any; // Allow any other fields
}

@Injectable({
  providedIn: 'root'
})
export class CCCDService {
  private apiKey = 'hdBg9sGAqA9mYwis25KLLkOA7j8AwvSx';
  private apiUrl = 'https://api.fpt.ai/vision/idr/vnm';

  constructor(private http: HttpClient) { }

  quetCCCD(file: File): Observable<CCCDResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const headers = new HttpHeaders()
      .set('api-key', this.apiKey);

    console.log('Sending request to FPT.AI with file:', file);

    return this.http.post<CCCDResponse>(this.apiUrl, formData, { headers }).pipe(
      tap((response: CCCDResponse) => {
        console.log('FPT.AI Response:', response);

        // Log detailed information about the response structure
        if (response && response.data && response.data.length > 0) {
          const data = response.data[0];
          console.log('CCCD Data Structure:', Object.keys(data));
          console.log('CCCD Data Details:');

          // Log each field and its value
          Object.keys(data).forEach(key => {
            console.log(`- ${key}:`, data[key]);
          });
        }
      }),
      catchError(error => {
        console.error('FPT.AI Error:', error);
        return throwError(() => error);
      })
    );
  }
}