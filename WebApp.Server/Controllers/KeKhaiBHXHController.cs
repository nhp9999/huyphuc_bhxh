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
using System.Text.Json.Serialization;
using Npgsql;
using System.IO;
using OfficeOpenXml;

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
                        ma_hgd = k.ThongTinThe.ma_hgd,
                        ma_dan_toc = k.ThongTinThe.ma_dan_toc,
                        so_dien_thoai = k.ThongTinThe.so_dien_thoai,
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
                        k.trang_thai,
                        k.nguoi_tao,
                        k.ngay_tao,
                        k.ghi_chu,
                        k.tinh_nkq,
                        k.huyen_nkq,
                        k.xa_nkq
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
                    .Include(k => k.ThongTinThe)
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

        // POST: api/dot-ke-khai/ke-khai-bhxh
        [HttpPost("ke-khai-bhxh")]
        public async Task<ActionResult<KeKhaiBHXH>> CreateKeKhaiBHXH([FromBody] JsonElement requestData)
        {
            try
            {
                _logger.LogInformation("Nhận yêu cầu tạo kê khai BHXH");
                
                // Lấy thông tin từ request
                if (!requestData.TryGetProperty("dot_ke_khai_id", out JsonElement dotKeKhaiIdElement))
                {
                    return BadRequest(new { message = "Thiếu thông tin dot_ke_khai_id" });
                }
                
                int dotKeKhaiId = dotKeKhaiIdElement.GetInt32();
                
                // Kiểm tra đợt kê khai tồn tại
                var dotKeKhai = await _context.DotKeKhais.FindAsync(dotKeKhaiId);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = $"Không tìm thấy đợt kê khai với ID: {dotKeKhaiId}" });
                }
                
                // Lấy thông tin thẻ từ request
                if (!requestData.TryGetProperty("thong_tin_the", out JsonElement thongTinTheElement))
                {
                    return BadRequest(new { message = "Thiếu thông tin thẻ" });
                }
                
                // Xử lý thông tin thẻ
                var thongTinThe = new ThongTinThe
                {
                    ma_so_bhxh = GetStringProperty(thongTinTheElement, "ma_so_bhxh"),
                    cccd = GetStringProperty(thongTinTheElement, "cccd"),
                    ho_ten = GetStringProperty(thongTinTheElement, "ho_ten"),
                    ngay_sinh = GetStringProperty(thongTinTheElement, "ngay_sinh"),
                    gioi_tinh = GetStringProperty(thongTinTheElement, "gioi_tinh"),
                    so_dien_thoai = GetStringProperty(thongTinTheElement, "so_dien_thoai", ""),
                    ma_tinh_nkq = GetStringProperty(thongTinTheElement, "ma_tinh_nkq", ""),
                    ma_huyen_nkq = GetStringProperty(thongTinTheElement, "ma_huyen_nkq", ""),
                    ma_xa_nkq = GetStringProperty(thongTinTheElement, "ma_xa_nkq", ""),
                    ma_tinh_ks = GetStringProperty(thongTinTheElement, "ma_tinh_ks", ""),
                    ma_huyen_ks = GetStringProperty(thongTinTheElement, "ma_huyen_ks", ""),
                    ma_xa_ks = GetStringProperty(thongTinTheElement, "ma_xa_ks", ""),
                    ma_dan_toc = GetStringProperty(thongTinTheElement, "ma_dan_toc", ""),
                    ma_hgd = GetStringProperty(thongTinTheElement, "ma_hgd", ""),
                    quoc_tich = "VN",
                    nguoi_tao = GetStringProperty(requestData, "nguoi_tao"),
                    ngay_tao = DateTime.Now
                };
                
                // Kiểm tra nếu thẻ đã tồn tại (dựa vào mã số BHXH hoặc CCCD)
                var existingThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(t => t.ma_so_bhxh == thongTinThe.ma_so_bhxh || t.cccd == thongTinThe.cccd);
                
                if (existingThe != null)
                {
                    // Cập nhật thông tin thẻ nếu đã tồn tại
                    existingThe.ho_ten = thongTinThe.ho_ten;
                    existingThe.ngay_sinh = thongTinThe.ngay_sinh;
                    existingThe.gioi_tinh = thongTinThe.gioi_tinh;
                    existingThe.so_dien_thoai = thongTinThe.so_dien_thoai;
                    existingThe.ma_tinh_nkq = thongTinThe.ma_tinh_nkq;
                    existingThe.ma_huyen_nkq = thongTinThe.ma_huyen_nkq;
                    existingThe.ma_xa_nkq = thongTinThe.ma_xa_nkq;
                    existingThe.ma_tinh_ks = thongTinThe.ma_tinh_ks;
                    existingThe.ma_huyen_ks = thongTinThe.ma_huyen_ks;
                    existingThe.ma_xa_ks = thongTinThe.ma_xa_ks;
                    existingThe.ma_dan_toc = thongTinThe.ma_dan_toc;
                    existingThe.ma_hgd = thongTinThe.ma_hgd;
                    
                    _context.ThongTinThes.Update(existingThe);
                    thongTinThe = existingThe;
                }
                else
                {
                    // Thêm mới nếu chưa tồn tại
                    _context.ThongTinThes.Add(thongTinThe);
                }
                
                await _context.SaveChangesAsync();
                
                // Tạo kê khai BHXH
                var keKhaiBHXH = new KeKhaiBHXH
                {
                    dot_ke_khai_id = dotKeKhaiId,
                    thong_tin_the_id = thongTinThe.id,
                    muc_thu_nhap = GetDecimalProperty(requestData, "muc_thu_nhap"),
                    ty_le_dong = GetDecimalProperty(requestData, "ty_le_dong"),
                    ty_le_nsnn = GetDecimalProperty(requestData, "ty_le_nsnn"),
                    loai_nsnn = GetStringProperty(requestData, "loai_nsnn"),
                    tien_ho_tro = GetDecimalProperty(requestData, "tien_ho_tro"),
                    so_tien_can_dong = GetDecimalProperty(requestData, "so_tien_can_dong"),
                    phuong_thuc_dong = GetInt32Property(requestData, "phuong_thuc_dong"),
                    thang_bat_dau = GetStringProperty(requestData, "thang_bat_dau"),
                    phuong_an = GetStringProperty(requestData, "phuong_an"),
                    loai_khai_bao = GetStringProperty(requestData, "loai_khai_bao"),
                    ngay_bien_lai = GetDateTimeProperty(requestData, "ngay_bien_lai"),
                    ghi_chu = GetStringProperty(requestData, "ghi_chu", ""),
                    nguoi_tao = GetStringProperty(requestData, "nguoi_tao"),
                    ngay_tao = DateTime.Now,
                    trang_thai = "chua_gui",
                    so_bien_lai = "",
                    ma_nhan_vien = GetStringProperty(requestData, "ma_nhan_vien", ""),
                    tinh_nkq = GetStringProperty(requestData, "tinh_nkq", ""),
                    huyen_nkq = GetStringProperty(requestData, "huyen_nkq", ""),
                    xa_nkq = GetStringProperty(requestData, "xa_nkq", "")
                };
                
                _context.KeKhaiBHXHs.Add(keKhaiBHXH);
                await _context.SaveChangesAsync();
                
                return CreatedAtAction(nameof(GetKeKhaiBHXH), new { dotKeKhaiId, id = keKhaiBHXH.id }, new { id = keKhaiBHXH.id });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo kê khai BHXH: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Lỗi khi tạo kê khai BHXH", error = ex.Message });
            }
        }

        // Các phương thức hỗ trợ để lấy giá trị từ JsonElement
        private string GetStringProperty(JsonElement element, string propertyName, string defaultValue = "")
        {
            if (element.TryGetProperty(propertyName, out JsonElement property) && 
                property.ValueKind != JsonValueKind.Null && 
                property.ValueKind != JsonValueKind.Undefined)
            {
                return property.GetString() ?? defaultValue;
            }
            return defaultValue;
        }

        private decimal GetDecimalProperty(JsonElement element, string propertyName, decimal defaultValue = 0)
        {
            if (element.TryGetProperty(propertyName, out JsonElement property) && 
                property.ValueKind != JsonValueKind.Null && 
                property.ValueKind != JsonValueKind.Undefined)
            {
                return property.GetDecimal();
            }
            return defaultValue;
        }

        private int GetInt32Property(JsonElement element, string propertyName, int defaultValue = 0)
        {
            if (element.TryGetProperty(propertyName, out JsonElement property) && 
                property.ValueKind != JsonValueKind.Null && 
                property.ValueKind != JsonValueKind.Undefined)
            {
                return property.GetInt32();
            }
            return defaultValue;
        }

        private DateTime GetDateTimeProperty(JsonElement element, string propertyName, DateTime? defaultValue = null)
        {
            if (element.TryGetProperty(propertyName, out JsonElement property) && 
                property.ValueKind != JsonValueKind.Null && 
                property.ValueKind != JsonValueKind.Undefined)
            {
                return DateTime.Parse(property.GetString());
            }
            return defaultValue ?? DateTime.Now;
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

        // GET: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh-export-vnpt
        [HttpGet]
        [Route("{dotKeKhaiId}/ke-khai-bhxh-export-vnpt")]
        public async Task<IActionResult> ExportBHXHVNPT(int dotKeKhaiId)
        {
            try
            {
                // Kiểm tra đợt kê khai tồn tại
                var dotKeKhai = await _context.DotKeKhais
                    .Include(d => d.DonVi)
                    .FirstOrDefaultAsync(d => d.id == dotKeKhaiId);
                
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = $"Không tìm thấy đợt kê khai với ID: {dotKeKhaiId}" });
                }

                // Lấy danh sách kê khai BHXH theo đợt kê khai
                var keKhaiBHXHs = await _context.KeKhaiBHXHs
                    .Include(k => k.ThongTinThe)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId)
                    .ToListAsync();

                if (keKhaiBHXHs.Count == 0)
                {
                    return NotFound(new { message = "Không có dữ liệu kê khai BHXH trong đợt này" });
                }

                // Tạo bộ nhớ để chứa file Excel
                using (var memoryStream = new MemoryStream())
                {
                    using (var package = new OfficeOpenXml.ExcelPackage(memoryStream))
                    {
                        // Tạo worksheet
                        var worksheet = package.Workbook.Worksheets.Add("Dữ Liệu");

                        // Header
                        var headers = new List<string>
                        {
                            "STT",
                            "HoTen",
                            "MasoBHXH",
                            "Loai",
                            "PA",
                            "MucTien",
                            "Tuthang",
                            "Sothang",
                            "Tyle",
                            "TyleNSNN",
                            "TienHotro",
                            "TyleNSDP",
                            "TienNSDP",
                            "TyleHotroKhac",
                            "TienHotroKhac",
                            "TienTuDong",
                            "TongTien",
                            "TenTinhDangSS",
                            "Matinh_DangSS",
                            "TenhuyenDangSS",
                            "Mahuyen_DangSS",
                            "TenxaDangSS",
                            "Maxa_DangSS",
                            "Diachi_DangSS",
                            "GhiChu",
                            "PhuongPhuc",
                            "Heso",
                            "SoCCCD",
                            "SoBienLai",
                            "NgayBienLai",
                            "MaNhanvienThu",
                            "Tk1_Save",
                            "CMND",
                            "Maho_Giadinh",
                            "NgaySinh",
                            "GioiTinh",
                            "TenQuocTich",
                            "QuocTich",
                            "TenDanToc",
                            "DanToc",
                            "TenTinhBenhVien",
                            "MaTinhBenhVien",
                            "TenBenhVien",
                            "MaBenhVien",
                            "TenTinhKS",
                            "Matinh_KS",
                            "TenHuyenKS",
                            "Mahuyen_KS",
                            "TenXaKS",
                            "Maxa_KS",
                            "TenTinhNN",
                            "Matinh_NN",
                            "TenHuyenNN",
                            "TenXaNN",
                            "Maxa_NN",
                            "Diachi_NN"
                        };

                        // Set header style và nội dung
                        for (int i = 0; i < headers.Count; i++)
                        {
                            worksheet.Cells[1, i + 1].Value = headers[i];
                            worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                            worksheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                            worksheet.Cells[1, i + 1].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
                        }

                        // Fill data
                        for (int i = 0; i < keKhaiBHXHs.Count; i++)
                        {
                            var item = keKhaiBHXHs[i];
                            int row = i + 2; // Dòng 1 là header
                            
                            // Xác định loại đóng (1 = TM, 2 = DC)
                            int loai = item.phuong_an == "TM" ? 1 : 2;
                            
                            // Phương án
                            string phuongAn = item.phuong_an;
                            
                            // Tính tiền hỗ trợ (NSNN)
                            decimal tienHoTro = Math.Round(item.muc_thu_nhap * (item.ty_le_dong / 100) * ((item.ty_le_nsnn ?? 0) / 100));
                            
                            // Tính tiền tự đóng
                            decimal tienTuDong = item.so_tien_can_dong - tienHoTro;
                            
                            // Định dạng tháng bắt đầu thành mm/yyyy
                            string thangBatDau = "";
                            if (!string.IsNullOrEmpty(item.thang_bat_dau))
                            {
                                try
                                {
                                    // Nếu tháng bắt đầu có định dạng yyyy-MM hoặc yyyy/MM
                                    if (item.thang_bat_dau.Length >= 7 && 
                                        (item.thang_bat_dau.Contains("-") || item.thang_bat_dau.Contains("/")))
                                    {
                                        var parts = item.thang_bat_dau.Split(new char[] { '-', '/' });
                                        if (parts.Length >= 2)
                                        {
                                            // Chuyển từ yyyy-MM hoặc yyyy/MM thành MM/yyyy
                                            thangBatDau = $"{parts[1]}/{parts[0]}";
                                        }
                                    }
                                    else
                                    {
                                        // Nếu là định dạng khác, thử chuyển sang DateTime và định dạng lại
                                        var date = DateTime.Parse(item.thang_bat_dau);
                                        thangBatDau = date.ToString("MM/yyyy");
                                    }
                                }
                                catch
                                {
                                    // Nếu không chuyển đổi được, giữ nguyên giá trị
                                    thangBatDau = item.thang_bat_dau;
                                }
                            }
                            
                            // Lấy thông tin tỉnh, huyện, xã
                            string tenTinh = item.tinh_nkq ?? "";
                            string tenHuyen = item.huyen_nkq ?? "";
                            string tenXa = item.xa_nkq ?? "";
                            
                            // Xác định hệ số từ giá trị phuong_thuc_dong
                            int heSo = item.phuong_thuc_dong;
                            
                            // Định dạng ngày biên lai
                            string ngayBienLai = item.ngay_bien_lai.HasValue ? item.ngay_bien_lai.Value.ToString("dd/MM/yyyy") : "";
                            
                            // Xác định giới tính dạng số (1 = nam, 0 = nữ)
                            int gioiTinh = item.ThongTinThe.gioi_tinh?.ToLower() == "nam" ? 1 : 0;
                            
                            // Định dạng ngày sinh
                            string ngaySinh = "";
                            if (!string.IsNullOrEmpty(item.ThongTinThe.ngay_sinh))
                            {
                                try
                                {
                                    ngaySinh = DateTime.Parse(item.ThongTinThe.ngay_sinh).Year.ToString();
                                }
                                catch
                                {
                                    ngaySinh = item.ThongTinThe.ngay_sinh;
                                }
                            }

                            // Quốc tịch
                            string tenQuocTich = "Việt Nam";
                            string quocTich = item.ThongTinThe.quoc_tich ?? "VN";

                            // Dân tộc
                            string tenDanToc = "";
                            string danToc = item.ThongTinThe.ma_dan_toc ?? "";
                            
                            // Phương phúc - Giá trị cho cột Z
                            string phuongPhuc = item.phuong_an == "TM" ? "TM" : "DC";
                            
                            // Thông tin KCB
                            string maNhanVienThu = item.ma_nhan_vien;
                            string tenTinhKS = "";
                            string maTinhKS = item.ThongTinThe.ma_tinh_ks ?? "";
                            string tenHuyenKS = "";
                            string maHuyenKS = item.ThongTinThe.ma_huyen_ks ?? "";
                            string tenXaKS = "";
                            string maXaKS = item.ThongTinThe.ma_xa_ks ?? "";
                            
                            // Thông tin nơi ở
                            string tenTinhNN = "";
                            string maTinhNN = item.ThongTinThe.ma_tinh_nkq ?? "";
                            string tenHuyenNN = "";
                            string maHuyenNN = item.ThongTinThe.ma_huyen_nkq ?? "";
                            string tenXaNN = "";
                            string maXaNN = item.ThongTinThe.ma_xa_nkq ?? "";
                            string diaChiNN = "";
                            
                            // Thông tin bệnh viện
                            string tenTinhBenhVien = "";
                            string maTinhBenhVien = "";
                            string tenBenhVien = "";
                            string maBenhVien = "";

                            // Các cột cũ
                            worksheet.Cells[row, 1].Value = i + 1; // STT
                            worksheet.Cells[row, 2].Value = item.ThongTinThe.ho_ten; // HoTen
                            worksheet.Cells[row, 3].Value = item.ThongTinThe.ma_so_bhxh; // MaSoBHXH
                            worksheet.Cells[row, 4].Value = loai; // Loai
                            worksheet.Cells[row, 5].Value = phuongAn; // PA
                            worksheet.Cells[row, 6].Value = item.muc_thu_nhap; // MucTien
                            worksheet.Cells[row, 7].Value = thangBatDau; // Tuthang
                            worksheet.Cells[row, 8].Value = item.phuong_thuc_dong; // Sothang
                            worksheet.Cells[row, 9].Value = item.ty_le_dong; // Tyle
                            worksheet.Cells[row, 10].Value = item.ty_le_nsnn; // TyleNSNN
                            worksheet.Cells[row, 11].Value = tienHoTro; // TienHotro
                            worksheet.Cells[row, 12].Value = 0; // TyleNSDP
                            worksheet.Cells[row, 13].Value = 0; // TienNSDP
                            worksheet.Cells[row, 14].Value = 0; // TyleHotroKhac
                            worksheet.Cells[row, 15].Value = 0; // TienHotroKhac
                            worksheet.Cells[row, 16].Value = tienTuDong; // TienTuDong
                            
                            // Các cột vừa thêm
                            worksheet.Cells[row, 17].Value = item.muc_thu_nhap; // TongTien
                            worksheet.Cells[row, 18].Value = tenTinh; // TenTinhDangSS
                            worksheet.Cells[row, 19].Value = maTinhNN; // Matinh_DangSS
                            worksheet.Cells[row, 20].Value = tenHuyen; // TenhuyenDangSS
                            worksheet.Cells[row, 21].Value = maHuyenNN; // Mahuyen_DangSS
                            worksheet.Cells[row, 22].Value = tenXa; // TenxaDangSS
                            worksheet.Cells[row, 23].Value = maXaNN; // Maxa_DangSS
                            worksheet.Cells[row, 24].Value = ""; // Diachi_DangSS
                            worksheet.Cells[row, 25].Value = item.ghi_chu; // GhiChu
                            worksheet.Cells[row, 26].Value = phuongPhuc; // PhuongPhuc
                            worksheet.Cells[row, 27].Value = heSo; // Heso
                            worksheet.Cells[row, 28].Value = item.ThongTinThe.cccd; // SoCCCD
                            worksheet.Cells[row, 29].Value = item.so_bien_lai; // SoBienLai
                            
                            // Các cột mới được thêm theo ảnh trước
                            worksheet.Cells[row, 30].Value = ngayBienLai; // NgayBienLai
                            worksheet.Cells[row, 31].Value = maNhanVienThu; // MaNhanvienThu
                            worksheet.Cells[row, 32].Value = ""; // Tk1_Save
                            worksheet.Cells[row, 33].Value = item.ThongTinThe.cccd; // CMND
                            worksheet.Cells[row, 34].Value = item.ThongTinThe.ma_hgd; // Maho_Giadinh
                            worksheet.Cells[row, 35].Value = ngaySinh; // NgaySinh
                            worksheet.Cells[row, 36].Value = gioiTinh; // GioiTinh
                            worksheet.Cells[row, 37].Value = tenQuocTich; // TenQuocTich
                            worksheet.Cells[row, 38].Value = quocTich; // QuocTich
                            worksheet.Cells[row, 39].Value = tenDanToc; // TenDanToc
                            worksheet.Cells[row, 40].Value = danToc; // DanToc
                            
                            // Các cột mới thêm từ ảnh mới về bệnh viện và KS
                            worksheet.Cells[row, 41].Value = tenTinhBenhVien; // TenTinhBenhVien
                            worksheet.Cells[row, 42].Value = maTinhBenhVien; // MaTinhBenhVien
                            worksheet.Cells[row, 43].Value = tenBenhVien; // TenBenhVien
                            worksheet.Cells[row, 44].Value = maBenhVien; // MaBenhVien
                            worksheet.Cells[row, 45].Value = tenTinhKS; // TenTinhKS
                            worksheet.Cells[row, 46].Value = maTinhKS; // Matinh_KS
                            worksheet.Cells[row, 47].Value = tenHuyenKS; // TenHuyenKS
                            worksheet.Cells[row, 48].Value = maHuyenKS; // Mahuyen_KS
                            worksheet.Cells[row, 49].Value = tenXaKS; // TenXaKS
                            worksheet.Cells[row, 50].Value = maXaKS; // Maxa_KS
                            worksheet.Cells[row, 51].Value = tenTinhNN; // TenTinhNN
                            worksheet.Cells[row, 52].Value = maTinhNN; // Matinh_NN
                            worksheet.Cells[row, 53].Value = tenHuyenNN; // TenHuyenNN
                            
                            // Các cột mới thêm từ ảnh mới nhất về xã nơi ở
                            worksheet.Cells[row, 54].Value = tenXaNN; // TenXaNN
                            worksheet.Cells[row, 55].Value = maXaNN; // Maxa_NN
                            worksheet.Cells[row, 56].Value = diaChiNN; // Diachi_NN

                            // Format các ô số
                            worksheet.Cells[row, 6].Style.Numberformat.Format = "#,##0"; // MucTien
                            worksheet.Cells[row, 11].Style.Numberformat.Format = "#,##0"; // TienHotro
                            worksheet.Cells[row, 13].Style.Numberformat.Format = "#,##0"; // TienNSDP
                            worksheet.Cells[row, 15].Style.Numberformat.Format = "#,##0"; // TienHotroKhac
                            worksheet.Cells[row, 16].Style.Numberformat.Format = "#,##0"; // TienTuDong
                            worksheet.Cells[row, 17].Style.Numberformat.Format = "#,##0"; // TongTien

                            // Thêm border cho các ô
                            for (int j = 1; j <= headers.Count; j++)
                            {
                                worksheet.Cells[row, j].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
                            }
                        }

                        // Tự động điều chỉnh độ rộng cột
                        worksheet.Cells.AutoFitColumns();

                        // Lưu workbook
                        package.Save();
                    }

                    // Trả về file Excel
                    memoryStream.Position = 0;
                    string fileName = $"BHXH_VNPT_{dotKeKhai.ten_dot?.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd}.xlsx";
                    return File(memoryStream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xuất BHXH VNPT: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xuất dữ liệu BHXH VNPT", error = ex.Message });
            }
        }
    }
} 