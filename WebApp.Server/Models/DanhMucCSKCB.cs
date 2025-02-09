using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApp.API.Models
{
    [Table("dm_cskcb")]
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

        [Column("ma_tinh_kcb")]
        [StringLength(10)]
        public string ma_tinh_kcb { get; set; }

        public DateTime created_at { get; set; }
    }
} 