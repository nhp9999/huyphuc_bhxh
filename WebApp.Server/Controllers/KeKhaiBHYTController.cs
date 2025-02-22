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
using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dot-ke-khai")]
    public class KeKhaiBHYTController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<KeKhaiBHYTController> _logger;

        public KeKhaiBHYTController(
            ApplicationDbContext context,
            ILogger<KeKhaiBHYTController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{dotKeKhaiId}/ke-khai-bhyt")]
        public async Task<ActionResult<IEnumerable<KeKhaiBHYT>>> GetByDotKeKhai(int dotKeKhaiId)
        {
            try
            {
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.ThongTinThe)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId)
                    .Select(k => new KeKhaiBHYT
                    {
                        id = k.id,
                        dot_ke_khai_id = k.dot_ke_khai_id,
                        thong_tin_the_id = k.thong_tin_the_id,
                        nguoi_thu = k.nguoi_thu,
                        so_thang_dong = k.so_thang_dong,
                        phuong_an_dong = k.phuong_an_dong,
                        han_the_cu = k.han_the_cu,
                        han_the_moi_tu = k.han_the_moi_tu,
                        han_the_moi_den = k.han_the_moi_den,
                        tinh_nkq = k.tinh_nkq,
                        huyen_nkq = k.huyen_nkq,
                        xa_nkq = k.xa_nkq,
                        dia_chi_nkq = k.dia_chi_nkq,
                        benh_vien_kcb = k.benh_vien_kcb,
                        nguoi_tao = k.nguoi_tao,
                        ngay_tao = k.ngay_tao,
                        ngay_bien_lai = k.ngay_bien_lai,
                        so_tien_can_dong = k.so_tien_can_dong,
                        DotKeKhai = k.DotKeKhai,
                        ThongTinThe = k.ThongTinThe
                    })
                    .ToListAsync();

                return Ok(keKhaiBHYTs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting ke khai BHYT list by dot ke khai {dotKeKhaiId}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kê khai BHYT", error = ex.Message });
            }
        }

        [HttpGet("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<ActionResult<KeKhaiBHYT>> GetKeKhaiBHYT(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);

                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                return Ok(keKhaiBHYT);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPost("{dotKeKhaiId}/ke-khai-bhyt")]
        public async Task<ActionResult<KeKhaiBHYT>> CreateKeKhaiBHYT(int dotKeKhaiId, KeKhaiBHYT keKhaiBHYT)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Received data: {JsonSerializer.Serialize(keKhaiBHYT)}");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning($"Invalid model state: {JsonSerializer.Serialize(ModelState)}");
                    return BadRequest(ModelState);
                }

                var dotKeKhai = await _context.DotKeKhais
                    .Include(d => d.DonVi)
                    .FirstOrDefaultAsync(d => d.id == dotKeKhaiId);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                // Kiểm tra xem mã số BHXH đã tồn tại trong đợt kê khai này chưa
                var existingKeKhai = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId)
                    .Select(k => new {
                        k.id,
                        k.dot_ke_khai_id,
                        k.thong_tin_the_id,
                        ma_so_bhxh = k.ThongTinThe.ma_so_bhxh,
                        k.tinh_nkq,
                        k.huyen_nkq,
                        k.xa_nkq,
                        k.dia_chi_nkq,
                        k.nguoi_thu,
                        k.so_thang_dong,
                        k.phuong_an_dong,
                        k.han_the_cu,
                        k.han_the_moi_tu,
                        k.han_the_moi_den,
                        k.benh_vien_kcb,
                        k.nguoi_tao,
                        k.ngay_tao,
                        k.ngay_bien_lai,
                        k.so_tien_can_dong
                    })
                    .FirstOrDefaultAsync(k => k.ma_so_bhxh == keKhaiBHYT.ThongTinThe.ma_so_bhxh);

                if (existingKeKhai != null)
                {
                    return BadRequest(new { 
                        success = false,
                        message = $"Mã số BHXH {keKhaiBHYT.ThongTinThe.ma_so_bhxh} đã được kê khai trong đợt này" 
                    });
                }

                // Kiểm tra xem mã số BHXH đã được kê khai trong vòng 1 tuần qua chưa
                var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
                var recentKeKhai = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Where(k => k.ThongTinThe.ma_so_bhxh == keKhaiBHYT.ThongTinThe.ma_so_bhxh
                        && k.ngay_tao >= oneWeekAgo
                        && k.dot_ke_khai_id != dotKeKhaiId)
                    .Select(k => new {
                        k.id,
                        k.dot_ke_khai_id,
                        k.thong_tin_the_id,
                        k.ThongTinThe.ma_so_bhxh,
                        k.tinh_nkq,
                        k.huyen_nkq,
                        k.xa_nkq,
                        k.DotKeKhai.so_dot,
                        k.DotKeKhai.thang,
                        k.DotKeKhai.nam
                    })
                    .OrderByDescending(k => k.id)
                    .FirstOrDefaultAsync();

                if (recentKeKhai != null)
                {
                    var dotKeKhaiInfo = $"Đợt {recentKeKhai.so_dot} tháng {recentKeKhai.thang} năm {recentKeKhai.nam}";
                    return BadRequest(new { 
                        success = false,
                        message = $"Mã số BHXH {keKhaiBHYT.ThongTinThe.ma_so_bhxh} đã được kê khai trong {dotKeKhaiInfo}" 
                    });
                }

                // Kiểm tra CCCD đã tồn tại chưa
                var existingThongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(t => t.cccd == keKhaiBHYT.ThongTinThe.cccd);

                if (existingThongTinThe != null)
                {
                    // Nếu đã tồn tại, sử dụng lại thông tin thẻ cũ
                    keKhaiBHYT.thong_tin_the_id = existingThongTinThe.id;
                    keKhaiBHYT.ThongTinThe = existingThongTinThe;
                }
                else 
                {
                    // Nếu chưa tồn tại, tạo mới thông tin thẻ
                    keKhaiBHYT.ThongTinThe.ngay_tao = DateTime.UtcNow;
                    keKhaiBHYT.ThongTinThe.nguoi_tao = User.Identity?.Name;
                    
                    // Lấy thông tin từ request
                    keKhaiBHYT.ThongTinThe.ma_dan_toc = keKhaiBHYT.ThongTinThe.ma_dan_toc;
                    keKhaiBHYT.ThongTinThe.quoc_tich = keKhaiBHYT.ThongTinThe.quoc_tich;

                    _context.ThongTinThes.Add(keKhaiBHYT.ThongTinThe);
                    await _context.SaveChangesAsync(); // Lưu trước để lấy ID
                    keKhaiBHYT.thong_tin_the_id = keKhaiBHYT.ThongTinThe.id;
                }

                // Gán DotKeKhai từ database
                keKhaiBHYT.DotKeKhai = dotKeKhai;
                keKhaiBHYT.dot_ke_khai_id = dotKeKhaiId;
                keKhaiBHYT.ngay_tao = DateTime.UtcNow;
                keKhaiBHYT.nguoi_tao = User.Identity?.Name;

                // Lấy thông tin người thu (người đang đăng nhập)
                var userName = User.Identity != null ? User.Identity.Name : null;
                if (string.IsNullOrEmpty(userName))
                {
                    _logger.LogWarning("Không tìm thấy thông tin người dùng đăng nhập");
                    return BadRequest(new { message = "Không tìm thấy thông tin người dùng đăng nhập" });
                }

                var nguoiThu = await _context.NguoiDungs
                    .FirstOrDefaultAsync(n => n.user_name == userName);

                if (nguoiThu == null)
                {
                    _logger.LogWarning($"Không tìm thấy thông tin người thu {userName}");
                    return BadRequest(new { message = "Không tìm thấy thông tin người thu" });
                }

                // Lấy số biên lai tiếp theo
                var quyenBienLai = await _context.QuyenBienLais
                    .Where(q => q.nhan_vien_thu == nguoiThu.id && 
                           q.trang_thai == "dang_su_dung")
                    .OrderBy(q => q.ngay_cap)
                    .FirstOrDefaultAsync();

                if (quyenBienLai == null)
                {
                    _logger.LogWarning($"Không tìm thấy quyển biên lai đang sử dụng cho người thu {nguoiThu.ho_ten}");
                    return BadRequest(new { message = "Người thu chưa được cấp quyển biên lai hoặc đã hết số" });
                }

                // Gán quyển biên lai cho kê khai
                keKhaiBHYT.quyen_bien_lai_id = quyenBienLai.id;

                if (quyenBienLai.so_hien_tai == null)
                {
                    _logger.LogWarning($"Số hiện tại null cho quyển: {quyenBienLai.quyen_so}");
                    return BadRequest(new { message = "Số hiện tại không hợp lệ" });
                }

                try
                {
                    var soHienTai = int.Parse(quyenBienLai.so_hien_tai);
                    var denSo = int.Parse(quyenBienLai.den_so);
                    
                    _logger.LogInformation($"Số hiện tại: {soHienTai}, Đến số: {denSo}");

                    if (soHienTai > denSo)
                    {
                        quyenBienLai.trang_thai = "da_su_dung";
                        await _context.SaveChangesAsync();
                        return BadRequest(new { message = "Quyển biên lai đã hết số" });
                    }

                    keKhaiBHYT.so_bien_lai = soHienTai.ToString().PadLeft(quyenBienLai.so_hien_tai.Length, '0');
                    quyenBienLai.so_hien_tai = (soHienTai + 1).ToString().PadLeft(quyenBienLai.so_hien_tai.Length, '0');

                    _logger.LogInformation($"Cấp số biên lai: {keKhaiBHYT.so_bien_lai}, Số tiếp theo: {quyenBienLai.so_hien_tai}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Lỗi xử lý số biên lai: {ex.Message}");
                    throw;
                }

                // 1. Lưu kê khai BHYT
                _context.KeKhaiBHYTs.Add(keKhaiBHYT);
                await _context.SaveChangesAsync();

                // 2. Tạo biên lai
                var bienLai = new BienLai
                {
                    quyen_so = quyenBienLai.quyen_so,
                    so_bien_lai = keKhaiBHYT.so_bien_lai,
                    ten_nguoi_dong = keKhaiBHYT.ThongTinThe.ho_ten,
                    so_tien = keKhaiBHYT.so_tien_can_dong,
                    ke_khai_bhyt_id = keKhaiBHYT.id,
                    ma_so_bhxh = keKhaiBHYT.ThongTinThe.ma_so_bhxh,
                    ma_nhan_vien = nguoiThu.ma_nhan_vien,
                    ngay_bien_lai = keKhaiBHYT.ngay_bien_lai ?? DateTime.Now,
                    ma_co_quan_bhxh = keKhaiBHYT.DotKeKhai.DonVi?.MaCoQuanBHXH ?? "",
                    ma_so_bhxh_don_vi = keKhaiBHYT.DotKeKhai.DonVi?.MaSoBHXH ?? "",
                    tinh_chat = "bien_lai_goc"
                };

                _context.BienLais.Add(bienLai);
                await _context.SaveChangesAsync();

                // Nếu mọi thứ OK thì commit transaction
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetKeKhaiBHYT), 
                    new { dotKeKhaiId, id = keKhaiBHYT.id }, 
                    new { success = true, message = "Tạo kê khai BHYT thành công", data = keKhaiBHYT }
                );
            }
            catch (Exception ex)
            {
                // Có lỗi thì rollback transaction
                await transaction.RollbackAsync();
                _logger.LogError($"Error creating ke khai BHYT: {ex.Message}");
                return StatusCode(500, new {
                    success = false,
                    message = "Lỗi khi tạo kê khai BHYT",
                    error = ex.Message
                });
            }
        }

        [HttpPut("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<IActionResult> UpdateKeKhaiBHYT(int dotKeKhaiId, int id, KeKhaiBHYT keKhaiBHYT)
        {
            if (id != keKhaiBHYT.id || dotKeKhaiId != keKhaiBHYT.dot_ke_khai_id)
            {
                return BadRequest(new { message = "ID không khớp" });
            }

            try
            {
                var existingKeKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);
                    
                if (existingKeKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Cập nhật thông tin thẻ
                if (existingKeKhaiBHYT.ThongTinThe != null && keKhaiBHYT.ThongTinThe != null)
                {
                    _context.Entry(existingKeKhaiBHYT.ThongTinThe).CurrentValues.SetValues(keKhaiBHYT.ThongTinThe);
                }

                // Cập nhật thông tin kê khai
                _context.Entry(existingKeKhaiBHYT).CurrentValues.SetValues(keKhaiBHYT);

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KeKhaiBHYTExists(dotKeKhaiId, id))
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật kê khai BHYT", error = ex.Message });
            }
        }

        [HttpDelete("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<IActionResult> DeleteKeKhaiBHYT(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);
                    
                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                _context.KeKhaiBHYTs.Remove(keKhaiBHYT);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPost("{dotKeKhaiId}/ke-khai-bhyt/delete-multiple")]
        public async Task<IActionResult> DeleteMultiple(int dotKeKhaiId, [FromBody] DeleteMultipleDto dto)
        {
            try
            {
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId && dto.ids.Contains(k.id))
                    .ToListAsync();

                _context.KeKhaiBHYTs.RemoveRange(keKhaiBHYTs);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting multiple ke khai BHYT: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa nhiều kê khai BHYT", error = ex.Message });
            }
        }

        private bool KeKhaiBHYTExists(int dotKeKhaiId, int id)
        {
            return _context.KeKhaiBHYTs.Any(e => e.dot_ke_khai_id == dotKeKhaiId && e.id == id);
        }

        [HttpPatch("{dotKeKhaiId}/ke-khai-bhyt/{id}/toggle-urgent")]
        public async Task<IActionResult> ToggleUrgent(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);
                    
                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Toggle trạng thái urgent
                keKhaiBHYT.is_urgent = !keKhaiBHYT.is_urgent;
                await _context.SaveChangesAsync();

                return Ok(new { is_urgent = keKhaiBHYT.is_urgent });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error toggling urgent status for ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái gấp", error = ex.Message });
            }
        }

        [HttpPost("{id}/cap-nhat-so-bien-lai")]
        public async Task<IActionResult> CapNhatSoBienLai(int id, [FromBody] CapNhatSoBienLaiDto dto)
        {
            try
            {
                var keKhai = await _context.KeKhaiBHYTs
                    .Include(k => k.QuyenBienLai)
                    .FirstOrDefaultAsync(k => k.id == id);

                if (keKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                if (keKhai.QuyenBienLai == null)
                {
                    return BadRequest(new { message = "Kê khai chưa được gán quyển biên lai" });
                }

                // Kiểm tra số biên lai có hợp lệ không
                var quyenBienLai = keKhai.QuyenBienLai;
                var soBienLai = int.Parse(dto.so_bien_lai);
                var tuSo = int.Parse(quyenBienLai.tu_so);
                var denSo = int.Parse(quyenBienLai.den_so);

                if (soBienLai < tuSo || soBienLai > denSo)
                {
                    return BadRequest(new { message = "Số biên lai không nằm trong khoảng cho phép" });
                }

                // Kiểm tra số biên lai đã được sử dụng chưa
                var daCoSoBienLai = await _context.KeKhaiBHYTs
                    .AnyAsync(k => k.id != id && 
                                  k.quyen_bien_lai_id == quyenBienLai.id && 
                                  k.so_bien_lai == dto.so_bien_lai);

                if (daCoSoBienLai)
                {
                    return BadRequest(new { message = "Số biên lai đã được sử dụng" });
                }

                keKhai.so_bien_lai = dto.so_bien_lai;
                quyenBienLai.so_hien_tai = dto.so_bien_lai;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật số biên lai thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating so bien lai for ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật số biên lai", error = ex.Message });
            }
        }

        [HttpPost("create-bien-lai")]
        public async Task<IActionResult> CreateBienLai([FromBody] BienLaiCreateDto dto)
        {
            try
            {
                // Kiểm tra quyển biên lai
                var quyenBienLai = await _context.QuyenBienLais
                    .FirstOrDefaultAsync(q => q.quyen_so == dto.quyen_so);

                if (quyenBienLai == null)
                {
                    return BadRequest(new { message = "Quyển biên lai không tồn tại" });
                }

                // Tạo biên lai mới
                var bienLai = new BienLai
                {
                    quyen_so = dto.quyen_so,
                    so_bien_lai = dto.so_bien_lai,
                    ten_nguoi_dong = dto.ten_nguoi_dong,
                    so_tien = dto.so_tien,
                    ghi_chu = dto.ghi_chu,
                    trang_thai = "active",
                    ngay_tao = DateTime.Now
                };

                _context.BienLais.Add(bienLai);
                await _context.SaveChangesAsync();

                return Ok(bienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo biên lai");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo biên lai" });
            }
        }
    }

    public class DeleteMultipleDto
    {
        [Required]
        public int[] ids { get; set; } = Array.Empty<int>();
    }

    public class CapNhatSoBienLaiDto
    {
        [Required]
        public string so_bien_lai { get; set; }
    }

    public class BienLaiCreateDto
    {
        [Required]
        public string quyen_so { get; set; }
        [Required]
        public string so_bien_lai { get; set; }
        [Required]
        public string ten_nguoi_dong { get; set; }
        [Required]
        public decimal so_tien { get; set; }
        public string ghi_chu { get; set; }
    }
} 