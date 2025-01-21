using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using Microsoft.Extensions.Logging;
using BCrypt.Net;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            ApplicationDbContext context,
            ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.id,
                        u.username,
                        u.ho_ten,
                        u.email,
                        u.so_dien_thoai,
                        u.role,
                        u.department_code,
                        u.unit,
                        u.unit_id,
                        u.status,
                        u.province,
                        u.district,
                        u.commune,
                        u.hamlet,
                        u.address,
                        u.last_login_at,
                        u.first_login,
                        u.password_changed,
                        u.created_at,
                        u.updated_at,
                        u.deleted_at,
                        is_deleted = u.deleted_at != null
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting users: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách người dùng" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.id == id && u.deleted_at == null)
                    .Select(u => new
                    {
                        u.id,
                        u.username,
                        u.ho_ten,
                        u.email,
                        u.so_dien_thoai,
                        u.role,
                        u.department_code,
                        u.unit,
                        u.unit_id,
                        u.status,
                        u.province,
                        u.district,
                        u.commune,
                        u.hamlet,
                        u.address,
                        u.last_login_at,
                        u.first_login,
                        u.password_changed,
                        u.created_at,
                        u.updated_at
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin người dùng" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] User model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.username) || string.IsNullOrEmpty(model.password))
                    return BadRequest(new { message = "Tên đăng nhập và mật khẩu không được để trống" });

                var existingUser = await _context.Users
                    .AnyAsync(u => u.username == model.username && u.deleted_at == null);

                if (existingUser)
                    return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

                model.password = BCrypt.Net.BCrypt.HashPassword(model.password);
                model.created_at = DateTime.UtcNow;
                model.updated_at = DateTime.UtcNow;
                model.status = "active";
                model.first_login = true;
                model.password_changed = false;

                _context.Users.Add(model);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = model.id }, new
                {
                    model.id,
                    model.username,
                    model.ho_ten,
                    model.email,
                    model.so_dien_thoai,
                    model.role,
                    model.department_code,
                    model.unit,
                    model.unit_id,
                    model.status,
                    model.created_at,
                    model.updated_at
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating user: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo người dùng" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User model)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null || user.deleted_at != null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                // Kiểm tra username mới có bị trùng không
                if (model.username != user.username)
                {
                    var existingUser = await _context.Users
                        .AnyAsync(u => u.username == model.username && u.deleted_at == null);

                    if (existingUser)
                        return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });
                }

                // Cập nhật thông tin
                user.username = model.username;
                user.ho_ten = model.ho_ten;
                user.email = model.email;
                user.so_dien_thoai = model.so_dien_thoai;
                user.role = model.role;
                user.department_code = model.department_code;
                user.unit = model.unit;
                user.unit_id = model.unit_id;
                user.status = model.status;
                user.province = model.province;
                user.district = model.district;
                user.commune = model.commune;
                user.hamlet = model.hamlet;
                user.address = model.address;
                user.updated_at = DateTime.UtcNow;

                // Nếu có mật khẩu mới thì cập nhật
                if (!string.IsNullOrEmpty(model.password))
                {
                    user.password = BCrypt.Net.BCrypt.HashPassword(model.password);
                    user.password_changed = true;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    user.id,
                    user.username,
                    user.ho_ten,
                    user.email,
                    user.so_dien_thoai,
                    user.role,
                    user.department_code,
                    user.unit,
                    user.unit_id,
                    user.status,
                    user.updated_at
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật người dùng" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa người dùng thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting user {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa người dùng" });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateStatusModel model)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null || user.deleted_at != null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                if (model.status != "active" && model.status != "inactive")
                    return BadRequest(new { message = "Trạng thái không hợp lệ" });

                user.status = model.status;
                user.updated_at = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    user.id,
                    user.username,
                    user.ho_ten,
                    user.status,
                    user.updated_at
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user status {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái người dùng" });
            }
        }
    }

    public class UpdateStatusModel
    {
        public string status { get; set; }
    }
} 