using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("ds_huyen")]
    public class DanhMucHuyen
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(3)]
        public string ma { get; set; }

        [Required]
        [StringLength(100)]
        public string ten { get; set; }

        [Required]
        [StringLength(100)]
        public string text { get; set; }

        [Required]
        [StringLength(2)]
        [Column("ma_tinh")]
        public string ma_tinh { get; set; }

        public DateTime created_at { get; set; }
    }
} 