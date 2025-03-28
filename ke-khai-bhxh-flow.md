# Tài liệu về luồng làm việc của chức năng kê khai BHXH

## Giới thiệu

Tài liệu này mô tả chi tiết luồng làm việc của chức năng kê khai bảo hiểm xã hội tự nguyện trong ứng dụng. Chức năng này cho phép người dùng tìm kiếm, xem, thêm mới, cập nhật và xóa thông tin kê khai BHXH của khách hàng.

## Cấu trúc thành phần

### Các file chính
- **ke-khai-bhxh.component.ts**: Xử lý logic và dữ liệu
- **ke-khai-bhxh.component.html**: Giao diện người dùng
- **ke-khai-bhxh.component.scss**: Định dạng CSS
- **ke-khai-bhxh.service.ts**: Gọi API liên quan đến kê khai BHXH
- **dot-ke-khai.service.ts**: Quản lý thông tin đợt kê khai
- **ssmv2.service.ts**: Xác thực và tương tác với API SSMV2

### Các service được sử dụng

1. **KeKhaiBHXHService**
   - Quản lý các thao tác CRUD với kê khai BHXH
   - Tìm kiếm thông tin BHXH từ hệ thống SSMV2
   - Cung cấp các phương thức gọi API

2. **DotKeKhaiService**
   - Quản lý các đợt kê khai
   - Cung cấp thông tin về các đợt kê khai

3. **DiaChiService**
   - Quản lý thông tin địa chỉ (tỉnh, huyện, xã)
   - Hỗ trợ tìm kiếm và chọn địa chỉ

4. **SSMV2Service**
   - Xác thực với hệ thống SSMV2
   - Quản lý token để truy cập API SSMV2

## Luồng làm việc chính

### 1. Khởi tạo component

```typescript
ngOnInit(): void {
  // Thêm CSS cho modal đăng nhập
  // Khởi tạo form
  this.initForm();
  // Lấy ID đợt kê khai từ route
  this.loadDanhMucTinh();
  // Thiết lập các sự kiện thay đổi giá trị form
  this.setupFormValueChanges();
}
```

### 2. Tìm kiếm thông tin BHXH

- Người dùng nhập mã số BHXH vào form
- Hệ thống gọi API thông qua KeKhaiBHXHService để tìm kiếm thông tin
- Nếu cần, hệ thống hiển thị modal đăng nhập vào SSMV2 và lấy captcha
- Sau khi đăng nhập thành công, hệ thống lấy thông tin BHXH và điền vào form

```typescript
searchBHXH(): void {
  // Kiểm tra mã số BHXH
  // Hiển thị loading
  // Gọi service tìm kiếm
  this.keKhaiBHXHService.searchBHXH(maSoBHXH).subscribe(
    (response) => {
      // Xử lý kết quả
      this.processSearchResult(response.data);
    },
    (error) => {
      // Kiểm tra nếu cần đăng nhập
      if (error.message === 'Unauthorized') {
        this.getCaptcha();
        this.isLoginVisible = true;
      } else {
        this.message.error(error.message || 'Có lỗi xảy ra khi tìm kiếm thông tin BHXH');
      }
    }
  );
}
```

### 3. Đăng nhập vào SSMV2 (nếu cần)

- Hiển thị modal đăng nhập với captcha
- Xác thực thông tin đăng nhập
- Lưu token và gọi lại API tìm kiếm

```typescript
handleLogin(): void {
  // Kiểm tra form
  // Hiển thị loading
  // Gọi API đăng nhập
  this.ssmv2Service.login(loginData).subscribe(
    (response) => {
      // Lưu token
      // Đóng modal
      // Tìm kiếm lại thông tin BHXH
      this.searchBHXH();
    },
    (error) => {
      // Xử lý lỗi
    }
  );
}
```

### 4. Tính toán số tiền phải đóng

- Dựa trên mức thu nhập, tỷ lệ đóng, và thông tin NSNN
- Cập nhật giá trị số tiền phải đóng trên form

```typescript
tinhSoTienPhaiDong(): void {
  // Lấy thông tin từ form
  // Tính toán số tiền phải đóng
  const soThangDong = this.form.get('phuong_thuc_dong')?.value;
  const mucThuNhap = this.form.get('muc_thu_nhap')?.value;
  const tyLeDong = this.form.get('ty_le_dong')?.value / 100;
  const tyLeNSNN = this.form.get('ty_le_nsnn')?.value / 100;
  
  // Tính toán số tiền
  let soTien = mucThuNhap * tyLeDong * soThangDong;
  const soTienHoTro = mucThuNhap * tyLeNSNN * soThangDong;
  soTien = soTien - soTienHoTro;
  
  // Cập nhật form
  this.form.patchValue({
    so_tien_can_dong: soTien
  });
}
```

### 5. Lưu thông tin kê khai

- Thu thập dữ liệu từ form
- Kiểm tra tính hợp lệ
- Gọi API lưu thông tin kê khai

```typescript
saveKeKhaiBHXH(): void {
  // Kiểm tra form
  // Thu thập dữ liệu
  // Kiểm tra trùng lặp
  this.checkDuplicateBHXH(this.form.get('ma_so_bhxh')?.value).subscribe(
    (isDuplicate) => {
      if (isDuplicate) {
        this.message.error('Mã số BHXH đã tồn tại trong đợt kê khai này!');
        return;
      }
      
      // Xử lý và gửi dữ liệu
      this.processKeKhaiBHXH();
    }
  );
}
```

### 6. Xử lý và gửi dữ liệu kê khai

```typescript
processKeKhaiBHXH(): void {
  // Hiển thị loading
  // Chuẩn bị dữ liệu
  const keKhaiBHXH = {
    // Thông tin cá nhân
    // Thông tin kê khai
    // Thông tin địa chỉ
  };
  
  // Gọi API lưu thông tin
  this.keKhaiBHXHService.create(this.dotKeKhaiId, keKhaiBHXH).subscribe(
    (response) => {
      // Hiển thị thông báo thành công
      // Làm mới form
    },
    (error) => {
      // Xử lý lỗi
    }
  );
}
```

### 7. Xóa dữ liệu kê khai

```typescript
deleteKeKhaiBHXH(id: number): void {
  // Hiển thị modal xác nhận
  this.modal.confirm({
    // Thông tin xác nhận
    onOk: () => {
      // Gọi API xóa
      this.keKhaiBHXHService.delete(this.dotKeKhaiId, id).subscribe(
        () => {
          // Hiển thị thông báo thành công
          // Cập nhật danh sách
        },
        (error) => {
          // Xử lý lỗi
        }
      );
    }
  });
}
```

## Các chức năng phụ trợ

### Quản lý địa chỉ
- Tải danh sách tỉnh/thành phố
- Cập nhật danh sách huyện/quận khi chọn tỉnh
- Cập nhật danh sách xã/phường khi chọn huyện

### Định dạng dữ liệu
- Định dạng tiền tệ
- Định dạng phần trăm
- Định dạng ngày tháng

### Kiểm tra dữ liệu
- Kiểm tra mã số BHXH
- Kiểm tra CCCD
- Kiểm tra trùng lặp

## Các lưu ý

1. Chức năng tìm kiếm BHXH yêu cầu xác thực với hệ thống SSMV2
2. Cần xử lý các tình huống mất kết nối hoặc lỗi xác thực
3. Dữ liệu địa chỉ được lưu cache để tối ưu hiệu năng
4. Các tính toán số tiền cần được thực hiện chính xác
5. Cần kiểm tra kỹ dữ liệu trước khi lưu

## Điểm cần cải thiện

1. Tối ưu hóa hiệu suất khi tải danh sách địa chỉ lớn
2. Cải thiện UX khi tìm kiếm và điền thông tin BHXH
3. Tăng cường xác thực dữ liệu nhập
4. Thêm tính năng xuất báo cáo 