using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.Server.Models;
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
            public bool TrangThai { get; set; }
            
            [Required]
            public List<int> DaiLyIds { get; set; } = new List<int>();
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
                    DaiLys = _context.DaiLyDonVis
                        .Where(dd => dd.DonViId == d.Id && dd.TrangThai)
                        .Select(dd => new
                        {
                            dd.DaiLy.Id,
                            dd.DaiLy.Ma,
                            dd.DaiLy.Ten,
                            dd.DaiLy.DiaChi,
                            dd.DaiLy.SoDienThoai,
                            dd.DaiLy.Email,
                            dd.DaiLy.NguoiDaiDien,
                            dd.DaiLy.TrangThai
                        }).ToList()
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
            using var transaction = _context.Database.BeginTransaction();
            try
            {
                var donVi = new DonVi
                {
                    MaCoQuanBHXH = donViDto.MaCoQuanBHXH,
                    MaSoBHXH = donViDto.MaSoBHXH,
                    TenDonVi = donViDto.TenDonVi,
                    IsBHXHTN = donViDto.IsBHXHTN,
                    IsBHYT = donViDto.IsBHYT,
                    DmKhoiKcbId = donViDto.DmKhoiKcbId,
                    TrangThai = donViDto.TrangThai
                };

                _context.DonVis.Add(donVi);
                await _context.SaveChangesAsync();

                // Thêm quan hệ với các đại lý
                foreach (var daiLyId in donViDto.DaiLyIds)
                {
                    var daiLyDonVi = new DaiLyDonVi
                    {
                        DaiLyId = daiLyId,
                        DonViId = donVi.Id,
                        TrangThai = true,
                        NguoiTao = User.Identity?.Name ?? "system"
                    };
                    _context.DaiLyDonVis.Add(daiLyDonVi);
                }
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return CreatedAtAction(nameof(GetDonVi), new { id = donVi.Id }, donVi);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error creating don vi: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo đơn vị", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDonVi(int id, [FromBody] DonViDTO donViDto)
        {
            using var transaction = _context.Database.BeginTransaction();
            try
            {
                var donVi = await _context.DonVis.FindAsync(id);
                if (donVi == null)
                {
                    return NotFound(new { message = $"Không tìm thấy đơn vị có ID: {id}" });
                }

                // Cập nhật thông tin đơn vị
                donVi.MaCoQuanBHXH = donViDto.MaCoQuanBHXH;
                donVi.MaSoBHXH = donViDto.MaSoBHXH;
                donVi.TenDonVi = donViDto.TenDonVi;
                donVi.IsBHXHTN = donViDto.IsBHXHTN;
                donVi.IsBHYT = donViDto.IsBHYT;
                donVi.DmKhoiKcbId = donViDto.DmKhoiKcbId;
                donVi.TrangThai = donViDto.TrangThai;
                donVi.UpdatedAt = DateTime.UtcNow;

                // Cập nhật quan hệ với đại lý
                var existingRelations = await _context.DaiLyDonVis
                    .Where(dd => dd.DonViId == id)
                    .ToListAsync();

                // Vô hiệu hóa các quan hệ không còn trong danh sách mới
                foreach (var relation in existingRelations)
                {
                    if (!donViDto.DaiLyIds.Contains(relation.DaiLyId))
                    {
                        relation.TrangThai = false;
                    }
                }

                // Thêm các quan hệ mới
                foreach (var daiLyId in donViDto.DaiLyIds)
                {
                    var existingRelation = existingRelations
                        .FirstOrDefault(r => r.DaiLyId == daiLyId);

                    if (existingRelation == null)
                    {
                        // Tạo quan hệ mới
                        var daiLyDonVi = new DaiLyDonVi
                        {
                            DaiLyId = daiLyId,
                            DonViId = id,
                            TrangThai = true,
                            NguoiTao = User.Identity?.Name ?? "system"
                        };
                        _context.DaiLyDonVis.Add(daiLyDonVi);
                    }
                    else if (!existingRelation.TrangThai)
                    {
                        // Kích hoạt lại quan hệ đã bị vô hiệu hóa
                        existingRelation.TrangThai = true;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { 
                    message = "Cập nhật đơn vị thành công",
                    data = donVi
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error updating don vi: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật đơn vị", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonVi(int id)
        {
            try
            {
                var donVi = await _context.DonVis.FindAsync(id);
                if (donVi == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn vị" });
                }

                // Kiểm tra xem đơn vị có đợt kê khai nào không
                var dotKeKhaiCount = await _context.DotKeKhais
                    .Where(x => x.don_vi_id == id)
                    .CountAsync();

                if (dotKeKhaiCount > 0)
                {
                    return BadRequest(new {
                        message = "Không thể xóa đơn vị này vì đang có đợt kê khai liên quan",
                        dotKeKhaiCount = dotKeKhaiCount
                    });
                }

                // Xóa các bản ghi liên quan trong bảng dai_ly_don_vi trước
                var daiLyDonVis = await _context.DaiLyDonVis
                    .Where(x => x.DonViId == id)
                    .ToListAsync();

                if (daiLyDonVis.Any())
                {
                    _context.DaiLyDonVis.RemoveRange(daiLyDonVis);
                    await _context.SaveChangesAsync();
                }

                // Sau đó mới xóa đơn vị
                _context.DonVis.Remove(donVi);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa đơn vị thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting don vi: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Có lỗi xảy ra khi xóa đơn vị",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("by-dai-ly/{daiLyId}")]
        public async Task<ActionResult<IEnumerable<DonVi>>> GetDonVisByDaiLy(int daiLyId)
        {
            try
            {
                var donVis = await _context.DaiLyDonVis
                    .Where(dd => dd.DaiLyId == daiLyId && dd.TrangThai)
                    .Select(dd => new
                    {
                        dd.DonVi.Id,
                        dd.DonVi.MaCoQuanBHXH,
                        dd.DonVi.MaSoBHXH, 
                        dd.DonVi.TenDonVi,
                        dd.DonVi.IsBHXHTN,
                        dd.DonVi.IsBHYT,
                        dd.DonVi.DmKhoiKcbId,
                        dd.DonVi.Type,
                        dd.DonVi.TrangThai
                    })
                    .OrderBy(d => d.TenDonVi)
                    .ToListAsync();

                if (!donVis.Any())
                {
                    return Ok(new List<DonVi>()); // Trả về mảng rỗng nếu không có dữ liệu
                }

                return Ok(donVis);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting don vi list by dai ly: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách đơn vị", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] Dictionary<string, bool> data)
        {
            try 
            {
                if (!data.ContainsKey("trangThai"))
                {
                    return BadRequest(new { message = "Thiếu thông tin trạng thái" });
                }

                var donVi = await _context.DonVis.FindAsync(id);
                if (donVi == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn vị" });
                }

                donVi.TrangThai = data["trangThai"];
                donVi.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Cập nhật trạng thái thành công",
                    data = donVi
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating don vi status: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Lỗi khi cập nhật trạng thái đơn vị",
                    error = ex.Message 
                });
            }
        }
    }
} 