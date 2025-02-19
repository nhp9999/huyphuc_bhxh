using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.Server.Models;

namespace WebApp.API.Models
{
    [Table("don_vi")]
    public class DonVi
    {
        public DonVi()
        {
            MaCoQuanBHXH = string.Empty;
            MaSoBHXH = string.Empty;
            TenDonVi = string.Empty;
            Type = 0;
            TrangThai = true;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            DaiLys = new List<DaiLy>();
        }

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
        public bool TrangThai { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        public virtual ICollection<DaiLy> DaiLys { get; set; }
    }
}