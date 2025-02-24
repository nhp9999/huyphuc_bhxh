using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using BCrypt.Net;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Linq;
using System.Security.Cryptography;

namespace WebApp.Server.Controllers
{
    public class NguoiDungDTO
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        [JsonPropertyName("userName")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên không được để trống")]
        [JsonPropertyName("hoTen")]
        public string HoTen { get; set; } = string.Empty;

        [JsonPropertyName("mangLuoi")]
        public string? MangLuoi { get; set; }

        [JsonPropertyName("donViCongTac")]
        public string? DonViCongTac { get; set; }

        [JsonPropertyName("chucDanh")]
        public string? ChucDanh { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("soDienThoai")]
        public string? SoDienThoai { get; set; }

        [JsonPropertyName("isSuperAdmin")]
        public bool IsSuperAdmin { get; set; }

        [JsonPropertyName("typeMangLuoi")]
        public int? TypeMangLuoi { get; set; }

        [JsonPropertyName("roles")]
        public string[]? Roles { get; set; }

        [JsonPropertyName("password")]
        public string? Password { get; set; }

        [JsonPropertyName("maNhanVien")]
        public string? MaNhanVien { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }
    }

    [Route("api/nguoi-dung")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NguoiDungController> _logger;

        public NguoiDungController(ApplicationDbContext context, ILogger<NguoiDungController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/nguoi-dung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NguoiDung>>> GetNguoiDungs()
        {
            try 
            {
                var nguoiDungs = await _context.NguoiDungs
                    .Select(n => new {
                        id = n.id,
                        userName = n.user_name,
                        hoTen = n.ho_ten,
                        donViCongTac = n.don_vi_cong_tac,
                        chucDanh = n.chuc_danh,
                        email = n.email,
                        soDienThoai = n.so_dien_thoai,
                        roles = n.roles,
                        status = n.status,
                        maNhanVien = n.ma_nhan_vien,
                        isSuperAdmin = n.is_super_admin,
                        typeMangLuoi = n.type_mang_luoi
                    })
                    .ToListAsync();
                    
                return Ok(nguoiDungs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting users: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách người dùng" });
            }
        }

        // GET: api/nguoi-dung/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NguoiDung>> GetNguoiDung(int id)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);

            if (nguoiDung == null)
            {
                return NotFound();
            }

            return nguoiDung;
        }

        // POST: api/nguoi-dung
        [HttpPost]
        public async Task<ActionResult<NguoiDung>> CreateNguoiDung(NguoiDungDTO dto)
        {
            // Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrWhiteSpace(dto.UserName))
            {
                ModelState.AddModelError("UserName", "Tên đăng nhập không được để trống");
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(dto.HoTen))
            {
                ModelState.AddModelError("HoTen", "Họ tên không được để trống");
                return BadRequest(ModelState);
            }

            // Kiểm tra trùng UserName
            if (await _context.NguoiDungs.AnyAsync(x => x.user_name.ToLower() == dto.UserName.ToLower()))
            {
                ModelState.AddModelError("UserName", "Tên đăng nhập đã tồn tại");
                return BadRequest(ModelState);
            }

            // Kiểm tra và mã hóa mật khẩu
            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                ModelState.AddModelError("Password", "Mật khẩu không được để trống");
                return BadRequest(ModelState);
            }

            if (dto.Password.Length < 6)
            {
                ModelState.AddModelError("Password", "Mật khẩu phải có ít nhất 6 ký tự");
                return BadRequest(ModelState);
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var nguoiDung = new NguoiDung
            {
                user_name = dto.UserName,
                password = hashedPassword,
                ho_ten = dto.HoTen,
                email = dto.Email,
                so_dien_thoai = dto.SoDienThoai,
                don_vi_cong_tac = dto.DonViCongTac,
                chuc_danh = dto.ChucDanh,
                is_super_admin = dto.IsSuperAdmin,
                type_mang_luoi = dto.TypeMangLuoi,
                status = 1,
                roles = dto.Roles,
                ma_nhan_vien = dto.MaNhanVien
            };

            try
            {
                _context.NguoiDungs.Add(nguoiDung);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetNguoiDung), new { id = nguoiDung.id }, nguoiDung);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "Có lỗi xảy ra khi tạo người dùng");
                return BadRequest(ModelState);
            }
        }

        // PUT: api/nguoi-dung/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNguoiDung(int id, NguoiDungDTO dto)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null)
            {
                return NotFound();
            }

            try
            {
                // Log để debug
                _logger.LogInformation($"Updating user {id} with status: {dto.Status}");

                nguoiDung.user_name = dto.UserName;
                nguoiDung.ho_ten = dto.HoTen;
                nguoiDung.don_vi_cong_tac = dto.DonViCongTac;
                nguoiDung.chuc_danh = dto.ChucDanh;
                nguoiDung.email = dto.Email;
                nguoiDung.so_dien_thoai = dto.SoDienThoai;
                nguoiDung.is_super_admin = dto.IsSuperAdmin;
                nguoiDung.type_mang_luoi = dto.TypeMangLuoi;
                nguoiDung.roles = dto.Roles;
                nguoiDung.status = dto.Status; // Đảm bảo status được cập nhật
                nguoiDung.ma_nhan_vien = dto.MaNhanVien;
                nguoiDung.updated_at = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(dto.Password))
                {
                    nguoiDung.password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                }

                await _context.SaveChangesAsync();

                // Log kết quả
                _logger.LogInformation($"User {id} updated successfully with status: {nguoiDung.status}");

                return Ok(nguoiDung);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user: {ex.Message}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật người dùng" });
            }
        }

        // DELETE: api/nguoi-dung/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNguoiDung(int id)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null)
            {
                return NotFound();
            }

            _context.NguoiDungs.Remove(nguoiDung);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/nguoi-dung/5/toggle-status
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var nguoiDung = await _context.NguoiDungs.FindAsync(id);
                if (nguoiDung == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng" });
                }

                // Log trạng thái trước khi thay đổi
                _logger.LogInformation($"Toggling status for user {id} from {nguoiDung.status}");

                nguoiDung.status = nguoiDung.status == 1 ? 0 : 1;
                nguoiDung.updated_at = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log trạng thái sau khi thay đổi
                _logger.LogInformation($"Status changed to {nguoiDung.status}");

                return Ok(nguoiDung);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error toggling status: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái" });
            }
        }

        private string GenerateRandomPassword()
        {
            // Định nghĩa các ký tự cho mật khẩu
            const string upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lowerCase = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string special = "@#$%^&*";

            // Tạo chuỗi ngẫu nhiên từ tất cả các loại ký tự
            var random = new Random();
            var password = new StringBuilder();

            // Thêm ít nhất 1 ký tự hoa
            password.Append(upperCase[random.Next(upperCase.Length)]);
            // Thêm ít nhất 1 ký tự thường  
            password.Append(lowerCase[random.Next(lowerCase.Length)]);
            // Thêm ít nhất 1 số
            password.Append(digits[random.Next(digits.Length)]);
            // Thêm ít nhất 1 ký tự đặc biệt
            password.Append(special[random.Next(special.Length)]);

            // Tạo chuỗi chứa tất cả các ký tự có thể
            var allChars = upperCase + lowerCase + digits + special;

            // Thêm các ký tự ngẫu nhiên cho đủ độ dài mong muốn (8 ký tự)
            for (int i = 4; i < 8; i++)
            {
                password.Append(allChars[random.Next(allChars.Length)]);
            }

            // Trộn ngẫu nhiên các ký tự trong chuỗi mật khẩu
            return new string(password.ToString().ToCharArray().OrderBy(x => random.Next()).ToArray());
        }

        // POST: api/nguoi-dung/5/reset-password
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            try
            {
                // Tạo mật khẩu ngẫu nhiên mới
                string newPassword = GenerateRandomPassword();
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
                
                nguoiDung.password = hashedPassword;
                nguoiDung.updated_at = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Đặt lại mật khẩu thành công",
                    password = newPassword
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Reset password error: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi đặt lại mật khẩu" });
            }
        }

        [HttpGet("info/{id}")]
        public async Task<ActionResult<NguoiDung>> GetUserInfo(int id)
        {
            var nguoiDung = await _context.NguoiDungs
                .Where(u => u.id == id)
                .Select(u => new {
                    u.id,
                    u.user_name,
                    u.ho_ten,
                    u.email,
                    u.ma_nhan_vien,
                    u.roles,
                    u.status,
                    u.is_super_admin,
                    u.type_mang_luoi
                })
                .FirstOrDefaultAsync();

            if (nguoiDung == null)
            {
                return NotFound("Không tìm thấy thông tin người dùng");
            }

            return Ok(nguoiDung);
        }

        private bool NguoiDungExists(int id)
        {
            return _context.NguoiDungs.Any(e => e.id == id);
        }
    }
} 