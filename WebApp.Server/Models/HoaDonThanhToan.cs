using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    public class HoaDonThanhToan
    {
        [Key]
        [Column("id")]
        public int id { get; set; }

        [Required]
        [Column("dot_ke_khai_id")]
        public int dot_ke_khai_id { get; set; }

        [Column("ngay_thanh_toan")]
        public DateTime ngay_thanh_toan { get; set; } = DateTime.UtcNow;

        [Column("so_tien")]
        public decimal so_tien { get; set; }

        [Required]
        [Column("noi_dung_thanh_toan")]
        public string noi_dung_thanh_toan { get; set; }

        [Required]
        [Column("url_bill")]
        public string url_bill { get; set; }

        [Column("public_id")]
        public string public_id { get; set; }

        [Required]
        [Column("trang_thai")]
        public string trang_thai { get; set; }

        [Required]
        [Column("nguoi_tao")]
        public string nguoi_tao { get; set; }

        [Column("ngay_tao")]
        public DateTime ngay_tao { get; set; } = DateTime.UtcNow;

        [Column("ghi_chu")]
        public string? ghi_chu { get; set; } = string.Empty;

        [Column("deleted_at")]
        public DateTime? deleted_at { get; set; }

        [Column("deleted_by")]
        public int? deleted_by { get; set; }

        // Navigation property
        [ForeignKey("dot_ke_khai_id")]
        public virtual DotKeKhai? DotKeKhai { get; set; }

        public HoaDonThanhToan()
        {
            noi_dung_thanh_toan = string.Empty;
            url_bill = string.Empty;
            public_id = string.Empty;
            trang_thai = "cho_duyet";
            nguoi_tao = string.Empty;
            ghi_chu = string.Empty;
            ngay_tao = DateTime.UtcNow;
            ngay_thanh_toan = DateTime.UtcNow;
        }
    }
} 