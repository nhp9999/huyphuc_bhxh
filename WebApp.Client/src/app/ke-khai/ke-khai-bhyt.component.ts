export class KeKhaiBHYTComponent {
  // ... existing code

  capNhatSoBienLai(keKhai: any): void {
    const modalRef = this.modal.create({
      nzTitle: 'Cập nhật số biên lai',
      nzContent: `
        <nz-form-item>
          <nz-form-label [nzSpan]="8">Số biên lai</nz-form-label>
          <nz-form-control [nzSpan]="16">
            <input nz-input [(ngModel)]="soBienLai" placeholder="Nhập số biên lai">
          </nz-form-control>
        </nz-form-item>
      `,
      nzOkText: 'Cập nhật',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        if (!this.soBienLai) {
          this.message.error('Vui lòng nhập số biên lai');
          return false;
        }

        this.quyenBienLaiService.kiemTraSoBienLaiHopLe(keKhai.quyen_bien_lai_id, this.soBienLai)
          .subscribe({
            next: () => {
              this.quyenBienLaiService.capNhatSoBienLai(keKhai.id, this.soBienLai)
                .subscribe({
                  next: () => {
                    this.message.success('Cập nhật số biên lai thành công');
                    this.loadData();
                  },
                  error: (err) => {
                    this.message.error(err.error?.message || 'Lỗi khi cập nhật số biên lai');
                  }
                });
            },
            error: (err) => {
              this.message.error(err.error?.message || 'Số biên lai không hợp lệ');
              return false;
            }
          });
      }
    });
  }
} 