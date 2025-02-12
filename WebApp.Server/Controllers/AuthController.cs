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
                _logger.LogInformation($"Login attempt for user: {loginDto.Username}");

                var user = await _context.NguoiDungs
                    .Where(u => u.UserName == loginDto.Username && u.Status == 1)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    _logger.LogWarning($"Login failed: User not found - {loginDto.Username}");
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                _logger.LogInformation($"Stored password hash: {user.Password}");
                _logger.LogInformation($"Provided password: {loginDto.Password}");

                bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);

                if (!isValidPassword)
                {
                    _logger.LogWarning($"Login failed: Invalid password for user - {loginDto.Username}");
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                var token = GenerateJwtToken(user);

                // Update last login time
                user.UpdatedAt = DateTime.UtcNow;
                
                // Lấy vị trí từ IP
                try {
                    using (var client = new HttpClient())
                    {
                        var response = await client.GetAsync($"https://open.oapi.vn/ip/me");
                        if (response.IsSuccessStatusCode)
                        {
                            var locationData = await response.Content.ReadFromJsonAsync<OpenApiLocationResponse>();
                            if (locationData != null && locationData.code == "success")
                            {
                                user.ClientId = $"{locationData.data.city}, {locationData.data.region}, {locationData.data.country}";
                                _logger.LogInformation($"Location found: {user.ClientId}");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error getting location from IP: {ex.Message}");
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        username = user.UserName,
                        hoTen = user.HoTen,
                        roles = user.Roles,
                        donViCongTac = user.DonViCongTac,
                        chucDanh = user.ChucDanh,
                        email = user.Email,
                        soDienThoai = user.SoDienThoai,
                        isSuperAdmin = user.IsSuperAdmin,
                        typeMangLuoi = user.TypeMangLuoi,
                        status = user.Status,
                        clientId = user.ClientId
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}");
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
                    .Where(u => u.UserName == username)
                    .Select(u => new
                    {
                        id = u.Id,
                        username = u.UserName,
                        hoTen = u.HoTen,
                        roles = u.Roles,
                        donViCongTac = u.DonViCongTac,
                        chucDanh = u.ChucDanh,
                        email = u.Email,
                        soDienThoai = u.SoDienThoai,
                        isSuperAdmin = u.IsSuperAdmin,
                        typeMangLuoi = u.TypeMangLuoi,
                        status = u.Status,
                        clientId = u.ClientId
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
                _logger.LogError($"Get current user error: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin người dùng" });
            }
        }

        private string GenerateJwtToken(NguoiDung user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("hoTen", user.HoTen)
            };

            if (user.Roles != null)
            {
                foreach (var role in user.Roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            if (user.IsSuperAdmin)
            {
                claims.Add(new Claim("IsSuperAdmin", "true"));
            }

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
                _logger.LogError($"Database connection check error: {ex.Message}");
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