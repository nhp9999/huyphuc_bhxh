import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {
  // Thêm các thuộc tính thống kê ở đây
  totalUsers: number = 0;
  activeUsers: number = 0;
  totalTransactions: number = 0;

  constructor() {
    // TODO: Thêm logic lấy dữ liệu thống kê từ service
  }
}
