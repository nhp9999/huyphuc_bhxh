using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("ds_xa")]
    public class DanhMucXa
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(5)]
        public string ma { get; set; }

        [Required]
        [StringLength(100)]
        public string ten { get; set; }

        [Required]
        [StringLength(100)]
        public string text { get; set; }

        [Required]
        [StringLength(3)]
        [Column("ma_huyen")]
        public string ma_huyen { get; set; }

        public DateTime created_at { get; set; }
    }
} 