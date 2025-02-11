using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HoaDonThanhToanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HoaDonThanhToanController> _logger;

        public HoaDonThanhToanController(
            ApplicationDbContext context,
            ILogger<HoaDonThanhToanController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public class CreateHoaDonRequest
        {
            public int dot_ke_khai_id { get; set; }
            public string noi_dung_thanh_toan { get; set; }
            public string url_bill { get; set; }
            public string public_id { get; set; }
            public string nguoi_tao { get; set; }
            public string? ghi_chu { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<HoaDonThanhToan>> CreateHoaDon(CreateHoaDonRequest request)
        {
            try
            {
                // Kiểm tra đợt kê khai tồn tại
                var dotKeKhai = await _context.DotKeKhais.FindAsync(request.dot_ke_khai_id);
                if (dotKeKhai == null)
                {
                    return BadRequest(new { message = "Không tìm thấy đợt kê khai" });
                }

                // Lấy tổng số tiền từ đợt kê khai
                var tongSoTien = await _context.KeKhaiBHYTs
                    .Where(k => k.dot_ke_khai_id == request.dot_ke_khai_id)
                    .SumAsync(k => k.so_tien_can_dong);

                var hoaDon = new HoaDonThanhToan
                {
                    dot_ke_khai_id = request.dot_ke_khai_id,
                    noi_dung_thanh_toan = request.noi_dung_thanh_toan,
                    url_bill = request.url_bill,
                    public_id = request.public_id,
                    nguoi_tao = request.nguoi_tao,
                    ghi_chu = request.ghi_chu,
                    so_tien = tongSoTien,
                    ngay_tao = DateTime.UtcNow,
                    ngay_thanh_toan = DateTime.UtcNow,
                    trang_thai = "cho_duyet"
                };

                _context.HoaDonThanhToans.Add(hoaDon);

                // Cập nhật url_bill cho đợt kê khai
                dotKeKhai.url_bill = request.url_bill;
                _context.DotKeKhais.Update(dotKeKhai);

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetHoaDon), new { id = hoaDon.id }, hoaDon);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating hoa don: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo hóa đơn", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HoaDonThanhToan>> GetHoaDon(int id)
        {
            try
            {
                var hoaDon = await _context.HoaDonThanhToans.FindAsync(id);

                if (hoaDon == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn" });
                }

                return Ok(hoaDon);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting hoa don {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin hóa đơn", error = ex.Message });
            }
        }
    }
} 