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
    [Route("api/[controller]")]
    public class DotKeKhaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DotKeKhaiController> _logger;

        public DotKeKhaiController(
            ApplicationDbContext context,
            ILogger<DotKeKhaiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DotKeKhai>>> GetDotKeKhais()
        {
            try
            {
                var result = await _context.DotKeKhais
                    .Include(d => d.DonVi)
                    .OrderByDescending(x => x.ngay_tao)
                    .ToListAsync();
                    
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dot ke khai list: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách đợt kê khai", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DotKeKhai>> GetDotKeKhai(int id)
        {
            try
            {
                var dotKeKhai = await _context.DotKeKhais.FindAsync(id);

                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                return Ok(dotKeKhai);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin đợt kê khai", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DotKeKhai>> CreateDotKeKhai(DotKeKhai dotKeKhai)
        {
            try
            {
                // Log dữ liệu nhận được
                _logger.LogInformation($"Received data: {JsonSerializer.Serialize(dotKeKhai)}");

                // Kiểm tra dữ liệu đầu vào
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning($"Invalid model state: {JsonSerializer.Serialize(ModelState)}");
                    return BadRequest(ModelState);
                }

                // Tự động tạo tên đợt
                dotKeKhai.GenerateTenDot();
                if (string.IsNullOrEmpty(dotKeKhai.ten_dot))
                {
                    return BadRequest(new { message = "Không thể tạo tên đợt do dữ liệu không hợp lệ" });
                }

                dotKeKhai.ngay_tao = DateTime.UtcNow;
                dotKeKhai.nguoi_tao = User.Identity?.Name;
                
                _context.DotKeKhais.Add(dotKeKhai);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDotKeKhai), new { id = dotKeKhai.id }, dotKeKhai);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating dot ke khai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo đợt kê khai", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDotKeKhai(int id, DotKeKhai dotKeKhai)
        {
            try
            {
                if (id != dotKeKhai.id)
                {
                    return BadRequest(new { message = "ID không khớp" });
                }

                // Kiểm tra dữ liệu đầu vào
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Tự động tạo tên đợt
                dotKeKhai.GenerateTenDot();
                if (string.IsNullOrEmpty(dotKeKhai.ten_dot))
                {
                    return BadRequest(new { message = "Không thể tạo tên đợt do dữ liệu không hợp lệ" });
                }

                _context.Entry(dotKeKhai).State = EntityState.Modified;
                _context.Entry(dotKeKhai).Property(x => x.ngay_tao).IsModified = false;
                _context.Entry(dotKeKhai).Property(x => x.nguoi_tao).IsModified = false;

                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DotKeKhaiExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật đợt kê khai", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDotKeKhai(int id)
        {
            try
            {
                var dotKeKhai = await _context.DotKeKhais.FindAsync(id);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                _context.DotKeKhais.Remove(dotKeKhai);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa đợt kê khai", error = ex.Message });
            }
        }

        private bool DotKeKhaiExists(int id)
        {
            return _context.DotKeKhais.Any(e => e.id == id);
        }
    }
} 