using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.Server.Models
{
    [Table("nguoi_dung")]
    public class NguoiDung
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_name")]
        [Required]
        [StringLength(50)]
        public string UserName { get; set; } = string.Empty;

        [Column("ho_ten")]
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; } = string.Empty;

        [Column("password")]
        [Required]
        [StringLength(100)]
        public string Password { get; set; } = string.Empty;

        [Column("don_vi_cong_tac")]
        [StringLength(200)]
        public string? DonViCongTac { get; set; }

        [Column("chuc_danh")]
        [StringLength(100)]
        public string? ChucDanh { get; set; }

        [Column("email")]
        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [Column("so_dien_thoai")]
        [StringLength(20)]
        public string? SoDienThoai { get; set; }

        [Column("is_super_admin")]
        public bool IsSuperAdmin { get; set; }

        [Column("type_mang_luoi")]
        public int? TypeMangLuoi { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("status")]
        public int Status { get; set; } = 1;

        [Column("client_id")]
        [StringLength(100)]
        public string? ClientId { get; set; }

        [Column("roles")]
        public string[]? Roles { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("ma_nhan_vien")]
        [StringLength(20)]
        public string? MaNhanVien { get; set; }
    }
} 