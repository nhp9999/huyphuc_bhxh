using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("ds_tinh")]
    public class DanhMucTinh
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(2)]
        public string ma { get; set; }

        [Required]
        [StringLength(100)]
        public string ten { get; set; }

        [Required]
        [StringLength(100)]
        public string text { get; set; }

        public DateTime created_at { get; set; }
    }
} 