import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { D03Service, D03TSOptions } from '../services/d03.service';
import { DotKeKhaiService } from '../../services/dot-ke-khai.service';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-xuat-mau-d03',
  templateUrl: './xuat-mau-d03.component.html',
  styleUrl: './xuat-mau-d03.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule
  ]
})
export class XuatMauD03Component implements OnInit {
  xuatForm: FormGroup;
  isLoading = false;
  dotKeKhaiList: any[] = [];

  constructor(
    private d03Service: D03Service,
    private dotKeKhaiService: DotKeKhaiService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.xuatForm = this.fb.group({
      dotKeKhaiId: [null],
      tenCongTy: ['CÔNG TY TNHH MTV THƯƠNG MẠI DỊCH VỤ HUY PHÚC'],
      maDonVi: ['2803132'],
      diaChi: ['Khánh Ninh Thành, Tổ Tình Cờ Đình Hương Khánh Hòa, An Khê, Gia Lai'],
      soDienThoai: ['0346697548'],
      email: ['ngocchidung@outlook.com'],
      nguoiLap: ['Nguyễn Văn A']
    });
  }

  ngOnInit(): void {
    this.loadDotKeKhai();
  }

  loadDotKeKhai(): void {
    this.isLoading = true;
    this.dotKeKhaiService.getDotKeKhais().subscribe({
      next: (data: any) => {
        this.dotKeKhaiList = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách đợt kê khai:', err);
        this.message.error('Có lỗi xảy ra khi tải danh sách đợt kê khai');
        this.isLoading = false;
      }
    });
  }

  exportExcel(): void {
    if (!this.xuatForm.value.dotKeKhaiId) {
      this.message.warning('Vui lòng chọn đợt kê khai');
      return;
    }

    this.isLoading = true;
    
    const options: D03TSOptions = {
      tenCongTy: this.xuatForm.value.tenCongTy,
      maDonVi: this.xuatForm.value.maDonVi,
      diaChi: this.xuatForm.value.diaChi,
      soDienThoai: this.xuatForm.value.soDienThoai,
      email: this.xuatForm.value.email,
      nguoiLap: this.xuatForm.value.nguoiLap,
      ngayLap: new Date()
    };

    try {
      this.d03Service.xuatExcelMauD03TSTuDotKeKhai(
        this.xuatForm.value.dotKeKhaiId,
        options
      );
      this.isLoading = false;
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      this.message.error('Có lỗi xảy ra khi xuất Excel mẫu D03-TS');
      this.isLoading = false;
    }
  }
}
