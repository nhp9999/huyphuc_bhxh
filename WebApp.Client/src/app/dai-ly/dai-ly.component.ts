import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { DaiLy, DaiLyService } from '../services/dai-ly.service';
import { DonViService } from '../services/don-vi.service';
import { DaiLyDonViService } from '../services/dai-ly-don-vi.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dai-ly',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzPopconfirmModule,
    NzTagModule,
    NzDividerModule,
    NzSwitchModule,
    NzSelectModule
  ],
  template: `
    <div class="page-header">
      <h1>Quản lý đại lý</h1>
      <button nz-button nzType="primary" (click)="showCreateModal()">
        <span nz-icon nzType="plus"></span>Thêm mới
      </button>
    </div>

    <nz-table #basicTable [nzData]="daiLys" [nzLoading]="isLoading">
      <thead>
        <tr>
          <th>Mã đại lý</th>
          <th>Tên đại lý</th>
          <th>Địa chỉ</th>
          <th>Số điện thoại</th>
          <th>Email</th>
          <th>Người đại diện</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of basicTable.data">
          <td>{{ data.ma }}</td>
          <td>{{ data.ten }}</td>
          <td>{{ data.diaChi }}</td>
          <td>{{ data.soDienThoai }}</td>
          <td>{{ data.email }}</td>
          <td>{{ data.nguoiDaiDien }}</td>
          <td>
            <nz-switch
              [(ngModel)]="data.trangThai"
              [nzLoading]="data.loading"
              (ngModelChange)="onStatusChange(data)">
            </nz-switch>
          </td>
          <td>
            <button nz-button nzType="primary" (click)="showEditModal(data)">
              <span nz-icon nzType="edit"></span>
            </button>
            <nz-divider nzType="vertical"></nz-divider>
            <button 
              nz-button 
              nzType="default" 
              nzDanger 
              nz-popconfirm
              [nzLoading]="isLoading"
              nzPopconfirmTitle="Bạn có chắc chắn muốn xóa đại lý này?"
              nzPopconfirmPlacement="left"
              nzOkText="Xóa"
              nzCancelText="Hủy"
              nzOkDanger
              (nzOnConfirm)="deleteData(data.id)">
              <span nz-icon nzType="delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </nz-table>

    <nz-modal
      [(nzVisible)]="isModalVisible"
      [nzTitle]="modalTitle"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()"
      [nzWidth]="700">
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="daiLyForm">
          <nz-form-item>
            <nz-form-label [nzSpan]="6" nzRequired>Mã đại lý</nz-form-label>
            <nz-form-control [nzSpan]="18" nzErrorTip="Vui lòng nhập mã đại lý!">
              <input nz-input formControlName="ma" placeholder="Nhập mã đại lý"/>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6" nzRequired>Tên đại lý</nz-form-label>
            <nz-form-control [nzSpan]="18" nzErrorTip="Vui lòng nhập tên đại lý!">
              <input nz-input formControlName="ten" placeholder="Nhập tên đại lý"/>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Địa chỉ</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <input nz-input formControlName="diaChi" placeholder="Nhập địa chỉ"/>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Số điện thoại</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <input nz-input formControlName="soDienThoai" placeholder="Nhập số điện thoại"/>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Email</nz-form-label>
            <nz-form-control [nzSpan]="18" [nzErrorTip]="emailErrorTpl">
              <input nz-input formControlName="email" placeholder="Nhập email"/>
              <ng-template #emailErrorTpl let-control>
                <ng-container *ngIf="control.hasError('email')">
                  Email không đúng định dạng!
                </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Người đại diện</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <input nz-input formControlName="nguoiDaiDien" placeholder="Nhập tên người đại diện"/>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Trạng thái</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <nz-switch formControlName="trangThai"></nz-switch>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Đơn vị</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <nz-select 
                [nzMode]="'multiple'"
                [(ngModel)]="selectedDonVis"
                [ngModelOptions]="{standalone: true}"
                (ngModelChange)="onDonVisChange($event)"
                nzPlaceHolder="Chọn đơn vị">
                <nz-option
                  *ngFor="let donVi of donVis"
                  [nzValue]="donVi.id"
                  [nzLabel]="donVi.tenDonVi">
                </nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>

        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    h1 {
      margin: 0;
    }
  `]
})
export class DaiLyComponent implements OnInit {
  daiLys: DaiLy[] = [];
  isLoading = false;
  isModalVisible = false;
  modalTitle = '';
  daiLyForm!: FormGroup;
  editingDaiLy: DaiLy | null = null;
  selectedDonVis: number[] = [];
  donVis: any[] = [];
  // Thêm cache cho danh sách đơn vị theo đại lý
  private donVisByDaiLyCache = new Map<number, any[]>();

  constructor(
    private daiLyService: DaiLyService,
    private message: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
    private donViService: DonViService,
    private daiLyDonViService: DaiLyDonViService,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadDaiLys();
    this.loadDonVis();
  }

  initForm(): void {
    this.daiLyForm = this.fb.group({
      ma: ['', [Validators.required, Validators.maxLength(20)]],
      ten: ['', [Validators.required, Validators.maxLength(200)]],
      diaChi: ['', [Validators.maxLength(500)]],
      soDienThoai: ['', [Validators.maxLength(15)]],
      email: ['', [Validators.maxLength(100), Validators.email]],
      nguoiDaiDien: ['', [Validators.maxLength(100)]],
      trangThai: [true]
    });
  }

  loadDaiLys(): void {
    this.isLoading = true;
    this.daiLyService.getDaiLys().subscribe({
      next: (data) => {
        this.daiLys = data;
        this.isLoading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
        this.isLoading = false;
      }
    });
  }

  loadDonVis(): void {
    this.donViService.getDonVis().subscribe({
      next: (data) => {
        this.donVis = data;
      },
      error: () => {
        this.message.error('Không thể tải danh sách đơn vị');
      }
    });
  }

  showCreateModal(): void {
    this.modalTitle = 'Thêm mới đại lý';
    this.editingDaiLy = null;
    this.daiLyForm.reset({ trangThai: true });
    this.isModalVisible = true;
  }

  showEditModal(data: DaiLy): void {
    this.modalTitle = 'Chỉnh sửa đại lý';
    this.editingDaiLy = data;
    this.daiLyForm.patchValue(data);
    
    // Kiểm tra cache trước khi gọi API
    if (this.donVisByDaiLyCache.has(data.id)) {
      this.selectedDonVis = this.donVisByDaiLyCache.get(data.id)!.map(d => d.id);
      this.isModalVisible = true;
      return;
    }
    
    // Load đơn vị của đại lý từ API nếu không có trong cache
    this.daiLyDonViService.getDonVisByDaiLy(data.id).subscribe({
      next: (donVis) => {
        this.selectedDonVis = donVis.map(d => d.id);
        // Lưu vào cache
        this.donVisByDaiLyCache.set(data.id, donVis);
      },
      error: () => {
        this.message.error('Không thể tải danh sách đơn vị của đại lý');
      }
    });

    this.isModalVisible = true;
  }

  handleOk(): void {
    if (this.daiLyForm.valid) {
      this.isLoading = true;
      const formValue = this.daiLyForm.value;

      // Đảm bảo các trường không bắt buộc có giá trị rỗng thay vì null
      const daiLyData = {
        ma: formValue.ma,
        ten: formValue.ten,
        diaChi: formValue.diaChi || '',
        soDienThoai: formValue.soDienThoai || '',
        email: formValue.email || '',
        nguoiDaiDien: formValue.nguoiDaiDien || '',
        trangThai: formValue.trangThai
      };

      if (this.editingDaiLy) {
        // Thêm các trường cần thiết khi cập nhật
        const updateData = {
          ...daiLyData,
          id: this.editingDaiLy.id,
          ngayTao: this.editingDaiLy.ngayTao,
          nguoiTao: this.editingDaiLy.nguoiTao
        };

        this.daiLyService.updateDaiLy(this.editingDaiLy.id, updateData).subscribe({
          next: () => {
            this.message.success('Cập nhật đại lý thành công');
            this.loadDaiLys();
            this.isModalVisible = false;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error details:', error);
            if (error.error?.errors) {
              const errorMessages = Object.values(error.error.errors)
                .flat()
                .join(', ');
              this.message.error(`Lỗi: ${errorMessages}`);
            } else {
              this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật đại lý');
            }
            this.isLoading = false;
          }
        });
      } else {
        this.daiLyService.createDaiLy(daiLyData).subscribe({
          next: () => {
            this.message.success('Thêm mới đại lý thành công');
            this.loadDaiLys();
            this.isModalVisible = false;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error details:', error);
            if (error.error?.errors) {
              const errorMessages = Object.values(error.error.errors)
                .flat()
                .join(', ');
              this.message.error(`Lỗi: ${errorMessages}`);
            } else {
              this.message.error(error.error?.message || 'Có lỗi xảy ra khi thêm mới đại lý');
            }
            this.isLoading = false;
          }
        });
      }
    } else {
      Object.values(this.daiLyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.editingDaiLy = null;
    this.selectedDonVis = [];
    this.daiLyForm.reset();
  }

  deleteData(id: number): void {
    this.isLoading = true;
    this.daiLyService.deleteDaiLy(id).subscribe({
      next: () => {
        this.message.success('Xóa đại lý thành công');
        this.loadDaiLys();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Delete error details:', {
          status: error.status,
          message: error.error?.message,
          error: error.error,
          fullError: error
        });
        
        this.isLoading = false;

        // Xử lý lỗi dựa trên error.error
        if (error.error) {
          // Kiểm tra nếu có thông tin về đơn vị liên kết
          if (error.error.donViCount) {
            this.modal.error({
              nzTitle: 'Không thể xóa',
              nzContent: `Không thể xóa đại lý này vì đang có ${error.error.donViCount} đơn vị liên kết. Vui lòng gỡ bỏ liên kết với các đơn vị trước khi xóa.`,
              nzOkText: 'Đóng'
            });
            return;
          }
          
          // Kiểm tra nếu có thông tin về đợt kê khai
          if (error.error.dotKeKhaiCount) {
            this.modal.error({
              nzTitle: 'Không thể xóa',
              nzContent: `Không thể xóa đại lý này vì đang có ${error.error.dotKeKhaiCount} đợt kê khai liên quan.`,
              nzOkText: 'Đóng'
            });
            return;
          }

          // Hiển thị thông báo lỗi từ server nếu có
          if (error.error.message) {
            this.message.error(error.error.message);
            return;
          }
        }

        // Thông báo lỗi mặc định nếu không xác định được lỗi cụ thể
        this.message.error('Có lỗi xảy ra khi xóa đại lý. Vui lòng thử lại sau.');
      }
    });
  }

  onStatusChange(daiLy: DaiLy): void {
    const oldStatus = !daiLy.trangThai;
    daiLy.loading = true;

    this.daiLyService.updateStatus(daiLy.id, daiLy).subscribe({
      next: () => {
        this.message.success(`${daiLy.trangThai ? 'Kích hoạt' : 'Vô hiệu hóa'} đại lý thành công`);
        daiLy.loading = false;
      },
      error: (error) => {
        daiLy.trangThai = oldStatus;
        if (error.error?.errors) {
          const errorMessages = Object.values(error.error.errors)
            .flat()
            .join(', ');
          this.message.error(`Lỗi: ${errorMessages}`);
        } else {
          this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
        daiLy.loading = false;
      }
    });
  }

  onDonVisChange(donViIds: number[]): void {
    if (!this.editingDaiLy) return;

    // Xóa các đơn vị cũ
    const removedDonViIds = this.selectedDonVis.filter(id => !donViIds.includes(id));
    removedDonViIds.forEach(donViId => {
      this.daiLyDonViService.deleteDaiLyDonVi(this.editingDaiLy!.id).subscribe({
        error: () => this.message.error('Có lỗi xảy ra khi xóa liên kết đơn vị')
      });
    });

    // Thêm các đơn vị mới
    const newDonViIds = donViIds.filter(id => !this.selectedDonVis.includes(id));
    newDonViIds.forEach(donViId => {
      this.daiLyDonViService.addDaiLyDonVi(
        this.editingDaiLy!.id, 
        donViId,
        this.authService.getCurrentUser()?.username || ''
      ).subscribe({
        error: () => this.message.error('Có lỗi xảy ra khi thêm liên kết đơn vị')
      });
    });

    this.selectedDonVis = donViIds;
  }
}