import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AdminGuard } from './guards/admin.guard';
import { DaiLyComponent } from './dai-ly/dai-ly.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'dai-ly',
        component: DaiLyComponent,
        canActivate: [AdminGuard]
      },
      { path: 'dot-ke-khai', loadComponent: () => import('./ke-khai/dot-ke-khai/dot-ke-khai.component').then(m => m.DotKeKhaiComponent) },
      { path: 'dot-ke-khai/:id/ke-khai-bhyt', loadComponent: () => import('./ke-khai/ke-khai-bhyt/ke-khai-bhyt.component').then(m => m.KeKhaiBHYTComponent) },
      {
        path: 'dot-ke-khai/:id/ke-khai-bhxh',
        loadComponent: () => import('./ke-khai/ke-khai-bhxh/ke-khai-bhxh.component').then(m => m.KeKhaiBHXHComponent)
      },
      {
        path: 'lich-su-ke-khai',
        loadComponent: () => import('./ke-khai/lich-su-ke-khai/lich-su-ke-khai.component').then(m => m.LichSuKeKhaiComponent)
      },
      {
        path: 'admin-danh-sach-ke-khai',
        loadComponent: () => import('./ke-khai/admin-danh-sach-ke-khai/admin-danh-sach-ke-khai.component').then(m => m.AdminDanhSachKeKhaiComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'reports',
        children: [
          { path: 'statistics', component: StatisticsComponent }
        ]
      },
      {
        path: 'don-vi',
        loadComponent: () => import('./ke-khai/don-vi/don-vi.component').then(m => m.DonViComponent)
      },
      {
        path: 'bien-lai',
        children: [
          {
            path: 'quyen-bien-lai',
            loadComponent: () => import('./bien-lai/quyen-bien-lai/quyen-bien-lai.component').then(m => m.QuyenBienLaiComponent),
            canActivate: [AdminGuard]
          },
          {
            path: 'danh-sach',
            loadComponent: () => import('./bien-lai/danh-sach-bien-lai/danh-sach-bien-lai.component').then(m => m.DanhSachBienLaiComponent)
          },
          {
            path: 'cap-phat',
            loadComponent: () => import('./bien-lai/cap-phat-bien-lai/cap-phat-bien-lai.component').then(m => m.CapPhatBienLaiComponent),
            canActivate: [AdminGuard]
          },
          {
            path: 'thong-ke',
            loadComponent: () => import('./bien-lai/thong-ke-bien-lai/thong-ke-bien-lai.component').then(m => m.ThongKeBienLaiComponent)
          },
          {
            path: 'bang-ke',
            loadComponent: () => import('./bien-lai/bang-ke-bien-lai/bang-ke-bien-lai.component').then(m => m.BangKeBienLaiComponent)
          },
          {
            path: 'bao-cao',
            loadComponent: () => import('./bien-lai/bao-cao-bien-lai/bao-cao-bien-lai.component').then(m => m.BaoCaoBienLaiComponent)
          },
          {
            path: 'dien-tu',
            loadChildren: () => import('./bien-lai/bien-lai-dien-tu/bien-lai-dien-tu.module').then(m => m.BienLaiDienTuModule)
          },
          { path: '', redirectTo: 'danh-sach', pathMatch: 'full' }
        ]
      },
      {
        path: 'tra-cuu',
        children: [
          {
            path: 'ma-so-bhxh',
            loadComponent: () => import('./tra-cuu/tra-cuu-ma-so-bhxh/tra-cuu-ma-so-bhxh.component').then(m => m.TraCuuMaSoBhxhComponent)
          },
          {
            path: 'ho-gia-dinh',
            loadComponent: () => import('./tra-cuu/tra-cuu-ho-gia-dinh/tra-cuu-ho-gia-dinh.component').then(m => m.TraCuuHoGiaDinhComponent)
          },
          {
            path: 'thong-tin-bhxh',
            loadComponent: () => import('./tra-cuu/tra-cuu-thong-tin-bhxh/tra-cuu-thong-tin-bhxh.component').then(m => m.TraCuuThongTinBHXHComponent)
          },
          {
            path: 'thong-tin-bhyt',
            loadComponent: () => import('./tra-cuu/tra-cuu-thong-tin-bhyt/tra-cuu-thong-tin-bhyt.component').then(m => m.TraCuuThongTinBHYTComponent)
          },
          { path: '', redirectTo: 'ma-so-bhxh', pathMatch: 'full' }
        ]
      },
      {
        path: 'bhyt',
        children: [
          {
            path: 'xuat-mau-d03',
            loadComponent: () => import('./bhyt/xuat-mau-d03/xuat-mau-d03.component').then(m => m.XuatMauD03Component)
          },
          { path: '', redirectTo: 'xuat-mau-d03', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
