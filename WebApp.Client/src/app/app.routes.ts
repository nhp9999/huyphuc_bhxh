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
          { path: '', redirectTo: 'danh-sach', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
