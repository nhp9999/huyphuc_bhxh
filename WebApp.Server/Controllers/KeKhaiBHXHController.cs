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
                        k.tien_lai,
                        k.tien_thua,
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

                // Lấy mức thu nhập
                decimal mucThuNhap = GetDecimalProperty(requestData, "muc_thu_nhap");

                // Tính hệ số dựa trên mức thu nhập
                int heSo = GetHeSoFromMucThuNhap(mucThuNhap);

                // Tạo kê khai BHXH
                var keKhaiBHXH = new KeKhaiBHXH
                {
                    dot_ke_khai_id = dotKeKhaiId,
                    thong_tin_the_id = thongTinThe.id,
                    muc_thu_nhap = mucThuNhap,
                    ty_le_dong = GetDecimalProperty(requestData, "ty_le_dong"),
                    ty_le_nsnn = GetDecimalProperty(requestData, "ty_le_nsnn"),
                    loai_nsnn = GetStringProperty(requestData, "loai_nsnn"),
                    tien_ho_tro = GetDecimalProperty(requestData, "tien_ho_tro"),
                    tien_lai = GetDecimalProperty(requestData, "tien_lai"),
                    tien_thua = GetDecimalProperty(requestData, "tien_thua"),
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
                    xa_nkq = GetStringProperty(requestData, "xa_nkq", ""),
                    he_so = heSo
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
            _logger.LogInformation($"Nhận yêu cầu cập nhật kê khai BHXH với ID: {id}, dotKeKhaiId: {dotKeKhaiId}");
            _logger.LogInformation($"Dữ liệu nhận được: {JsonSerializer.Serialize(keKhaiBHXH)}");

            if (id != keKhaiBHXH.id || dotKeKhaiId != keKhaiBHXH.dot_ke_khai_id)
            {
                _logger.LogWarning($"ID không khớp: id={id}, keKhaiBHXH.id={keKhaiBHXH.id}, dotKeKhaiId={dotKeKhaiId}, keKhaiBHXH.dot_ke_khai_id={keKhaiBHXH.dot_ke_khai_id}");
                return BadRequest(new { message = "ID không khớp" });
            }

            try
            {
                // Tìm bản ghi hiện có
                var existingKeKhaiBHXH = await _context.KeKhaiBHXHs
                    .Include(k => k.ThongTinThe)
                    .FirstOrDefaultAsync(k => k.id == id && k.dot_ke_khai_id == dotKeKhaiId);

                if (existingKeKhaiBHXH == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHXH" });
                }

                // Cập nhật thông tin thẻ nếu có
                if (existingKeKhaiBHXH.ThongTinThe != null && keKhaiBHXH.ThongTinThe != null)
                {
                    var existingThongTinThe = existingKeKhaiBHXH.ThongTinThe;
                    var updatedThongTinThe = keKhaiBHXH.ThongTinThe;

                    // Cập nhật thông tin cơ bản
                    existingThongTinThe.ho_ten = updatedThongTinThe.ho_ten;
                    existingThongTinThe.ngay_sinh = updatedThongTinThe.ngay_sinh;
                    existingThongTinThe.gioi_tinh = updatedThongTinThe.gioi_tinh;
                    existingThongTinThe.so_dien_thoai = updatedThongTinThe.so_dien_thoai;
                    existingThongTinThe.cccd = updatedThongTinThe.cccd;
                    existingThongTinThe.ma_dan_toc = updatedThongTinThe.ma_dan_toc;
                    existingThongTinThe.ma_hgd = updatedThongTinThe.ma_hgd;

                    // Cập nhật thông tin nơi khám quán
                    existingThongTinThe.ma_tinh_nkq = updatedThongTinThe.ma_tinh_nkq;
                    existingThongTinThe.ma_huyen_nkq = updatedThongTinThe.ma_huyen_nkq;
                    existingThongTinThe.ma_xa_nkq = updatedThongTinThe.ma_xa_nkq;

                    // Cập nhật entity trong context
                    _context.ThongTinThes.Update(existingThongTinThe);
                }

                // Cập nhật từng trường thông tin của kê khai BHXH
                existingKeKhaiBHXH.muc_thu_nhap = keKhaiBHXH.muc_thu_nhap;
                existingKeKhaiBHXH.ty_le_dong = keKhaiBHXH.ty_le_dong;
                existingKeKhaiBHXH.ty_le_nsnn = keKhaiBHXH.ty_le_nsnn;
                existingKeKhaiBHXH.loai_nsnn = keKhaiBHXH.loai_nsnn;
                existingKeKhaiBHXH.tien_ho_tro = keKhaiBHXH.tien_ho_tro;
                existingKeKhaiBHXH.tien_lai = keKhaiBHXH.tien_lai;
                existingKeKhaiBHXH.tien_thua = keKhaiBHXH.tien_thua;
                existingKeKhaiBHXH.so_tien_can_dong = keKhaiBHXH.so_tien_can_dong;
                existingKeKhaiBHXH.phuong_thuc_dong = keKhaiBHXH.phuong_thuc_dong;
                existingKeKhaiBHXH.thang_bat_dau = keKhaiBHXH.thang_bat_dau;
                existingKeKhaiBHXH.phuong_an = keKhaiBHXH.phuong_an;
                existingKeKhaiBHXH.loai_khai_bao = keKhaiBHXH.loai_khai_bao;
                existingKeKhaiBHXH.ngay_bien_lai = keKhaiBHXH.ngay_bien_lai;
                existingKeKhaiBHXH.ghi_chu = keKhaiBHXH.ghi_chu;
                existingKeKhaiBHXH.tinh_nkq = keKhaiBHXH.tinh_nkq;
                existingKeKhaiBHXH.huyen_nkq = keKhaiBHXH.huyen_nkq;
                existingKeKhaiBHXH.xa_nkq = keKhaiBHXH.xa_nkq;
                existingKeKhaiBHXH.ma_nhan_vien = keKhaiBHXH.ma_nhan_vien;
                existingKeKhaiBHXH.he_so = keKhaiBHXH.he_so;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã cập nhật thành công kê khai BHXH với ID: {id}");

                return Ok(new {
                    success = true,
                    message = "Cập nhật kê khai BHXH thành công",
                    data = existingKeKhaiBHXH
                });
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!KeKhaiBHXHExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHXH" });
                }
                else
                {
                    _logger.LogError($"Lỗi DbUpdateConcurrencyException khi cập nhật kê khai BHXH: {ex.Message}");
                    return StatusCode(500, new { message = "Lỗi khi cập nhật kê khai BHXH", error = ex.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật kê khai BHXH: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Lỗi khi cập nhật kê khai BHXH", error = ex.Message });
            }
        }

        // POST: api/dot-ke-khai/ke-khai-bhxh/update
        [HttpPost("ke-khai-bhxh/update")]
        public async Task<IActionResult> UpdateKeKhaiBHXHAlternative([FromBody] JsonElement requestData)
        {
            try
            {
                _logger.LogInformation("Nhận yêu cầu cập nhật kê khai BHXH (phương thức thay thế)");
                _logger.LogInformation($"Dữ liệu nhận được: {requestData}");

                // Lấy ID và dot_ke_khai_id từ request
                if (!requestData.TryGetProperty("id", out JsonElement idElement) ||
                    !requestData.TryGetProperty("dot_ke_khai_id", out JsonElement dotKeKhaiIdElement))
                {
                    return BadRequest(new { message = "Thiếu thông tin id hoặc dot_ke_khai_id" });
                }

                int id = idElement.GetInt32();
                int dotKeKhaiId = dotKeKhaiIdElement.GetInt32();

                // Tìm bản ghi hiện có
                var existingKeKhaiBHXH = await _context.KeKhaiBHXHs
                    .Include(k => k.ThongTinThe)
                    .FirstOrDefaultAsync(k => k.id == id && k.dot_ke_khai_id == dotKeKhaiId);

                if (existingKeKhaiBHXH == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHXH" });
                }

                // Cập nhật thông tin thẻ nếu có
                if (existingKeKhaiBHXH.ThongTinThe != null &&
                    requestData.TryGetProperty("thong_tin_the", out JsonElement thongTinTheElement))
                {
                    var existingThongTinThe = existingKeKhaiBHXH.ThongTinThe;

                    // Cập nhật thông tin cơ bản
                    existingThongTinThe.ho_ten = GetStringProperty(thongTinTheElement, "ho_ten", existingThongTinThe.ho_ten);
                    existingThongTinThe.ngay_sinh = GetStringProperty(thongTinTheElement, "ngay_sinh", existingThongTinThe.ngay_sinh);
                    existingThongTinThe.gioi_tinh = GetStringProperty(thongTinTheElement, "gioi_tinh", existingThongTinThe.gioi_tinh);
                    existingThongTinThe.so_dien_thoai = GetStringProperty(thongTinTheElement, "so_dien_thoai", existingThongTinThe.so_dien_thoai);
                    existingThongTinThe.cccd = GetStringProperty(thongTinTheElement, "cccd", existingThongTinThe.cccd);
                    existingThongTinThe.ma_dan_toc = GetStringProperty(thongTinTheElement, "ma_dan_toc", existingThongTinThe.ma_dan_toc);
                    existingThongTinThe.ma_hgd = GetStringProperty(thongTinTheElement, "ma_hgd", existingThongTinThe.ma_hgd);

                    // Cập nhật thông tin nơi khám quán
                    existingThongTinThe.ma_tinh_nkq = GetStringProperty(thongTinTheElement, "ma_tinh_nkq", existingThongTinThe.ma_tinh_nkq);
                    existingThongTinThe.ma_huyen_nkq = GetStringProperty(thongTinTheElement, "ma_huyen_nkq", existingThongTinThe.ma_huyen_nkq);
                    existingThongTinThe.ma_xa_nkq = GetStringProperty(thongTinTheElement, "ma_xa_nkq", existingThongTinThe.ma_xa_nkq);

                    // Cập nhật entity trong context
                    _context.ThongTinThes.Update(existingThongTinThe);
                }

                // Cập nhật từng trường thông tin của kê khai BHXH
                if (requestData.TryGetProperty("muc_thu_nhap", out JsonElement mucThuNhapElement))
                {
                    existingKeKhaiBHXH.muc_thu_nhap = mucThuNhapElement.GetDecimal();
                }

                if (requestData.TryGetProperty("ty_le_dong", out JsonElement tyLeDongElement))
                {
                    existingKeKhaiBHXH.ty_le_dong = tyLeDongElement.GetDecimal();
                }

                if (requestData.TryGetProperty("ty_le_nsnn", out JsonElement tyLeNSNNElement) &&
                    tyLeNSNNElement.ValueKind != JsonValueKind.Null)
                {
                    existingKeKhaiBHXH.ty_le_nsnn = tyLeNSNNElement.GetDecimal();
                }

                existingKeKhaiBHXH.loai_nsnn = GetStringProperty(requestData, "loai_nsnn", existingKeKhaiBHXH.loai_nsnn);

                if (requestData.TryGetProperty("tien_ho_tro", out JsonElement tienHoTroElement))
                {
                    existingKeKhaiBHXH.tien_ho_tro = tienHoTroElement.GetDecimal();
                }

                if (requestData.TryGetProperty("tien_lai", out JsonElement tienLaiElement))
                {
                    existingKeKhaiBHXH.tien_lai = tienLaiElement.GetDecimal();
                }

                if (requestData.TryGetProperty("tien_thua", out JsonElement tienThuaElement))
                {
                    existingKeKhaiBHXH.tien_thua = tienThuaElement.GetDecimal();
                }

                if (requestData.TryGetProperty("so_tien_can_dong", out JsonElement soTienCanDongElement))
                {
                    existingKeKhaiBHXH.so_tien_can_dong = soTienCanDongElement.GetDecimal();
                }

                if (requestData.TryGetProperty("phuong_thuc_dong", out JsonElement phuongThucDongElement))
                {
                    existingKeKhaiBHXH.phuong_thuc_dong = phuongThucDongElement.GetInt32();
                }

                existingKeKhaiBHXH.thang_bat_dau = GetStringProperty(requestData, "thang_bat_dau", existingKeKhaiBHXH.thang_bat_dau);
                existingKeKhaiBHXH.phuong_an = GetStringProperty(requestData, "phuong_an", existingKeKhaiBHXH.phuong_an);
                existingKeKhaiBHXH.loai_khai_bao = GetStringProperty(requestData, "loai_khai_bao", existingKeKhaiBHXH.loai_khai_bao);

                if (requestData.TryGetProperty("ngay_bien_lai", out JsonElement ngayBienLaiElement) &&
                    ngayBienLaiElement.ValueKind != JsonValueKind.Null)
                {
                    existingKeKhaiBHXH.ngay_bien_lai = DateTime.Parse(ngayBienLaiElement.GetString());
                }

                existingKeKhaiBHXH.ghi_chu = GetStringProperty(requestData, "ghi_chu", existingKeKhaiBHXH.ghi_chu);
                existingKeKhaiBHXH.tinh_nkq = GetStringProperty(requestData, "tinh_nkq", existingKeKhaiBHXH.tinh_nkq);
                existingKeKhaiBHXH.huyen_nkq = GetStringProperty(requestData, "huyen_nkq", existingKeKhaiBHXH.huyen_nkq);
                existingKeKhaiBHXH.xa_nkq = GetStringProperty(requestData, "xa_nkq", existingKeKhaiBHXH.xa_nkq);
                existingKeKhaiBHXH.ma_nhan_vien = GetStringProperty(requestData, "ma_nhan_vien", existingKeKhaiBHXH.ma_nhan_vien);

                if (requestData.TryGetProperty("he_so", out JsonElement heSoElement))
                {
                    existingKeKhaiBHXH.he_so = heSoElement.GetInt32();
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã cập nhật thành công kê khai BHXH với ID: {id} (phương thức thay thế)");

                return Ok(new {
                    success = true,
                    message = "Cập nhật kê khai BHXH thành công",
                    data = existingKeKhaiBHXH
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật kê khai BHXH (phương thức thay thế): {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
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
                            "TienTudong",
                            "Tongtien",
                            "TenTinhDangSS",
                            "Matinh_DangSS",
                            "TenhuyenDangSS",
                            "Mahuyen_DangSS",
                            "TenxaDangSS",
                            "Maxa_DangSS",
                            "Diachi_DangSS",
                            "Ghichu",
                            "Phuongthuc",
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
                            "Mahuyen_NN",
                            "TenXaNN",
                            "Maxa_NN",
                            "Diachi_NN"
                        };

                        // Set header nội dung - không định dạng gì cả
                        for (int i = 0; i < headers.Count; i++)
                        {
                            worksheet.Cells[1, i + 1].Value = headers[i];
                            // Không áp dụng bất kỳ định dạng nào
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

                            // Không format các ô số, để dữ liệu thuần túy

                            // Bỏ phần thêm border cho các ô dữ liệu
                        }

                        // Thiết lập độ rộng cột cố định thay vì tự động điều chỉnh
                        // Thiết lập độ rộng cột cho các cột quan trọng
                        worksheet.Column(1).Width = 5;     // STT
                        worksheet.Column(2).Width = 30;    // Họ tên
                        worksheet.Column(3).Width = 15;    // Mã số BHXH
                        worksheet.Column(6).Width = 15;    // Mức tiền
                        worksheet.Column(7).Width = 10;    // Từ tháng
                        worksheet.Column(8).Width = 8;     // Số tháng
                        worksheet.Column(11).Width = 15;   // Tiền hỗ trợ
                        worksheet.Column(16).Width = 15;   // Tiền tự đóng
                        worksheet.Column(17).Width = 15;   // Tổng tiền
                        worksheet.Column(24).Width = 40;   // Địa chỉ
                        worksheet.Column(28).Width = 15;   // Số CCCD
                        worksheet.Column(29).Width = 15;   // Số biên lai
                        worksheet.Column(30).Width = 15;   // Ngày biên lai
                        worksheet.Column(31).Width = 15;   // Mã nhân viên thu

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
        // GET: api/dot-ke-khai/{dotKeKhaiId}/ke-khai-bhxh-export-vnpt-sheetjs
        [HttpGet]
        [Route("{dotKeKhaiId}/ke-khai-bhxh-export-vnpt-sheetjs")]
        public async Task<IActionResult> ExportBHXHVNPTSheetJS(int dotKeKhaiId)
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

                // Chuẩn bị dữ liệu để trả về cho client
                var result = new
                {
                    dotKeKhai = new
                    {
                        id = dotKeKhai.id,
                        ten_dot = dotKeKhai.ten_dot,
                        don_vi = dotKeKhai.DonVi != null ? new { id = dotKeKhai.DonVi.Id, ten_don_vi = dotKeKhai.DonVi.TenDonVi } : null
                    },
                    keKhaiBHXHs = keKhaiBHXHs.Select((item, index) => {
                        // Loại mặc định là 1
                        int loai = 1;

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

                        // Xác định hệ số dựa trên mức thu nhập
                        int heSo = GetHeSoFromMucThuNhap(item.muc_thu_nhap);

                        // Cập nhật hệ số nếu đã có trong cơ sở dữ liệu
                        if (item.he_so.HasValue)
                        {
                            heSo = item.he_so.Value;
                        }

                        // Định dạng ngày biên lai
                        string ngayBienLai = item.ngay_bien_lai.HasValue ? item.ngay_bien_lai.Value.ToString("dd/MM/yyyy") : "";

                        // Xác định giới tính dạng số (1 = nam, 0 = nữ)
                        int gioiTinh = item.ThongTinThe.gioi_tinh?.ToLower() == "nam" ? 1 : 0;

                        // Định dạng ngày sinh - hiển thị đầy đủ
                        string ngaySinh = "";
                        if (!string.IsNullOrEmpty(item.ThongTinThe.ngay_sinh))
                        {
                            try
                            {
                                // Chuyển đổi sang DateTime và định dạng lại theo dd/MM/yyyy
                                ngaySinh = DateTime.Parse(item.ThongTinThe.ngay_sinh).ToString("dd/MM/yyyy");
                            }
                            catch
                            {
                                // Nếu không chuyển đổi được, giữ nguyên giá trị
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
                        string phuongPhuc = item.phuong_an;

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

                        return new
                        {
                            stt = index + 1,
                            ho_ten = item.ThongTinThe.ho_ten,
                            ma_so_bhxh = item.ThongTinThe.ma_so_bhxh,
                            loai,
                            phuong_an = phuongAn,
                            muc_tien = item.muc_thu_nhap,
                            tu_thang = thangBatDau,
                            so_thang = item.phuong_thuc_dong,
                            ty_le = item.ty_le_dong,
                            ty_le_nsnn = item.ty_le_nsnn,
                            tien_ho_tro = tienHoTro,
                            ty_le_nsdp = 0,
                            tien_nsdp = 0,
                            ty_le_ho_tro_khac = 0,
                            tien_ho_tro_khac = 0,
                            tien_tu_dong = tienTuDong,
                            so_tien_can_dong = item.so_tien_can_dong,
                            tong_tien = item.muc_thu_nhap,
                            ten_tinh_dang_ss = tenTinh,
                            ma_tinh_dang_ss = maTinhNN,
                            ten_huyen_dang_ss = tenHuyen,
                            ma_huyen_dang_ss = maHuyenNN,
                            ten_xa_dang_ss = tenXa,
                            ma_xa_dang_ss = maXaNN,
                            dia_chi_dang_ss = ".",
                            ghi_chu = item.ghi_chu,
                            phuong_thuc = item.phuong_thuc_dong.ToString(),
                            phuong_thuc_dong = item.phuong_thuc_dong,
                            he_so = heSo,
                            so_cccd = item.ThongTinThe.cccd,
                            so_bien_lai = item.so_bien_lai,
                            ngay_bien_lai = ngayBienLai,
                            ma_nhan_vien_thu = maNhanVienThu,
                            tk1_save = "",
                            cmnd = item.ThongTinThe.cccd,
                            ma_ho_gia_dinh = item.ThongTinThe.ma_hgd,
                            ngay_sinh = ngaySinh,
                            gioi_tinh = gioiTinh,
                            ten_quoc_tich = tenQuocTich,
                            quoc_tich = quocTich,
                            ten_dan_toc = tenDanToc,
                            dan_toc = danToc,
                            ten_tinh_benh_vien = tenTinhBenhVien,
                            ma_tinh_benh_vien = maTinhBenhVien,
                            ten_benh_vien = tenBenhVien,
                            ma_benh_vien = maBenhVien,
                            ten_tinh_ks = tenTinhKS,
                            ma_tinh_ks = maTinhKS,
                            ten_huyen_ks = tenHuyenKS,
                            ma_huyen_ks = maHuyenKS,
                            ten_xa_ks = tenXaKS,
                            ma_xa_ks = maXaKS,
                            ten_tinh_nn = tenTinhNN,
                            ma_tinh_nn = maTinhNN,
                            ten_huyen_nn = tenHuyenNN,
                            ma_huyen_nn = maHuyenNN,
                            ten_xa_nn = tenXaNN,
                            ma_xa_nn = maXaNN,
                            dia_chi_nn = diaChiNN
                        };
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xuất dữ liệu BHXH VNPT SheetJS: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xuất dữ liệu BHXH VNPT", error = ex.Message });
            }
        }
        // Phương thức để lấy hệ số từ mức thu nhập
        private int GetHeSoFromMucThuNhap(decimal mucThuNhap)
        {
            // Trường hợp đặc biệt cho mức thu nhập tối thiểu
            if (mucThuNhap == 1500000)
            {
                return 0; // Mức tối thiểu tương ứng với hệ số 0
            }

            // Tính hệ số dựa trên công thức: CEIL((mức thu nhập - 1.500.000) / 50.000)
            if (mucThuNhap < 1500000)
            {
                return 0; // Đảm bảo không có hệ số âm
            }

            // Làm tròn lên để đảm bảo hệ số luôn là số nguyên
            return (int)Math.Ceiling((mucThuNhap - 1500000) / 50000);
        }
    }
}