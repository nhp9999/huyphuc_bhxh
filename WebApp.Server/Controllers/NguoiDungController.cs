using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using BCrypt.Net;
using Microsoft.Extensions.Logging;

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

            // Chuẩn hóa dữ liệu
            dto.UserName = dto.UserName.Trim();
            dto.HoTen = dto.HoTen.Trim();

            // Tạo mật khẩu mặc định và mã hóa
            string defaultPassword = "123456";
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(defaultPassword);

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

            // Kiểm tra trùng UserName (trừ chính nó)
            if (await _context.NguoiDungs.AnyAsync(x => x.user_name.ToLower() == dto.UserName.ToLower() && x.id != id))
            {
                ModelState.AddModelError("UserName", "Tên đăng nhập đã tồn tại");
                return BadRequest(ModelState);
            }

            // Chuẩn hóa dữ liệu
            dto.UserName = dto.UserName.Trim();
            dto.HoTen = dto.HoTen.Trim();

            nguoiDung.user_name = dto.UserName;
            nguoiDung.ho_ten = dto.HoTen;
            nguoiDung.don_vi_cong_tac = dto.DonViCongTac;
            nguoiDung.chuc_danh = dto.ChucDanh;
            nguoiDung.email = dto.Email;
            nguoiDung.so_dien_thoai = dto.SoDienThoai;
            nguoiDung.is_super_admin = dto.IsSuperAdmin;
            nguoiDung.type_mang_luoi = dto.TypeMangLuoi;
            nguoiDung.roles = dto.Roles;
            nguoiDung.updated_at = DateTime.UtcNow;
            nguoiDung.ma_nhan_vien = dto.MaNhanVien;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(nguoiDung);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NguoiDungExists(id))
                {
                    return NotFound();
                }
                else
                {
                    ModelState.AddModelError("", "Có lỗi xảy ra khi cập nhật người dùng");
                    return BadRequest(ModelState);
                }
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
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null)
            {
                return NotFound();
            }

            nguoiDung.status = nguoiDung.status == 1 ? 0 : 1;
            nguoiDung.updated_at = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NguoiDungExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(nguoiDung);
        }

        // POST: api/nguoi-dung/5/reset-password
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null)
            {
                return NotFound();
            }

            // TODO: Implement password reset logic
            return Ok(new { message = "Mật khẩu đã được đặt lại" });
        }

        private bool NguoiDungExists(int id)
        {
            return _context.NguoiDungs.Any(e => e.id == id);
        }
    }
} 