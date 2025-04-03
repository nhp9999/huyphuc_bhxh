using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.Server.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using BCrypt.Net;
using System.Net.Http;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Ip { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginDto)
        {
            try
            {
                // Xác thực người dùng và mật khẩu
                var user = await _context.NguoiDungs
                    .Where(u => u.user_name == loginDto.Username && u.status == 1)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    _logger.LogWarning($"Đăng nhập thất bại: Không tìm thấy người dùng - {loginDto.Username}");
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.password);

                if (!isValidPassword)
                {
                    _logger.LogWarning($"Đăng nhập thất bại: Mật khẩu không đúng - {loginDto.Username}");
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                // Sinh token JWT
                var token = GenerateJwtToken(user);

                // Cập nhật thời gian đăng nhập cuối
                user.updated_at = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đăng nhập thành công: {loginDto.Username}");

                // Trả về thông tin người dùng và token
                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.id,
                        username = user.user_name,
                        hoTen = user.ho_ten,
                        roles = user.roles,
                        donViCongTac = user.don_vi_cong_tac,
                        chucDanh = user.chuc_danh,
                        email = user.email,
                        soDienThoai = user.so_dien_thoai,
                        isSuperAdmin = user.is_super_admin,
                        typeMangLuoi = user.type_mang_luoi,
                        status = user.status,
                        clientId = user.client_id
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi đăng nhập: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi trong quá trình đăng nhập" });
            }
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                var user = await _context.NguoiDungs
                    .Where(u => u.user_name == username)
                    .Select(u => new
                    {
                        id = u.id,
                        username = u.user_name,
                        hoTen = u.ho_ten,
                        roles = u.roles,
                        donViCongTac = u.don_vi_cong_tac,
                        chucDanh = u.chuc_danh,
                        email = u.email,
                        soDienThoai = u.so_dien_thoai,
                        isSuperAdmin = u.is_super_admin,
                        typeMangLuoi = u.type_mang_luoi,
                        status = u.status,
                        clientId = u.client_id,
                        maNhanVien = u.ma_nhan_vien
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin người dùng" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi lấy thông tin người dùng: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin người dùng" });
            }
        }

        private string GenerateJwtToken(NguoiDung user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.user_name),
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim("hoTen", user.ho_ten)
            };

            // Thêm roles vào claims
            if (user.roles != null)
            {
                foreach (var role in user.roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            if (user.is_super_admin)
            {
                claims.Add(new Claim("IsSuperAdmin", "true"));
            }

            // Tạo token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"] ?? "1"));

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("check-connection")]
        public async Task<IActionResult> CheckConnection()
        {
            try
            {
                // Kiểm tra kết nối đến database
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return StatusCode(503, new { message = "Không thể kết nối đến cơ sở dữ liệu" });
                }

                return Ok(new { message = "Kết nối thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi kiểm tra kết nối CSDL: {ex.Message}");
                return StatusCode(503, new { message = "Lỗi khi kiểm tra kết nối đến cơ sở dữ liệu" });
            }
        }
    }

    public class OpenApiLocationResponse
    {
        public string code { get; set; } = string.Empty;
        public OpenApiLocationData data { get; set; } = new OpenApiLocationData();
    }

    public class OpenApiLocationData 
    {
        public string ip { get; set; } = string.Empty;
        public string city { get; set; } = string.Empty;
        public string country { get; set; } = string.Empty;
        public string loc { get; set; } = string.Empty;
        public string org { get; set; } = string.Empty;
        public string postal { get; set; } = string.Empty;
        public string region { get; set; } = string.Empty;
        public string timezone { get; set; } = string.Empty;
    }
} 