import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

@Component({
  selector: 'app-thong-ke-bien-lai',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzCardModule,
    NzStatisticModule
  ],
  template: `
    <div class="page-header">
      <h2>Thống kê biên lai</h2>
    </div>
    <div class="page-content">
      <!-- Content here -->
    </div>
  `
})
export class ThongKeBienLaiComponent {
  // Component logic
} 