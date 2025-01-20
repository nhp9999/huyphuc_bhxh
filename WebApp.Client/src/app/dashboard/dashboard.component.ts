import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';

interface Activity {
  avatar: string;
  title: string;
  description: string;
  time?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzListModule,
    NzRadioModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  title = 'Tổng quan';
  selectedPeriod = 'month';
  
  recentActivities: Activity[] = [
    {
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
      title: 'Nguyễn Văn A đã cập nhật hồ sơ',
      description: 'Cập nhật thông tin cá nhân và địa chỉ mới',
      time: '2 giờ trước'
    },
    {
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
      title: 'Trần Thị B đã tạo yêu cầu mới',
      description: 'Yêu cầu xin nghỉ phép 3 ngày',
      time: '4 giờ trước'
    },
    {
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
      title: 'Lê Văn C đã phê duyệt hồ sơ',
      description: 'Phê duyệt đơn xin nghỉ phép của nhân viên',
      time: '1 ngày trước'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Khởi tạo dữ liệu dashboard ở đây
  }
}
