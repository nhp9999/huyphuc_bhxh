using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.API.Models;

namespace WebApp.Server.Models
{
    [Table("dai_ly_don_vi")]
    public class DaiLyDonVi
    {
        public DaiLyDonVi()
        {
            NguoiTao = string.Empty;
            TrangThai = true;
            NgayTao = DateTime.UtcNow;
        }

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("dai_ly_id")]
        public int DaiLyId { get; set; }

        [Column("don_vi_id")]
        public int DonViId { get; set; }

        [Column("trang_thai")]
        public bool TrangThai { get; set; }

        [Column("ngay_tao")]
        public DateTime NgayTao { get; set; }

        [Column("nguoi_tao")]
        [StringLength(50)]
        public string NguoiTao { get; set; }

        [ForeignKey("DaiLyId")]
        public virtual DaiLy DaiLy { get; set; }

        [ForeignKey("DonViId")]
        public virtual DonVi DonVi { get; set; }
    }
} 