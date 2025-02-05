using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace WebApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dot-ke-khai")]
    public class KeKhaiBHYTController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<KeKhaiBHYTController> _logger;

        public KeKhaiBHYTController(
            ApplicationDbContext context,
            ILogger<KeKhaiBHYTController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{dotKeKhaiId}/ke-khai-bhyt")]
        public async Task<ActionResult<IEnumerable<KeKhaiBHYT>>> GetByDotKeKhai(int dotKeKhaiId)
        {
            try
            {
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.ThongTinThe)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId)
                    .Select(k => new KeKhaiBHYT
                    {
                        id = k.id,
                        dot_ke_khai_id = k.dot_ke_khai_id,
                        thong_tin_the_id = k.thong_tin_the_id,
                        nguoi_thu = k.nguoi_thu,
                        so_thang_dong = k.so_thang_dong,
                        phuong_an_dong = k.phuong_an_dong,
                        han_the_cu = k.han_the_cu,
                        han_the_moi_tu = k.han_the_moi_tu,
                        han_the_moi_den = k.han_the_moi_den,
                        tinh_nkq = k.tinh_nkq,
                        huyen_nkq = k.huyen_nkq,
                        xa_nkq = k.xa_nkq,
                        dia_chi_nkq = k.dia_chi_nkq,
                        benh_vien_kcb = k.benh_vien_kcb,
                        nguoi_tao = k.nguoi_tao,
                        ngay_tao = k.ngay_tao,
                        ngay_bien_lai = k.ngay_bien_lai,
                        so_tien_can_dong = k.so_tien_can_dong,
                        DotKeKhai = k.DotKeKhai,
                        ThongTinThe = k.ThongTinThe
                    })
                    .ToListAsync();

                return Ok(keKhaiBHYTs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting ke khai BHYT list by dot ke khai {dotKeKhaiId}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kê khai BHYT", error = ex.Message });
            }
        }

        [HttpGet("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<ActionResult<KeKhaiBHYT>> GetKeKhaiBHYT(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);

                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                return Ok(keKhaiBHYT);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPost("{dotKeKhaiId}/ke-khai-bhyt")]
        public async Task<ActionResult<KeKhaiBHYT>> CreateKeKhaiBHYT(int dotKeKhaiId, KeKhaiBHYT keKhaiBHYT)
        {
            try
            {
                _logger.LogInformation($"Received data: {JsonSerializer.Serialize(keKhaiBHYT)}");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning($"Invalid model state: {JsonSerializer.Serialize(ModelState)}");
                    return BadRequest(ModelState);
                }

                var dotKeKhai = await _context.DotKeKhais.FindAsync(dotKeKhaiId);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                // Kiểm tra xem ThongTinThe đã tồn tại chưa
                var existingThongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(t => t.id == keKhaiBHYT.ThongTinThe.id);

                if (existingThongTinThe != null)
                {
                    // Nếu đã tồn tại, sử dụng lại thông tin thẻ đó
                    keKhaiBHYT.ThongTinThe = existingThongTinThe;
                }

                // Gán DotKeKhai từ database
                keKhaiBHYT.DotKeKhai = dotKeKhai;
                keKhaiBHYT.dot_ke_khai_id = dotKeKhaiId;
                keKhaiBHYT.ngay_tao = DateTime.UtcNow;
                keKhaiBHYT.nguoi_tao = User.Identity?.Name;

                _context.KeKhaiBHYTs.Add(keKhaiBHYT);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetKeKhaiBHYT), new { dotKeKhaiId, id = keKhaiBHYT.id }, keKhaiBHYT);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating ke khai BHYT: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPut("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<IActionResult> UpdateKeKhaiBHYT(int dotKeKhaiId, int id, KeKhaiBHYT keKhaiBHYT)
        {
            if (id != keKhaiBHYT.id || dotKeKhaiId != keKhaiBHYT.dot_ke_khai_id)
            {
                return BadRequest(new { message = "ID không khớp" });
            }

            try
            {
                var existingKeKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);
                    
                if (existingKeKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Cập nhật thông tin thẻ
                if (existingKeKhaiBHYT.ThongTinThe != null && keKhaiBHYT.ThongTinThe != null)
                {
                    _context.Entry(existingKeKhaiBHYT.ThongTinThe).CurrentValues.SetValues(keKhaiBHYT.ThongTinThe);
                }

                // Cập nhật thông tin kê khai
                _context.Entry(existingKeKhaiBHYT).CurrentValues.SetValues(keKhaiBHYT);

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KeKhaiBHYTExists(dotKeKhaiId, id))
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật kê khai BHYT", error = ex.Message });
            }
        }

        [HttpDelete("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<IActionResult> DeleteKeKhaiBHYT(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);
                    
                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                _context.KeKhaiBHYTs.Remove(keKhaiBHYT);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPost("{dotKeKhaiId}/ke-khai-bhyt/delete-multiple")]
        public async Task<IActionResult> DeleteMultiple(int dotKeKhaiId, [FromBody] DeleteMultipleDto dto)
        {
            try
            {
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId && dto.ids.Contains(k.id))
                    .ToListAsync();

                _context.KeKhaiBHYTs.RemoveRange(keKhaiBHYTs);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting multiple ke khai BHYT: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa nhiều kê khai BHYT", error = ex.Message });
            }
        }

        private bool KeKhaiBHYTExists(int dotKeKhaiId, int id)
        {
            return _context.KeKhaiBHYTs.Any(e => e.dot_ke_khai_id == dotKeKhaiId && e.id == id);
        }

        [HttpPatch("{dotKeKhaiId}/ke-khai-bhyt/{id}/toggle-urgent")]
        public async Task<IActionResult> ToggleUrgent(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);
                    
                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Toggle trạng thái urgent
                keKhaiBHYT.is_urgent = !keKhaiBHYT.is_urgent;
                await _context.SaveChangesAsync();

                return Ok(new { is_urgent = keKhaiBHYT.is_urgent });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error toggling urgent status for ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái gấp", error = ex.Message });
            }
        }
    }

    public class DeleteMultipleDto
    {
        public int[] ids { get; set; }
    }
} 