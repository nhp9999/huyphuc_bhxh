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
        public DateTime ngay_sinh { get; set; }

        [Required]
        public bool gioi_tinh { get; set; }

        [StringLength(15)]
        public string so_dien_thoai { get; set; }

        [Required]
        [StringLength(50)]
        public string nguoi_tao { get; set; }

        public DateTime ngay_tao { get; set; }
    }
} 