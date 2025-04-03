import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UserService, NguoiDung } from '../../services/user.service';
import { QuyenBienLaiService, QuyenBienLai } from '../../services/quyen-bien-lai.service';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { AuthService } from '../../services/auth.service';
import { 
  HomeOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  FilterOutline,
  ClearOutline,
  BookOutline,
  CheckCircleOutline,
  InboxOutline,
  FileDoneOutline,
  UserOutline,
  TagOutline,
  SearchOutline,
  EyeOutline,
  NumberOutline
} from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import { ChiTietQuyenBienLaiComponent } from './chi-tiet-quyen-bien-lai/chi-tiet-quyen-bien-lai.component';
import { QuyenBienLai as QuyenBienLaiModel } from '../models/quyen-bien-lai.model';
// Import other needed modules

interface NguoiThuOption {
  value: number;
  label: string;
}

// Thêm interface cho token payload
interface TokenPayload {
  hoTen?: string;
  userName?: string;
  [key: string]: any; // Cho phép các trường động
}

const icons: IconDefinition[] = [
  HomeOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  FilterOutline,
  ClearOutline,
  BookOutline,
  CheckCircleOutline,
  InboxOutline,
  FileDoneOutline,
  UserOutline,
  TagOutline,
  SearchOutline,
  EyeOutline,
  NumberOutline
];

@Component({
  selector: 'app-quyen-bien-lai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzTagModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzEmptyModule,
    NzAvatarModule,
    NzRadioModule,
    NzDescriptionsModule,
    NzProgressModule,
    NzToolTipModule,
    NzGridModule,
    NzLayoutModule,
    NzAlertModule,
    NzCheckboxModule,
    ChiTietQuyenBienLaiComponent
  ],
  templateUrl: './quyen-bien-lai.component.html',
  styleUrls: ['./quyen-bien-lai.component.scss']
})
export class QuyenBienLaiComponent implements OnInit {
  listQuyenBienLai: QuyenBienLai[] = [];
  filteredQuyenBienLai: QuyenBienLai[] = [];
  users: NguoiDung[] = [];
  userMap = new Map<number, NguoiDung>();
  loading = false;
  isVisible = false;
  isOkLoading = false;
  modalTitle = 'Thêm quyển biên lai';
  form: FormGroup;
  nguoiThus: NguoiThuOption[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  editingQuyenBienLai: QuyenBienLai | null = null;
  selectedNguoiThu: any = 'all';
  selectedTrangThai: string = 'all';
  searchText: string = '';
  isDetailVisible: boolean = false;
  selectedQuyenBienLai: QuyenBienLai | null = null;
  suggestedQuyenSo: string = '';
  quyenSoStatus: string = '';
  private debounceTimer: any;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService,
    private userService: UserService,
    private quyenBienLaiService: QuyenBienLaiService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      quyen_so: ['', [Validators.required]],
      tu_so: ['', [Validators.required]],
      den_so: ['', [Validators.required]],
      nhan_vien_thu: [null, [Validators.required]],
      trang_thai: ['dang_su_dung'],
      so_hien_tai: ['']
    });

    // Giảm tần suất xử lý khi nhập liệu bằng cách gom nhóm các subscription
    // và thêm debounce time
    this.form.valueChanges.subscribe(() => {
      this.debounce(() => {
        this.validateSoHienTai();
      }, 300);
    });

    // Thêm subscription để theo dõi thay đổi của tu_so và tính toán den_so
    this.form.get('tu_so')?.valueChanges.subscribe(value => {
      if (value) {
        const tuSo = parseInt(value);
        if (!isNaN(tuSo)) {
          this.debounce(() => {
            const denSo = (tuSo + 49).toString().padStart(value.length, '0');
            if (!this.editingQuyenBienLai && !this.form.get('so_hien_tai')?.value) {
              this.form.patchValue({
                den_so: denSo,
                so_hien_tai: value
              }, { emitEvent: false });
            } else {
              this.form.patchValue({
                den_so: denSo
              }, { emitEvent: false });
            }
          }, 300);
        }
      }
    });

    // Bỏ các subscription không cần thiết vì đã được gom vào form.valueChanges
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadData();
    this.calculateSuggestedQuyenSo();
  }

  loadData(): void {
    this.loading = true;
    this.quyenBienLaiService.getQuyenBienLais().subscribe({
      next: (data: QuyenBienLai[]) => {
        console.log('Loaded quyen bien lai:', data);
        this.listQuyenBienLai = data;
        this.filteredQuyenBienLai = data;
        this.loading = false;
        this.setOfCheckedId.clear();
        this.refreshCheckedStatus();
      },
      error: (err: any) => {
        this.message.error('Lỗi khi tải danh sách quyển biên lai');
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: NguoiDung[]) => {
        console.log('Loaded users:', users);
        this.users = users;
        this.userMap = new Map(users.map(user => [user.id, user]));
        this.nguoiThus = users.map((user: NguoiDung) => ({
          value: user.id,
          label: this.getDisplayName(user)
        }));
      },
      error: (err: any) => {
        this.message.error('Lỗi khi tải danh sách người thu');
        console.error(err);
      }
    });
  }

  getNguoiThuName(nguoiThuId: number): string {
    const nguoiThu = this.userMap.get(nguoiThuId);
    return nguoiThu ? this.getDisplayName(nguoiThu) : '';
  }

  showModal(): void {
    this.editingQuyenBienLai = null;
    this.form.reset({
      trang_thai: 'dang_su_dung',
      so_hien_tai: '' // Số hiện tại sẽ được thiết lập tự động khi nhập từ số
    });
    this.modalTitle = 'Thêm quyển biên lai';
    this.isVisible = true;
    this.calculateSuggestedQuyenSo();
    
    // Một mẹo nhỏ để đảm bảo số hiện tại sẽ tự động được cập nhật 
    // với giá trị từ số khi người dùng nhập từ số
    setTimeout(() => {
      const tuSoValue = this.form.get('tu_so')?.value;
      if (tuSoValue) {
        this.form.patchValue({
          so_hien_tai: tuSoValue
        }, { emitEvent: false });
      }
    }, 500);
  }

  handleOk(): void {
    this.checkDuplicateQuyenSo();
    
    if (this.form.valid) {
      this.isOkLoading = true;
      
      const currentUser = this.authService.getCurrentUser();
      
      const formValue = this.form.value;
      
      // Đảm bảo có số hiện tại
      let soHienTai = formValue.so_hien_tai;
      if (!soHienTai) {
        // Nếu không có số hiện tại, đặt dựa trên trạng thái
        if (formValue.trang_thai === 'chua_su_dung' || formValue.trang_thai === 'dang_su_dung') {
          soHienTai = formValue.tu_so;
        } else if (formValue.trang_thai === 'da_su_dung') {
          soHienTai = formValue.den_so;
        }
      }
      
      const data = {
        id: this.editingQuyenBienLai?.id,
        quyen_so: formValue.quyen_so,
        tu_so: formValue.tu_so,
        den_so: formValue.den_so,
        so_hien_tai: soHienTai,
        nhan_vien_thu: formValue.nhan_vien_thu,
        nguoi_cap: currentUser?.hoTen || currentUser?.userName,
        ngay_cap: new Date(),
        trang_thai: formValue.trang_thai
      };
      
      if (formValue.trang_thai === 'da_su_dung' && (!this.editingQuyenBienLai || this.editingQuyenBienLai.trang_thai !== 'da_su_dung')) {
        this.modal.confirm({
          nzTitle: 'Xác nhận trạng thái',
          nzContent: 'Bạn đang đặt trạng thái quyển biên lai là "Đã sử dụng". Sau khi lưu, bạn sẽ không thể chỉnh sửa quyển biên lai này nữa. Bạn có chắc chắn muốn tiếp tục?',
          nzOkText: 'Đồng ý',
          nzOkType: 'primary',
          nzOkDanger: true,
          nzOnOk: () => this.saveQuyenBienLai(data),
          nzCancelText: 'Hủy',
          nzOnCancel: () => {
            this.isOkLoading = false;
          }
        });
      } else {
        this.saveQuyenBienLai(data);
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

  handleCancel(): void {
    this.isVisible = false;
    this.editingQuyenBienLai = null;
  }

  edit(item: QuyenBienLai): void {
    this.modalTitle = 'Sửa quyển biên lai';
    this.editingQuyenBienLai = item;
    this.form.patchValue({
      quyen_so: item.quyen_so,
      tu_so: item.tu_so,
      den_so: item.den_so,
      nhan_vien_thu: item.nhan_vien_thu,
      trang_thai: item.trang_thai,
      so_hien_tai: item.so_hien_tai
    });
    this.isVisible = true;
  }

  delete(item: QuyenBienLai): void {
    if (!item.id) {
      this.message.error('Không tìm thấy ID quyển biên lai');
      return;
    }

    // Hiển thị modal xác nhận trước khi xóa
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa quyển biên lai ${item.quyen_so}?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        // Gọi API xóa
        this.quyenBienLaiService.deleteQuyenBienLai(item.id!).subscribe({
          next: () => {
            this.message.success('Xóa quyển biên lai thành công');
            this.loadData(); // Tải lại dữ liệu
          },
          error: (err) => {
            this.message.error('Lỗi khi xóa quyển biên lai: ' + (err.error?.message || 'Đã có lỗi xảy ra'));
            console.error(err);
          }
        });
      },
      nzCancelText: 'Hủy'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'chua_su_dung':
        return 'blue';
      case 'dang_su_dung':
        return 'green';
      case 'da_su_dung':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'chua_su_dung':
        return 'Chưa sử dụng';
      case 'dang_su_dung':
        return 'Đang sử dụng';
      case 'da_su_dung':
        return 'Đã sử dụng';
      default:
        return status;
    }
  }

  // Thêm custom validator
  validateSoThuTu(control: AbstractControl) {
    const form = control.parent as FormGroup;
    if (!form) return null;

    const tuSo = form.get('tu_so')?.value;
    const denSo = form.get('den_so')?.value;

    if (tuSo && denSo) {
      const tuSoNum = parseInt(tuSo);
      const denSoNum = parseInt(denSo);
      
      if (tuSoNum >= denSoNum) {
        return { soThuTuKhongHopLe: true };
      }
    }
    return null;
  }

  onNumberInput(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Loại bỏ các ký tự không phải số
    value = value.replace(/[^0-9]/g, '');
    
    // Giới hạn độ dài
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    
    // Cập nhật giá trị vào input và form control
    input.value = value;
    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      const control = this.form.get(controlName);
      if (control) {
        // Không gọi emitEvent để tránh trigger các validators liên tục
        control.setValue(value, { emitEvent: false });
        
        // Nếu đang nhập tu_so, tự động cập nhật den_so và so_hien_tai
        if (controlName === 'tu_so' && value) {
          const tuSo = parseInt(value);
          if (!isNaN(tuSo)) {
            // Tạo một timeout để giảm lag khi nhập liệu
            setTimeout(() => {
              const denSo = (tuSo + 49).toString().padStart(value.length, '0');
              
              // Luôn thiết lập số hiện tại = từ số khi thay đổi từ số (trừ khi đang chỉnh sửa)
              // Nếu đang ở trạng thái "đã sử dụng" thì số hiện tại = đến số
              const trangThai = this.form.get('trang_thai')?.value;
              if (trangThai === 'da_su_dung') {
                this.form.patchValue({
                  den_so: denSo,
                  so_hien_tai: denSo
                }, { emitEvent: false });
              } else {
                this.form.patchValue({
                  den_so: denSo,
                  so_hien_tai: value
                }, { emitEvent: false });
              }
            }, 100);
          }
        }
      }
    }
  }

  // Phương thức mới để xử lý nhập quyển số (cho phép nhập chữ và ký tự đặc biệt)
  onQuyenSoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Cập nhật giá trị vào form control mà không gọi sự kiện phức tạp
    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      const control = this.form.get(controlName);
      if (control) {
        control.setValue(value, { emitEvent: false });
        // Chỉ kích hoạt valueChanges khi người dùng ngừng nhập
        // Không gọi checkDuplicateQuyenSo ở đây nữa - sẽ gọi khi blur
      }
    }
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    // Chỉ cho phép chọn những quyển chưa sử dụng
    this.filteredQuyenBienLai
      .filter(item => item.trang_thai === 'chua_su_dung')
      .forEach(({ id }) => this.updateCheckedSet(id!, checked));
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    // Chỉ tính toán trạng thái checked dựa trên những quyển chưa sử dụng
    const listChuaSuDung = this.filteredQuyenBienLai.filter(item => item.trang_thai === 'chua_su_dung');
    
    // Nếu không có quyển nào chưa sử dụng, set checked và indeterminate về false
    if (listChuaSuDung.length === 0) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }

    // Kiểm tra xem tất cả các quyển chưa sử dụng có được chọn không
    this.checked = listChuaSuDung.every(({ id }) => this.setOfCheckedId.has(id!));
    
    // Kiểm tra xem có ít nhất một quyển được chọn nhưng không phải tất cả
    this.indeterminate = listChuaSuDung.some(({ id }) => this.setOfCheckedId.has(id!)) && !this.checked;
  }

  getDisplayName(user: NguoiDung): string {
    return user.ho_ten || 
           user.hoTen || 
           user.user_name || 
           user.userName || 
           user.username || 
           'Không có tên';
  }

  // Thêm phương thức validate số hiện tại
  validateSoHienTai(): void {
    const soHienTaiControl = this.form.get('so_hien_tai');
    const tuSoControl = this.form.get('tu_so');
    const denSoControl = this.form.get('den_so');

    if (!soHienTaiControl?.value || !tuSoControl?.value || !denSoControl?.value) {
      return; // Không validate nếu thiếu giá trị
    }

    try {
      // Thêm validator pattern
      soHienTaiControl.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      
      const soHienTai = parseInt(soHienTaiControl.value);
      const tuSo = parseInt(tuSoControl.value);
      const denSo = parseInt(denSoControl.value);

      // Kiểm tra số hiện tại nằm trong khoảng từ số đến đến số
      if (soHienTai < tuSo || soHienTai > denSo) {
        soHienTaiControl.setErrors({ soHienTaiKhongHopLe: true });
      } else {
        // Xóa lỗi soHienTaiKhongHopLe nếu có
        const errors = soHienTaiControl.errors;
        if (errors) {
          delete errors['soHienTaiKhongHopLe'];
          soHienTaiControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    } catch (error) {
      console.error('Lỗi khi validate số hiện tại:', error);
    }
  }

  // Phương thức xử lý khi thay đổi bộ lọc
  onFilterChange(): void {
    this.applyFilter();
  }

  // Phương thức đặt lại bộ lọc
  resetFilter(): void {
    this.selectedNguoiThu = 'all';
    this.selectedTrangThai = 'all';
    this.searchText = '';
    this.applyFilter();
  }

  // Phương thức áp dụng bộ lọc
  applyFilter(): void {
    let filtered = [...this.listQuyenBienLai];
    
    // Lọc theo người thu
    if (this.selectedNguoiThu !== 'all') {
      filtered = filtered.filter(item => item.nhan_vien_thu === this.selectedNguoiThu);
    }
    
    // Lọc theo trạng thái
    if (this.selectedTrangThai !== 'all') {
      filtered = filtered.filter(item => item.trang_thai === this.selectedTrangThai);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.quyen_so.toString().includes(searchLower) ||
        item.tu_so.toString().includes(searchLower) ||
        item.den_so.toString().includes(searchLower) ||
        (item.so_hien_tai && item.so_hien_tai.toString().includes(searchLower)) ||
        this.getNguoiThuName(item.nhan_vien_thu).toLowerCase().includes(searchLower) ||
        (item.nguoi_cap && item.nguoi_cap.toLowerCase().includes(searchLower))
      );
    }
    
    this.filteredQuyenBienLai = filtered;
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus();
  }

  // Lấy icon cho trạng thái
  getStatusIcon(status: string): string {
    switch (status) {
      case 'chua_su_dung':
        return 'inbox';
      case 'dang_su_dung':
        return 'check-circle';
      case 'da_su_dung':
        return 'file-done';
      default:
        return 'question-circle';
    }
  }

  // Đếm số quyển theo trạng thái
  getQuyenCount(status: string): number {
    return this.listQuyenBienLai.filter(item => item.trang_thai === status).length;
  }

  // Xem chi tiết quyển biên lai
  viewDetails(item: QuyenBienLai): void {
    this.selectedQuyenBienLai = item;
    this.isDetailVisible = true;
  }

  // Đóng modal chi tiết
  closeDetailModal(): void {
    this.isDetailVisible = false;
    this.selectedQuyenBienLai = null;
  }

  // Chuyển đổi dữ liệu từ selectedQuyenBienLai sang model QuyenBienLai
  mapToQuyenBienLaiModel(item: any): QuyenBienLaiModel | null {
    if (!item) return null;
    
    return {
      quyenSo: item.quyen_so,
      trangThai: this.getStatusText(item.trang_thai) as any,
      tuSo: item.tu_so,
      denSo: item.den_so,
      soHienTai: item.so_hien_tai,
      soLuongBienLai: this.calculateTotalReceipts(item),
      nguoiThu: this.getNguoiThuName(item.nhan_vien_thu),
      nguoiCap: item.nguoi_cap,
      ngayCap: item.ngay_cap,
      tienDoSuDung: this.calculateProgress(item),
      soLuongDaSuDung: this.getUsedCount(item)
    };
  }

  // Tính tổng số biên lai trong quyển
  calculateTotalReceipts(item: QuyenBienLai): number {
    const tuSo = parseInt(item.tu_so);
    const denSo = parseInt(item.den_so);
    return denSo - tuSo + 1;
  }

  // Tính số biên lai đã sử dụng
  getUsedCount(item: QuyenBienLai): number {
    if (item.trang_thai === 'chua_su_dung') {
      return 0;
    }
    
    const tuSo = parseInt(item.tu_so);
    const soHienTai = item.so_hien_tai ? parseInt(item.so_hien_tai) : tuSo;
    
    return soHienTai - tuSo;
  }

  // Tính phần trăm tiến độ sử dụng
  calculateProgress(item: QuyenBienLai): number {
    const total = this.calculateTotalReceipts(item);
    const used = this.getUsedCount(item);
    
    return Math.round((used / total) * 100);
  }

  // Lấy màu cho thanh tiến độ
  getProgressColor(percent: number): string {
    if (percent >= 90) {
      return '#ff4d4f'; // Đỏ - sắp hết
    } else if (percent >= 70) {
      return '#faad14'; // Vàng - đã sử dụng nhiều
    } else {
      return '#52c41a'; // Xanh lá - còn nhiều
    }
  }

  // Định dạng hiển thị tiến độ
  progressFormatFn = (percent: number): string => {
    return `${percent}%`;
  }

  // Kiểm tra quyển số có phải là dạng số không
  isNumericQuyenSo(quyenSo: string): boolean {
    return /^\d+$/.test(quyenSo);
  }

  // Tính toán giá trị gợi ý cho quyển số
  calculateSuggestedQuyenSo(): void {
    // Tìm quyển số lớn nhất trong danh sách
    const numericQuyenSo = this.listQuyenBienLai
      .map(q => q.quyen_so)
      .filter(qs => /^\d+$/.test(qs.toString())) // Chỉ lấy quyển số dạng số
      .map(qs => parseInt(qs.toString()));
      
    if (numericQuyenSo.length > 0) {
      const maxQuyenSo = Math.max(...numericQuyenSo);
      this.suggestedQuyenSo = (maxQuyenSo + 1).toString();
    } else {
      this.suggestedQuyenSo = '1';
    }
  }

  // Áp dụng gợi ý quyển số
  applySuggestedQuyenSo(): void {
    this.form.get('quyen_so')?.setValue(this.suggestedQuyenSo);
    this.checkDuplicateQuyenSo();
  }

  // Kiểm tra trùng lặp quyển số
  checkDuplicateQuyenSo(): void {
    const quyenSoControl = this.form.get('quyen_so');
    const quyenSoValue = quyenSoControl?.value;
    
    if (!quyenSoValue) {
      this.quyenSoStatus = '';
      return;
    }

    try {
      // Kiểm tra xem quyển số đã tồn tại chưa - chỉ tìm kiếm trong danh sách đã lọc
      const isDuplicate = this.listQuyenBienLai.some(item => 
        item.quyen_so === quyenSoValue && 
        (!this.editingQuyenBienLai || item.id !== this.editingQuyenBienLai.id)
      );

      if (isDuplicate) {
        quyenSoControl?.setErrors({ ...quyenSoControl.errors, duplicate: true });
        this.quyenSoStatus = 'error';
      } else {
        // Xóa lỗi duplicate nếu có
        if (quyenSoControl?.hasError('duplicate')) {
          const errors = { ...quyenSoControl.errors };
          delete errors['duplicate'];
          
          // Nếu không còn lỗi nào khác, set errors = null
          quyenSoControl.setErrors(Object.keys(errors).length ? errors : null);
        }
        
        this.quyenSoStatus = quyenSoControl?.invalid ? 'error' : 'success';
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trùng lặp quyển số:', error);
    }
  }

  // Xử lý khi thay đổi trạng thái
  onTrangThaiChange(value: string): void {
    if (value === 'da_su_dung') {
      // Hiển thị cảnh báo trong form
      // Cảnh báo đã được thêm vào template HTML
    }
    
    // Thiết lập số hiện tại dựa trên trạng thái
    const tuSoControl = this.form.get('tu_so');
    const denSoControl = this.form.get('den_so');
    
    if (tuSoControl?.value && denSoControl?.value) {
      const tuSo = parseInt(tuSoControl.value);
      const denSo = parseInt(denSoControl.value);
      
      if (value === 'chua_su_dung') {
        // Nếu chưa sử dụng, số hiện tại = từ số
        this.form.patchValue({ so_hien_tai: tuSoControl.value });
      } else if (value === 'dang_su_dung') {
        // Nếu đang sử dụng, giữ nguyên số hiện tại nếu đã có, nếu không thì lấy từ số
        const soHienTai = this.form.get('so_hien_tai')?.value;
        if (!soHienTai) {
          this.form.patchValue({ so_hien_tai: tuSoControl.value });
        }
      } else if (value === 'da_su_dung') {
        // Nếu đã sử dụng, số hiện tại = đến số
        this.form.patchValue({ so_hien_tai: denSoControl.value });
      }
    }
  }

  // Phương thức lưu quyển biên lai
  saveQuyenBienLai(data: any): void {
    if (this.editingQuyenBienLai) {
      this.quyenBienLaiService.updateQuyenBienLai(this.editingQuyenBienLai.id!, data).subscribe({
        next: () => {
          this.message.success('Cập nhật quyển biên lai thành công');
          this.isVisible = false;
          this.isOkLoading = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Lỗi khi cập nhật quyển biên lai');
          console.error(err);
          this.isOkLoading = false;
        }
      });
    } else {
      this.quyenBienLaiService.createQuyenBienLai(data).subscribe({
        next: () => {
          this.message.success('Thêm quyển biên lai thành công');
          this.isVisible = false;
          this.isOkLoading = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Lỗi khi thêm quyển biên lai');
          console.error(err);
          this.isOkLoading = false;
        }
      });
    }
  }

  // Phương thức debounce để tránh gọi hàm quá nhiều lần
  debounce(func: Function, wait: number) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      func();
    }, wait);
  }
} 