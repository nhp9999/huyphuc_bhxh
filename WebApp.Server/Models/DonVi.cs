using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("don_vi")]
    public class DonVi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("ma_co_quan_bhxh")]
        [StringLength(10)]
        public string MaCoQuanBHXH { get; set; }

        [Required]
        [Column("ma_so_bhxh")]
        [StringLength(10)]
        public string MaSoBHXH { get; set; }

        [Required]
        [Column("ten_don_vi")]
        [StringLength(255)]
        public string TenDonVi { get; set; }

        [Column("is_bhxhtn")]
        public bool IsBHXHTN { get; set; }

        [Column("is_bhyt")]
        public bool IsBHYT { get; set; }

        [Column("dm_khoi_kcb_id")]
        public int? DmKhoiKcbId { get; set; }

        [Column("type")]
        public int Type { get; set; }

        [Column("trang_thai")]
        public bool TrangThai { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}