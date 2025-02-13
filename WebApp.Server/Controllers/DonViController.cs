using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Controllers
{
    [Route("api/don-vi")]
    [ApiController]
    public class DonViController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DonViController> _logger;

        public class DonViDTO
        {
            [Required]
            public string MaCoQuanBHXH { get; set; } = string.Empty;
            
            [Required]
            public string MaSoBHXH { get; set; } = string.Empty;
            
            [Required]
            public string TenDonVi { get; set; } = string.Empty;
            
            public bool IsBHXHTN { get; set; }
            public bool IsBHYT { get; set; }
            public int? DmKhoiKcbId { get; set; }
            public int Type { get; set; }
            public bool TrangThai { get; set; }
            
            [Required]
            public int DaiLyId { get; set; }
        }

        public DonViController(ApplicationDbContext context, ILogger<DonViController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonVi>>> GetDonVis()
        {
            var donVis = await _context.DonVis
                .Include(d => d.DaiLy)
                .OrderBy(x => x.TenDonVi)
                .Select(d => new
                {
                    d.Id,
                    d.MaCoQuanBHXH,
                    d.MaSoBHXH,
                    d.TenDonVi,
                    d.IsBHXHTN,
                    d.IsBHYT,
                    d.DmKhoiKcbId,
                    d.Type,
                    d.TrangThai,
                    d.CreatedAt,
                    d.UpdatedAt,
                    d.DaiLyId,
                    DaiLy = new
                    {
                        d.DaiLy.Id,
                        d.DaiLy.Ma,
                        d.DaiLy.Ten,
                        d.DaiLy.DiaChi,
                        d.DaiLy.SoDienThoai,
                        d.DaiLy.Email,
                        d.DaiLy.NguoiDaiDien,
                        d.DaiLy.TrangThai
                    }
                })
                .ToListAsync();

            return Ok(donVis);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DonVi>> GetDonVi(int id)
        {
            var donVi = await _context.DonVis.FindAsync(id);

            if (donVi == null)
            {
                return NotFound();
            }

            return donVi;
        }

        [HttpPost]
        public async Task<ActionResult<DonVi>> CreateDonVi(DonViDTO donViDto)
        {
            var donVi = new DonVi
            {
                MaCoQuanBHXH = donViDto.MaCoQuanBHXH,
                MaSoBHXH = donViDto.MaSoBHXH,
                TenDonVi = donViDto.TenDonVi,
                IsBHXHTN = donViDto.IsBHXHTN,
                IsBHYT = donViDto.IsBHYT,
                DmKhoiKcbId = donViDto.DmKhoiKcbId,
                Type = donViDto.Type,
                TrangThai = donViDto.TrangThai,
                DaiLyId = donViDto.DaiLyId
            };

            _context.DonVis.Add(donVi);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDonVi), new { id = donVi.Id }, donVi);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDonVi(int id, DonViDTO donViDto)
        {
            var donVi = await _context.DonVis.FindAsync(id);
            if (donVi == null)
            {
                return NotFound();
            }

            donVi.MaCoQuanBHXH = donViDto.MaCoQuanBHXH;
            donVi.MaSoBHXH = donViDto.MaSoBHXH;
            donVi.TenDonVi = donViDto.TenDonVi;
            donVi.IsBHXHTN = donViDto.IsBHXHTN;
            donVi.IsBHYT = donViDto.IsBHYT;
            donVi.DmKhoiKcbId = donViDto.DmKhoiKcbId;
            donVi.Type = donViDto.Type;
            donVi.TrangThai = donViDto.TrangThai;
            donVi.DaiLyId = donViDto.DaiLyId;
            donVi.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonVi(int id)
        {
            var donVi = await _context.DonVis.FindAsync(id);
            if (donVi == null)
            {
                return NotFound();
            }

            _context.DonVis.Remove(donVi);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 