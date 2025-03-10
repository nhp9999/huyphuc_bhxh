using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WebApp.API.Data;
using WebApp.API.Models;
using System.Security.Claims;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

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
                    .Include(b => b.KeKhaiBHYT)
                        .ThenInclude(k => k.DotKeKhai)
                            .ThenInclude(d => d.DonVi)
                    .AsQueryable();

                // Chỉ lấy biên lai của người dùng hiện tại nếu không phải admin hoặc super admin
                if (!currentUser.roles.Contains("admin") && !currentUser.roles.Contains("super_admin"))
                {
                    query = query.Where(b => b.ma_nhan_vien == currentUser.ma_nhan_vien);
                }

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
                        ngay_bien_lai = b.ngay_bien_lai.Date,
                        ma_nhan_vien = b.ma_nhan_vien,
                        ten_nhan_vien = _context.NguoiDungs
                            .Where(n => n.ma_nhan_vien == b.ma_nhan_vien)
                            .Select(n => n.ho_ten)
                            .FirstOrDefault(),
                        ghi_chu = b.ghi_chu,
                        trang_thai = b.trang_thai,
                        tinh_chat = b.tinh_chat,
                        ngay_tao = b.ngay_tao,
                        don_vi = b.KeKhaiBHYT != null && b.KeKhaiBHYT.DotKeKhai != null && b.KeKhaiBHYT.DotKeKhai.DonVi != null ? 
                            b.KeKhaiBHYT.DotKeKhai.DonVi.TenDonVi : null,
                        ma_ho_so = b.KeKhaiBHYT != null ? b.KeKhaiBHYT.ma_ho_so : 
                                  (b.KeKhaiBHYT != null && b.KeKhaiBHYT.DotKeKhai != null ? 
                                   b.KeKhaiBHYT.DotKeKhai.ma_ho_so : null),
                        so_thang_dong = b.KeKhaiBHYT != null ? b.KeKhaiBHYT.so_thang_dong : 0,
                        nguoi_thu = b.KeKhaiBHYT != null ? b.KeKhaiBHYT.nguoi_thu : 0
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
                    .Include(b => b.KeKhaiBHYT)
                        .ThenInclude(k => k.DotKeKhai)
                            .ThenInclude(d => d.DonVi)
                    .AsQueryable();

                // Chỉ lấy biên lai của người dùng hiện tại nếu không phải admin hoặc super admin
                if (!currentUser.roles.Contains("admin") && !currentUser.roles.Contains("super_admin"))
                {
                    query = query.Where(b => b.ma_nhan_vien == currentUser.ma_nhan_vien);
                }

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
                        ngay_bien_lai = b.ngay_bien_lai.Date,
                        ma_nhan_vien = b.ma_nhan_vien,
                        ten_nhan_vien = _context.NguoiDungs
                            .Where(n => n.ma_nhan_vien == b.ma_nhan_vien)
                            .Select(n => n.ho_ten)
                            .FirstOrDefault(),
                        ghi_chu = b.ghi_chu,
                        trang_thai = b.trang_thai,
                        tinh_chat = b.tinh_chat,
                        ngay_tao = b.ngay_tao,
                        don_vi = b.KeKhaiBHYT != null && b.KeKhaiBHYT.DotKeKhai != null && b.KeKhaiBHYT.DotKeKhai.DonVi != null ? 
                            b.KeKhaiBHYT.DotKeKhai.DonVi.TenDonVi : null,
                        ma_ho_so = b.KeKhaiBHYT != null ? b.KeKhaiBHYT.ma_ho_so : 
                                  (b.KeKhaiBHYT != null && b.KeKhaiBHYT.DotKeKhai != null ? 
                                   b.KeKhaiBHYT.DotKeKhai.ma_ho_so : null),
                        so_thang_dong = b.KeKhaiBHYT != null ? b.KeKhaiBHYT.so_thang_dong : 0,
                        nguoi_thu = b.KeKhaiBHYT != null ? b.KeKhaiBHYT.nguoi_thu : 0
                    })
                    .OrderByDescending(b => b.ngay_tao)
                    .ToListAsync();

                // Tạo file Excel mới
                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Bảng kê biên lai");
                    
                    // Thiết lập tiêu đề
                    worksheet.Cells["A1:J1"].Merge = true;
                    worksheet.Cells["A1"].Value = "BẢNG KÊ BIÊN LAI";
                    worksheet.Cells["A1"].Style.Font.Size = 16;
                    worksheet.Cells["A1"].Style.Font.Bold = true;
                    worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Thiết lập header
                    var headers = new[] { "Quyển số", "Số biên lai", "Tên người đóng", "Mã số BHXH", "Số tiền", "Ngày biên lai", "Mã NV", "Tên nhân viên", "Đơn vị", "Mã hồ sơ", "Số tháng", "Người thứ", "Ghi chú", "Trạng thái", "Tính chất" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cells[3, i + 1].Value = headers[i];
                        worksheet.Cells[3, i + 1].Style.Font.Bold = true;
                        worksheet.Cells[3, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                        worksheet.Cells[3, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                        worksheet.Cells[3, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    }

                    // Điền dữ liệu
                    int row = 4;
                    decimal tongSoTien = 0;
                    foreach (var item in data)
                    {
                        worksheet.Cells[row, 1].Value = item.quyen_so;
                        worksheet.Cells[row, 2].Value = item.so_bien_lai;
                        worksheet.Cells[row, 3].Value = item.ten_nguoi_dong;
                        worksheet.Cells[row, 4].Value = item.ma_so_bhxh;
                        worksheet.Cells[row, 5].Value = item.so_tien;
                        worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0";
                        worksheet.Cells[row, 6].Value = item.ngay_bien_lai.ToString("dd/MM/yyyy");
                        worksheet.Cells[row, 7].Value = item.ma_nhan_vien;
                        worksheet.Cells[row, 8].Value = item.ten_nhan_vien;
                        worksheet.Cells[row, 9].Value = item.don_vi;
                        worksheet.Cells[row, 10].Value = item.ma_ho_so;
                        worksheet.Cells[row, 11].Value = item.so_thang_dong;
                        worksheet.Cells[row, 12].Value = GetNguoiThuText(item.nguoi_thu);
                        worksheet.Cells[row, 13].Value = item.ghi_chu;
                        worksheet.Cells[row, 14].Value = item.trang_thai;
                        worksheet.Cells[row, 15].Value = item.tinh_chat;

                        // Thêm border cho các ô
                        worksheet.Cells[row, 1, row, 15].Style.Border.BorderAround(ExcelBorderStyle.Thin);

                        tongSoTien += item.so_tien;
                        row++;
                    }

                    // Thêm tổng số tiền
                    worksheet.Cells[row + 1, 4].Value = "Tổng số tiền:";
                    worksheet.Cells[row + 1, 4].Style.Font.Bold = true;
                    worksheet.Cells[row + 1, 5].Value = tongSoTien;
                    worksheet.Cells[row + 1, 5].Style.Font.Bold = true;
                    worksheet.Cells[row + 1, 5].Style.Numberformat.Format = "#,##0";

                    // Tự động điều chỉnh độ rộng cột
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    // Tạo file Excel
                    var content = package.GetAsByteArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                        $"bang-ke-bien-lai-{DateTime.Now:yyyyMMddHHmmss}.xlsx");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting bang ke bien lai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xuất bảng kê biên lai" });
            }
        }

        // Hàm chuyển đổi số người thứ sang text
        private string GetNguoiThuText(int nguoiThu)
        {
            switch (nguoiThu)
            {
                case 1:
                    return "Người thứ 1";
                case 2:
                    return "Người thứ 2";
                case 3:
                    return "Người thứ 3";
                case 4:
                    return "Người thứ 4";
                case 5:
                    return "Người thứ 5 trở đi";
                default:
                    return "";
            }
        }
    }
} 