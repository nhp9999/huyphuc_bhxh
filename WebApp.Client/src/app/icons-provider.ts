import { Provider } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { 
  LockOutline,
  UnlockOutline,
  DeleteOutline,
  EditOutline,
  PlusOutline,
  SearchOutline,
  CloseOutline,
  UserOutline,
  MailOutline,
  PhoneOutline,
  TeamOutline,
  ApartmentOutline,
  EnvironmentOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  BellOutline,
  LogoutOutline,
  BarChartOutline,
  FileTextOutline,
  FundOutline,
  SettingOutline,
  DashboardOutline,
  SolutionOutline,
  AppstoreOutline,
  ReloadOutline,
  KeyOutline,
  ProfileOutline,
  BookOutline,
  FormOutline
} from '@ant-design/icons-angular/icons';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};

const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

export function provideNzIcons(): Provider[] {
  return [
    { provide: NZ_ICONS, useValue: icons }
  ];
}

export const IconsProviderModule = NzIconModule.forRoot(icons);