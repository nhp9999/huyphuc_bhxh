export interface QuyenBienLai {
  quyenSo: string;
  trangThai: 'Đang sử dụng' | 'Đã hết' | 'Đã hủy';
  tuSo: string;
  denSo: string;
  soHienTai: string;
  soLuongBienLai: number;
  nguoiThu: string;
  nguoiCap: string;
  ngayCap: Date | string;
  tienDoSuDung: number; // Phần trăm đã sử dụng
  soLuongDaSuDung?: number; // Số lượng biên lai đã sử dụng
} 