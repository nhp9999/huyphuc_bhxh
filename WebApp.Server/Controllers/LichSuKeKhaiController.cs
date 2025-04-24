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
            [FromQuery] DateTime? denNgay,
            [FromQuery] int? donViId)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var userName = User.Identity?.Name;
                if (string.IsNullOrEmpty(userName))
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                // Kiểm tra vai trò của người dùng
                var currentUser = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.user_name == userName);
                if (currentUser == null)
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                var query = _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.DotKeKhai.DonVi)
                    .AsQueryable();

                // Nếu không phải admin hoặc super_admin, chỉ hiển thị kê khai do người dùng tạo
                if (!currentUser.roles.Contains("admin") && !currentUser.roles.Contains("super_admin"))
                {
                    query = query.Where(k => k.nguoi_tao == userName);
                }

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

                if (donViId.HasValue)
                {
                    query = query.Where(k => k.DotKeKhai.don_vi_id == donViId.Value);
                }

                // Sắp xếp theo ngày tạo mới nhất
                query = query.OrderByDescending(k => k.ngay_tao);

                // Lấy danh sách mã nhân viên từ bảng NguoiDung
                var nguoiDungMap = await _context.NguoiDungs
                    .Where(n => n.ma_nhan_vien != null && n.ma_nhan_vien != "")
                    .ToDictionaryAsync(n => n.user_name, n => n.ma_nhan_vien);

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
                        k.ma_ho_so,
                        k.nguoi_tao,
                        ma_nhan_vien = "",
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
                            k.DotKeKhai.trang_thai,
                            DonVi = k.DotKeKhai.DonVi != null ? new
                            {
                                k.DotKeKhai.DonVi.Id,
                                k.DotKeKhai.DonVi.TenDonVi
                            } : null
                        }
                    })
                    .ToListAsync();

                // Thêm mã nhân viên từ nguoiDungMap
                var result = keKhaiBHYTs.Select(k => new {
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
                    k.ma_ho_so,
                    k.nguoi_tao,
                    ma_nhan_vien = nguoiDungMap.ContainsKey(k.nguoi_tao) ? nguoiDungMap[k.nguoi_tao] : "",
                    k.ThongTinThe,
                    k.DotKeKhai
                }).ToList();

                return Ok(result);
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
            [FromQuery] DateTime? denNgay,
            [FromQuery] int? donViId)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var userName = User.Identity?.Name;
                if (string.IsNullOrEmpty(userName))
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                // Kiểm tra vai trò của người dùng
                var currentUser = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.user_name == userName);
                if (currentUser == null)
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                var query = _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.DotKeKhai.DonVi)
                    .AsQueryable();

                // Nếu không phải admin hoặc super_admin, chỉ hiển thị kê khai do người dùng tạo
                if (!currentUser.roles.Contains("admin") && !currentUser.roles.Contains("super_admin"))
                {
                    query = query.Where(k => k.nguoi_tao == userName);
                }

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

                if (donViId.HasValue)
                {
                    query = query.Where(k => k.DotKeKhai.don_vi_id == donViId.Value);
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
                    worksheet.Cells[1, 12].Value = "Mã hồ sơ";
                    worksheet.Cells[1, 13].Value = "Mã nhân viên";
                    worksheet.Cells[1, 14].Value = "Đơn vị";
                    worksheet.Cells[1, 15].Value = "Trạng thái";

                    // Thêm dữ liệu
                    int row = 2;
                    foreach (var item in data)
                    {
                        worksheet.Cells[row, 1].Value = $"Đợt {item.DotKeKhai.so_dot} tháng {item.DotKeKhai.thang} năm {item.DotKeKhai.nam}";
                        worksheet.Cells[row, 2].Value = item.ThongTinThe.ma_so_bhxh;
                        worksheet.Cells[row, 3].Value = item.ThongTinThe.ho_ten;
                        worksheet.Cells[row, 4].Value = item.ThongTinThe.cccd;
                        worksheet.Cells[row, 5].Value = item.ThongTinThe.ngay_sinh;
                        worksheet.Cells[row, 6].Value = item.ThongTinThe.gioi_tinh;
                        worksheet.Cells[row, 7].Value = item.nguoi_thu;
                        worksheet.Cells[row, 8].Value = item.phuong_an_dong;
                        worksheet.Cells[row, 9].Value = item.so_thang_dong;
                        worksheet.Cells[row, 10].Value = item.so_tien_can_dong;
                        worksheet.Cells[row, 11].Value = item.ngay_tao.ToString("dd/MM/yyyy HH:mm");
                        worksheet.Cells[row, 12].Value = item.ma_ho_so;
                        // Lấy mã nhân viên từ người tạo
                        var maNhanVien = "";
                        var nguoiDung = _context.NguoiDungs.FirstOrDefault(n => n.user_name == item.nguoi_tao);
                        if (nguoiDung != null && !string.IsNullOrEmpty(nguoiDung.ma_nhan_vien))
                        {
                            maNhanVien = nguoiDung.ma_nhan_vien;
                        }
                        worksheet.Cells[row, 13].Value = maNhanVien;
                        worksheet.Cells[row, 14].Value = item.DotKeKhai.DonVi?.TenDonVi ?? "";
                        worksheet.Cells[row, 15].Value = item.DotKeKhai.trang_thai;
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

        [HttpGet("lich-su-bhxh")]
        public async Task<ActionResult<IEnumerable<object>>> GetLichSuKeKhaiBHXH(
            [FromQuery] string? maSoBHXH,
            [FromQuery] string? cccd,
            [FromQuery] string? hoTen,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] int? donViId)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var userName = User.Identity?.Name;
                if (string.IsNullOrEmpty(userName))
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                // Kiểm tra vai trò của người dùng
                var currentUser = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.user_name == userName);
                if (currentUser == null)
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                var query = _context.KeKhaiBHXHs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.DotKeKhai.DonVi)
                    .AsQueryable();

                // Nếu không phải admin hoặc super_admin, chỉ hiển thị kê khai do người dùng tạo
                if (!currentUser.roles.Contains("admin") && !currentUser.roles.Contains("super_admin"))
                {
                    query = query.Where(k => k.nguoi_tao == userName);
                }

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

                if (donViId.HasValue)
                {
                    query = query.Where(k => k.DotKeKhai.don_vi_id == donViId.Value);
                }

                // Lấy danh sách mã nhân viên từ bảng NguoiDung
                var nguoiDungMap = await _context.NguoiDungs
                    .Where(n => n.ma_nhan_vien != null && n.ma_nhan_vien != "")
                    .ToDictionaryAsync(n => n.user_name, n => n.ma_nhan_vien);

                var keKhaiBHXHs = await query
                    .Select(k => new {
                        k.id,
                        k.dot_ke_khai_id,
                        k.thong_tin_the_id,
                        k.muc_thu_nhap,
                        k.ty_le_dong,
                        k.ty_le_nsnn,
                        k.loai_nsnn,
                        k.tien_ho_tro,
                        k.so_tien_can_dong,
                        k.phuong_thuc_dong,
                        k.thang_bat_dau,
                        k.so_thang_dong,
                        k.phuong_an,
                        k.loai_khai_bao,
                        k.ngay_bien_lai,
                        k.so_bien_lai,
                        k.ngay_tao,
                        k.ma_ho_so,
                        k.nguoi_tao,
                        k.ma_nhan_vien,
                        ThongTinThe = new {
                            k.ThongTinThe.ma_so_bhxh,
                            k.ThongTinThe.ho_ten,
                            k.ThongTinThe.cccd,
                            k.ThongTinThe.ngay_sinh,
                            k.ThongTinThe.gioi_tinh
                        },
                        DotKeKhai = new {
                            k.DotKeKhai.so_dot,
                            k.DotKeKhai.thang,
                            k.DotKeKhai.nam,
                            k.DotKeKhai.trang_thai,
                            DonVi = k.DotKeKhai.DonVi != null ? new
                            {
                                k.DotKeKhai.DonVi.Id,
                                k.DotKeKhai.DonVi.TenDonVi
                            } : null
                        }
                    })
                    .OrderByDescending(k => k.ngay_tao)
                    .ToListAsync();

                return Ok(keKhaiBHXHs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách kê khai BHXH: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kê khai BHXH", error = ex.Message });
            }
        }

        [HttpGet("lich-su-bhxh/export")]
        public async Task<IActionResult> ExportLichSuKeKhaiBHXH(
            [FromQuery] string? maSoBHXH,
            [FromQuery] string? cccd,
            [FromQuery] string? hoTen,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] int? donViId)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var userName = User.Identity?.Name;
                if (string.IsNullOrEmpty(userName))
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                // Kiểm tra vai trò của người dùng
                var currentUser = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.user_name == userName);
                if (currentUser == null)
                {
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });
                }

                var query = _context.KeKhaiBHXHs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.DotKeKhai.DonVi)
                    .AsQueryable();

                // Nếu không phải admin hoặc super_admin, chỉ hiển thị kê khai do người dùng tạo
                if (!currentUser.roles.Contains("admin") && !currentUser.roles.Contains("super_admin"))
                {
                    query = query.Where(k => k.nguoi_tao == userName);
                }

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

                if (donViId.HasValue)
                {
                    query = query.Where(k => k.DotKeKhai.don_vi_id == donViId.Value);
                }

                var data = await query.ToListAsync();

                // Tạo file Excel
                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Lịch sử kê khai BHXH");

                    // Thêm header
                    worksheet.Cells[1, 1].Value = "Đợt kê khai";
                    worksheet.Cells[1, 2].Value = "Mã số BHXH";
                    worksheet.Cells[1, 3].Value = "Họ tên";
                    worksheet.Cells[1, 4].Value = "CCCD";
                    worksheet.Cells[1, 5].Value = "Ngày sinh";
                    worksheet.Cells[1, 6].Value = "Giới tính";
                    worksheet.Cells[1, 7].Value = "Mức lương";
                    worksheet.Cells[1, 8].Value = "Phương án đóng";
                    worksheet.Cells[1, 9].Value = "Số tháng đóng";
                    worksheet.Cells[1, 10].Value = "Số tiền đóng";
                    worksheet.Cells[1, 11].Value = "Ngày tạo";
                    worksheet.Cells[1, 12].Value = "Mã hồ sơ";
                    worksheet.Cells[1, 13].Value = "Mã nhân viên";
                    worksheet.Cells[1, 14].Value = "Đơn vị";
                    worksheet.Cells[1, 15].Value = "Trạng thái";

                    // Thêm dữ liệu
                    int row = 2;
                    foreach (var item in data)
                    {
                        worksheet.Cells[row, 1].Value = $"Đợt {item.DotKeKhai.so_dot} tháng {item.DotKeKhai.thang} năm {item.DotKeKhai.nam}";
                        worksheet.Cells[row, 2].Value = item.ThongTinThe.ma_so_bhxh;
                        worksheet.Cells[row, 3].Value = item.ThongTinThe.ho_ten;
                        worksheet.Cells[row, 4].Value = item.ThongTinThe.cccd;
                        worksheet.Cells[row, 5].Value = item.ThongTinThe.ngay_sinh;
                        worksheet.Cells[row, 6].Value = item.ThongTinThe.gioi_tinh;
                        worksheet.Cells[row, 7].Value = item.muc_thu_nhap;
                        worksheet.Cells[row, 8].Value = item.phuong_an;
                        worksheet.Cells[row, 9].Value = item.so_thang_dong;
                        worksheet.Cells[row, 10].Value = item.so_tien_can_dong;
                        worksheet.Cells[row, 11].Value = item.ngay_tao.ToString("dd/MM/yyyy HH:mm");
                        worksheet.Cells[row, 12].Value = item.ma_ho_so;
                        worksheet.Cells[row, 13].Value = item.ma_nhan_vien ?? "";
                        // Nếu không có mã nhân viên, thử lấy từ người tạo
                        if (string.IsNullOrEmpty(item.ma_nhan_vien))
                        {
                            var nguoiDung = _context.NguoiDungs.FirstOrDefault(n => n.user_name == item.nguoi_tao);
                            if (nguoiDung != null && !string.IsNullOrEmpty(nguoiDung.ma_nhan_vien))
                            {
                                worksheet.Cells[row, 13].Value = nguoiDung.ma_nhan_vien;
                            }
                        }
                        worksheet.Cells[row, 14].Value = item.DotKeKhai.DonVi?.TenDonVi ?? "";
                        worksheet.Cells[row, 15].Value = item.DotKeKhai.trang_thai;
                        row++;
                    }

                    // Format các cột
                    worksheet.Cells.AutoFitColumns();

                    // Trả về file Excel
                    var content = package.GetAsByteArray();
                    var fileName = $"lich-su-ke-khai-bhxh-{DateTime.Now:yyyyMMddHHmmss}.xlsx";

                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting lich su ke khai BHXH: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Lỗi khi xuất lịch sử kê khai BHXH", error = ex.Message });
            }
        }
    }
}