using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace WebApp.API.Models
{
    /// <summary>
    /// Model quản lý đợt kê khai
    /// </summary>
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
        public string ten_dot { get; set; }

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
        /// Ghi chú
        /// </summary>
        public string ghi_chu { get; set; }

        /// <summary>
        /// Trạng thái hoạt động
        /// </summary>
        public bool trang_thai { get; set; } = true;

        /// <summary>
        /// Ngày tạo đợt kê khai
        /// </summary>
        public DateTime ngay_tao { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Người tạo đợt kê khai
        /// </summary>
        public string nguoi_tao { get; set; }

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
    }
} 