# Hướng dẫn sử dụng biến màu sắc trong dự án

## Giới thiệu

File này hướng dẫn cách sử dụng biến màu sắc trong dự án để đảm bảo tính nhất quán và dễ bảo trì. Tất cả các màu sắc trong dự án nên được lấy từ các biến đã được định nghĩa trong file `variables.scss`.

## Cách sử dụng biến màu sắc

### 1. Trong file SCSS

Để sử dụng biến màu sắc trong file SCSS của component, bạn cần import file biến:

```scss
@import "src/styles/variables.scss";

.my-component {
  color: $primary-color;
  background-color: $background-color-light;
  border: 1px solid $border-color;
}
```

### 2. Sử dụng các class tiện ích

Dự án đã định nghĩa sẵn một số class tiện ích trong file `styles.scss`:

```html
<div class="text-primary">Văn bản màu chính</div>
<div class="bg-success">Nền màu thành công</div>
<div class="border-danger">Viền màu cảnh báo</div>
```

### 3. Sử dụng với ng-zorro-antd

Các biến CSS của ng-zorro-antd đã được tùy chỉnh trong file `styles.scss`. Bạn có thể sử dụng các component của ng-zorro-antd mà không cần thêm style:

```html
<button nz-button nzType="primary">Nút với màu chính</button>
<nz-alert nzType="success" nzMessage="Thông báo thành công"></nz-alert>
```

## Danh sách biến màu sắc

### Màu sắc chính
- `$primary-color`: Màu chính của dự án (#004080)
- `$primary-color-light`: Màu chính nhạt (#1890ff)
- `$primary-color-dark`: Màu chính đậm (#003366)

### Màu sắc phụ
- `$secondary-color`: Màu phụ (#52c41a)
- `$danger-color`: Màu nguy hiểm (#ff4d4f)
- `$warning-color`: Màu cảnh báo (#faad14)
- `$success-color`: Màu thành công (#52c41a)
- `$info-color`: Màu thông tin (#1890ff)

### Màu sắc văn bản
- `$text-color`: Màu văn bản chính (rgba(0, 0, 0, 0.85))
- `$text-color-secondary`: Màu văn bản phụ (rgba(0, 0, 0, 0.65))
- `$text-color-disabled`: Màu văn bản bị vô hiệu hóa (rgba(0, 0, 0, 0.45))
- `$text-color-light`: Màu văn bản nhạt (#8c8c8c)

### Màu sắc nền
- `$background-color`: Màu nền chính (#fff)
- `$background-color-light`: Màu nền nhạt (#f0f2f5)
- `$background-color-dark`: Màu nền đậm (#001529)

### Màu sắc viền
- `$border-color`: Màu viền chính (#d9d9d9)
- `$border-color-split`: Màu viền phân tách (#f0f0f0)

## Thay đổi theme

Nếu bạn muốn thay đổi theme của dự án, chỉ cần cập nhật các giá trị trong file `variables.scss`. Tất cả các component sử dụng biến màu sắc sẽ tự động cập nhật.

## Quy tắc sử dụng màu sắc

1. **KHÔNG** sử dụng mã màu cứng (hardcoded) trong các file SCSS
2. Luôn sử dụng biến màu sắc đã được định nghĩa
3. Nếu cần thêm màu mới, hãy thêm vào file `variables.scss`
4. Sử dụng các class tiện ích khi có thể để giảm thiểu việc viết CSS 