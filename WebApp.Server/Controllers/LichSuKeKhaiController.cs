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
using OfficeOpenXml;

namespace WebApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/ke-khai-bhyt")]
    public class LichSuKeKhaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LichSuKeKhaiController> _logger;

        public LichSuKeKhaiController(
            ApplicationDbContext context,
            ILogger<LichSuKeKhaiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("lich-su")]
        public async Task<ActionResult<IEnumerable<KeKhaiBHYT>>> GetLichSuKeKhai(
            [FromQuery] string? maSoBHXH,
            [FromQuery] string? cccd,
            [FromQuery] string? hoTen,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay)
        {
            try
            {
                var query = _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .AsQueryable();

                // Áp dụng các điều kiện tìm kiếm
                if (!string.IsNullOrEmpty(maSoBHXH))
                {
                    query = query.Where(k => k.ThongTinThe.ma_so_bhxh.Contains(maSoBHXH));
                }

                if (!string.IsNullOrEmpty(cccd))
                {
                    query = query.Where(k => k.ThongTinThe.cccd.Contains(cccd));
                }

                if (!string.IsNullOrEmpty(hoTen))
                {
                    query = query.Where(k => k.ThongTinThe.ho_ten.Contains(hoTen));
                }

                if (tuNgay.HasValue)
                {
                    query = query.Where(k => k.ngay_tao >= tuNgay.Value.Date);
                }

                if (denNgay.HasValue)
                {
                    query = query.Where(k => k.ngay_tao <= denNgay.Value.Date.AddDays(1).AddSeconds(-1));
                }

                // Sắp xếp theo ngày tạo mới nhất
                query = query.OrderByDescending(k => k.ngay_tao);

                var keKhaiBHYTs = await query
                    .Select(k => new
                    {
                        k.id,
                        k.dot_ke_khai_id,
                        k.thong_tin_the_id,
                        k.nguoi_thu,
                        k.so_thang_dong,
                        k.phuong_an_dong,
                        k.han_the_cu,
                        k.han_the_moi_tu,
                        k.han_the_moi_den,
                        k.ngay_tao,
                        k.ngay_bien_lai,
                        k.so_tien_can_dong,
                        k.is_urgent,
                        ThongTinThe = new
                        {
                            k.ThongTinThe.ma_so_bhxh,
                            k.ThongTinThe.cccd,
                            k.ThongTinThe.ho_ten,
                            k.ThongTinThe.ngay_sinh,
                            k.ThongTinThe.gioi_tinh,
                            k.ThongTinThe.so_dien_thoai
                        },
                        DotKeKhai = new
                        {
                            k.DotKeKhai.so_dot,
                            k.DotKeKhai.thang,
                            k.DotKeKhai.nam,
                            k.DotKeKhai.trang_thai
                        }
                    })
                    .ToListAsync();

                return Ok(keKhaiBHYTs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting lich su ke khai: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy lịch sử kê khai", error = ex.Message });
            }
        }

        [HttpGet("lich-su/export")]
        public async Task<IActionResult> ExportLichSuKeKhai(
            [FromQuery] string? maSoBHXH,
            [FromQuery] string? cccd,
            [FromQuery] string? hoTen,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay)
        {
            try
            {
                var query = _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .AsQueryable();

                // Áp dụng các điều kiện tìm kiếm
                if (!string.IsNullOrEmpty(maSoBHXH))
                {
                    query = query.Where(k => k.ThongTinThe.ma_so_bhxh.Contains(maSoBHXH));
                }

                if (!string.IsNullOrEmpty(cccd))
                {
                    query = query.Where(k => k.ThongTinThe.cccd.Contains(cccd));
                }

                if (!string.IsNullOrEmpty(hoTen))
                {
                    query = query.Where(k => k.ThongTinThe.ho_ten.Contains(hoTen));
                }

                if (tuNgay.HasValue)
                {
                    query = query.Where(k => k.ngay_tao >= tuNgay.Value.Date);
                }

                if (denNgay.HasValue)
                {
                    query = query.Where(k => k.ngay_tao <= denNgay.Value.Date.AddDays(1).AddSeconds(-1));
                }

                var data = await query.ToListAsync();

                // Tạo file Excel
                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Lịch sử kê khai");

                    // Thêm header
                    worksheet.Cells[1, 1].Value = "Đợt kê khai";
                    worksheet.Cells[1, 2].Value = "Mã số BHXH";
                    worksheet.Cells[1, 3].Value = "Họ tên";
                    worksheet.Cells[1, 4].Value = "CCCD";
                    worksheet.Cells[1, 5].Value = "Ngày sinh";
                    worksheet.Cells[1, 6].Value = "Giới tính";
                    worksheet.Cells[1, 7].Value = "Người thứ";
                    worksheet.Cells[1, 8].Value = "Phương án đóng";
                    worksheet.Cells[1, 9].Value = "Số tháng đóng";
                    worksheet.Cells[1, 10].Value = "Số tiền đóng";
                    worksheet.Cells[1, 11].Value = "Ngày tạo";
                    worksheet.Cells[1, 12].Value = "Trạng thái";

                    // Thêm dữ liệu
                    int row = 2;
                    foreach (var item in data)
                    {
                        worksheet.Cells[row, 1].Value = $"Đợt {item.DotKeKhai.so_dot} tháng {item.DotKeKhai.thang} năm {item.DotKeKhai.nam}";
                        worksheet.Cells[row, 2].Value = item.ThongTinThe.ma_so_bhxh;
                        worksheet.Cells[row, 3].Value = item.ThongTinThe.ho_ten;
                        worksheet.Cells[row, 4].Value = item.ThongTinThe.cccd;
                        worksheet.Cells[row, 5].Value = item.ThongTinThe.ngay_sinh.ToString("dd/MM/yyyy");
                        worksheet.Cells[row, 6].Value = item.ThongTinThe.gioi_tinh;
                        worksheet.Cells[row, 7].Value = item.nguoi_thu;
                        worksheet.Cells[row, 8].Value = item.phuong_an_dong;
                        worksheet.Cells[row, 9].Value = item.so_thang_dong;
                        worksheet.Cells[row, 10].Value = item.so_tien_can_dong;
                        worksheet.Cells[row, 11].Value = item.ngay_tao.ToString("dd/MM/yyyy HH:mm");
                        worksheet.Cells[row, 12].Value = item.DotKeKhai.trang_thai;
                        row++;
                    }

                    // Format các cột
                    worksheet.Cells.AutoFitColumns();

                    // Trả về file Excel
                    var content = package.GetAsByteArray();
                    var fileName = $"lich-su-ke-khai-{DateTime.Now:yyyyMMddHHmmss}.xlsx";

                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting lich su ke khai: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Lỗi khi xuất lịch sử kê khai", error = ex.Message });
            }
        }
    }
} 