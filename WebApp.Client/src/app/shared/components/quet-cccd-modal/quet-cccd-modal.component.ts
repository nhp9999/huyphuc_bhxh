import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CCCDService } from '../../../services/cccd.service';

export interface CCCDResult {
  id: string;
  name: string;
  dob: string;
  sex: string;
  nationality: string;
  home_address?: any;
  permanent_address?: any;
  address?: string;
  issue_date?: string;
  issue_place?: string;
  ngaySinhFormatted?: string;
  gioiTinh?: string;
  status: 'success' | 'error';
  message?: string;
  checked: boolean;
}

@Component({
  selector: 'app-quet-cccd-modal',
  templateUrl: './quet-cccd-modal.component.html',
  styleUrls: ['./quet-cccd-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzCheckboxModule,
    NzSelectModule,
    NzBadgeModule,
    NzEmptyModule,
    NzToolTipModule,
    NzUploadModule
  ]
})
export class QuetCCCDModalComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() applyData = new EventEmitter<CCCDResult[]>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  // Data properties
  avatarUrls: string[] = [];
  pendingFiles: File[] = [];
  currentImageIndex = 0;
  danhSachCCCD: CCCDResult[] = [];
  filteredCCCDList: CCCDResult[] = [];

  // UI state
  loadingQuetCCCD = false;
  selectedTabIndex = 0;
  filterStatus: 'success' | 'error' | null = null;
  isAllChecked = false;
  isIndeterminate = false;

  // Options
  applyPermanentAddress = true;
  applyHomeAddress = false;
  loadingApDung = false;

  constructor(
    private message: NzMessageService,
    private cccdService: CCCDService
  ) { }

  ngOnInit(): void {
  }

  // Handle modal visibility
  handleCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // File upload handlers
  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }

    const isLt5M = (file.size || 0) / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    this.addFile(file as any);
    return false;
  };

  handleChange(info: any): void {
    if (info.file.status === 'uploading') {
      return;
    }
  }

  addFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrls = [...this.avatarUrls, e.target.result];
      this.pendingFiles = [...this.pendingFiles, file];
      this.currentImageIndex = this.avatarUrls.length - 1;
    };
    reader.readAsDataURL(file);
  }

  // Image management
  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  removeImage(index: number): void {
    this.avatarUrls = this.avatarUrls.filter((_, i) => i !== index);
    this.pendingFiles = this.pendingFiles.filter((_, i) => i !== index);

    if (this.currentImageIndex >= this.avatarUrls.length) {
      this.currentImageIndex = Math.max(0, this.avatarUrls.length - 1);
    }
  }

  clearImages(): void {
    this.avatarUrls = [];
    this.pendingFiles = [];
    this.currentImageIndex = 0;
    this.danhSachCCCD = [];
    this.filteredCCCDList = [];
    this.filterStatus = null;
  }

  addMoreImages(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/jpeg,image/png';
    input.onchange = (e: any) => {
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        this.addFile(files[i]);
      }
    };
    input.click();
  }

  // Clipboard handling
  handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          this.addFile(file);
          event.preventDefault();
          return;
        }
      }
    }
  }

  requestPasteFromClipboard(): void {
    this.message.info('Nhấn Ctrl+V để dán ảnh từ clipboard');
    if (this.modalContent && this.modalContent.nativeElement) {
      this.modalContent.nativeElement.focus();
    }
  }

  // CCCD scanning
  async quetTatCaCCCD(): Promise<void> {
    if (this.pendingFiles.length === 0) {
      this.message.warning('Vui lòng tải lên ít nhất một ảnh CCCD!');
      return;
    }

    this.loadingQuetCCCD = true;
    this.danhSachCCCD = [];

    try {
      for (const file of this.pendingFiles) {
        try {
          const response = await firstValueFrom(this.cccdService.quetCCCD(file));

          // FPT.AI trả về dữ liệu trong response.data
          if (response && response.data && response.data.length > 0) {
            const cccdData = response.data[0];

            // Log the full response to see what fields are available
            console.log('CCCD API Response Data:', cccdData);

            // Format ngày sinh
            let ngaySinhFormatted = '';
            if (cccdData.dob) {
              const parts = cccdData.dob.split('/');
              if (parts.length === 3) {
                ngaySinhFormatted = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
              } else {
                ngaySinhFormatted = cccdData.dob;
              }
            }

            // Xác định giới tính
            let gioiTinh = '';
            if (cccdData.sex) {
              gioiTinh = cccdData.sex.toLowerCase() === 'nam' || cccdData.sex.toLowerCase() === 'male' ? 'Nam' : 'Nữ';
            }

            // Extract home address (quê quán) from the appropriate field
            // FPT.AI might return home address in a different field name or format
            let homeAddress = null;

            // Log all fields to help debug
            console.log('Checking for home address fields in CCCD data:', cccdData);

            // Check for various possible field names for home address
            if (cccdData.home_address) {
              homeAddress = cccdData.home_address;
              console.log('Found home_address:', homeAddress);
            } else if (cccdData.origin_location) {
              // Some APIs use origin_location for home address/place of origin
              homeAddress = cccdData.origin_location;
              console.log('Found origin_location:', homeAddress);
            } else if (cccdData.place_of_origin) {
              // Alternative field name
              homeAddress = cccdData.place_of_origin;
              console.log('Found place_of_origin:', homeAddress);
            } else if (cccdData.que_quan) {
              // Vietnamese specific field
              homeAddress = cccdData.que_quan;
              console.log('Found que_quan:', homeAddress);
            } else if (cccdData.origin) {
              // Another alternative field name
              homeAddress = cccdData.origin;
              console.log('Found origin:', homeAddress);
            } else if (cccdData.hometown) {
              // Another alternative field name
              homeAddress = cccdData.hometown;
              console.log('Found hometown:', homeAddress);
            }

            // Check if we have a field that contains "que_quan" in its name
            for (const key in cccdData) {
              if (key.toLowerCase().includes('que') || key.toLowerCase().includes('origin') || key.toLowerCase().includes('home')) {
                if (!homeAddress && cccdData[key]) {
                  homeAddress = cccdData[key];
                  console.log(`Found home address in field ${key}:`, homeAddress);
                  break;
                }
              }
            }

            // Extract permanent address (nơi thường trú) from the appropriate field
            let permanentAddress = null;
            if (cccdData.permanent_address) {
              permanentAddress = cccdData.permanent_address;
            } else if (cccdData.current_address) {
              // Alternative field name
              permanentAddress = cccdData.current_address;
            } else if (cccdData.residence_address) {
              // Alternative field name
              permanentAddress = cccdData.residence_address;
            } else if (cccdData.noi_thuong_tru) {
              // Vietnamese specific field
              permanentAddress = cccdData.noi_thuong_tru;
            }

            // If we have address but not specific types, try to parse it
            if (cccdData.address && typeof cccdData.address === 'string') {
              console.log('Trying to extract addresses from general address field:', cccdData.address);
              const addressStr = cccdData.address.toLowerCase();

              // If we don't have a home address yet, check if the address contains keywords for home address
              if (!homeAddress && (
                  addressStr.includes('quê quán') ||
                  addressStr.includes('place of origin') ||
                  addressStr.includes('home address') ||
                  addressStr.includes('quê') ||
                  addressStr.includes('origin') ||
                  addressStr.includes('home')
                )) {
                // Try to extract the home address part
                const parts = addressStr.split(/[;:,.]/);
                for (const part of parts) {
                  if (part.includes('quê quán') ||
                      part.includes('place of origin') ||
                      part.includes('home address') ||
                      part.includes('quê') ||
                      part.includes('origin') ||
                      part.includes('home')) {
                    homeAddress = part.replace(/quê quán|place of origin|home address|quê|origin|home/i, '').trim();
                    console.log('Extracted home address from general address:', homeAddress);
                    break;
                  }
                }
              }

              // If we don't have a permanent address yet, check if the address contains keywords for permanent address
              if (!permanentAddress && (
                  addressStr.includes('thường trú') ||
                  addressStr.includes('permanent address') ||
                  addressStr.includes('residence') ||
                  addressStr.includes('trú') ||
                  addressStr.includes('permanent') ||
                  addressStr.includes('current')
                )) {
                // Try to extract the permanent address part
                const parts = addressStr.split(/[;:,.]/);
                for (const part of parts) {
                  if (part.includes('thường trú') ||
                      part.includes('permanent address') ||
                      part.includes('residence') ||
                      part.includes('trú') ||
                      part.includes('permanent') ||
                      part.includes('current')) {
                    permanentAddress = part.replace(/thường trú|permanent address|residence|trú|permanent|current/i, '').trim();
                    console.log('Extracted permanent address from general address:', permanentAddress);
                    break;
                  }
                }
              }

              // If we still don't have either address, use the full address
              if (!permanentAddress) {
                permanentAddress = cccdData.address;
                console.log('Using general address as permanent address:', permanentAddress);
              }

              // If we still don't have home address, also use the full address
              if (!homeAddress) {
                homeAddress = cccdData.address;
                console.log('Using general address as home address:', homeAddress);
              }
            }

            // If we still don't have a home address, create a placeholder
            if (!homeAddress) {
              homeAddress = "Không có thông tin";
            }

            // If we still don't have a permanent address, create a placeholder
            if (!permanentAddress) {
              permanentAddress = "Không có thông tin";
            }

            const result: CCCDResult = {
              id: cccdData.id || '',
              name: cccdData.name || '',
              dob: cccdData.dob || '',
              sex: cccdData.sex || '',
              nationality: cccdData.nationality || 'Việt Nam',
              home_address: homeAddress,
              permanent_address: permanentAddress,
              address: cccdData.address || '',
              issue_date: cccdData.issue_date || '',
              issue_place: cccdData.issue_place || '',
              ngaySinhFormatted,
              gioiTinh,
              status: 'success',
              message: '',
              checked: false
            };

            this.danhSachCCCD = [...this.danhSachCCCD, result];
          } else {
            const errorResult: CCCDResult = {
              id: '',
              name: '',
              dob: '',
              sex: '',
              nationality: '',
              address: '',
              status: 'error',
              message: 'Không nhận dạng được thông tin',
              checked: false
            };
            this.danhSachCCCD = [...this.danhSachCCCD, errorResult];
          }
        } catch (error: any) {
          const errorResult: CCCDResult = {
            id: '',
            name: '',
            dob: '',
            sex: '',
            nationality: '',
            address: '',
            status: 'error',
            message: error?.error?.message || error?.message || 'Lỗi khi xử lý ảnh',
            checked: false
          };
          this.danhSachCCCD = [...this.danhSachCCCD, errorResult];
        }
      }

      this.filteredCCCDList = [...this.danhSachCCCD];
      this.selectedTabIndex = 1; // Switch to results tab

      const successCount = this.danhSachCCCD.filter(item => item.status === 'success').length;
      this.message.success(`Đã quét ${successCount}/${this.danhSachCCCD.length} CCCD thành công`);
    } catch (error) {
      this.message.error('Có lỗi xảy ra khi quét CCCD');
    } finally {
      this.loadingQuetCCCD = false;
    }
  }

  // Filter and selection
  applyFilter(): void {
    if (this.filterStatus === null) {
      this.filteredCCCDList = [...this.danhSachCCCD];
    } else {
      this.filteredCCCDList = this.danhSachCCCD.filter(item => item.status === this.filterStatus);
    }
    this.refreshCheckStatus();
  }

  onAllChecked(checked: boolean): void {
    this.filteredCCCDList.forEach(item => {
      if (item.status === 'success') {
        item.checked = checked;
      }
    });
    this.refreshCheckStatus();
  }

  onCCCDChecked(item: CCCDResult, checked: boolean): void {
    item.checked = checked;
    this.refreshCheckStatus();
  }

  refreshCheckStatus(): void {
    const validItems = this.filteredCCCDList.filter(item => item.status === 'success');
    const allChecked = validItems.length > 0 && validItems.every(item => item.checked);
    const allUnchecked = validItems.every(item => !item.checked);

    this.isAllChecked = allChecked;
    this.isIndeterminate = !allChecked && !allUnchecked;
  }

  selectAllSuccess(): void {
    this.danhSachCCCD.forEach(item => {
      if (item.status === 'success') {
        item.checked = true;
      }
    });
    this.refreshCheckStatus();
  }

  // Utility methods
  formatFullAddress(address: any): string {
    if (!address) return 'N/A';

    // Log the address to help debug
    console.log('Formatting address:', address);

    // If address is a string, return it directly
    if (typeof address === 'string') {
      // Clean up the address string
      let cleanAddress = address.trim();

      // Remove any "Không có thông tin" text
      if (cleanAddress === 'Không có thông tin') {
        return 'N/A';
      }

      // Remove any common prefixes that might be in the address
      const prefixes = ['quê quán:', 'quê quán', 'nơi thường trú:', 'nơi thường trú', 'địa chỉ:', 'địa chỉ'];
      for (const prefix of prefixes) {
        if (cleanAddress.toLowerCase().startsWith(prefix.toLowerCase())) {
          cleanAddress = cleanAddress.substring(prefix.length).trim();
          break;
        }
      }

      return cleanAddress || 'N/A';
    }

    // If address is an object, try to extract parts
    if (typeof address === 'object') {
      // Check if it's an empty object
      if (!address || Object.keys(address).length === 0) {
        return 'N/A';
      }

      // Try to extract address parts
      const parts = [];

      // Handle different possible property names
      if (address.street) parts.push(address.street);
      if (address.ward) parts.push(address.ward);
      if (address.district) parts.push(address.district);
      if (address.province) parts.push(address.province);

      // Alternative property names
      if (address.address) parts.push(address.address);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.country) parts.push(address.country);

      // Vietnamese specific property names
      if (address.xa) parts.push(address.xa);
      if (address.huyen) parts.push(address.huyen);
      if (address.tinh) parts.push(address.tinh);
      if (address.phuong) parts.push(address.phuong);
      if (address.quan) parts.push(address.quan);
      if (address.thanhpho) parts.push(address.thanhpho);

      // If we have parts, join them
      if (parts.length > 0) {
        return parts.join(', ');
      }

      // If we have a text property, use that
      if (address.text) {
        return address.text;
      }

      // If we have a value property, use that
      if (address.value) {
        return address.value;
      }

      // Last resort: stringify the object but make it readable
      try {
        // Try to convert to a readable string, removing quotes and braces
        const addressStr = JSON.stringify(address)
          .replace(/[{}"]/g, '')
          .replace(/,/g, ', ')
          .replace(/:/g, ': ');
        return addressStr || 'N/A';
      } catch (e) {
        console.error('Error formatting address:', e);
        return 'N/A';
      }
    }

    // Fallback
    return 'N/A';
  }

  hasSelectedCCCD(): boolean {
    return this.danhSachCCCD.some(item => item.checked && item.status === 'success');
  }

  getSuccessCount(): number {
    return this.danhSachCCCD.filter(item => item.status === 'success').length;
  }

  hasSuccessResults(): boolean {
    return this.danhSachCCCD.some(item => item.status === 'success');
  }

  hasErrorResults(): boolean {
    return this.danhSachCCCD.some(item => item.status === 'error');
  }

  // Apply data
  apDungNhieuCCCD(): void {
    const selectedCCCDs = this.danhSachCCCD.filter(item => item.checked && item.status === 'success');

    if (selectedCCCDs.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một CCCD để áp dụng');
      return;
    }

    this.loadingApDung = true;

    setTimeout(() => {
      this.applyData.emit(selectedCCCDs);
      this.loadingApDung = false;
      this.handleCancel();
    }, 500);
  }
}
