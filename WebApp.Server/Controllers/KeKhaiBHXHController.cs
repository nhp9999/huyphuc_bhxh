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

namespace WebApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dot-ke-khai")]
    public class KeKhaiBHXHController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<KeKhaiBHXHController> _logger;

        public KeKhaiBHXHController(
            ApplicationDbContext context,
            ILogger<KeKhaiBHXHController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh
        [HttpGet("{dotKeKhaiId}/ke-khai-bhxh")]
        public async Task<ActionResult<IEnumerable<object>>> GetKeKhaiBHXHsByDotKeKhaiId(int dotKeKhaiId)
        {
            try
            {
                var keKhaiBHXHs = await _context.KeKhaiBHXHs
                    .Include(k => k.ThongTinThe)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId)
                    .Select(k => new {
                        k.id,
                        k.dot_ke_khai_id,
                        k.thong_tin_the_id,
                        ma_so_bhxh = k.ThongTinThe.ma_so_bhxh,
                        ho_ten = k.ThongTinThe.ho_ten,
                        cccd = k.ThongTinThe.cccd,
                        ngay_sinh = k.ThongTinThe.ngay_sinh,
                        gioi_tinh = k.ThongTinThe.gioi_tinh,
                        k.muc_thu_nhap,
                        k.ty_le_dong,
                        k.ty_le_nsnn,
                        k.loai_nsnn,
                        k.tien_ho_tro,
                        k.so_tien_phai_dong,
                        k.phuong_thuc_dong,
                        k.thang_bat_dau,
                        k.tu_thang,
                        k.so_thang_dong,
                        k.phuong_an,
                        k.loai_khai_bao,
                        k.ngay_bien_lai,
                        k.so_bien_lai,
                        k.trang_thai,
                        k.nguoi_tao,
                        k.ngay_tao,
                        k.ghi_chu
                    })
                    .ToListAsync();

                return Ok(keKhaiBHXHs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách kê khai BHXH theo đợt kê khai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kê khai BHXH", error = ex.Message });
            }
        }

        // GET: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh/{id}
        [HttpGet("{dotKeKhaiId}/ke-khai-bhxh/{id}")]
        public async Task<ActionResult<KeKhaiBHXH>> GetKeKhaiBHXH(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHXH = await _context.KeKhaiBHXHs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);

                if (keKhaiBHXH == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHXH" });
                }

                return Ok(keKhaiBHXH);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy thông tin kê khai BHXH: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin kê khai BHXH", error = ex.Message });
            }
        }

        // POST: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh
        [HttpPost("{dotKeKhaiId}/ke-khai-bhxh")]
        public async Task<ActionResult<KeKhaiBHXH>> CreateKeKhaiBHXH(int dotKeKhaiId, KeKhaiBHXH keKhaiBHXH)
        {
            try
            {
                keKhaiBHXH.dot_ke_khai_id = dotKeKhaiId;
                keKhaiBHXH.ngay_tao = DateTime.Now;

                _context.KeKhaiBHXHs.Add(keKhaiBHXH);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetKeKhaiBHXH), new { dotKeKhaiId, id = keKhaiBHXH.id }, keKhaiBHXH);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo kê khai BHXH: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo kê khai BHXH", error = ex.Message });
            }
        }

        // PUT: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh/{id}
        [HttpPut("{dotKeKhaiId}/ke-khai-bhxh/{id}")]
        public async Task<IActionResult> UpdateKeKhaiBHXH(int dotKeKhaiId, int id, KeKhaiBHXH keKhaiBHXH)
        {
            if (id != keKhaiBHXH.id || dotKeKhaiId != keKhaiBHXH.dot_ke_khai_id)
            {
                return BadRequest(new { message = "ID không khớp" });
            }

            try
            {
                _context.Entry(keKhaiBHXH).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KeKhaiBHXHExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHXH" });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật kê khai BHXH: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật kê khai BHXH", error = ex.Message });
            }
        }

        // DELETE: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh/{id}
        [HttpDelete("{dotKeKhaiId}/ke-khai-bhxh/{id}")]
        public async Task<IActionResult> DeleteKeKhaiBHXH(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHXH = await _context.KeKhaiBHXHs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);

                if (keKhaiBHXH == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHXH" });
                }

                _context.KeKhaiBHXHs.Remove(keKhaiBHXH);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa kê khai BHXH: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa kê khai BHXH", error = ex.Message });
            }
        }

        private bool KeKhaiBHXHExists(int id)
        {
            return _context.KeKhaiBHXHs.Any(e => e.id == id);
        }
    }
} 