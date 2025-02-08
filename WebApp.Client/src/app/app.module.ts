import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiTokenInterceptor } from './interceptors/api-token.interceptor';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { QuetCCCDComponent } from './ke-khai/quet-cccd/quet-cccd.component';

@NgModule({
  declarations: [
    AppComponent,
    QuetCCCDComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NzUploadModule,
    NzMessageModule,
    NzCardModule,
    NzDescriptionsModule,
    NzSpinModule,
    NzGridModule,
    NzIconModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiTokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 