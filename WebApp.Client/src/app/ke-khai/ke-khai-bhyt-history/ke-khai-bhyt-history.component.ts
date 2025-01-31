import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface KeKhaiBHYTHistory {
  id: number;
  ke_khai_bhyt_id: number;
  action: string;
  nguoi_thuc_hien: string;
  thoi_gian: Date;
  noi_dung: string;
}

@Component({
  selector: 'app-ke-khai-bhyt-history',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzTimelineModule,
    NzMessageModule,
    NzSpinModule,
    NzIconModule
  ],
  templateUrl: './ke-khai-bhyt-history.component.html',
  styleUrls: ['./ke-khai-bhyt-history.component.scss']
})
export class KeKhaiBHYTHistoryComponent implements OnInit {
  histories: KeKhaiBHYTHistory[] = [];
  loading = false;
  keKhaiId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.keKhaiId = +params['id'];
      this.loadHistory();
    });
  }

  loadHistory(): void {
    this.loading = true;
    // TODO: Implement history loading logic
    this.loading = false;
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      default:
        return 'default';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'plus-circle';
      case 'UPDATE':
        return 'edit';
      case 'DELETE':
        return 'delete';
      default:
        return 'info-circle';
    }
  }
}