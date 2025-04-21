-- Thêm các cột mới cho tích hợp VNPT vào bảng bien_lai_dien_tu
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS is_published_to_vnpt BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS vnpt_key VARCHAR(100);
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS vnpt_response VARCHAR(255);
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS vnpt_pattern VARCHAR(20);
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS vnpt_serial VARCHAR(20);
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS vnpt_invoice_no VARCHAR(20);
ALTER TABLE bien_lai_dien_tu ADD COLUMN IF NOT EXISTS vnpt_publish_date TIMESTAMP WITH TIME ZONE;

-- Kiểm tra xem các cột đã được thêm thành công chưa
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'bien_lai_dien_tu' AND 
    column_name IN (
        'is_published_to_vnpt', 
        'vnpt_key', 
        'vnpt_response', 
        'vnpt_pattern', 
        'vnpt_serial', 
        'vnpt_invoice_no', 
        'vnpt_publish_date'
    );
