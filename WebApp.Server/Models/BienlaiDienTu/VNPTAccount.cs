using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models.BienlaiDienTu
{
    [Table("vnpt_accounts")]
    public class VNPTAccount
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("ma_nhan_vien")]
        [StringLength(50)]
        public string MaNhanVien { get; set; } = string.Empty;

        [Required]
        [Column("account")]
        [StringLength(100)]
        public string Account { get; set; } = string.Empty;

        [Required]
        [Column("acpass")]
        [StringLength(100)]
        public string ACPass { get; set; } = string.Empty;

        [Required]
        [Column("username")]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [Column("password")]
        [StringLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Column("pattern")]
        [StringLength(20)]
        public string Pattern { get; set; } = string.Empty;

        [Required]
        [Column("serial")]
        [StringLength(20)]
        public string Serial { get; set; } = string.Empty;

        [Required]
        [Column("service_url")]
        [StringLength(255)]
        public string ServiceUrl { get; set; } = "https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx";

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
