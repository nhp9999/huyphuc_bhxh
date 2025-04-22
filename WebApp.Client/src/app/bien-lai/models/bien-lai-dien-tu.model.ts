export interface QuyenBienLaiDienTu {
  id?: number;
  ky_hieu: string;
  tu_so: string;
  den_so: string;
  so_hien_tai?: string;
  nguoi_cap: string;
  ngay_cap?: string;
  ngay_tao?: string;
  trang_thai?: string;
  ma_co_quan_bhxh: string;
}

export interface QuyenBienLaiDienTuResponse {
  id: number;
  ky_hieu: string;
  tu_so: string;
  den_so: string;
  so_hien_tai: string;
  nguoi_cap: string;
  ngay_cap: string;
  ngay_tao: string;
  trang_thai: string;
  ma_co_quan_bhxh: string;
}

export interface BienLaiDienTu {
  id?: number;
  quyen_bien_lai_dien_tu_id: number;
  ky_hieu?: string;
  so_bien_lai?: string;
  ten_nguoi_dong: string;
  so_tien: number;
  ghi_chu?: string;
  ma_so_bhxh: string;
  ma_nhan_vien: string;
  ma_co_quan_bhxh: string;
  ma_so_bhxh_don_vi: string;
  is_bhyt: boolean;
  is_bhxh: boolean;
  tinh_chat: string;
  ngay_tao?: string;
  nguoi_tao_id?: number;
  // VNPT Biên lai điện tử integration fields
  vnpt_key?: string;
  vnpt_response?: string;
  vnpt_pattern?: string;
  vnpt_serial?: string;
  vnpt_invoice_no?: string;
  is_published_to_vnpt?: boolean;
  vnpt_publish_date?: string;
  vnpt_link?: string;
  vnpt_transaction_id?: string;
}

export interface BienLaiDienTuResponse {
  id: number;
  quyen_bien_lai_dien_tu_id: number;
  ky_hieu: string;
  so_bien_lai: string;
  ten_nguoi_dong: string;
  so_tien: number;
  ghi_chu: string;
  ma_so_bhxh: string;
  ma_nhan_vien: string;
  ma_co_quan_bhxh: string;
  ma_so_bhxh_don_vi: string;
  is_bhyt: boolean;
  is_bhxh: boolean;
  tinh_chat: string;
  ngay_tao: string;
  nguoi_tao_id: number;
  // VNPT Biên lai điện tử integration fields
  vnpt_key: string;
  vnpt_response: string;
  vnpt_pattern: string;
  vnpt_serial: string;
  vnpt_invoice_no: string;
  is_published_to_vnpt: boolean;
  vnpt_publish_date: string;
  vnpt_link: string;
  vnpt_transaction_id: string;
}