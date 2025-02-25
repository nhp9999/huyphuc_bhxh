using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("ke_khai_bhxh")]
    public class KeKhaiBHXH
    {
        [Key]
        [Column("id")]
        public int id { get; set; }

        [Column("dot_ke_khai_id")]
        public int dot_ke_khai_id { get; set; }

        [Column("thong_tin_the_id")]
        public int thong_tin_the_id { get; set; }

        [Column("muc_thu_nhap")]
        public decimal muc_thu_nhap { get; set; }

        [Column("ty_le_dong")]
        public decimal ty_le_dong { get; set; }

        [Column("ty_le_nsnn")]
        public decimal? ty_le_nsnn { get; set; }

        [Column("loai_nsnn")]
        public string loai_nsnn { get; set; }

        [Column("tien_ho_tro")]
        public decimal tien_ho_tro { get; set; }

        [Column("so_tien_phai_dong")]
        public decimal so_tien_phai_dong { get; set; }

        [Column("phuong_thuc_dong")]
        public int phuong_thuc_dong { get; set; }

        [Column("thang_bat_dau")]
        public DateTime thang_bat_dau { get; set; }

        [Column("tu_thang")]
        public DateTime? tu_thang { get; set; }

        [Column("so_thang_dong")]
        public int so_thang_dong { get; set; }

        [Column("phuong_an")]
        public string phuong_an { get; set; }

        [Column("loai_khai_bao")]
        public string loai_khai_bao { get; set; }

        [Column("ngay_bien_lai")]
        public DateTime? ngay_bien_lai { get; set; }

        [Column("so_bien_lai")]
        public string so_bien_lai { get; set; }

        [Column("quyen_bien_lai_id")]
        public int? quyen_bien_lai_id { get; set; }

        [Column("ghi_chu")]
        public string ghi_chu { get; set; }

        [Column("nguoi_tao")]
        public string nguoi_tao { get; set; }

        [Column("ngay_tao")]
        public DateTime ngay_tao { get; set; }

        [Column("is_urgent")]
        public bool is_urgent { get; set; }

        [Column("trang_thai")]
        public string trang_thai { get; set; }

        [ForeignKey("thong_tin_the_id")]
        public virtual ThongTinThe ThongTinThe { get; set; }

        [ForeignKey("dot_ke_khai_id")]
        public virtual DotKeKhai DotKeKhai { get; set; }
    }
} 