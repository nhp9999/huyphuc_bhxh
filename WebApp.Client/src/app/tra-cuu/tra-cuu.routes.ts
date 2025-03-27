import { Routes } from '@angular/router';
import { TraCuuMaSoBhxhComponent } from './tra-cuu-ma-so-bhxh/tra-cuu-ma-so-bhxh.component';
import { TraCuuHoGiaDinhComponent } from './tra-cuu-ho-gia-dinh/tra-cuu-ho-gia-dinh.component';
import { TraCuuThongTinBHXHComponent } from './tra-cuu-thong-tin-bhxh/tra-cuu-thong-tin-bhxh.component';
import { TraCuuThongTinBHYTComponent } from './tra-cuu-thong-tin-bhyt/tra-cuu-thong-tin-bhyt.component';

export const traCuuRoutes: Routes = [
  {
    path: 'ma-so-bhxh',
    component: TraCuuMaSoBhxhComponent,
    title: 'Tra cứu mã số BHXH'
  },
  {
    path: 'ho-gia-dinh',
    component: TraCuuHoGiaDinhComponent,
    title: 'Tra cứu hộ gia đình'
  },
  {
    path: 'thong-tin-bhxh',
    component: TraCuuThongTinBHXHComponent,
    title: 'Tra cứu thông tin BHXH'
  },
  {
    path: 'thong-tin-bhyt',
    component: TraCuuThongTinBHYTComponent,
    title: 'Tra cứu thông tin BHYT'
  }
]; 