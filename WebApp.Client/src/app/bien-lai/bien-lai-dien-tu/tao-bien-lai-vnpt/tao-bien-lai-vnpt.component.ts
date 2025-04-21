import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { VNPTBienLaiService } from '../../../services/vnpt-bien-lai.service';
import { PublishInvoiceRequest } from '../../../services/vnpt-bien-lai.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tao-bien-lai-vnpt',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzCardModule,
    NzDividerModule,
    NzSpinModule,
    NzModalModule
  ],
  templateUrl: './tao-bien-lai-vnpt.component.html',
  styleUrls: ['./tao-bien-lai-vnpt.component.scss']
})
export class TaoBienLaiVNPTComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private vnptBienLaiService: VNPTBienLaiService,
    private message: NzMessageService,
    private modal: NzModalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  // Hàm định dạng tiền VND
  formatterVND = (value: number): string => `${value.toLocaleString('vi-VN')} đ`;
  parserVND = (value: string): number => parseInt(value.replace(/[^0-9]/g, ''), 10);

  initForm(): void {
    this.form = this.fb.group({
      tenNguoiDong: ['', [Validators.required]],
      maSoBHXH: ['', [Validators.required]],
      soTien: [0, [Validators.required, Validators.min(1000)]],
      ghiChu: [''],
      isBHYT: [true],
      isBHXH: [false]
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }

    this.isLoading = true;
    const formData = this.form.value;

    const request: PublishInvoiceRequest = {
      bienLaiId: 0, // Tạo biên lai mới
      tenNguoiDong: formData.tenNguoiDong,
      maSoBHXH: formData.maSoBHXH,
      soTien: formData.soTien,
      ghiChu: formData.ghiChu,
      isBHYT: formData.isBHYT,
      isBHXH: formData.isBHXH
    };

    this.vnptBienLaiService.publishInvoice(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.message.success('Tạo biên lai điện tử thành công');

          // Hiển thị thông báo khi phát hành thành công
          this.modal.success({
            nzTitle: 'Tạo biên lai điện tử thành công',
            nzContent: 'Biên lai điện tử đã được tạo thành công và sẵn sàng sử dụng.'
          });
          this.form.reset();
          this.form.patchValue({
            soTien: 0,
            isBHYT: true,
            isBHXH: false
          });

          // Chuyển hướng đến trang quản lý biên lai
          this.router.navigate(['/bien-lai/bien-lai-dien-tu/quan-ly']);
        } else {
          this.message.error(response.message || 'Có lỗi khi tạo biên lai điện tử');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Lỗi khi tạo biên lai điện tử:', error);
        this.message.error(error.error?.message || 'Có lỗi khi tạo biên lai điện tử');
      }
    });
  }
}
