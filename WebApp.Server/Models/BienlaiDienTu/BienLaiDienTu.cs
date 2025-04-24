using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.API.Models;

namespace WebApp.API.Models.BienlaiDienTu
{
    public enum TinhChatBienLaiDienTu
    {
        [Column(TypeName = "text")]
        bien_lai_goc = 0,
        [Column(TypeName = "text")]
        bien_lai_huy_bo = 1
    }

    [Table("bien_lai_dien_tu")]
    public class BienLaiDienTu
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(20)]
        public string ky_hieu { get; set; } = "BH25-AG/08907/E";

        [Required]
        [StringLength(20)]
        public string so_bien_lai { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ten_nguoi_dong { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal so_tien { get; set; }

        [StringLength(500)]
        public string? ghi_chu { get; set; }

        [Required]
        [StringLength(20)]
        public string trang_thai { get; set; } = "active";

        [Required]
        public DateTime ngay_tao { get; set; } = DateTime.Now;

        [Required]
        public DateTime ngay_bien_lai { get; set; } = DateTime.Now;

        // Foreign key
        public int? ke_khai_bhyt_id { get; set; }

        [ForeignKey("ke_khai_bhyt_id")]
        public virtual KeKhaiBHYT? KeKhaiBHYT { get; set; }

        // Foreign key to QuyenBienLaiDienTu
        public int quyen_bien_lai_dien_tu_id { get; set; }

        [ForeignKey("quyen_bien_lai_dien_tu_id")]
        public virtual QuyenBienLaiDienTu? QuyenBienLaiDienTu { get; set; }

        [Required]
        [StringLength(10)]
        public string ma_so_bhxh { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ma_nhan_vien { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "text")]
        public string tinh_chat { get; set; } = "bien_lai_goc";

        [Required]
        [StringLength(20)]
        public string ma_co_quan_bhxh { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string ma_so_bhxh_don_vi { get; set; } = string.Empty;

        [Required]
        public bool is_bhyt { get; set; }

        [Required]
        public bool is_bhxh { get; set; }

        // VNPT Biên lai điện tử integration fields
        [StringLength(100)]
        public string? vnpt_key { get; set; }

        [StringLength(255)]
        public string? vnpt_response { get; set; }

        [StringLength(20)]
        public string? vnpt_pattern { get; set; }

        [StringLength(20)]
        public string? vnpt_serial { get; set; }

        [StringLength(20)]
        public string? vnpt_invoice_no { get; set; }

        public bool is_published_to_vnpt { get; set; } = false;

        public DateTime? vnpt_publish_date { get; set; }

        [StringLength(500)]
        public string? vnpt_link { get; set; }

        [StringLength(100)]
        public string? vnpt_transaction_id { get; set; }

        [Column(TypeName = "text")]
        public string? vnpt_xml_content { get; set; }
    }
}