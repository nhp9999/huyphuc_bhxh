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

        [Column("tien_lai")]
        public decimal tien_lai { get; set; }

        [Column("tien_thua")]
        public decimal tien_thua { get; set; }

        [Column("so_tien_can_dong")]
        public decimal so_tien_can_dong { get; set; }

        [Column("phuong_thuc_dong")]
        public int phuong_thuc_dong { get; set; }

        [Column("thang_bat_dau")]
        public string thang_bat_dau { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
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
        public string? ghi_chu { get; set; }

        [Column("nguoi_tao")]
        public string nguoi_tao { get; set; }

        [Column("ngay_tao")]
        public DateTime ngay_tao { get; set; }

        [Column("is_urgent")]
        public bool is_urgent { get; set; }

        [Column("trang_thai")]
        public string trang_thai { get; set; }

        [Column("ma_nhan_vien")]
        [Required(ErrorMessage = "Mã nhân viên không được để trống")]
        public string ma_nhan_vien { get; set; } = "";

        [Column("tinh_nkq")]
        public string? tinh_nkq { get; set; }

        [Column("huyen_nkq")]
        public string? huyen_nkq { get; set; }

        [Column("xa_nkq")]
        public string? xa_nkq { get; set; }

        [Column("ma_ho_so")]
        [StringLength(50)]
        public string? ma_ho_so { get; set; }

        [Column("he_so")]
        public int? he_so { get; set; }

        [ForeignKey("thong_tin_the_id")]
        public virtual ThongTinThe? ThongTinThe { get; set; }

        [ForeignKey("dot_ke_khai_id")]
        public virtual DotKeKhai? DotKeKhai { get; set; }
    }
}