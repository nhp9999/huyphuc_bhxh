import { Component, OnInit } from '@angular/core';
import { DonViService, DonVi } from '../../services/don-vi.service';
import { DaiLyDonViService } from '../../services/dai-ly-don-vi.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { DaiLy } from '../../services/user.service';

@Component({
  selector: 'app-don-vi',
  templateUrl: './don-vi.component.html',
  styleUrls: ['./don-vi.component.scss']
})
export class DonViComponent implements OnInit {
  donVis: DonVi[] = [];
  daiLys: DaiLy[] = [];
  selectedDaiLys: number[] = [];
  selectedDonVi: DonVi | null = null;
  loading = false;

  constructor(
    private donViService: DonViService,
    private daiLyDonViService: DaiLyDonViService,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDaiLys();
  }

  loadDaiLys(): void {
    this.loading = true;
    this.daiLyDonViService.getDaiLysByDonVi(this.selectedDonVi?.id || 0).subscribe({
      next: (daiLys: DaiLy[]) => {
        this.daiLys = daiLys;
        this.loading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
        this.loading = false;
      }
    });
  }

  loadDaiLysByDonVi(donViId: number): void {
    this.loading = true;
    this.daiLyDonViService.getDaiLysByDonVi(donViId).subscribe({
      next: (daiLys: DaiLy[]) => {
        this.selectedDaiLys = daiLys.map(d => d.id);
        this.loading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý của đơn vị');
        this.loading = false;
      }
    });
  }

  onDaiLysChange(daiLyIds: number[]): void {
    const donViId = this.selectedDonVi?.id;
    if (!donViId) return;

    // Xóa các đại lý cũ
    const removedDaiLyIds = this.selectedDaiLys.filter(id => !daiLyIds.includes(id));
    removedDaiLyIds.forEach(daiLyId => {
      this.daiLyDonViService.deleteDaiLyDonVi(daiLyId).subscribe({
        error: () => this.message.error('Có lỗi xảy ra khi xóa đại lý')
      });
    });

    // Thêm các đại lý mới
    const newDaiLyIds = daiLyIds.filter(id => !this.selectedDaiLys.includes(id));
    newDaiLyIds.forEach(daiLyId => {
      this.daiLyDonViService.addDaiLyDonVi(
        daiLyId, 
        donViId, 
        this.authService.getCurrentUser()?.username || ''
      ).subscribe({
        error: () => this.message.error('Có lỗi xảy ra khi thêm đại lý')
      });
    });

    this.selectedDaiLys = daiLyIds;
  }

  // ... các phương thức khác
} 