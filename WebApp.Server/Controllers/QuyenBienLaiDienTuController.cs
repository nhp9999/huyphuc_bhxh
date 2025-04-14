using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using WebApp.API.Data;
using WebApp.API.Models.BienlaiDienTu;
using System.Security.Claims;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/quyen-bien-lai-dien-tu")]
    public class QuyenBienLaiDienTuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<QuyenBienLaiDienTuController> _logger;

        public QuyenBienLaiDienTuController(ApplicationDbContext context, ILogger<QuyenBienLaiDienTuController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var quyenBienLais = await _context.QuyenBienLaiDienTus
                .OrderByDescending(q => q.ngay_cap)
                .ToListAsync();
            return Ok(quyenBienLais);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var quyenBienLai = await _context.QuyenBienLaiDienTus
                .FirstOrDefaultAsync(q => q.id == id);

            if (quyenBienLai == null)
                return NotFound();

            return Ok(quyenBienLai);
        }

        [HttpPost]
        public async Task<IActionResult> Create(QuyenBienLaiDienTu quyenBienLai)
        {
            try 
            {
                _logger.LogInformation($"Received request to create QuyenBienLaiDienTu: {JsonSerializer.Serialize(quyenBienLai)}");

                if (quyenBienLai == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Lấy thông tin người dùng hiện tại từ token JWT
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var hoTen = User.FindFirst("hoTen")?.Value;
                
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }
                
                // Lấy thông tin người dùng từ database để có thông tin đầy đủ hơn
                var currentUser = await _context.NguoiDungs
                    .FirstOrDefaultAsync(u => u.user_name == username);

                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
                }

                // Luôn thiết lập người cấp, bất kể client có gửi hay không
                quyenBienLai.nguoi_cap = currentUser.ho_ten;

                // Kiểm tra các trường bắt buộc
                if (string.IsNullOrEmpty(quyenBienLai.ky_hieu) ||
                    string.IsNullOrEmpty(quyenBienLai.tu_so) || 
                    string.IsNullOrEmpty(quyenBienLai.den_so))
                {
                    return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin quyển biên lai điện tử" });
                }

                // Đảm bảo trường ma_co_quan_bhxh không bị null
                if (string.IsNullOrEmpty(quyenBienLai.ma_co_quan_bhxh))
                {
                    quyenBienLai.ma_co_quan_bhxh = "";
                }

                quyenBienLai.ngay_cap = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                quyenBienLai.so_hien_tai = quyenBienLai.tu_so;
                quyenBienLai.trang_thai = "chua_su_dung";

                // Đảm bảo ký hiệu biên lai đúng định dạng
                if (quyenBienLai.ky_hieu != "BH25-AG/08907/E")
                {
                    quyenBienLai.ky_hieu = "BH25-AG/08907/E";
                }

                _context.QuyenBienLaiDienTus.Add(quyenBienLai);
                await _context.SaveChangesAsync();

                var createdQuyenBienLai = await _context.QuyenBienLaiDienTus
                    .FirstOrDefaultAsync(q => q.id == quyenBienLai.id);

                return CreatedAtAction(
                    nameof(GetById), 
                    new { id = quyenBienLai.id }, 
                    new { 
                        message = "Thêm quyển biên lai điện tử thành công",
                        data = createdQuyenBienLai 
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thêm quyển biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi thêm quyển biên lai điện tử", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, QuyenBienLaiDienTu quyenBienLai)
        {
            try
            {
                _logger.LogInformation($"Received request to update QuyenBienLaiDienTu: {JsonSerializer.Serialize(quyenBienLai)}");
                
                if (id != quyenBienLai.id)
                    return BadRequest(new { message = "ID không khớp với dữ liệu cập nhật" });

                var existingQuyenBienLai = await _context.QuyenBienLaiDienTus.FindAsync(id);
                if (existingQuyenBienLai == null)
                    return NotFound(new { message = "Không tìm thấy quyển biên lai điện tử" });

                existingQuyenBienLai.ky_hieu = "BH25-AG/08907/E"; // Giữ nguyên ký hiệu
                existingQuyenBienLai.tu_so = quyenBienLai.tu_so;
                existingQuyenBienLai.den_so = quyenBienLai.den_so;
                existingQuyenBienLai.trang_thai = quyenBienLai.trang_thai;
                
                // Cập nhật mã cơ quan BHXH
                if (!string.IsNullOrEmpty(quyenBienLai.ma_co_quan_bhxh))
                {
                    existingQuyenBienLai.ma_co_quan_bhxh = quyenBienLai.ma_co_quan_bhxh;
                }
                
                // Không cập nhật người cấp khi chỉnh sửa để giữ nguyên thông tin người đã tạo ban đầu
                
                if (!string.IsNullOrEmpty(quyenBienLai.so_hien_tai))
                {
                    if (int.TryParse(quyenBienLai.so_hien_tai, out int soHienTai) && 
                        int.TryParse(quyenBienLai.tu_so, out int tuSo) && 
                        int.TryParse(quyenBienLai.den_so, out int denSo))
                    {
                        if (soHienTai < tuSo || soHienTai > denSo)
                        {
                            return BadRequest(new { message = "Số hiện tại phải nằm trong khoảng từ số đến số" });
                        }

                        // Kiểm tra đã có biên lai được cấp cho các số trước số hiện tại mới
                        if (int.TryParse(existingQuyenBienLai.so_hien_tai, out int oldSoHienTai) && soHienTai < oldSoHienTai)
                        {
                            // Lấy tất cả biên lai của quyển biên lai này
                            var existingBienLais = await _context.BienLaiDienTus
                                .Where(b => b.quyen_bien_lai_dien_tu_id == id)
                                .ToListAsync();
                                
                            // Kiểm tra có biên lai nào đã được cấp có số nằm giữa số hiện tại mới và số hiện tại cũ
                            bool hasConflictingBienLai = existingBienLais.Any(b => {
                                if (int.TryParse(b.so_bien_lai, out int soBienLai)) {
                                    return soBienLai >= soHienTai && soBienLai < oldSoHienTai;
                                }
                                return false;
                            });
                                
                            if (hasConflictingBienLai)
                            {
                                return BadRequest(new { message = "Không thể giảm số hiện tại xuống thấp hơn vì đã có biên lai được cấp với số này" });
                            }
                            
                            _logger.LogInformation($"Giảm số hiện tại từ {oldSoHienTai} xuống {soHienTai}");
                        }
                    }
                    else
                    {
                        return BadRequest(new { message = "Số hiện tại, từ số hoặc đến số không hợp lệ" });
                    }
                    
                    existingQuyenBienLai.so_hien_tai = quyenBienLai.so_hien_tai;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật quyển biên lai điện tử thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật quyển biên lai điện tử ID {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật quyển biên lai điện tử", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var quyenBienLai = await _context.QuyenBienLaiDienTus.FindAsync(id);
            if (quyenBienLai == null)
                return NotFound();

            if (quyenBienLai.trang_thai != "chua_su_dung")
                return BadRequest(new { message = "Không thể xóa quyển biên lai đã sử dụng" });

            _context.QuyenBienLaiDienTus.Remove(quyenBienLai);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa quyển biên lai điện tử thành công" });
        }

        [HttpGet("by-ma-co-quan/{maCoQuanBHXH}")]
        public async Task<IActionResult> GetByMaCoQuanBHXH(string maCoQuanBHXH)
        {
            try
            {
                // Đảm bảo mã cơ quan BHXH không null
                maCoQuanBHXH = maCoQuanBHXH ?? "";
                
                // Tìm quyển biên lai điện tử đang active với mã cơ quan BHXH cụ thể
                var quyenBienLai = await _context.QuyenBienLaiDienTus
                    .Where(q => q.trang_thai == "active" && 
                           (string.IsNullOrEmpty(q.ma_co_quan_bhxh) || q.ma_co_quan_bhxh == maCoQuanBHXH))
                    .OrderBy(q => q.id)
                    .FirstOrDefaultAsync();
                
                // Nếu không tìm thấy, trả về quyển biên lai mặc định (không có mã cơ quan BHXH)
                if (quyenBienLai == null)
                {
                    quyenBienLai = await _context.QuyenBienLaiDienTus
                        .Where(q => q.trang_thai == "active")
                        .OrderBy(q => q.id)
                        .FirstOrDefaultAsync();
                }

                if (quyenBienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy quyển biên lai điện tử khả dụng" });
                }

                return Ok(quyenBienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tìm quyển biên lai điện tử theo mã cơ quan BHXH '{maCoQuanBHXH}'");
                return StatusCode(500, new { message = "Lỗi khi tìm quyển biên lai điện tử", error = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            try
            {
                var quyenBienLai = await _context.QuyenBienLaiDienTus
                    .Where(q => q.trang_thai == "active")
                    .OrderBy(q => q.id)
                    .ToListAsync();

                if (quyenBienLai == null || !quyenBienLai.Any())
                {
                    return NotFound(new { message = "Không tìm thấy quyển biên lai điện tử đang active" });
                }

                return Ok(quyenBienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách quyển biên lai điện tử đang active");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách quyển biên lai điện tử đang active", error = ex.Message });
            }
        }

        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ActivateQuyenBienLai(int id)
        {
            try
            {
                var quyenBienLai = await _context.QuyenBienLaiDienTus.FindAsync(id);
                if (quyenBienLai == null)
                    return NotFound(new { message = "Không tìm thấy quyển biên lai điện tử" });

                // Cập nhật trạng thái
                quyenBienLai.trang_thai = "active";
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Đã kích hoạt quyển biên lai điện tử thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi kích hoạt quyển biên lai điện tử ID {id}");
                return StatusCode(500, new { message = "Lỗi khi kích hoạt quyển biên lai điện tử", error = ex.Message });
            }
        }

        [HttpPatch("{id}/inactive")]
        public async Task<IActionResult> DeactivateQuyenBienLai(int id)
        {
            try
            {
                var quyenBienLai = await _context.QuyenBienLaiDienTus.FindAsync(id);
                if (quyenBienLai == null)
                    return NotFound(new { message = "Không tìm thấy quyển biên lai điện tử" });

                // Cập nhật trạng thái
                quyenBienLai.trang_thai = "inactive";
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Đã vô hiệu hóa quyển biên lai điện tử thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi vô hiệu hóa quyển biên lai điện tử ID {id}");
                return StatusCode(500, new { message = "Lỗi khi vô hiệu hóa quyển biên lai điện tử", error = ex.Message });
            }
        }

        private async Task<bool> QuyenBienLaiExists(int id)
        {
            return await _context.QuyenBienLaiDienTus.AnyAsync(e => e.id == id);
        }
    }
} 