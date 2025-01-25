using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    /// <summary>
    /// Model quản lý kê khai BHYT
    /// </summary>
    public class KeKhaiBHYT
    {
        /// <summary>
        /// ID kê khai BHYT
        /// </summary>
        [Key]
        public int id { get; set; }

        /// <summary>
        /// ID đợt kê khai
        /// </summary>
        [Required]
        public int dot_ke_khai_id { get; set; }

        /// <summary>
        /// Navigation property cho đợt kê khai
        /// </summary>
        [ForeignKey("dot_ke_khai_id")]
        public virtual DotKeKhai DotKeKhai { get; set; }

        /// <summary>
        /// ID thông tin thẻ
        /// </summary>
        [Required]
        public int thong_tin_the_id { get; set; }

        /// <summary>
        /// Navigation property cho thông tin thẻ
        /// </summary>
        [ForeignKey("thong_tin_the_id")]
        public virtual ThongTinThe ThongTinThe { get; set; }

        /// <summary>
        /// Người thu
        /// </summary>
        [Required]
        [Range(1, int.MaxValue)]
        public int nguoi_thu { get; set; }

        /// <summary>
        /// Số tháng đóng
        /// </summary>
        [Required]
        [Range(1, int.MaxValue)]
        public int so_thang_dong { get; set; }

        /// <summary>
        /// Phương án đóng
        /// </summary>
        [Required]
        [StringLength(50)]
        public string phuong_an_dong { get; set; }

        /// <summary>
        /// Hạn thẻ cũ
        /// </summary>
        public DateTime? han_the_cu { get; set; }

        /// <summary>
        /// Hạn thẻ mới từ
        /// </summary>
        [Required]
        public DateTime han_the_moi_tu { get; set; }

        /// <summary>
        /// Hạn thẻ mới đến
        /// </summary>
        [Required]
        public DateTime han_the_moi_den { get; set; }

        /// <summary>
        /// Tình nhận quyết định
        /// </summary>
        [Required]
        [StringLength(100)]
        public string tinh_nkq { get; set; }

        /// <summary>
        /// Huyện nhận quyết định
        /// </summary>
        [Required]
        [StringLength(100)]
        public string huyen_nkq { get; set; }

        /// <summary>
        /// Xã nhận quyết định
        /// </summary>
        [Required]
        [StringLength(100)]
        public string xa_nkq { get; set; }

        /// <summary>
        /// Địa chỉ nhận quyết định
        /// </summary>
        [Required]
        [StringLength(200)]
        public string dia_chi_nkq { get; set; }

        /// <summary>
        /// Bệnh viện khám chữa bệnh
        /// </summary>
        [Required]
        [StringLength(200)]
        public string benh_vien_kcb { get; set; }

        /// <summary>
        /// Người tạo
        /// </summary>
        [Required]
        [StringLength(50)]
        public string nguoi_tao { get; set; }

        /// <summary>
        /// Ngày tạo
        /// </summary>
        public DateTime ngay_tao { get; set; }
    }
} 