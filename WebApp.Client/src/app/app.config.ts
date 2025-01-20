import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { IconDefinition } from '@ant-design/icons-angular';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { 
  TeamOutline,
  SolutionOutline,
  FileTextOutline,
  FundOutline,
  SettingOutline,
  DashboardOutline,
  AppstoreOutline,
  BarChartOutline,
  BellOutline,
  UserOutline,
  LockOutline,
  LogoutOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  ArrowUpOutline,
  ArrowDownOutline
} from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [
  TeamOutline,
  SolutionOutline,
  FileTextOutline,
  FundOutline,
  SettingOutline,
  DashboardOutline,
  AppstoreOutline,
  BarChartOutline,
  BellOutline,
  UserOutline,
  LockOutline,
  LogoutOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  ArrowUpOutline,
  ArrowDownOutline
];

registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(NzIconModule.forRoot(icons)),
    provideNzI18n(vi_VN)
  ]
};
