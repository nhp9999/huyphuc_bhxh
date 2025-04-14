using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.API.Models;

namespace WebApp.API.Models.BienlaiDienTu
{
    [Table("quyen_bien_lai_dien_tu")]
    public class QuyenBienLaiDienTu
    {
        public QuyenBienLaiDienTu()
        {
            ky_hieu = "BH25-AG/08907/E";
            tu_so = "0000001";
            den_so = "9999999";
            nguoi_cap = "Admin";
            trang_thai = "chua_su_dung";
            ma_co_quan_bhxh = "";
        }

        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(20)]
        public string ky_hieu { get; set; }

        [Required] 
        [StringLength(20)]
        public string tu_so { get; set; }

        [Required]
        [StringLength(20)] 
        public string den_so { get; set; }

        public DateTime ngay_cap { get; set; }

        [StringLength(50)]
        public string nguoi_cap { get; set; }

        [Required]
        [StringLength(20)]
        public string trang_thai { get; set; }

        [StringLength(20)]
        public string? so_hien_tai { get; set; }

        [StringLength(20)]
        public string? ma_co_quan_bhxh { get; set; }
    }
} 