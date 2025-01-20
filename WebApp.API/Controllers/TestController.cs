using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TestController> _logger;
        private readonly IConfiguration _configuration;

        public TestController(
            ApplicationDbContext context,
            ILogger<TestController> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet("database")]
        public async Task<IActionResult> TestDatabaseConnection()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var sampleUsers = await _context.Users
                    .Take(5)
                    .Select(u => new { u.username, u.role, u.status })
                    .ToListAsync();

                return Ok(new
                {
                    status = "success",
                    message = "Database connection successful",
                    details = new
                    {
                        userCount,
                        sampleUsers,
                        databaseName = _context.Database.GetDbConnection().Database
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Database connection error: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Lỗi kết nối database", error = ex.Message });
            }
        }

        [HttpGet("user/{username}")]
        public async Task<IActionResult> GetUserDetails(string username)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.username == username)
                    .Select(u => new
                    {
                        u.username,
                        u.ho_ten,
                        u.role,
                        u.status,
                        u.email,
                        u.so_dien_thoai,
                        u.department_code,
                        u.unit,
                        u.created_at,
                        u.last_login_at
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy user" });

                return Ok(new
                {
                    status = "success",
                    data = user
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user details: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin user", error = ex.Message });
            }
        }
    }
} 