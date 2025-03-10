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
                        k.ghi_chu
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
    }
} 