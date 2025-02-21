import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-danh-sach-bien-lai',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule],
  template: `
    <div class="page-header">
      <h2>Danh sách biên lai</h2>
    </div>
    <div class="page-content">
      <!-- Content here -->
    </div>
  `
})
export class DanhSachBienLaiComponent {
  // Component logic
} 