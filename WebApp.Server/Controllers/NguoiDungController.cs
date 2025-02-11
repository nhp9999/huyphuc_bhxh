using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WebApp.Server.Controllers
{
    public class NguoiDungDTO
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        [JsonPropertyName("user_name")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên không được để trống")]
        [JsonPropertyName("ho_ten")]
        public string HoTen { get; set; } = string.Empty;

        [JsonPropertyName("mang_luoi")]
        public string? MangLuoi { get; set; }

        [JsonPropertyName("don_vi_cong_tac")]
        public string? DonViCongTac { get; set; }

        [JsonPropertyName("chuc_danh")]
        public string? ChucDanh { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("so_dien_thoai")]
        public string? SoDienThoai { get; set; }

        [JsonPropertyName("is_super_admin")]
        public bool IsSuperAdmin { get; set; }

        [JsonPropertyName("cap")]
        public string? Cap { get; set; }

        [JsonPropertyName("type_mang_luoi")]
        public int? TypeMangLuoi { get; set; }

        [JsonPropertyName("roles")]
        public string[]? Roles { get; set; }
    }

    [Route("api/nguoi-dung")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NguoiDungController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/nguoi-dung
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NguoiDung>>> GetNguoiDungs()
        {
            return await _context.NguoiDungs.ToListAsync();
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
            // Kiểm tra trùng UserName
            if (await _context.NguoiDungs.AnyAsync(x => x.UserName == dto.UserName))
            {
                ModelState.AddModelError("UserName", "Tên đăng nhập đã tồn tại");
                return BadRequest(ModelState);
            }

            var nguoiDung = new NguoiDung
            {
                UserName = dto.UserName,
                HoTen = dto.HoTen,
                MangLuoi = dto.MangLuoi,
                DonViCongTac = dto.DonViCongTac,
                ChucDanh = dto.ChucDanh,
                Email = dto.Email,
                SoDienThoai = dto.SoDienThoai,
                IsSuperAdmin = dto.IsSuperAdmin,
                Cap = dto.Cap,
                TypeMangLuoi = dto.TypeMangLuoi,
                Status = 1,
                Roles = dto.Roles ?? new[] { "user" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.NguoiDungs.Add(nguoiDung);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNguoiDung), new { id = nguoiDung.Id }, nguoiDung);
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

            // Kiểm tra trùng UserName (trừ chính nó)
            if (await _context.NguoiDungs.AnyAsync(x => x.UserName == dto.UserName && x.Id != id))
            {
                ModelState.AddModelError("UserName", "Tên đăng nhập đã tồn tại");
                return BadRequest(ModelState);
            }

            nguoiDung.UserName = dto.UserName;
            nguoiDung.HoTen = dto.HoTen;
            nguoiDung.MangLuoi = dto.MangLuoi;
            nguoiDung.DonViCongTac = dto.DonViCongTac;
            nguoiDung.ChucDanh = dto.ChucDanh;
            nguoiDung.Email = dto.Email;
            nguoiDung.SoDienThoai = dto.SoDienThoai;
            nguoiDung.IsSuperAdmin = dto.IsSuperAdmin;
            nguoiDung.Cap = dto.Cap;
            nguoiDung.TypeMangLuoi = dto.TypeMangLuoi;
            nguoiDung.Roles = dto.Roles;
            nguoiDung.UpdatedAt = DateTime.UtcNow;

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

            return NoContent();
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

            nguoiDung.Status = nguoiDung.Status == 1 ? 0 : 1;
            nguoiDung.UpdatedAt = DateTime.UtcNow;

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
            return _context.NguoiDungs.Any(e => e.Id == id);
        }
    }
} 