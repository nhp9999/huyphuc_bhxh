using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using WebApp.API.Models;
using WebApp.Server.Models;

namespace WebApp.API.Models
{
    /// <summary>
    /// Model quản lý đợt kê khai
    /// </summary>
    [Table("dot_ke_khai")]
    public class DotKeKhai
    {
        /// <summary>
        /// ID đợt kê khai
        /// </summary>
        [Column("id")]
        public int id { get; set; }

        /// <summary>
        /// Tên đợt kê khai (định dạng: Đợt [số đợt] Tháng [tháng] năm [năm])
        /// </summary>
        [Required(ErrorMessage = "Tên đợt kê khai không được để trống")]
        [StringLength(200, ErrorMessage = "Tên đợt kê khai không được vượt quá 200 ký tự")]
        [RegularExpression(@"^Đợt \d+ Tháng \d{1,2} năm \d{4}$", 
            ErrorMessage = "Tên đợt phải có định dạng: Đợt [số đợt] Tháng [tháng] năm [năm]")]
        public string ten_dot { get; set; } = string.Empty;

        /// <summary>
        /// Số đợt trong năm
        /// </summary>
        [Required(ErrorMessage = "Số đợt không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số đợt phải lớn hơn 0")]
        public int so_dot { get; set; }

        /// <summary>
        /// Tháng kê khai
        /// </summary>
        [Required(ErrorMessage = "Tháng không được để trống")]
        [Range(1, 12, ErrorMessage = "Tháng phải từ 1 đến 12")]
        public int thang { get; set; }

        /// <summary>
        /// Năm kê khai
        /// </summary>
        [Required(ErrorMessage = "Năm không được để trống")]
        [Range(2000, 9999, ErrorMessage = "Năm phải từ 2000 đến 9999")]
        public int nam { get; set; }

        /// <summary>
        /// Loại dịch vụ (BHXH TN, BHYT)
        /// </summary>
        [Required(ErrorMessage = "Loại dịch vụ không được để trống")]
        [StringLength(10)]
        public string dich_vu { get; set; } = "BHXH TN";

        /// <summary>
        /// Ghi chú cho đợt kê khai
        /// </summary>
        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string? ghi_chu { get; set; } = string.Empty;

        /// <summary>
        /// Trạng thái đợt kê khai
        /// </summary>
        public string trang_thai { get; set; } = "chua_gui";

        /// <summary>
        /// Ngày tạo đợt kê khai
        /// </summary>
        public DateTime ngay_tao { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Ngày gửi đợt kê khai
        /// </summary>
        [Column("ngay_gui")]
        public DateTime? ngay_gui { get; set; }

        /// <summary>
        /// Người tạo đợt kê khai
        /// </summary>
        [Required(ErrorMessage = "Người tạo không được để trống")]
        public string nguoi_tao { get; set; } = string.Empty;

        /// <summary>
        /// Tạo tên đợt tự động theo định dạng: Đợt [số đợt] Tháng [tháng] năm [năm]
        /// </summary>
        public void GenerateTenDot()
        {
            // Đảm bảo số đợt, tháng và năm đều hợp lệ
            if (so_dot > 0 && thang >= 1 && thang <= 12 && nam >= 2000)
            {
                ten_dot = $"Đợt {so_dot} Tháng {thang} năm {nam}";
            }
        }

        [Column("don_vi_id")]
        [ForeignKey("DonVi")]
        [Required(ErrorMessage = "Đơn vị không được để trống")]
        public int don_vi_id { get; set; }
        public virtual DonVi? DonVi { get; set; }

        [Column("tong_so_tien")]
        public decimal? tong_so_tien { get; set; }

        [Column("tong_so_the")]
        public int? tong_so_the { get; set; }

        [Column("url_bill")]
        public string? url_bill { get; set; }

        [Column("ma_ho_so")]
        [StringLength(50)]
        public string? ma_ho_so { get; set; }

        [Column("is_bien_lai_dien_tu")]
        public bool is_bien_lai_dien_tu { get; set; } = false;

        // Navigation property cho KeKhaiBHYT
        [JsonIgnore]
        public virtual ICollection<KeKhaiBHYT> KeKhaiBHYTs { get; set; }

        [Column("dai_ly_id")]
        [Required]
        public int dai_ly_id { get; set; }

        [ForeignKey("dai_ly_id")]
        public virtual DaiLy? DaiLy { get; set; }

        public DotKeKhai()
        {
            ten_dot = string.Empty;
            dich_vu = "BHXH TN";
            trang_thai = "chua_gui";
            nguoi_tao = string.Empty;
            ghi_chu = string.Empty;
            KeKhaiBHYTs = new List<KeKhaiBHYT>();
            ngay_tao = DateTime.UtcNow;
        }
    }
} 