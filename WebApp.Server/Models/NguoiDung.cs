using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("nguoi_dung")]
    public class NguoiDung
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(50)]
        public string user_name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ho_ten { get; set; } = string.Empty;

        [StringLength(200)]
        public string? don_vi_cong_tac { get; set; }

        [StringLength(100)]
        public string? chuc_danh { get; set; }

        [StringLength(100)]
        public string? email { get; set; }

        [StringLength(20)]
        public string? so_dien_thoai { get; set; }

        public bool is_super_admin { get; set; } = false;

        public int? type_mang_luoi { get; set; }

        public int? user_id { get; set; }

        public int status { get; set; } = 1;

        [StringLength(100)]
        public string? client_id { get; set; }

        public string[]? roles { get; set; }

        public DateTime? created_at { get; set; }

        public DateTime? updated_at { get; set; }

        [Required]
        [StringLength(100)]
        public string password { get; set; } = string.Empty;

        [StringLength(20)]
        public string? ma_nhan_vien { get; set; }
    }
} 