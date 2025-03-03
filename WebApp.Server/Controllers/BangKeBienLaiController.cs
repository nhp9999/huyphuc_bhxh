using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WebApp.API.Data;
using WebApp.API.Models;
using System.Security.Claims;

namespace WebApp.API.Controllers
{
    [Route("api/bien-lai/bang-ke")]
    [ApiController]
    public class BangKeBienLaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BangKeBienLaiController> _logger;

        public BangKeBienLaiController(
            ApplicationDbContext context,
            ILogger<BangKeBienLaiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetBangKeBienLai(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] string? quyenSo = null,
            [FromQuery] string? maNhanVien = null)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại từ token
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                // Lấy thông tin người dùng từ database
                var currentUser = await _context.NguoiDungs
                    .FirstOrDefaultAsync(u => u.user_name == username);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                var query = _context.BienLais
                    .Include(b => b.KeKhaiBHYT)
                        .ThenInclude(k => k.ThongTinThe)
                    .AsQueryable();

                // Chỉ lấy biên lai của người dùng hiện tại
                query = query.Where(b => b.ma_nhan_vien == currentUser.ma_nhan_vien);

                if (tuNgay.HasValue)
                {
                    query = query.Where(b => b.ngay_bien_lai.Date >= tuNgay.Value.Date);
                }

                if (denNgay.HasValue)
                {
                    query = query.Where(b => b.ngay_bien_lai.Date <= denNgay.Value.Date);
                }

                if (!string.IsNullOrEmpty(quyenSo))
                {
                    query = query.Where(b => b.quyen_so.Contains(quyenSo));
                }

                if (!string.IsNullOrEmpty(maNhanVien))
                {
                    query = query.Where(b => b.ma_nhan_vien.Contains(maNhanVien));
                }

                var result = await query
                    .Select(b => new
                    {
                        quyen_so = b.quyen_so,
                        so_bien_lai = b.so_bien_lai,
                        ten_nguoi_dong = b.ten_nguoi_dong,
                        ma_so_bhxh = b.ma_so_bhxh,
                        so_tien = b.so_tien,
                        ngay_bien_lai = b.ngay_bien_lai,
                        ma_nhan_vien = b.ma_nhan_vien,
                        ghi_chu = b.ghi_chu,
                        trang_thai = b.trang_thai,
                        tinh_chat = b.tinh_chat,
                        ngay_tao = b.ngay_tao
                    })
                    .OrderByDescending(b => b.ngay_tao)
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting bang ke bien lai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu bảng kê biên lai" });
            }
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportBangKeBienLai(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] string? quyenSo = null,
            [FromQuery] string? maNhanVien = null)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại từ token
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                // Lấy thông tin người dùng từ database
                var currentUser = await _context.NguoiDungs
                    .FirstOrDefaultAsync(u => u.user_name == username);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                var query = _context.BienLais
                    .Include(b => b.KeKhaiBHYT)
                        .ThenInclude(k => k.ThongTinThe)
                    .AsQueryable();

                // Chỉ lấy biên lai của người dùng hiện tại
                query = query.Where(b => b.ma_nhan_vien == currentUser.ma_nhan_vien);

                if (tuNgay.HasValue)
                {
                    query = query.Where(b => b.ngay_bien_lai.Date >= tuNgay.Value.Date);
                }

                if (denNgay.HasValue)
                {
                    query = query.Where(b => b.ngay_bien_lai.Date <= denNgay.Value.Date);
                }

                if (!string.IsNullOrEmpty(quyenSo))
                {
                    query = query.Where(b => b.quyen_so.Contains(quyenSo));
                }

                if (!string.IsNullOrEmpty(maNhanVien))
                {
                    query = query.Where(b => b.ma_nhan_vien.Contains(maNhanVien));
                }

                var data = await query
                    .Select(b => new
                    {
                        quyen_so = b.quyen_so,
                        so_bien_lai = b.so_bien_lai,
                        ten_nguoi_dong = b.ten_nguoi_dong,
                        ma_so_bhxh = b.ma_so_bhxh,
                        so_tien = b.so_tien,
                        ngay_bien_lai = b.ngay_bien_lai,
                        ma_nhan_vien = b.ma_nhan_vien,
                        ghi_chu = b.ghi_chu,
                        trang_thai = b.trang_thai,
                        tinh_chat = b.tinh_chat,
                        ngay_tao = b.ngay_tao
                    })
                    .OrderByDescending(b => b.ngay_tao)
                    .ToListAsync();

                // TODO: Implement export Excel logic here
                return File(new byte[] { }, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    $"bang-ke-bien-lai-{DateTime.Now:yyyyMMddHHmmss}.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting bang ke bien lai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xuất bảng kê biên lai" });
            }
        }
    }
} 