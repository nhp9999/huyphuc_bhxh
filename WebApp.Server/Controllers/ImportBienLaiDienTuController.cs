using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using WebApp.API.Data;
using WebApp.API.Models.BienlaiDienTu;
using WebApp.API.Services;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/bien-lai-dien-tu/import")]
    public class ImportBienLaiDienTuController : ControllerBase
    {
        private readonly string _templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "mau-import-bien-lai-dien-tu.xlsx");
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ImportBienLaiDienTuController> _logger;

        public ImportBienLaiDienTuController(
            ApplicationDbContext context,
            ILogger<ImportBienLaiDienTuController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            try
            {
                // Kiểm tra xem file mẫu có tồn tại không
                if (!System.IO.File.Exists(_templatePath))
                {
                    // Nếu không tồn tại, tạo file mẫu mới
                    using (var package = new ExcelPackage())
                    {
                        var worksheet = package.Workbook.Worksheets.Add("Mẫu import biên lai");

                        // Thiết lập header theo mẫu
                        // Dòng 1: Tiêu đề của bảng
                        worksheet.Cells[1, 1, 1, 17].Merge = true;
                        worksheet.Cells[1, 1].Value = "DANH SÁCH NGƯỜI CHI THAM GIA BHYT";
                        worksheet.Cells[1, 1].Style.Font.Bold = true;
                        worksheet.Cells[1, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

                        // Dòng 14: Header của bảng
                        worksheet.Cells[14, 1].Value = "STT";
                        worksheet.Cells[14, 2].Value = "Họ và tên";
                        worksheet.Cells[14, 3].Value = "Mã số BHXH";
                        worksheet.Cells[14, 4].Value = "Số CCCD/CMND/Hộ chiếu";
                        worksheet.Cells[14, 5].Value = "Ngày tháng năm sinh";
                        worksheet.Cells[14, 6].Value = "Giới tính";
                        worksheet.Cells[14, 7].Value = "Địa chỉ";
                        worksheet.Cells[14, 8].Value = "Nơi đăng ký KCB ban đầu";
                        worksheet.Cells[14, 9].Value = "Ngày tham gia";
                        worksheet.Cells[14, 10].Value = "Số biên lai";
                        worksheet.Cells[14, 11].Value = "Số tiền";
                        worksheet.Cells[14, 12].Value = "Hỗ trợ thêm NSDP";
                        worksheet.Cells[14, 13].Value = "Hỗ trợ thêm Khác";
                        worksheet.Cells[14, 14].Value = "Từ tháng";
                        worksheet.Cells[14, 15].Value = "Số tháng";
                        worksheet.Cells[14, 16].Value = "Mã nhân viên";
                        worksheet.Cells[14, 17].Value = "Ghi chú";

                        // Định dạng header dòng 14
                        using (var range = worksheet.Cells[14, 1, 14, 17])
                        {
                            range.Style.Font.Bold = true;
                            range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                            range.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
                            range.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                        }

                        // Thêm dữ liệu mẫu theo file mẫu
                        // Dòng 15 (dòng đầu tiên của dữ liệu)
                        worksheet.Cells[15, 1].Value = 1;
                        worksheet.Cells[15, 2].Value = "Phạm Hồng Thanh Hương";
                        worksheet.Cells[15, 3].Value = "8923453374";
                        worksheet.Cells[15, 4].Value = "089206016386";
                        worksheet.Cells[15, 5].Value = "19/01/2006";
                        worksheet.Cells[15, 6].Value = "Nam";
                        worksheet.Cells[15, 7].Value = "Ấp An Hòa, Xã An Hảo, Huyện Tịnh Biên, Tỉnh An Giang";
                        worksheet.Cells[15, 8].Value = "Trung tâm Y tế huyện Tịnh Biên";
                        worksheet.Cells[15, 9].Value = "09/04/2025";
                        worksheet.Cells[15, 10].Value = "0000118";
                        worksheet.Cells[15, 11].Value = "505,440";
                        worksheet.Cells[15, 12].Value = "0";
                        worksheet.Cells[15, 13].Value = "0";
                        worksheet.Cells[15, 14].Value = "07/05/2025";
                        worksheet.Cells[15, 15].Value = "12";
                        worksheet.Cells[15, 16].Value = "NV089167001615";
                        worksheet.Cells[15, 17].Value = "";

                        // Dòng 16
                        worksheet.Cells[16, 1].Value = 2;
                        worksheet.Cells[16, 2].Value = "Trần Thanh Thảo";
                        worksheet.Cells[16, 3].Value = "8923481590";
                        worksheet.Cells[16, 4].Value = "089161001066";
                        worksheet.Cells[16, 5].Value = "22/02/1961";
                        worksheet.Cells[16, 6].Value = "Nữ";
                        worksheet.Cells[16, 7].Value = "Ấp An Hòa, Xã An Hảo, Huyện Tịnh Biên, Tỉnh An Giang";
                        worksheet.Cells[16, 8].Value = "Trung tâm Y tế thị xã Tịnh Biên";
                        worksheet.Cells[16, 9].Value = "09/04/2025";
                        worksheet.Cells[16, 10].Value = "0000114";
                        worksheet.Cells[16, 11].Value = "1,263,600";
                        worksheet.Cells[16, 12].Value = "0";
                        worksheet.Cells[16, 13].Value = "0";
                        worksheet.Cells[16, 14].Value = "23/04/2025";
                        worksheet.Cells[16, 15].Value = "12";
                        worksheet.Cells[16, 16].Value = "NV089167001615";
                        worksheet.Cells[16, 17].Value = "";

                        // Tự động điều chỉnh độ rộng cột
                        worksheet.Cells.AutoFitColumns();

                        // Tạo thư mục Templates nếu chưa tồn tại
                        var templateDir = Path.GetDirectoryName(_templatePath);
                        if (!Directory.Exists(templateDir))
                        {
                            Directory.CreateDirectory(templateDir!);
                        }

                        // Lưu file
                        package.SaveAs(new FileInfo(_templatePath));
                    }
                }

                // Đọc file và trả về
                var fileBytes = System.IO.File.ReadAllBytes(_templatePath);
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "mau-import-bien-lai-dien-tu.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo hoặc tải xuống file mẫu Excel");
                return StatusCode(500, new { message = "Lỗi khi tạo hoặc tải xuống file mẫu Excel", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ImportFromExcel(IFormFile file)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file Excel để import" });
            }

            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Chỉ hỗ trợ file Excel (.xlsx)" });
            }

            try
            {
                var result = new List<object>();
                var errors = new List<string>();
                var importedCount = 0;

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets[0]; // Lấy sheet đầu tiên
                        var rowCount = worksheet.Dimension.Rows;

                        // Kiểm tra xem có quyển biên lai điện tử nào có thể sử dụng không
                        var quyenBienLai = await _context.QuyenBienLaiDienTus
                            .Where(q => q.trang_thai == "dang_su_dung" || q.trang_thai == "chua_su_dung" || q.trang_thai == "active")
                            .OrderByDescending(q => q.ngay_cap)
                            .FirstOrDefaultAsync();

                        if (quyenBienLai == null)
                        {
                            return BadRequest(new { message = "Không tìm thấy quyển biên lai điện tử có thể sử dụng" });
                        }

                        // Nếu quyển biên lai có trạng thái là "chua_su_dung", cập nhật thành "dang_su_dung"
                        if (quyenBienLai.trang_thai == "chua_su_dung")
                        {
                            quyenBienLai.trang_thai = "dang_su_dung";
                        }

                        // Tự động xác định các dòng chứa thông tin biên lai
                        for (int row = 1; row <= rowCount; row++)
                        {
                            try
                            {
                                // Đọc dữ liệu từ Excel
                                var stt = worksheet.Cells[row, 1].Value?.ToString(); // STT (cột A)
                                var tenNguoiDong = worksheet.Cells[row, 2].Value?.ToString(); // Họ và tên (cột B)
                                var maSoBHXH = worksheet.Cells[row, 3].Value?.ToString(); // Mã số BHXH (cột C)
                                var cccd = worksheet.Cells[row, 4].Value?.ToString(); // Số CCCD/CMND/Hộ chiếu (cột D)
                                var ngaySinhStr = worksheet.Cells[row, 5].Value?.ToString(); // Ngày tháng năm sinh (cột E)
                                var gioiTinh = worksheet.Cells[row, 6].Value?.ToString(); // Giới tính (cột F)
                                var diaChi = worksheet.Cells[row, 7].Value?.ToString(); // Địa chỉ (cột G)
                                var noiDangKyKCB = worksheet.Cells[row, 8].Value?.ToString(); // Nơi đăng ký KCB ban đầu (cột H)
                                var ngayThamGiaStr = worksheet.Cells[row, 9].Value?.ToString(); // Ngày tham gia (cột I)
                                var soBienLaiStr = worksheet.Cells[row, 10].Value?.ToString(); // Số biên lai (cột J)
                                var soTienStr = worksheet.Cells[row, 11].Value?.ToString(); // Số tiền (cột K)
                                var hoTroThemNSDP = worksheet.Cells[row, 12].Value?.ToString(); // Hỗ trợ thêm NSDP (cột L)
                                var hoTroThemKhac = worksheet.Cells[row, 13].Value?.ToString(); // Hỗ trợ thêm Khác (cột M)
                                var tuThangStr = worksheet.Cells[row, 14].Value?.ToString(); // Từ tháng (cột N)
                                var soThangStr = worksheet.Cells[row, 15].Value?.ToString(); // Số tháng (cột O)
                                var maNhanVien = worksheet.Cells[row, 16].Value?.ToString(); // Mã số nhân viên thu (cột P)
                                var ghiChu = worksheet.Cells[row, 17].Value?.ToString(); // Ghi chú (cột Q)
                                var tinhTrangHuong = ""; // Không có trong file mẫu

                                // Kiểm tra xem dòng này có phải là dòng chứa thông tin biên lai không
                                // Dòng hợp lệ phải có STT, tên người đóng và mã số BHXH
                                if (string.IsNullOrEmpty(stt) || string.IsNullOrEmpty(tenNguoiDong) || string.IsNullOrEmpty(maSoBHXH))
                                {
                                    // Không phải dòng chứa thông tin biên lai, bỏ qua
                                    continue;
                                }

                                // Kiểm tra thêm: STT phải là số
                                if (!int.TryParse(stt.Trim(), out _))
                                {
                                    // Không phải dòng chứa thông tin biên lai, bỏ qua
                                    continue;
                                }

                                // Ghi log thông tin dòng hợp lệ
                                _logger.LogInformation($"Tìm thấy dòng hợp lệ tại dòng {row}: STT={stt}, Tên={tenNguoiDong}, Mã BHXH={maSoBHXH}");

                                // Kiểm tra dữ liệu bắt buộc
                                if (string.IsNullOrEmpty(tenNguoiDong) || string.IsNullOrEmpty(maSoBHXH))
                                {
                                    errors.Add($"Dòng {row}: Thiếu thông tin bắt buộc (Tên người đóng, Mã số BHXH)");
                                    continue;
                                }

                                // Chuyển đổi số tiền
                                decimal soTien = 0;
                                if (!string.IsNullOrEmpty(soTienStr))
                                {
                                    // Làm sạch dữ liệu trước khi chuyển đổi
                                    string cleanedSoTien = soTienStr.Replace(",", "");

                                    // Thử chuyển đổi
                                    if (!decimal.TryParse(cleanedSoTien, out soTien))
                                    {
                                        // Thử cách khác: loại bỏ tất cả các ký tự không phải số
                                        string digitsOnly = new string(cleanedSoTien.Where(c => char.IsDigit(c)).ToArray());

                                        if (!string.IsNullOrEmpty(digitsOnly) && decimal.TryParse(digitsOnly, out soTien))
                                        {
                                            // Ghi log để debug
                                            _logger.LogWarning($"Đã chuyển đổi số tiền từ '{soTienStr}' thành {soTien} tại dòng {row}");
                                        }
                                        else
                                        {
                                            errors.Add($"Dòng {row}: Số tiền không hợp lệ '{soTienStr}'");
                                            continue;
                                        }
                                    }
                                }
                                else
                                {
                                    errors.Add($"Dòng {row}: Số tiền không được để trống");
                                    continue;
                                }

                                // Chuyển đổi số tháng
                                int soThang = 12; // Mặc định là 12 tháng
                                if (!string.IsNullOrEmpty(soThangStr))
                                {
                                    // Làm sạch dữ liệu trước khi chuyển đổi
                                    string cleanedSoThang = soThangStr.Trim();

                                    // Thử chuyển đổi
                                    if (!int.TryParse(cleanedSoThang, out soThang))
                                    {
                                        // Ghi log để debug
                                        _logger.LogWarning($"Không thể chuyển đổi số tháng: '{soThangStr}' tại dòng {row}");

                                        // Sử dụng giá trị mặc định thay vì báo lỗi
                                        soThang = 12;
                                    }
                                }

                                // Xử lý ngày sinh
                                DateTime? ngaySinh = null;
                                if (!string.IsNullOrEmpty(ngaySinhStr))
                                {
                                    try
                                    {
                                        // Thử các định dạng ngày tháng phổ biến
                                        if (DateTime.TryParseExact(ngaySinhStr, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
                                        {
                                            ngaySinh = date;
                                        }
                                        else if (DateTime.TryParseExact(ngaySinhStr, "d/M/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                                        {
                                            ngaySinh = date;
                                        }
                                        else if (DateTime.TryParse(ngaySinhStr, out date))
                                        {
                                            ngaySinh = date;
                                        }
                                    }
                                    catch
                                    {
                                        errors.Add($"Dòng {row}: Ngày sinh không hợp lệ");
                                        continue;
                                    }
                                }

                                // Xử lý ngày tham gia
                                DateTime? ngayThamGia = DateTime.Now;
                                if (!string.IsNullOrEmpty(ngayThamGiaStr))
                                {
                                    try
                                    {
                                        // Thử các định dạng ngày tháng phổ biến
                                        if (DateTime.TryParseExact(ngayThamGiaStr, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
                                        {
                                            ngayThamGia = date;
                                        }
                                        else if (DateTime.TryParseExact(ngayThamGiaStr, "d/M/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                                        {
                                            ngayThamGia = date;
                                        }
                                        else if (DateTime.TryParse(ngayThamGiaStr, out date))
                                        {
                                            ngayThamGia = date;
                                        }
                                    }
                                    catch
                                    {
                                        // Sử dụng ngày hiện tại nếu không chuyển đổi được
                                    }
                                }

                                // Xử lý từ tháng
                                DateTime? tuThang = null;
                                if (!string.IsNullOrEmpty(tuThangStr))
                                {
                                    try
                                    {
                                        if (DateTime.TryParseExact(tuThangStr, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
                                        {
                                            tuThang = date;
                                        }
                                        else if (DateTime.TryParseExact(tuThangStr, "d/M/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                                        {
                                            tuThang = date;
                                        }
                                        else if (DateTime.TryParse(tuThangStr, out date))
                                        {
                                            tuThang = date;
                                        }
                                    }
                                    catch
                                    {
                                        // Sử dụng ngày hiện tại nếu không chuyển đổi được
                                    }
                                }

                                // Tạo ghi chú từ các thông tin khác
                                ghiChu = $"Biên lai điện tử import từ Excel - {tenNguoiDong} - {maSoBHXH}";
                                if (!string.IsNullOrEmpty(tinhTrangHuong))
                                {
                                    ghiChu += $" - {tinhTrangHuong}";
                                }

                                // Tạo biên lai điện tử mới
                                var bienLai = new BienLaiDienTu
                                {
                                    quyen_bien_lai_dien_tu_id = quyenBienLai.id,
                                    ky_hieu = "BH25-AG/08907/E",
                                    ten_nguoi_dong = tenNguoiDong,
                                    so_tien = soTien,
                                    ghi_chu = ghiChu,
                                    ma_so_bhxh = maSoBHXH,
                                    ma_nhan_vien = maNhanVien ?? "",
                                    ma_co_quan_bhxh = quyenBienLai.ma_co_quan_bhxh,
                                    ma_so_bhxh_don_vi = "",
                                    is_bhyt = true,
                                    is_bhxh = false,
                                    tinh_chat = "bien_lai_goc",
                                    ngay_tao = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
                                    ngay_bien_lai = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)
                                };

                                // Xử lý số biên lai
                                string soBienLai;

                                // Nếu có số biên lai trong file Excel, sử dụng nó
                                if (!string.IsNullOrEmpty(soBienLaiStr))
                                {
                                    soBienLai = soBienLaiStr.Trim().PadLeft(7, '0');
                                    _logger.LogInformation($"Sử dụng số biên lai từ file Excel: {soBienLai}");
                                }
                                else
                                {
                                    // Nếu không có, lấy số biên lai hiện tại và cập nhật
                                    if (string.IsNullOrEmpty(quyenBienLai.so_hien_tai))
                                    {
                                        quyenBienLai.so_hien_tai = quyenBienLai.tu_so;
                                    }

                                    int soHienTai = int.Parse(quyenBienLai.so_hien_tai);
                                    int denSo = int.Parse(quyenBienLai.den_so);

                                    if (soHienTai > denSo)
                                    {
                                        errors.Add($"Dòng {row}: Quyển biên lai đã sử dụng hết");
                                        continue;
                                    }

                                    soBienLai = quyenBienLai.so_hien_tai.PadLeft(7, '0');

                                    // Cập nhật số hiện tại của quyển biên lai
                                    int nextNumber = soHienTai + 1;
                                    quyenBienLai.so_hien_tai = nextNumber.ToString();
                                }

                                bienLai.so_bien_lai = soBienLai;

                                // Cập nhật trạng thái quyển biên lai
                                // Đảm bảo quyển biên lai đang ở trạng thái sử dụng
                                if (quyenBienLai.trang_thai != "da_su_dung_het")
                                {
                                    quyenBienLai.trang_thai = "dang_su_dung";

                                    // Kiểm tra xem quyển biên lai đã sử dụng hết chưa
                                    if (!string.IsNullOrEmpty(quyenBienLai.so_hien_tai))
                                    {
                                        int soHienTai = int.Parse(quyenBienLai.so_hien_tai);
                                        int denSo = int.Parse(quyenBienLai.den_so);

                                        if (soHienTai > denSo)
                                        {
                                            quyenBienLai.trang_thai = "da_su_dung_het";
                                        }
                                    }
                                }

                                // Lưu biên lai
                                _context.BienLaiDienTus.Add(bienLai);

                                // Thêm vào danh sách kết quả
                                result.Add(new
                                {
                                    row,
                                    ten_nguoi_dong = bienLai.ten_nguoi_dong,
                                    ma_so_bhxh = bienLai.ma_so_bhxh,
                                    so_bien_lai = bienLai.so_bien_lai,
                                    so_tien = bienLai.so_tien,
                                    status = "success"
                                });

                                importedCount++;
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, $"Lỗi khi import dòng {row}");
                                errors.Add($"Dòng {row}: {ex.Message}");
                            }
                        }

                        // Lưu thay đổi vào database
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new
                {
                    message = $"Import thành công {importedCount} biên lai điện tử",
                    data = result,
                    errors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import biên lai điện tử từ Excel");
                return StatusCode(500, new { message = "Lỗi khi import biên lai điện tử từ Excel", error = ex.Message });
            }
        }
    }
}
