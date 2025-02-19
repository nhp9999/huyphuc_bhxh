using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using WebApp.API.Models;

namespace WebApp.Server.Models
{
    [Table("dai_ly")]
    public class DaiLy
    {
        public DaiLy()
        {
            Ma = string.Empty;
            Ten = string.Empty;
            DiaChi = string.Empty;
            SoDienThoai = string.Empty;
            Email = string.Empty;
            NguoiDaiDien = string.Empty;
            NguoiTao = string.Empty;
            NgayTao = DateTime.UtcNow;
            TrangThai = true;
            DonVis = new List<DonVi>();
        }

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("ma")]
        [Required]
        [StringLength(20)]
        public string Ma { get; set; }

        [Column("ten")]
        [Required]
        [StringLength(200)]
        public string Ten { get; set; }

        [Column("dia_chi")]
        public string DiaChi { get; set; }

        [Column("so_dien_thoai")]
        [StringLength(15)]
        public string SoDienThoai { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string Email { get; set; }

        [Column("nguoi_dai_dien")]
        [StringLength(100)]
        public string NguoiDaiDien { get; set; }

        [Column("trang_thai")]
        public bool TrangThai { get; set; }

        [Column("ngay_tao")]
        public DateTime NgayTao { get; set; }

        [Column("nguoi_tao")]
        [StringLength(50)]
        public string NguoiTao { get; set; }

        public virtual ICollection<DonVi> DonVis { get; set; }
    }
} 