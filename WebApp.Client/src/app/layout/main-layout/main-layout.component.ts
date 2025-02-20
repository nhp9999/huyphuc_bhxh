import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AuthService } from '../../services/auth.service';
import { ShopOutline } from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzBreadCrumbModule,
    NzAvatarModule,
    NzDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isCollapsed = false;
  currentUser: any;
  isAdmin = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private iconService: NzIconService
  ) {
    this.iconService.addIcon(ShopOutline);
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }

    this.isAdmin = this.currentUser?.roles?.some((role: string) => 
      ['admin', 'super_admin'].includes(role)
    ) || this.currentUser?.isSuperAdmin;
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
