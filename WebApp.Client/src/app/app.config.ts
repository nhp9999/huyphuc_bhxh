import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IconsProviderModule } from './icons-provider';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth.interceptor';
import { apiTokenInterceptor } from './interceptors/api-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        apiTokenInterceptor,
        authInterceptor
      ])
    ),
    provideNzI18n(vi_VN),
    provideAnimations(),
    importProvidersFrom(IconsProviderModule)
  ]
};
