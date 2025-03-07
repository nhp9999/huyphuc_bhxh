import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { QuyenBienLai } from '../../models/quyen-bien-lai.model';

@Component({
  selector: 'app-chi-tiet-quyen-bien-lai',
  templateUrl: './chi-tiet-quyen-bien-lai.component.html',
  styleUrls: ['./chi-tiet-quyen-bien-lai.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzGridModule,
    NzTagModule,
    NzProgressModule,
    NzAvatarModule,
    NzIconModule
  ]
})
export class ChiTietQuyenBienLaiComponent implements OnInit {
  @Input() isVisible = false;
  @Input() quyenBienLai: QuyenBienLai | null = null;
  @Output() closeModal = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  handleCancel(): void {
    this.isVisible = false;
    this.closeModal.emit();
  }

  // Tính số lượng biên lai đã sử dụng
  getSoLuongDaSuDung(): number {
    if (!this.quyenBienLai) return 0;
    
    return Math.round(this.quyenBienLai.tienDoSuDung * this.quyenBienLai.soLuongBienLai / 100);
  }
} 