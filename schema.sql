CREATE TABLE public.quyen_bien_lai (
    id SERIAL PRIMARY KEY,
    quyen_so VARCHAR(20) NOT NULL,
    tu_so VARCHAR(20) NOT NULL, 
    den_so VARCHAR(20) NOT NULL,
    nguoi_thu INTEGER NOT NULL,
    ngay_cap TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nguoi_cap VARCHAR(50) NOT NULL,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'chua_su_dung',
    so_hien_tai VARCHAR(20),
    FOREIGN KEY (nguoi_thu) REFERENCES public.nguoi_dung(id)
);

-- Thêm cột số biên lai vào bảng ke_khai_bhyt
ALTER TABLE public.ke_khai_bhyt 
ADD COLUMN so_bien_lai VARCHAR(20);

-- Thêm cột quyen_bien_lai_id vào bảng ke_khai_bhyt
ALTER TABLE public.ke_khai_bhyt 
ADD COLUMN quyen_bien_lai_id INTEGER,
ADD CONSTRAINT fk_ke_khai_bhyt_quyen_bien_lai 
FOREIGN KEY (quyen_bien_lai_id) 
REFERENCES public.quyen_bien_lai(id); 