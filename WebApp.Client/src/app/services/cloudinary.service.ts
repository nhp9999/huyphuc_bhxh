import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.uploadPreset;
  private apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) { }

  uploadImage(file: File, fileName: string): Observable<CloudinaryResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('public_id', fileName);
    formData.append('folder', 'bills');

    return this.http.post<any>(this.apiUrl, formData).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return {
          secure_url: response.secure_url,
          public_id: response.public_id
        };
      })
    );
  }
} 