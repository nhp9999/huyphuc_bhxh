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
    [Route("api/thong-tin-the")]
    public class ThongTinTheController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ThongTinTheController> _logger;

        public ThongTinTheController(
            ApplicationDbContext context,
            ILogger<ThongTinTheController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ThongTinThe>>> GetAll()
        {
            try
            {
                var result = await _context.ThongTinThes
                    .OrderByDescending(x => x.ngay_tao)
                    .ToListAsync();
                    
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting thong tin the list: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách thông tin thẻ", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ThongTinThe>> GetById(int id)
        {
            try
            {
                var thongTinThe = await _context.ThongTinThes.FindAsync(id);

                if (thongTinThe == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin thẻ" });
                }

                return Ok(thongTinThe);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting thong tin the {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin thẻ", error = ex.Message });
            }
        }

        [HttpGet("cccd/{cccd}")]
        public async Task<ActionResult<ThongTinThe>> GetByCCCD(string cccd)
        {
            try
            {
                var thongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(x => x.cccd == cccd);

                if (thongTinThe == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin thẻ" });
                }

                return Ok(thongTinThe);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting thong tin the by CCCD {cccd}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin thẻ", error = ex.Message });
            }
        }

        [HttpGet("ma-so-bhxh/{maSoBHXH}")]
        public async Task<ActionResult<ThongTinThe>> GetByMaSoBHXH(string maSoBHXH)
        {
            try
            {
                var thongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(x => x.ma_so_bhxh == maSoBHXH);

                if (thongTinThe == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin thẻ" });
                }

                return Ok(thongTinThe);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting thong tin the by ma so BHXH {maSoBHXH}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin thẻ", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ThongTinThe>> Create(ThongTinThe thongTinThe)
        {
            try
            {
                _logger.LogInformation($"Received data: {JsonSerializer.Serialize(thongTinThe)}");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning($"Invalid model state: {JsonSerializer.Serialize(ModelState)}");
                    return BadRequest(ModelState);
                }

                // Kiểm tra xem mã số BHXH đã tồn tại chưa
                var existingThongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(x => x.ma_so_bhxh == thongTinThe.ma_so_bhxh);

                if (existingThongTinThe != null)
                {
                    // Nếu đã tồn tại, trả về thông tin thẻ cũ
                    return Ok(existingThongTinThe);
                }

                // Nếu chưa tồn tại, tạo mới
                thongTinThe.ngay_tao = DateTime.UtcNow;
                _context.ThongTinThes.Add(thongTinThe);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = thongTinThe.id }, thongTinThe);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating thong tin the: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo thông tin thẻ", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ThongTinThe thongTinThe)
        {
            if (id != thongTinThe.id)
            {
                return BadRequest(new { message = "ID không khớp" });
            }

            try
            {
                var existingThongTinThe = await _context.ThongTinThes.FindAsync(id);
                if (existingThongTinThe == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin thẻ" });
                }

                _context.Entry(existingThongTinThe).CurrentValues.SetValues(thongTinThe);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ThongTinTheExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy thông tin thẻ" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating thong tin the {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật thông tin thẻ", error = ex.Message });
            }
        }

        private bool ThongTinTheExists(int id)
        {
            return _context.ThongTinThes.Any(e => e.id == id);
        }
    }
} 