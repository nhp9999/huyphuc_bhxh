using System;
using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Models
{
    public class ThongTinThe
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(10)]
        public string ma_so_bhxh { get; set; }

        [Required]
        [StringLength(12)]
        public string cccd { get; set; }

        [Required]
        [StringLength(100)]
        public string ho_ten { get; set; }

        [Required]
        [StringLength(50)]
        public string ngay_sinh { get; set; }

        [Required]
        [StringLength(3)]
        public string gioi_tinh { get; set; }

        [StringLength(15)]
        public string so_dien_thoai { get; set; }

        [StringLength(10)]
        public string? ma_tinh_ks { get; set; }

        [StringLength(20)]
        public string ma_hgd { get; set; }

        [Required]
        [StringLength(50)]
        public string nguoi_tao { get; set; }

        public DateTime ngay_tao { get; set; }

        /// <summary>
        /// Mã huyện KS
        /// </summary>
        [StringLength(50)]
        public string? ma_huyen_ks { get; set; }

        /// <summary>
        /// Mã xã KS
        /// </summary>
        [StringLength(50)]
        public string? ma_xa_ks { get; set; }

        /// <summary>
        /// Mã tỉnh nơi khám, chữa bệnh
        /// </summary>
        [StringLength(50)]
        public string? ma_tinh_nkq { get; set; }

        /// <summary>
        /// Mã huyện nơi khám, chữa bệnh
        /// </summary>
        [StringLength(50)]
        public string? ma_huyen_nkq { get; set; }

        /// <summary>
        /// Mã xã nơi khám, chữa bệnh
        /// </summary>
        [StringLength(50)]
        public string? ma_xa_nkq { get; set; }

        /// <summary>
        /// Số thẻ BHYT
        /// </summary>
        [StringLength(15)]
        public string? so_the_bhyt { get; set; }

        /// <summary>
        /// Mã dân tộc
        /// </summary>
        [StringLength(50)]
        public string? ma_dan_toc { get; set; }

        /// <summary>
        /// Quốc tịch
        /// </summary>
        [Required]
        [StringLength(10)]
        [System.ComponentModel.DefaultValue("VN")]
        public string quoc_tich { get; set; } = "VN";

        /// <summary>
        /// Mã bệnh viện
        /// </summary>
        [StringLength(50)]
        public string? ma_benh_vien { get; set; }
    }
}