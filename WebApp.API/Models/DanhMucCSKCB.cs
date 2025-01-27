using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Models
{
    public class DanhMucCSKCB
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(10)]
        public string value { get; set; }

        [Required] 
        [StringLength(200)]
        public string text { get; set; }

        [Required]
        [StringLength(200)]
        public string ten { get; set; }

        [StringLength(10)]
        public string? ma { get; set; }

        public DateTime created_at { get; set; }
    }
} 