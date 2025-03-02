using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApp.API.Data;
using WebApp.API.Models;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/quyen-bien-lai")]
    public class QuyenBienLaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<QuyenBienLaiController> _logger;

        public QuyenBienLaiController(ApplicationDbContext context, ILogger<QuyenBienLaiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var quyenBienLais = await _context.QuyenBienLais
                .Include(q => q.NguoiThu)
                .OrderByDescending(q => q.ngay_cap)
                .ToListAsync();
            return Ok(quyenBienLais);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var quyenBienLai = await _context.QuyenBienLais
                .Include(q => q.NguoiThu)
                .FirstOrDefaultAsync(q => q.id == id);

            if (quyenBienLai == null)
                return NotFound();

            return Ok(quyenBienLai);
        }

        [HttpPost]
        public async Task<IActionResult> Create(QuyenBienLai quyenBienLai)
        {
            try 
            {
                // Log để debug
                _logger.LogInformation($"Received request to create QuyenBienLai: {JsonSerializer.Serialize(quyenBienLai)}");

                // Validate input
                if (quyenBienLai == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Kiểm tra người thu có tồn tại không
                var nguoiThu = await _context.NguoiDungs
                    .FirstOrDefaultAsync(n => n.id == quyenBienLai.nhan_vien_thu);

                if (nguoiThu == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy người thu với ID: {quyenBienLai.nhan_vien_thu}" });
                }

                // Kiểm tra số quyển và số biên lai
                if (string.IsNullOrEmpty(quyenBienLai.quyen_so) || 
                    string.IsNullOrEmpty(quyenBienLai.tu_so) || 
                    string.IsNullOrEmpty(quyenBienLai.den_so))
                {
                    return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin quyển biên lai" });
                }

                // Set các giá trị mặc định
                quyenBienLai.ngay_cap = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                quyenBienLai.so_hien_tai = quyenBienLai.tu_so;
                quyenBienLai.trang_thai = "chua_su_dung";

                // Thêm vào database
                _context.QuyenBienLais.Add(quyenBienLai);
                await _context.SaveChangesAsync();

                // Lấy quyển biên lai vừa tạo kèm thông tin người thu
                var createdQuyenBienLai = await _context.QuyenBienLais
                    .Include(q => q.NguoiThu)
                    .FirstOrDefaultAsync(q => q.id == quyenBienLai.id);

                return CreatedAtAction(
                    nameof(GetById), 
                    new { id = quyenBienLai.id }, 
                    new { 
                        message = "Thêm quyển biên lai thành công",
                        data = createdQuyenBienLai 
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thêm quyển biên lai");
                return StatusCode(500, new { message = "Lỗi khi thêm quyển biên lai", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, QuyenBienLai quyenBienLai)
        {
            if (id != quyenBienLai.id)
                return BadRequest();

            var existingQuyenBienLai = await _context.QuyenBienLais.FindAsync(id);
            if (existingQuyenBienLai == null)
                return NotFound();

            // Cập nhật các trường
            existingQuyenBienLai.quyen_so = quyenBienLai.quyen_so;
            existingQuyenBienLai.tu_so = quyenBienLai.tu_so;
            existingQuyenBienLai.den_so = quyenBienLai.den_so;
            existingQuyenBienLai.nhan_vien_thu = quyenBienLai.nhan_vien_thu;
            existingQuyenBienLai.trang_thai = quyenBienLai.trang_thai;
            
            // Cập nhật số hiện tại nếu được cung cấp
            if (!string.IsNullOrEmpty(quyenBienLai.so_hien_tai))
            {
                // Kiểm tra số hiện tại có hợp lệ không (nằm trong khoảng từ số đến số)
                if (int.TryParse(quyenBienLai.so_hien_tai, out int soHienTai) && 
                    int.TryParse(quyenBienLai.tu_so, out int tuSo) && 
                    int.TryParse(quyenBienLai.den_so, out int denSo))
                {
                    if (soHienTai < tuSo || soHienTai > denSo)
                    {
                        return BadRequest(new { message = "Số hiện tại phải nằm trong khoảng từ số đến số" });
                    }
                }
                
                existingQuyenBienLai.so_hien_tai = quyenBienLai.so_hien_tai;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await QuyenBienLaiExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var quyenBienLai = await _context.QuyenBienLais.FindAsync(id);
            if (quyenBienLai == null)
                return NotFound();

            if (quyenBienLai.trang_thai != "chua_su_dung")
                return BadRequest("Không thể xóa quyển biên lai đã sử dụng");

            _context.QuyenBienLais.Remove(quyenBienLai);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> QuyenBienLaiExists(int id)
        {
            return await _context.QuyenBienLais.AnyAsync(e => e.id == id);
        }
    }
} 