import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { QuyenBienLaiDienTuComponent } from '../quyen-bien-lai-dien-tu/quyen-bien-lai-dien-tu.component';
import { QuanLyBienLaiDienTuComponent } from './quan-ly-bien-lai-dien-tu/quan-ly-bien-lai-dien-tu.component';

const routes: Routes = [
  { path: 'quan-ly', component: QuanLyBienLaiDienTuComponent },
  { path: 'quyen-bien-lai', component: QuyenBienLaiDienTuComponent },
  { path: 'tao-bien-lai-vnpt', loadComponent: () => import('./tao-bien-lai-vnpt/tao-bien-lai-vnpt.component').then(m => m.TaoBienLaiVNPTComponent) },
  { path: 'tai-khoan-vnpt', loadComponent: () => import('./quan-ly-tai-khoan-vnpt/quan-ly-tai-khoan-vnpt.component').then(m => m.QuanLyTaiKhoanVNPTComponent) },
  { path: 'import-bien-lai-dien-tu', loadComponent: () => import('./import-bien-lai-dien-tu/import-bien-lai-dien-tu.component').then(m => m.ImportBienLaiDienTuComponent) },
  { path: '', redirectTo: 'quan-ly', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzModalModule,
    NzMessageModule,
    NzTagModule,
    NzIconModule,
    NzDividerModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSpaceModule,
    QuyenBienLaiDienTuComponent,
    QuanLyBienLaiDienTuComponent
  ]
})
export class BienLaiDienTuModule { }