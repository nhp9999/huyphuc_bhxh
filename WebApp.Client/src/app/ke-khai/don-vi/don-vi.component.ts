import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { DonViService, DonVi } from '../../services/don-vi.service';
import { DaiLyService } from '../../services/dai-ly.service';
import { AuthService } from '../../services/auth.service';
import { DaiLyDonViService } from '../../services/dai-ly-don-vi.service';

@Component({
  selector: 'app-don-vi',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    NzTableModule,
    NzMessageModule,
    NzModalModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzDividerModule,
    NzSwitchModule,
    NzRadioModule,
    NzPopconfirmModule
  ],
  templateUrl: './don-vi.component.html',
  styleUrls: ['./don-vi.component.scss']
})
export class DonViComponent implements OnInit {
  donVis: DonVi[] = [];
  daiLys: any[] = [];
  selectedDaiLys: number[] = [];
  loading = false;
  isModalVisible = false;
  modalTitle = '';
  donViForm!: FormGroup;
  editingDonVi: DonVi | null = null;
  searchText = '';
  originalDonVis: DonVi[] = [];

  constructor(
    private fb: FormBuilder,
    private donViService: DonViService,
    private daiLyService: DaiLyService,
    private daiLyDonViService: DaiLyDonViService,
    private message: NzMessageService,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadDaiLys();
  }

  initForm(): void {
    this.donViForm = this.fb.group({
      maCoQuanBHXH: ['', [Validators.required]],
      maSoBHXH: ['', [Validators.required]],
      tenDonVi: ['', [Validators.required]],
      type: [1],
      isBHXHTN: [false],
      isBHYT: [false],
      trangThai: [true]
    });

    // Thêm xử lý khi type thay đổi
    this.donViForm.get('type')?.valueChanges.subscribe(value => {
      if (value === 1) {
        this.donViForm.patchValue({
          isBHXHTN: true,
          isBHYT: false
        });
      } else {
        this.donViForm.patchValue({
          isBHXHTN: false,
          isBHYT: true
        });
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.donViService.getDonVis().subscribe({
      next: (data) => {
        this.originalDonVis = data; // Lưu lại dữ liệu gốc
        this.donVis = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đơn vị');
        this.loading = false;
      }
    });
  }

  loadDaiLys(): void {
    this.daiLyService.getDaiLys().subscribe({
      next: (data) => {
        this.daiLys = data;
      },
      error: () => {
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
      }
    });
  }

  showCreateModal(): void {
    this.modalTitle = 'Thêm mới đơn vị';
    this.donViForm.reset({
      type: 1,
      trangThai: true,
      isBHXHTN: false,
      isBHYT: false
    });
    this.selectedDaiLys = [];
    this.isModalVisible = true;
  }

  showEditModal(data: DonVi): void {
    this.modalTitle = 'Cập nhật đơn vị';
    this.editingDonVi = data;
    this.donViForm.patchValue({
      maCoQuanBHXH: data.maCoQuanBHXH,
      maSoBHXH: data.maSoBHXH,
      tenDonVi: data.tenDonVi,
      type: data.isBHXHTN ? 1 : 2,
      isBHXHTN: data.isBHXHTN,
      isBHYT: data.isBHYT,
      trangThai: data.trangThai
    });

    // Load danh sách đại lý của đơn vị
    this.daiLyDonViService.getDaiLysByDonVi(data.id).subscribe({
      next: (daiLys) => {
        this.selectedDaiLys = daiLys.map(d => d.id);
        this.isModalVisible = true;
      },
      error: (error) => {
        console.error('Error loading dai lys:', error);
        this.message.error('Có lỗi xảy ra khi tải danh sách đại lý');
      }
    });
  }

  handleOk(): void {
    if (this.donViForm.valid) {
      this.loading = true;
      const currentUser = this.authService.getCurrentUser();
      const formData = {
        ...this.donViForm.value,
        nguoiTao: currentUser?.username || 'system',
        ngayTao: new Date().toISOString()
      };

      // Nếu đang thêm mới
      if (this.modalTitle === 'Thêm mới đơn vị') {
        this.donViService.createDonVi(formData).subscribe({
          next: (donVi) => {
            // Sau khi tạo đơn vị thành công, tạo quan hệ với đại lý
            if (this.selectedDaiLys.length > 0) {
              const promises = this.selectedDaiLys.map(daiLyId => {
                return this.daiLyDonViService.createDaiLyDonVi({
                  daiLyId: daiLyId,
                  donViId: donVi.id,
                  trangThai: true,
                  nguoiTao: currentUser?.username || 'system'
                }).toPromise();
              });

              Promise.all(promises)
                .then(() => {
                  this.message.success('Thêm mới đơn vị và liên kết đại lý thành công');
                  this.loadData();
                  this.handleCancel();
                })
                .catch(error => {
                  console.error('Error creating dai ly don vi:', error);
                  this.message.error('Có lỗi xảy ra khi liên kết đại lý');
                })
                .finally(() => {
                  this.loading = false;
                });
            } else {
              this.message.success('Thêm mới đơn vị thành công');
              this.loadData();
              this.handleCancel();
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Error:', error);
            if (error.error?.errors) {
              const errorMessages = Object.values(error.error.errors)
                .flat()
                .join(', ');
              this.message.error(`Lỗi: ${errorMessages}`);
            } else {
              this.message.error(error.error?.message || 'Có lỗi xảy ra khi thêm đơn vị');
            }
            this.loading = false;
          }
        });
      } 
      // Nếu đang cập nhật
      else {
        const donViId = this.donVis.find(d => 
          d.id === this.editingDonVi?.id
        )?.id;

        if (donViId) {
          // Cập nhật thông tin đơn vị
          this.donViService.updateDonVi(donViId, {
            ...formData,
            daiLyIds: this.selectedDaiLys
          }).subscribe({
            next: () => {
              this.message.success('Cập nhật đơn vị thành công');
              this.loadData();
              this.handleCancel();
            },
            error: (error) => {
              console.error('Error:', error);
              if (error.error?.errors) {
                const errorMessages = Object.values(error.error.errors)
                  .flat()
                  .join(', ');
                this.message.error(`Lỗi: ${errorMessages}`);
              } else {
                this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật đơn vị');
              }
            },
            complete: () => {
              this.loading = false;
            }
          });
        } else {
          this.message.error('Không tìm thấy đơn vị cần cập nhật');
          this.loading = false;
        }
      }
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.values(this.donViForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    }
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.donViForm.reset();
    this.editingDonVi = null;
  }

  onStatusChange(data: DonVi): void {
    const oldStatus = !data.trangThai;
    data.loading = true;

    this.donViService.updateStatus(data.id, data.trangThai).subscribe({
      next: () => {
        this.message.success(`${data.trangThai ? 'Kích hoạt' : 'Vô hiệu hóa'} đơn vị thành công`);
        data.loading = false;
      },
      error: (error) => {
        data.trangThai = oldStatus; // Khôi phục trạng thái cũ nếu lỗi
        console.error('Error:', error);
        if (error.error?.errors) {
          const errorMessages = Object.values(error.error.errors)
            .flat()
            .join(', ');
          this.message.error(`Lỗi: ${errorMessages}`);
        } else {
          this.message.error(error.error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
        data.loading = false;
      }
    });
  }

  deleteData(id: number): void {
    this.donViService.deleteDonVi(id).subscribe({
      next: () => {
        this.message.success('Xóa đơn vị thành công');
        this.loadData();
      },
      error: (error) => {
        console.error('Delete error:', error);
        // Kiểm tra nếu là lỗi do đợt kê khai
        if (error.error?.dotKeKhaiCount) {
          this.message.error(`Không thể xóa đơn vị này vì đang có ${error.error.dotKeKhaiCount} đợt kê khai liên quan`);
          return;
        }
        
        // Hiển thị thông báo lỗi từ server nếu có
        if (error.error?.message) {
          this.message.error(error.error.message);
          return;
        }

        // Thông báo mặc định nếu không có thông tin lỗi cụ thể
        this.message.error('Có lỗi xảy ra khi xóa đơn vị');
      }
    });
  }

  onDaiLysChange(daiLyIds: number[]): void {
    this.selectedDaiLys = daiLyIds;
  }

  onSearch(): void {
    if (!this.searchText.trim()) {
      this.donVis = [...this.originalDonVis];
      return;
    }

    const searchValue = this.searchText.toLowerCase().trim();
    this.donVis = this.originalDonVis.filter(donVi => 
      donVi.maCoQuanBHXH.toLowerCase().includes(searchValue) ||
      donVi.maSoBHXH.toLowerCase().includes(searchValue) ||
      donVi.tenDonVi.toLowerCase().includes(searchValue)
    );
  }
} 