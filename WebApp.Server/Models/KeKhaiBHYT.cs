using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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
        [Column("id")]
        public int id { get; set; }

        /// <summary>
        /// ID đợt kê khai
        /// </summary>
        [Required]
        [Column("dot_ke_khai_id")]
        public int dot_ke_khai_id { get; set; }

        /// <summary>
        /// Navigation property cho đợt kê khai
        /// </summary>
        [JsonIgnore]
        [ForeignKey("dot_ke_khai_id")]
        public virtual DotKeKhai? DotKeKhai { get; set; }

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
        public string? phuong_an_dong { get; set; }

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
        /// Tỉnh nhận quyết định
        /// </summary>
        [Required]
        [StringLength(20)]
        public string tinh_nkq { get; set; }

        /// <summary>
        /// Huyện nhận quyết định
        /// </summary>
        [Required]
        [StringLength(20)]
        public string huyen_nkq { get; set; }

        /// <summary>
        /// Xã nhận quyết định
        /// </summary>
        [Required]
        [StringLength(20)]
        public string xa_nkq { get; set; }

        /// <summary>
        /// Địa chỉ nhận quyết định
        /// </summary>
        [Required]
        [StringLength(200)]
        public string dia_chi_nkq { get; set; }

        /// <summary>
        /// Bệnh viện khám chữa bệnh (mã)
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

        /// <summary>
        /// Ngày biên lai
        /// </summary>
        public DateTime? ngay_bien_lai { get; set; }

        /// <summary>
        /// Số tiền cần đóng
        /// </summary>
        [Column("so_tien_can_dong")]
        public decimal so_tien_can_dong { get; set; }

        /// <summary>
        /// Đánh dấu kê khai cần xử lý gấp
        /// </summary>
        [Column("is_urgent")]
        public bool is_urgent { get; set; }

        /// <summary>
        /// Trạng thái kê khai
        /// </summary>
        [Column("trang_thai")]
        [Required]
        [StringLength(50)]
        public string trang_thai { get; set; } = "chua_gui";

        /// <summary>
        /// Số biên lai
        /// </summary>
        [StringLength(20)]
        public string? so_bien_lai { get; set; }

        /// <summary>
        /// Mã số hồ sơ của đợt kê khai
        /// </summary>
        [StringLength(50)]
        public string? ma_ho_so { get; set; }

        /// <summary>
        /// Mã nhân viên
        /// </summary>
        [Column("ma_nhan_vien")]
        [StringLength(50)]
        public string? ma_nhan_vien { get; set; }

        public int? quyen_bien_lai_id { get; set; }

        [ForeignKey("quyen_bien_lai_id")]
        public virtual QuyenBienLai? QuyenBienLai { get; set; }

        // Navigation property cho BienLai
        [InverseProperty("KeKhaiBHYT")]
        public virtual BienLai? BienLai { get; set; }

        // Thêm constructor để khởi tạo các giá trị mặc định cho non-nullable properties
        public KeKhaiBHYT()
        {
            phuong_an_dong = "";
            tinh_nkq = "";
            huyen_nkq = "";
            xa_nkq = "";
            dia_chi_nkq = "";
            benh_vien_kcb = "";
            nguoi_tao = "";
            trang_thai = "chua_gui";
            ngay_tao = DateTime.Now;
            ThongTinThe = new ThongTinThe(); // Khởi tạo ThongTinThe
        }
    }
}