using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuyenBienLaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<QuyenBienLaiController> _logger;

        public QuyenBienLaiController(ApplicationDbContext context, ILogger<QuyenBienLaiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<QuyenBienLai>> CreateQuyenBienLai(QuyenBienLai quyenBienLai)
        {
            try
            {
                quyenBienLai.ngay_cap = DateTime.UtcNow;
                quyenBienLai.nguoi_cap = User.Identity?.Name ?? "system";
                quyenBienLai.so_hien_tai = quyenBienLai.tu_so;

                _context.QuyenBienLais.Add(quyenBienLai);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetQuyenBienLai), new { id = quyenBienLai.id }, quyenBienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating quyen bien lai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo quyển biên lai", error = ex.Message });
            }
        }

        [HttpGet("next-so-bien-lai/{nguoiThuId}")]
        public async Task<ActionResult<string>> GetNextSoBienLai(int nguoiThuId)
        {
            try
            {
                var quyenBienLai = await _context.QuyenBienLais
                    .Where(q => q.nguoi_thu == nguoiThuId && q.trang_thai == "dang_su_dung")
                    .OrderBy(q => q.ngay_cap)
                    .FirstOrDefaultAsync();

                if (quyenBienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy quyển biên lai đang sử dụng" });
                }

                var soHienTai = int.Parse(quyenBienLai.so_hien_tai);
                var denSo = int.Parse(quyenBienLai.den_so);

                if (soHienTai > denSo)
                {
                    quyenBienLai.trang_thai = "da_su_dung";
                    await _context.SaveChangesAsync();
                    return BadRequest(new { message = "Quyển biên lai đã hết số" });
                }

                var nextSo = (soHienTai + 1).ToString().PadLeft(quyenBienLai.so_hien_tai.Length, '0');
                quyenBienLai.so_hien_tai = nextSo;
                await _context.SaveChangesAsync();

                return Ok(new { so_bien_lai = soHienTai.ToString().PadLeft(quyenBienLai.so_hien_tai.Length, '0') });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting next so bien lai: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy số biên lai tiếp theo" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QuyenBienLai>> GetQuyenBienLai(int id)
        {
            try
            {
                var quyenBienLai = await _context.QuyenBienLais
                    .Include(q => q.NguoiThu)
                    .FirstOrDefaultAsync(q => q.id == id);

                if (quyenBienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy quyển biên lai" });
                }

                return Ok(quyenBienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting quyen bien lai {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin quyển biên lai", error = ex.Message });
            }
        }
    }
} 