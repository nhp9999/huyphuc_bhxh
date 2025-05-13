import { Component, EventEmitter, Input, OnInit, Output, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SSMV2Service } from '../../../services/ssmv2.service';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-captcha-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzToolTipModule
  ],
  templateUrl: './captcha-modal.component.html',
  styleUrls: ['./captcha-modal.component.scss']
})
export class CaptchaModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() userName = '';
  @Input() password = '';
  @Input() loading = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() login = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  captchaForm: FormGroup;
  captchaImage: string = '';
  captchaCode: string = '';
  isLoading = false;

  private fb = inject(FormBuilder);
  private ssmv2Service = inject(SSMV2Service);
  private message = inject(NzMessageService);

  constructor() {
    this.captchaForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      text: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]]
    });
  }

  ngOnInit(): void {
    // Khi component được khởi tạo, lấy captcha mới
    if (this.visible) {
      this.getCaptcha();
    }
  }

  ngOnChanges(): void {
    // Cập nhật giá trị form khi input thay đổi
    if (this.userName && this.password) {
      this.captchaForm.patchValue({
        userName: this.userName,
        password: this.password
      });
    }

    // Lấy captcha mới khi modal hiển thị
    if (this.visible) {
      this.getCaptcha();
    }
  }

  getCaptcha(): void {
    this.isLoading = true;
    this.ssmv2Service.getCaptcha().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.captchaImage = res.data.image;
          this.captchaCode = res.data.code;

          // Kiểm tra xem captchaImage có tiền tố data:image chưa
          if (this.captchaImage && !this.captchaImage.startsWith('data:')) {
            this.captchaImage = 'data:image/png;base64,' + this.captchaImage;
          }
        } else {
          this.message.error('Không nhận được dữ liệu captcha');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Captcha error:', err);
        this.message.error('Lỗi khi lấy captcha: ' + err.message);
      }
    });
  }

  convertToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.captchaForm.get('text')?.setValue(input.value);
  }

  handleCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.captchaForm.get('text')?.reset();
  }

  handleOk(): void {
    if (this.captchaForm.invalid) {
      Object.values(this.captchaForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const loginData = {
      grant_type: 'password',
      userName: this.captchaForm.get('userName')?.value,
      password: this.captchaForm.get('password')?.value,
      text: this.captchaForm.get('text')?.value,
      code: this.captchaCode,
      clientId: 'ZjRiYmI5ZTgtZDcyOC00ODRkLTkyOTYtMDNjYmUzM2U4Yjc5',
      isWeb: true
    };

    this.login.emit(loginData);
  }
}
