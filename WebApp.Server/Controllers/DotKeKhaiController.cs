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
    [Route("api/[controller]")]
    public class DotKeKhaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DotKeKhaiController> _logger;

        public DotKeKhaiController(
            ApplicationDbContext context,
            ILogger<DotKeKhaiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DotKeKhai>>> GetDotKeKhais()
        {
            try
            {
                var dotKeKhais = await _context.DotKeKhais
                    .Include(d => d.DonVi)
                    .Select(d => new
                    {
                        d.id,
                        d.ten_dot,
                        d.so_dot,
                        d.thang,
                        d.nam,
                        d.dich_vu,
                        d.ghi_chu,
                        d.trang_thai,
                        d.nguoi_tao,
                        d.don_vi_id,
                        d.ngay_tao,
                        DonVi = d.DonVi,
                        tong_so_tien = _context.KeKhaiBHYTs
                            .Where(k => k.dot_ke_khai_id == d.id)
                            .Sum(k => k.so_tien_can_dong),
                        tong_so_the = _context.KeKhaiBHYTs
                            .Count(k => k.dot_ke_khai_id == d.id),
                        url_bill = _context.HoaDonThanhToans
                            .Where(h => h.dot_ke_khai_id == d.id && h.deleted_at == null)
                            .OrderByDescending(h => h.ngay_tao)
                            .Select(h => h.url_bill)
                            .FirstOrDefault()
                    })
                    .ToListAsync();

                return Ok(dotKeKhais);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dot ke khai list: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách đợt kê khai", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DotKeKhai>> GetDotKeKhai(int id)
        {
            try
            {
                var dotKeKhai = await _context.DotKeKhais
                    .Include(d => d.DonVi)
                    .Where(d => d.id == id)
                    .Select(d => new
                    {
                        d.id,
                        d.ten_dot,
                        d.so_dot,
                        d.thang,
                        d.nam,
                        d.dich_vu,
                        d.ghi_chu,
                        d.trang_thai,
                        d.nguoi_tao,
                        d.don_vi_id,
                        d.ngay_tao,
                        DonVi = d.DonVi,
                        tong_so_tien = _context.KeKhaiBHYTs
                            .Where(k => k.dot_ke_khai_id == d.id)
                            .Sum(k => k.so_tien_can_dong),
                        tong_so_the = _context.KeKhaiBHYTs
                            .Count(k => k.dot_ke_khai_id == d.id),
                        url_bill = _context.HoaDonThanhToans
                            .Where(h => h.dot_ke_khai_id == d.id && h.deleted_at == null)
                            .OrderByDescending(h => h.ngay_tao)
                            .Select(h => h.url_bill)
                            .FirstOrDefault()
                    })
                    .FirstOrDefaultAsync();

                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                return Ok(dotKeKhai);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin đợt kê khai", error = ex.Message });
            }
        }

        public class DotKeKhaiDTO
        {
            [Required]
            public int so_dot { get; set; }

            [Required]
            public int thang { get; set; }

            [Required]
            public int nam { get; set; }

            [Required]
            public int don_vi_id { get; set; }

            [Required]
            public int dai_ly_id { get; set; }

            public string? ghi_chu { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<DotKeKhai>> CreateDotKeKhai(DotKeKhaiDTO dotKeKhaiDto)
        {
            try
            {
                // Kiểm tra đại lý tồn tại
                var daiLy = await _context.DaiLys.FindAsync(dotKeKhaiDto.dai_ly_id);
                if (daiLy == null)
                {
                    return BadRequest(new { message = "Không tìm thấy đại lý" });
                }

                // Kiểm tra đơn vị tồn tại
                var donVi = await _context.DonVis.FindAsync(dotKeKhaiDto.don_vi_id);
                if (donVi == null)
                {
                    return BadRequest(new { message = "Không tìm thấy đơn vị" });
                }

                var dotKeKhai = new DotKeKhai
                {
                    so_dot = dotKeKhaiDto.so_dot,
                    thang = dotKeKhaiDto.thang,
                    nam = dotKeKhaiDto.nam,
                    don_vi_id = dotKeKhaiDto.don_vi_id,
                    dai_ly_id = dotKeKhaiDto.dai_ly_id,
                    dich_vu = donVi.IsBHYT ? "BHYT" : "BHXH TN",
                    ghi_chu = dotKeKhaiDto.ghi_chu,
                    trang_thai = "chua_gui",
                    nguoi_tao = User.Identity?.Name ?? "system",
                    ngay_tao = DateTime.UtcNow
                };

                // Tự động tạo tên đợt
                dotKeKhai.GenerateTenDot();

                _context.DotKeKhais.Add(dotKeKhai);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDotKeKhai), new { id = dotKeKhai.id }, dotKeKhai);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating dot ke khai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo đợt kê khai", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDotKeKhai(int id, DotKeKhai dotKeKhai)
        {
            try
            {
                if (id != dotKeKhai.id)
                {
                    return BadRequest(new { message = "ID không khớp" });
                }

                // Kiểm tra đơn vị tồn tại và cập nhật dịch vụ
                var donVi = await _context.DonVis.FindAsync(dotKeKhai.don_vi_id);
                if (donVi == null)
                {
                    ModelState.AddModelError("don_vi_id", "Không tìm thấy đơn vị");
                    return BadRequest(new { errors = new[] { "Không tìm thấy đơn vị" } });
                }

                // Tự động xác định dịch vụ từ đơn vị
                dotKeKhai.dich_vu = donVi.IsBHYT ? "BHYT" : "BHXH TN";

                // Kiểm tra dữ liệu đầu vào
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Tự động tạo tên đợt
                dotKeKhai.GenerateTenDot();
                if (string.IsNullOrEmpty(dotKeKhai.ten_dot))
                {
                    return BadRequest(new { message = "Không thể tạo tên đợt do dữ liệu không hợp lệ" });
                }

                _context.Entry(dotKeKhai).State = EntityState.Modified;
                _context.Entry(dotKeKhai).Property(x => x.ngay_tao).IsModified = false;
                _context.Entry(dotKeKhai).Property(x => x.nguoi_tao).IsModified = false;

                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DotKeKhaiExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật đợt kê khai", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDotKeKhai(int id)
        {
            try
            {
                var dotKeKhai = await _context.DotKeKhais.FindAsync(id);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                _context.DotKeKhais.Remove(dotKeKhai);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa đợt kê khai", error = ex.Message });
            }
        }

        [HttpGet("next-so-dot")]
        public async Task<ActionResult<int>> GetNextSoDot(
            [FromQuery] int donViId, 
            [FromQuery] int thang,
            [FromQuery] int nam)
        {
            try
            {
                var donVi = await _context.DonVis.FindAsync(donViId);
                if (donVi == null)
                {
                    return BadRequest(new { message = "Không tìm thấy đơn vị" });
                }

                var lastDotKeKhai = await _context.DotKeKhais
                    .Where(d => d.don_vi_id == donViId 
                        && d.thang == thang
                        && d.nam == nam)
                    .OrderByDescending(d => d.so_dot)
                    .FirstOrDefaultAsync();

                var nextSoDot = (lastDotKeKhai?.so_dot ?? 0) + 1;

                // Kiểm tra xem số đợt tiếp theo đã tồn tại chưa
                while (await _context.DotKeKhais.AnyAsync(d => 
                    d.don_vi_id == donViId 
                    && d.thang == thang 
                    && d.nam == nam 
                    && d.so_dot == nextSoDot))
                {
                    nextSoDot++;
                }

                return Ok(nextSoDot);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting next so dot: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy số đợt tiếp theo" });
            }
        }

        [HttpGet("{id}/ke-khai-bhyt")]
        public async Task<ActionResult<IEnumerable<KeKhaiBHYT>>> GetKeKhaiBHYTs(int id)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var username = User.Identity?.Name;
                var nguoiDung = await _context.NguoiDungs
                    .FirstOrDefaultAsync(n => n.user_name == username);

                if (nguoiDung == null)
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                _logger.LogInformation($"Bắt đầu lấy danh sách kê khai BHYT cho đợt {id}");

                // Kiểm tra đợt kê khai có tồn tại không
                var dotKeKhai = await _context.DotKeKhais
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.id == id);

                if (dotKeKhai == null)
                {
                    _logger.LogWarning($"Không tìm thấy đợt kê khai ID: {id}");
                    return NotFound(new { message = $"Không tìm thấy đợt kê khai có ID: {id}" });
                }

                _logger.LogInformation($"Tìm thấy đợt kê khai: {JsonSerializer.Serialize(dotKeKhai)}");

                if (dotKeKhai.dich_vu != "BHYT")
                {
                    _logger.LogWarning($"Đợt kê khai {id} không phải loại BHYT. Loại dịch vụ: {dotKeKhai.dich_vu}");
                    return BadRequest(new { message = $"Đợt kê khai này không phải là BHYT (Loại dịch vụ: {dotKeKhai.dich_vu})" });
                }

                // Lấy danh sách kê khai BHYT
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.QuyenBienLai)
                    .Where(k => k.dot_ke_khai_id == id)
                    .Select(k => new
                    {
                        ho_ten = k.ThongTinThe.ho_ten,
                        cccd = k.ThongTinThe.cccd,
                        ma_so_bhxh = k.ThongTinThe.ma_so_bhxh,
                        ngay_sinh = k.ThongTinThe.ngay_sinh,
                        gioi_tinh = k.ThongTinThe.gioi_tinh,
                        phuong_an_dong = k.phuong_an_dong,
                        so_dien_thoai = k.ThongTinThe.so_dien_thoai,
                        so_the_bhyt = k.ThongTinThe.so_the_bhyt,
                        so_tien = k.so_tien_can_dong,
                        nguoi_thu = k.nguoi_thu,
                        ngay_bien_lai = k.ngay_bien_lai,
                        ma_tinh_nkq = k.ThongTinThe.ma_tinh_nkq,
                        ma_huyen_nkq = k.ThongTinThe.ma_huyen_nkq,
                        ma_xa_nkq = k.ThongTinThe.ma_xa_nkq,
                        dia_chi_nkq = k.dia_chi_nkq,
                        so_thang_dong = k.so_thang_dong,
                        ma_benh_vien = k.ThongTinThe.ma_benh_vien,
                        ma_hgd = k.ThongTinThe.ma_hgd,
                        quoc_tich = k.ThongTinThe.quoc_tich,
                        ma_tinh_ks = k.ThongTinThe.ma_tinh_ks,
                        ma_huyen_ks = k.ThongTinThe.ma_huyen_ks,
                        ma_xa_ks = k.ThongTinThe.ma_xa_ks,
                        han_the_moi_tu = k.han_the_moi_tu,
                        is_urgent = k.is_urgent,
                        so_bien_lai = k.so_bien_lai,
                        QuyenBienLai = new {
                            quyen_so = k.QuyenBienLai.quyen_so
                        },
                        ma_nhan_vien = nguoiDung.ma_nhan_vien
                    })
                    .ToListAsync();

                _logger.LogInformation($"Tìm thấy {keKhaiBHYTs.Count} bản ghi kê khai BHYT cho đợt {id}");
                
                return Ok(keKhaiBHYTs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách kê khai BHYT cho đợt {id}: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPatch("{id}/trang-thai")]
        public async Task<IActionResult> UpdateTrangThai(int id, [FromBody] UpdateTrangThaiDto dto)
        {
            try
            {
                var dotKeKhai = await _context.DotKeKhais.FindAsync(id);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                dotKeKhai.trang_thai = dto.trang_thai;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật trạng thái thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating dot ke khai status: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái đợt kê khai", error = ex.Message });
            }
        }

        [HttpPatch("{id}/gui")]
        public async Task<IActionResult> GuiDotKeKhai(int id)
        {
            try
            {
                // Kiểm tra đợt kê khai tồn tại
                var dotKeKhai = await _context.DotKeKhais.FindAsync(id);
                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                // Kiểm tra trạng thái hiện tại
                if (dotKeKhai.trang_thai != "chua_gui")
                {
                    return BadRequest(new { message = "Đợt kê khai không ở trạng thái chưa gửi" });
                }

                // Cập nhật trạng thái đợt kê khai sang chờ thanh toán
                dotKeKhai.trang_thai = "cho_thanh_toan";
                
                // Cập nhật trạng thái các kê khai BHYT trong đợt
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Where(k => k.dot_ke_khai_id == id)
                    .ToListAsync();

                foreach (var keKhai in keKhaiBHYTs)
                {
                    keKhai.trang_thai = "cho_thanh_toan";
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Gửi đợt kê khai thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending dot ke khai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi gửi đợt kê khai", error = ex.Message });
            }
        }

        public class UpdateTrangThaiDto
        {
            public string trang_thai { get; set; }
        }

        private bool DotKeKhaiExists(int id)
        {
            return _context.DotKeKhais.Any(e => e.id == id);
        }
    }
} 