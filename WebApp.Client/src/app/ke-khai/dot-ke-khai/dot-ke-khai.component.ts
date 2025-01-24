import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DotKeKhai, DotKeKhaiService } from '../../services/dot-ke-khai.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-dot-ke-khai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzInputNumberModule,
    DatePipe
  ],
  templateUrl: './dot-ke-khai.component.html',
  styleUrls: ['./dot-ke-khai.component.scss']
})
export class DotKeKhaiComponent implements OnInit {
  dotKeKhais: DotKeKhai[] = [];
  loading = false;
  isVisible = false;
  isEdit = false;
  form: FormGroup;
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  selectedIds: number[] = [];

  constructor(
    private dotKeKhaiService: DotKeKhaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder
  ) {
    const currentDate = new Date();
    this.form = this.fb.group({
      id: [null],
      ten_dot: [{value: '', disabled: true}],
      so_dot: [1, [Validators.required, Validators.min(1)]],
      thang: [currentDate.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      nam: [currentDate.getFullYear(), [Validators.required, Validators.min(2000)]],
      ghi_chu: [''],
      trang_thai: [true],
      nguoi_tao: [this.currentUser.username || '']
    });

    this.form.get('so_dot')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('thang')?.valueChanges.subscribe(() => this.updateTenDot());
    this.form.get('nam')?.valueChanges.subscribe(() => this.updateTenDot());
  }

  updateTenDot(): void {
    const so_dot = this.form.get('so_dot')?.value;
    const thang = this.form.get('thang')?.value;
    const nam = this.form.get('nam')?.value;

    if (so_dot > 0 && thang >= 1 && thang <= 12 && nam >= 2000) {
      const ten_dot = `Đợt ${so_dot} Tháng ${thang} năm ${nam}`;
      this.form.patchValue({ ten_dot }, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.updateTenDot();
  }

  loadData(): void {
    this.loading = true;
    this.dotKeKhaiService.getDotKeKhais().subscribe({
      next: (data) => {
        // Lọc danh sách đợt kê khai theo người tạo
        this.dotKeKhais = data.filter(dot => dot.nguoi_tao === this.currentUser.username);
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Có lỗi xảy ra khi tải dữ liệu');
        this.loading = false;
      }
    });
  }

  getNextSoDot(nam: number): number {
    // Lọc các đợt kê khai trong năm hiện tại của người dùng hiện tại
    const dotKeKhaisInYear = this.dotKeKhais.filter(dot => 
      dot.nam === nam && dot.nguoi_tao === this.currentUser.username
    );
    if (dotKeKhaisInYear.length === 0) {
      return 1; // Nếu không có đợt nào trong năm, trả về 1
    }
    // Tìm số đợt lớn nhất và cộng thêm 1
    const maxSoDot = Math.max(...dotKeKhaisInYear.map(dot => dot.so_dot));
    return maxSoDot + 1;
  }

  showModal(data?: DotKeKhai): void {
    this.isEdit = !!data;
    if (data) {
      this.form.patchValue({
        ...data
      });
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const nextSoDot = this.getNextSoDot(currentYear);
      
      this.form.reset({
        id: null,
        ten_dot: '',
        so_dot: nextSoDot,
        thang: currentDate.getMonth() + 1,
        nam: currentYear,
        ghi_chu: '',
        trang_thai: true,
        nguoi_tao: this.currentUser.username || ''
      });
      this.updateTenDot();
    }
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextSoDot = this.getNextSoDot(currentYear);
    
    this.form.reset({ 
      so_dot: nextSoDot,
      thang: currentDate.getMonth() + 1,
      nam: currentYear,
      trang_thai: true,
      nguoi_tao: this.currentUser.username || ''
    });
    this.updateTenDot();
  }

  handleOk(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.getRawValue(); // Lấy tất cả giá trị bao gồm cả disabled controls
      
      // Đảm bảo các trường số được chuyển đổi đúng kiểu
      const data: DotKeKhai = {
        ten_dot: formValue.ten_dot,
        so_dot: Number(formValue.so_dot),
        thang: Number(formValue.thang),
        nam: Number(formValue.nam),
        ghi_chu: (formValue.ghi_chu || '').trim(),
        trang_thai: Boolean(formValue.trang_thai),
        nguoi_tao: this.currentUser.username || ''
      };

      if (this.isEdit && formValue.id) {
        data.id = Number(formValue.id);
        this.dotKeKhaiService.updateDotKeKhai(data.id, data).subscribe({
          next: () => {
            this.message.success('Cập nhật thành công');
            this.loadData();
            this.handleCancel();
          },
          error: (error) => {
            console.error('Lỗi khi cập nhật:', error);
            this.message.error('Có lỗi xảy ra khi cập nhật');
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        this.dotKeKhaiService.createDotKeKhai(data).subscribe({
          next: () => {
            this.message.success('Thêm mới thành công');
            this.loadData();
            this.handleCancel();
          },
          error: (error) => {
            console.error('Lỗi khi thêm mới:', error);
            this.message.error('Có lỗi xảy ra khi thêm mới');
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  delete(id: number): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa đợt kê khai này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.dotKeKhaiService.deleteDotKeKhai(id).subscribe({
          next: () => {
            this.message.success('Xóa thành công');
            this.loadData();
          },
          error: () => this.message.error('Có lỗi xảy ra khi xóa')
        });
      }
    });
  }

  onAllChecked(checked: boolean): void {
    this.selectedIds = checked ? this.dotKeKhais.map(item => item.id!).filter(id => id) : [];
  }

  onItemChecked(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    }
  }

  deleteSelected(): void {
    if (this.selectedIds.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một đợt kê khai để xóa');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${this.selectedIds.length} đợt kê khai đã chọn?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        const deletePromises = this.selectedIds.map(id =>
          this.dotKeKhaiService.deleteDotKeKhai(id).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.message.success('Xóa thành công');
            this.selectedIds = [];
            this.loadData();
          })
          .catch(() => {
            this.message.error('Có lỗi xảy ra khi xóa');
          });
      }
    });
  }
} 