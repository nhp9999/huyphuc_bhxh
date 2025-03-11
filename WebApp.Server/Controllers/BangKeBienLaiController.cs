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

        [HttpGet("bao-cao/bc01")]
        public async Task<IActionResult> ExportBC01(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] string? quyenSo = null,
            [FromQuery] string? maNhanVien = null,
            [FromQuery] string? trangThai = null,
            [FromQuery] string? donVi = null,
            [FromQuery] string? tinhChat = null,
            [FromQuery] string? maHoSo = null)
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

                if (!string.IsNullOrEmpty(trangThai))
                {
                    query = query.Where(b => b.trang_thai == trangThai);
                }

                if (!string.IsNullOrEmpty(donVi))
                {
                    query = query.Where(b => b.KeKhaiBHYT != null && 
                                            b.KeKhaiBHYT.DotKeKhai != null && 
                                            b.KeKhaiBHYT.DotKeKhai.DonVi != null && 
                                            b.KeKhaiBHYT.DotKeKhai.DonVi.TenDonVi.Contains(donVi));
                }

                if (!string.IsNullOrEmpty(tinhChat))
                {
                    query = query.Where(b => b.tinh_chat == tinhChat);
                }

                if (!string.IsNullOrEmpty(maHoSo))
                {
                    query = query.Where(b => (b.KeKhaiBHYT != null && b.KeKhaiBHYT.ma_ho_so.Contains(maHoSo)) ||
                                            (b.KeKhaiBHYT != null && b.KeKhaiBHYT.DotKeKhai != null && 
                                             b.KeKhaiBHYT.DotKeKhai.ma_ho_so.Contains(maHoSo)));
                }

                var data = await query
                    .Select(b => new
                    {
                        quyen_so = b.quyen_so,
                        so_bien_lai = b.so_bien_lai,
                        ngay_bien_lai = b.ngay_bien_lai.Date,
                        noi_dung_thu = b.tinh_chat == "bhyt" ? "BHYT tự nguyện" : 
                                      (b.tinh_chat == "bhxh" ? "BHXH tự nguyện" : "BHTN tự nguyện"),
                        so_tien_bhxh = b.tinh_chat == "bhxh" ? b.so_tien : 0,
                        so_tien_bhyt = b.tinh_chat == "bhyt" ? b.so_tien : 0,
                        tong_so = b.so_tien
                    })
                    .OrderBy(b => b.quyen_so)
                    .ThenBy(b => b.so_bien_lai)
                    .ToListAsync();

                // Tạo file Excel mới
                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("BC01");
                    
                        // Thiết lập cấu hình trang in
                    worksheet.PrinterSettings.PaperSize = ePaperSize.A4;
                    worksheet.PrinterSettings.Orientation = eOrientation.Portrait;
                    worksheet.PrinterSettings.FitToPage = true;
                    worksheet.PrinterSettings.FitToWidth = 1;
                    worksheet.PrinterSettings.FitToHeight = 0;
                    worksheet.PrinterSettings.LeftMargin = 0.5m;
                    worksheet.PrinterSettings.RightMargin = 0.5m;
                    worksheet.PrinterSettings.TopMargin = 0.5m;
                    worksheet.PrinterSettings.BottomMargin = 0.5m;
                    worksheet.PrinterSettings.HorizontalCentered = true;
                    worksheet.PrinterSettings.VerticalCentered = true;
                    
                    // Thiết lập vùng in
                    worksheet.PrinterSettings.RepeatRows = worksheet.Cells["1:16"];
                    
                    // Thiết lập font chữ mặc định cho toàn bộ worksheet
                    worksheet.Cells.Style.Font.Name = "Times New Roman";
                    worksheet.Cells.Style.Font.Size = 12;

                    // Thiết lập tiêu đề và thông tin đơn vị
                    worksheet.Cells["A1:H1"].Merge = true;
                    worksheet.Cells["A1"].Value = "BẢO HIỂM XÃ HỘI TỈNH AN GIANG";
                    worksheet.Cells["A1"].Style.Font.Bold = true;
                    worksheet.Cells["A1"].Style.Font.Size = 12;
                    worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    
                    worksheet.Cells["H1"].Value = "Mẫu số: BC 01/QTAC";
                    worksheet.Cells["H1"].Style.Font.Bold = true;
                    worksheet.Cells["H1"].Style.Font.Size = 12;
                    worksheet.Cells["H1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                    
                    worksheet.Cells["A2:H2"].Merge = true;
                    worksheet.Cells["A2"].Value = "BẢO HIỂM XÃ HỘI HUYỆN TỊNH BIÊN";
                    worksheet.Cells["A2"].Style.Font.Bold = true;
                    worksheet.Cells["A2"].Style.Font.Size = 12;
                    worksheet.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                    // Thiết lập tiêu đề báo cáo
                    worksheet.Cells["A5:H5"].Merge = true;
                    worksheet.Cells["A5"].Value = "BẢNG KÊ";
                    worksheet.Cells["A5"].Style.Font.Bold = true;
                    worksheet.Cells["A5"].Style.Font.Size = 14;
                    worksheet.Cells["A5"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    
                    worksheet.Cells["A6:H6"].Merge = true;
                    worksheet.Cells["A6"].Value = "SỬ DỤNG BIÊN LAI THU TIỀN BHYT, BHXH TỰ NGUYỆN";
                    worksheet.Cells["A6"].Style.Font.Bold = true;
                    worksheet.Cells["A6"].Style.Font.Size = 14;
                    worksheet.Cells["A6"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    
                    // Thiết lập thời gian báo cáo
                    string thangNam = "Tháng ";
                    if (tuNgay.HasValue)
                    {
                        thangNam += tuNgay.Value.Month.ToString("00") + " năm " + tuNgay.Value.Year;
                    }
                    else
                    {
                        thangNam += DateTime.Now.Month.ToString("00") + " năm " + DateTime.Now.Year;
                    }
                    
                    worksheet.Cells["A7:H7"].Merge = true;
                    worksheet.Cells["A7"].Value = thangNam;
                    worksheet.Cells["A7"].Style.Font.Bold = true;
                    worksheet.Cells["A7"].Style.Font.Size = 14;
                    worksheet.Cells["A7"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Thiết lập độ rộng cột trước khi đặt nội dung
                    worksheet.Column(1).Width = 20;     // Cột A - Cho label
                    worksheet.Column(2).Width = 3;      // Cột B - Khoảng cách
                    worksheet.Column(3).Width = 60;     // Cột C - Cho nội dung
                    worksheet.Column(4).Width = 15;     // Cột D
                    worksheet.Column(5).Width = 15;     // Cột E
                    worksheet.Column(6).Width = 15;     // Cột F
                    worksheet.Column(7).Width = 15;     // Cột G
                    worksheet.Column(8).Width = 15;     // Cột H

                    // Thiết lập thông tin đơn vị
                    worksheet.Cells["A10"].Value = "Tên đơn vị, đại lý:";
                    worksheet.Cells["A10"].Style.Font.Bold = true;
                    worksheet.Cells["A10"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["A10"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    
                    worksheet.Cells["C10:H10"].Merge = true;
                    worksheet.Cells["C10"].Value = "Công ty TNHH MTV TMDV Huy Phúc";
                    worksheet.Cells["C10"].Style.WrapText = true;
                    worksheet.Cells["C10"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["C10"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    worksheet.Row(10).Height = 25;
                    
                    worksheet.Cells["A11"].Value = "Địa chỉ:";
                    worksheet.Cells["A11"].Style.Font.Bold = true;
                    worksheet.Cells["A11"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["A11"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    
                    worksheet.Cells["C11:H11"].Merge = true;
                    worksheet.Cells["C11"].Value = "Khóm Vĩnh Thành, thị trấn Cái Dầu, huyện Châu Phú, tỉnh An Giang";
                    worksheet.Cells["C11"].Style.WrapText = true;
                    worksheet.Cells["C11"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["C11"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    worksheet.Row(11).Height = 25;

                    // Thêm padding cho nội dung
                    worksheet.Cells["C10:H11"].Style.Indent = 2;

                    // Thiết lập tiêu đề bảng
                    worksheet.Cells["A13:H13"].Merge = true;
                    worksheet.Cells["A13"].Value = "I/. TÌNH HÌNH SỬ DỤNG BIÊN LAI";
                    worksheet.Cells["A13"].Style.Font.Bold = true;
                    worksheet.Cells["A13"].Style.Font.Size = 12;
                    worksheet.Cells["A13"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                    // Thiết lập header bảng
                    var headerRange = worksheet.Cells["A14:H16"];
                    headerRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    headerRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    headerRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    headerRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                    worksheet.Cells["A14:A16"].Merge = true;
                    worksheet.Cells["A14"].Value = "STT";
                    worksheet.Cells["A14"].Style.Font.Bold = true;
                    worksheet.Cells["A14"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["A14"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["B14:D14"].Merge = true;
                    worksheet.Cells["B14"].Value = "Số biên lai";
                    worksheet.Cells["B14"].Style.Font.Bold = true;
                    worksheet.Cells["B14"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["E14:E16"].Merge = true;
                    worksheet.Cells["E14"].Value = "Nội dung thu";
                    worksheet.Cells["E14"].Style.Font.Bold = true;
                    worksheet.Cells["E14"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["E14"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["F14:H14"].Merge = true;
                    worksheet.Cells["F14"].Value = "Số Tiền Thu";
                    worksheet.Cells["F14"].Style.Font.Bold = true;
                    worksheet.Cells["F14"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["B15"].Value = "Quyển số";
                    worksheet.Cells["B15"].Style.Font.Bold = true;
                    worksheet.Cells["B15"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["C15"].Value = "Số";
                    worksheet.Cells["C15"].Style.Font.Bold = true;
                    worksheet.Cells["C15"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["D15"].Value = "Ngày";
                    worksheet.Cells["D15"].Style.Font.Bold = true;
                    worksheet.Cells["D15"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["F15"].Value = "BHXH";
                    worksheet.Cells["F15"].Style.Font.Bold = true;
                    worksheet.Cells["F15"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["G15"].Value = "BHYT";
                    worksheet.Cells["G15"].Style.Font.Bold = true;
                    worksheet.Cells["G15"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["H15"].Value = "Tổng Số";
                    worksheet.Cells["H15"].Style.Font.Bold = true;
                    worksheet.Cells["H15"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["B16"].Value = "2";
                    worksheet.Cells["B16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["C16"].Value = "3";
                    worksheet.Cells["C16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["D16"].Value = "4";
                    worksheet.Cells["D16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["E16"].Value = "5";
                    worksheet.Cells["E16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["F16"].Value = "6";
                    worksheet.Cells["F16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["G16"].Value = "7";
                    worksheet.Cells["G16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells["H16"].Value = "8=6+7";
                    worksheet.Cells["H16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Điền dữ liệu
                    int row = 17;
                    int stt = 1;
                    decimal tongSoTienBHXH = 0;
                    decimal tongSoTienBHYT = 0;
                    decimal tongSoTien = 0;

                    foreach (var item in data)
                    {
                        var rowRange = worksheet.Cells[row, 1, row, 8];
                        rowRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        rowRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        rowRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        rowRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                        worksheet.Cells[row, 1].Value = stt++;
                        worksheet.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        worksheet.Cells[row, 2].Value = item.quyen_so;
                        worksheet.Cells[row, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        worksheet.Cells[row, 3].Value = item.so_bien_lai;
                        worksheet.Cells[row, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        worksheet.Cells[row, 4].Value = item.ngay_bien_lai.ToString("dd/MM/yyyy");
                        worksheet.Cells[row, 4].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        worksheet.Cells[row, 5].Value = item.noi_dung_thu;
                        worksheet.Cells[row, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                        worksheet.Cells[row, 6].Value = item.so_tien_bhxh;
                        worksheet.Cells[row, 6].Style.Numberformat.Format = "#,##0";
                        worksheet.Cells[row, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                        worksheet.Cells[row, 7].Value = item.so_tien_bhyt;
                        worksheet.Cells[row, 7].Style.Numberformat.Format = "#,##0";
                        worksheet.Cells[row, 7].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                        worksheet.Cells[row, 8].Value = item.tong_so;
                        worksheet.Cells[row, 8].Style.Numberformat.Format = "#,##0";
                        worksheet.Cells[row, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                        tongSoTienBHXH += item.so_tien_bhxh;
                        tongSoTienBHYT += item.so_tien_bhyt;
                        tongSoTien += item.tong_so;

                        row++;
                    }

                    // Thêm dòng tổng cộng
                    var tongCongRow = row;
                    var tongCongRange = worksheet.Cells[tongCongRow, 1, tongCongRow, 8];
                    tongCongRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    tongCongRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    tongCongRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    tongCongRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                    worksheet.Cells[tongCongRow, 1, tongCongRow, 5].Merge = true;
                    worksheet.Cells[tongCongRow, 1].Value = "Tổng cộng:";
                    worksheet.Cells[tongCongRow, 1].Style.Font.Bold = true;
                    worksheet.Cells[tongCongRow, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Cells[tongCongRow, 6].Value = tongSoTienBHXH;
                    worksheet.Cells[tongCongRow, 6].Style.Numberformat.Format = "#,##0";
                    worksheet.Cells[tongCongRow, 6].Style.Font.Bold = true;
                    worksheet.Cells[tongCongRow, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    worksheet.Cells[tongCongRow, 7].Value = tongSoTienBHYT;
                    worksheet.Cells[tongCongRow, 7].Style.Numberformat.Format = "#,##0";
                    worksheet.Cells[tongCongRow, 7].Style.Font.Bold = true;
                    worksheet.Cells[tongCongRow, 7].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    worksheet.Cells[tongCongRow, 8].Value = tongSoTien;
                    worksheet.Cells[tongCongRow, 8].Style.Numberformat.Format = "#,##0";
                    worksheet.Cells[tongCongRow, 8].Style.Font.Bold = true;
                    worksheet.Cells[tongCongRow, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    // Điều chỉnh độ rộng cột cho phù hợp với khổ dọc
                    worksheet.Column(1).Width = 5;   // STT
                    worksheet.Column(2).Width = 12;   // Quyển số
                    worksheet.Column(3).Width = 8;   // Số
                    worksheet.Column(4).Width = 12;  // Ngày
                    worksheet.Column(5).Width = 18;  // Nội dung thu - Tăng độ rộng lên
                    worksheet.Column(6).Width = 12;  // BHXH
                    worksheet.Column(7).Width = 12;  // BHYT
                    worksheet.Column(8).Width = 12;  // Tổng số

                    // Thiết lập co giãn tự động cho nội dung dài
                    worksheet.Column(5).Style.WrapText = true; // Cho phép xuống dòng ở cột Nội dung thu
                    
                    // Điều chỉnh chiều cao tối thiểu cho các hàng
                    for (int i = 14; i <= row; i++)
                    {
                        worksheet.Row(i).CustomHeight = false;
                        worksheet.Row(i).Height = 25; // Tăng chiều cao mặc định
                    }

                    // Thiết lập căn chỉnh cho cột Nội dung thu
                    var noiDungThuRange = worksheet.Cells[17, 5, row - 1, 5];
                    noiDungThuRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    noiDungThuRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                    // Đặt lại định dạng cho header của cột Nội dung thu
                    worksheet.Cells["E14:E16"].Style.WrapText = true;
                    worksheet.Cells["E14:E16"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells["E14:E16"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Thiết lập vùng in
                    var printArea = worksheet.Cells[1, 1, row + 1, 8];
                    worksheet.PrinterSettings.PrintArea = printArea;

                    // Thiết lập tỷ lệ co giãn và chế độ xem
                    worksheet.View.ZoomScale = 100;
                    worksheet.View.PageLayoutView = false; // Chuyển sang chế độ Normal view
                    
                    // Thiết lập thuộc tính hiển thị lưới
                    worksheet.View.ShowGridLines = true;
                    worksheet.View.ShowHeaders = true;
                    
                    // Đảm bảo nội dung không bị cắt khi in
                    worksheet.PrinterSettings.FitToPage = true;
                    worksheet.PrinterSettings.FitToWidth = 1;
                    worksheet.PrinterSettings.FitToHeight = 0;

                    // Tự động điều chỉnh chiều cao hàng
                    for (int i = 1; i <= row; i++)
                    {
                        worksheet.Row(i).CustomHeight = false;
                        worksheet.Row(i).Height = 20; // Đặt chiều cao cố định cho mỗi hàng
                    }

                    // Tạo file Excel
                    var content = package.GetAsByteArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                        $"BC01-Bang-Ke-BHYT-BHXH-{DateTime.Now:yyyyMMdd}.xlsx");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting BC01: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xuất báo cáo BC01" });
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