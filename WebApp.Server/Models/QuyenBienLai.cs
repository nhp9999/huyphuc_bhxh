using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.API.Models;

namespace WebApp.API.Models
{
    [Table("quyen_bien_lai")]
    public class QuyenBienLai
    {
        public QuyenBienLai()
        {
            quyen_so = string.Empty;
            tu_so = string.Empty;
            den_so = string.Empty;
            nguoi_cap = string.Empty;
            trang_thai = "chua_su_dung";
        }

        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(20)]
        public string quyen_so { get; set; }

        [Required] 
        [StringLength(20)]
        public string tu_so { get; set; }

        [Required]
        [StringLength(20)] 
        public string den_so { get; set; }

        [Required]
        [Column("nhan_vien_thu")]
        public int nhan_vien_thu { get; set; }

        [ForeignKey("nhan_vien_thu")]
        public virtual NguoiDung? NguoiThu { get; set; }

        public DateTime ngay_cap { get; set; }

        [Required]
        [StringLength(50)]
        public string nguoi_cap { get; set; }

        [Required]
        [StringLength(20)]
        public string trang_thai { get; set; }

        [StringLength(20)]
        public string? so_hien_tai { get; set; }
    }
} 