using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
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

                var user = await _context.Users
                    .Where(u => u.username == loginDto.Username && u.status == "active")
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    _logger.LogWarning($"Login failed: User not found - {loginDto.Username}");
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                _logger.LogInformation($"Stored password hash: {user.password}");
                _logger.LogInformation($"Provided password: {loginDto.Password}");

                bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.password);

                if (!isValidPassword)
                {
                    _logger.LogWarning($"Login failed: Invalid password for user - {loginDto.Username}");
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                var token = GenerateJwtToken(user);

                // Update last login time and IP
                user.last_login_at = DateTime.UtcNow;
                user.last_login_ip = loginDto.Ip;
                
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
                                user.last_login_location = $"{locationData.data.city}, {locationData.data.region}, {locationData.data.country}";
                                _logger.LogInformation($"Location found: {user.last_login_location}");
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
                        id = user.id,
                        username = user.username,
                        ho_ten = user.ho_ten,
                        role = user.role,
                        department_code = user.department_code,
                        unit = user.unit,
                        first_login = user.first_login,
                        password_changed = user.password_changed,
                        ip = user.last_login_ip,
                        last_login_location = user.last_login_location
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

                var user = await _context.Users
                    .Where(u => u.username == username)
                    .Select(u => new
                    {
                        u.id,
                        u.username,
                        u.ho_ten,
                        u.role,
                        u.department_code,
                        u.unit,
                        u.first_login,
                        u.password_changed
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
                _logger.LogError($"Error getting current user: {ex.Message}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin người dùng" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.username),
                new Claim(ClaimTypes.Role, user.role ?? ""),
                new Claim("DepartmentCode", user.department_code ?? ""),
                new Claim("UserId", user.id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // API kiểm tra kết nối database
        [HttpGet("check-connection")]
        public async Task<IActionResult> CheckConnection()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var firstUser = await _context.Users.FirstOrDefaultAsync();
                
                return Ok(new { 
                    message = "Kết nối database thành công",
                    userCount = userCount,
                    sampleUser = firstUser != null ? new { 
                        username = firstUser.username,
                        ho_ten = firstUser.ho_ten,
                        role = firstUser.role,
                        status = firstUser.status
                    } : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Database connection error: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Lỗi kết nối database", error = ex.Message });
            }
        }
    }

    public class OpenApiLocationResponse
    {
        public string code { get; set; }
        public OpenApiLocationData data { get; set; }
    }

    public class OpenApiLocationData 
    {
        public string ip { get; set; }
        public string city { get; set; }
        public string country { get; set; }
        public string loc { get; set; }
        public string org { get; set; }
        public string postal { get; set; }
        public string region { get; set; }
        public string timezone { get; set; }
    }
} 