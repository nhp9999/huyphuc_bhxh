using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(50)]
        public string username { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string password { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ho_ten { get; set; }

        [StringLength(100)]
        [EmailAddress]
        public string? email { get; set; }

        [StringLength(15)]
        public string? so_dien_thoai { get; set; }

        [StringLength(20)]
        public string? role { get; set; }

        [StringLength(50)]
        public string? department_code { get; set; }

        [StringLength(100)]
        public string? unit { get; set; }

        public int? unit_id { get; set; }

        [StringLength(20)]
        public string status { get; set; } = "active";

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        public DateTime updated_at { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string? province { get; set; }

        [StringLength(50)]
        public string? district { get; set; }

        [StringLength(50)]
        public string? commune { get; set; }

        [StringLength(50)]
        public string? hamlet { get; set; }

        public string? address { get; set; }

        public DateTime? last_login_at { get; set; }

        public bool first_login { get; set; } = true;

        public bool password_changed { get; set; } = false;

        public DateTime? deleted_at { get; set; }

        [StringLength(45)]
        public string? last_login_ip { get; set; }

        public string? last_login_location { get; set; }
    }
} 