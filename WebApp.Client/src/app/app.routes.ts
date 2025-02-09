import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AdminGuard } from './guards/admin.guard';

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
      { path: 'dot-ke-khai', loadComponent: () => import('./ke-khai/dot-ke-khai/dot-ke-khai.component').then(m => m.DotKeKhaiComponent) },
      { path: 'dot-ke-khai/:id/ke-khai-bhyt', loadComponent: () => import('./ke-khai/ke-khai-bhyt/ke-khai-bhyt.component').then(m => m.KeKhaiBHYTComponent) },
      { 
        path: 'reports',
        children: [
          { path: 'statistics', component: StatisticsComponent }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
