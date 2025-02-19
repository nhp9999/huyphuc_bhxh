using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.Server.Models;

namespace WebApp.Server.Controllers
{
    public class DaiLyDonViDTO
    {
        public int DaiLyId { get; set; }
        public int DonViId { get; set; }
        public string NguoiTao { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/dai-ly-don-vi")]
    public class DaiLyDonViController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DaiLyDonViController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dai-ly/{daiLyId}")]
        public async Task<IActionResult> GetDonVisByDaiLy(int daiLyId)
        {
            var donVis = await _context.DaiLyDonVis
                .Where(x => x.DaiLyId == daiLyId && x.TrangThai)
                .Include(x => x.DonVi)
                .Select(x => new {
                    x.DonVi.Id,
                    x.DonVi.MaCoQuanBHXH,
                    x.DonVi.MaSoBHXH,
                    x.DonVi.TenDonVi,
                    x.DonVi.IsBHXHTN,
                    x.DonVi.IsBHYT,
                    x.DonVi.DmKhoiKcbId,
                    x.DonVi.Type,
                    x.DonVi.TrangThai,
                    x.DonVi.CreatedAt,
                    x.DonVi.UpdatedAt
                })
                .ToListAsync();

            return Ok(donVis);
        }

        [HttpGet("don-vi/{donViId}")]
        public async Task<IActionResult> GetDaiLysByDonVi(int donViId)
        {
            var daiLys = await _context.DaiLyDonVis
                .Where(x => x.DonViId == donViId && x.TrangThai)
                .Include(x => x.DaiLy)
                .Select(x => new {
                    x.DaiLy.Id,
                    x.DaiLy.Ma,
                    x.DaiLy.Ten,
                    x.DaiLy.DiaChi,
                    x.DaiLy.SoDienThoai,
                    x.DaiLy.Email,
                    x.DaiLy.NguoiDaiDien,
                    x.DaiLy.TrangThai
                })
                .ToListAsync();

            return Ok(daiLys);
        }

        [HttpPost]
        public async Task<IActionResult> AddDaiLyDonVi(DaiLyDonViDTO dto)
        {
            var exists = await _context.DaiLyDonVis
                .AnyAsync(x => x.DaiLyId == dto.DaiLyId && x.DonViId == dto.DonViId && x.TrangThai);

            if (exists)
            {
                return BadRequest(new { message = "Quan hệ này đã tồn tại" });
            }

            var daiLyDonVi = new DaiLyDonVi
            {
                DaiLyId = dto.DaiLyId,
                DonViId = dto.DonViId,
                NguoiTao = dto.NguoiTao,
                TrangThai = true
            };

            _context.DaiLyDonVis.Add(daiLyDonVi);
            await _context.SaveChangesAsync();

            return Ok(daiLyDonVi);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDaiLyDonVi(int id)
        {
            var daiLyDonVi = await _context.DaiLyDonVis.FindAsync(id);
            if (daiLyDonVi == null)
            {
                return NotFound(new { message = "Không tìm thấy quan hệ này" });
            }

            daiLyDonVi.TrangThai = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công" });
        }
    }
} 