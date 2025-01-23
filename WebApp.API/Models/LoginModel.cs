using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Models
{
    public class LoginModel
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string Ip { get; set; } = string.Empty;
    }
} 