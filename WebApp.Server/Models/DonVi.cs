using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    public class DonVi
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("ma_co_quan_bhxh")]
        [StringLength(10)]
        public string MaCoQuanBHXH { get; set; }
        [Column("ma_so_bhxh")]
        [StringLength(10)]
        public string MaSoBHXH { get; set; }
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
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}