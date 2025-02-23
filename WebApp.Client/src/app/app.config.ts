import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';
import { IconsProviderModule } from './icons-provider';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ApiTokenInterceptor } from './interceptors/api-token.interceptor';
import { DonViService } from './services/don-vi.service';
import { provideNzIcons } from './icons-provider';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';

// Đăng ký locale data cho tiếng Việt
registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([
      authInterceptor
    ])),
    provideNzI18n(vi_VN),
    provideAnimations(),
    importProvidersFrom(IconsProviderModule),
    DonViService,
    provideNzIcons(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiTokenInterceptor,
      multi: true
    }
  ]
};
