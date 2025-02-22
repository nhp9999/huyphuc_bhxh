using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.API.Models;

namespace WebApp.API.Models
{
    public enum TinhChatBienLai
    {
        [Column(TypeName = "text")]
        bien_lai_goc = 0,
        [Column(TypeName = "text")]
        bien_lai_huy_bo = 1
    }

    public class BienLai
    {
        [Key]
        public int id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string quyen_so { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)] 
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
        public int ke_khai_bhyt_id { get; set; }

        [ForeignKey("ke_khai_bhyt_id")]
        public virtual KeKhaiBHYT? KeKhaiBHYT { get; set; }

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
    }
} 