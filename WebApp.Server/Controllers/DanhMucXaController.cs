using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Route("api/danh-muc-xa")]
    [ApiController]
    public class DanhMucXaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DanhMucXaController> _logger;

        public DanhMucXaController(
            ApplicationDbContext context,
            ILogger<DanhMucXaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/danh-muc-xa
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMucXa>>> GetDanhMucXa()
        {
            try
            {
                _logger.LogInformation("Đang lấy danh sách xã/phường");

                var danhMucXas = await _context.DanhMucXas
                    .OrderBy(x => x.ten)
                    .ToListAsync();

                if (!danhMucXas.Any())
                {
                    _logger.LogWarning("Không tìm thấy dữ liệu xã/phường");
                    return NotFound("Không tìm thấy dữ liệu xã/phường");
                }

                _logger.LogInformation($"Đã tìm thấy {danhMucXas.Count} xã/phường");
                return Ok(danhMucXas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách xã/phường");
                return StatusCode(500, "Có lỗi xảy ra khi lấy danh sách xã/phường");
            }
        }

        // GET: api/danh-muc-xa/ma-huyen/001
        [HttpGet("ma-huyen/{maHuyen}")]
        public async Task<ActionResult<IEnumerable<DanhMucXa>>> GetDanhMucXaByMaHuyen(string maHuyen)
        {
            try
            {
                if (string.IsNullOrEmpty(maHuyen))
                {
                    _logger.LogWarning("Mã huyện không được để trống");
                    return BadRequest("Mã huyện không được để trống");
                }

                _logger.LogInformation($"Đang lấy danh sách xã/phường theo mã huyện: {maHuyen}");

                var danhMucXas = await _context.DanhMucXas
                    .Where(x => x.ma_huyen == maHuyen)
                    .OrderBy(x => x.ten)
                    .AsNoTracking()
                    .ToListAsync();

                if (!danhMucXas.Any())
                {
                    _logger.LogWarning($"Không tìm thấy xã/phường cho mã huyện: {maHuyen}");
                    return Ok(new List<DanhMucXa>()); // Trả về mảng rỗng thay vì NotFound
                }

                _logger.LogInformation($"Đã tìm thấy {danhMucXas.Count} xã/phường cho mã huyện: {maHuyen}");
                return Ok(danhMucXas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy danh sách xã/phường cho mã huyện: {maHuyen}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách xã/phường", error = ex.Message });
            }
        }

        // GET: api/danh-muc-xa/ma/00001
        [HttpGet("ma/{ma}")]
        public async Task<ActionResult<DanhMucXa>> GetDanhMucXaByMa(string ma)
        {
            try
            {
                _logger.LogInformation($"Đang tìm xã/phường với mã hoặc tên: {ma}");

                // Kiểm tra nếu tham số là tên xã thay vì mã xã
                bool isTenXa = ma.StartsWith("Xã ") || ma.StartsWith("Phường ") ||
                               ma.StartsWith("Thị trấn ");

                DanhMucXa danhMucXa;

                if (isTenXa)
                {
                    // Tìm theo tên xã
                    danhMucXa = await _context.DanhMucXas
                        .FirstOrDefaultAsync(x => x.ten == ma);

                    if (danhMucXa == null)
                    {
                        _logger.LogWarning($"Không tìm thấy xã/phường với tên: {ma}");

                        // Thử tìm kiếm tương đối
                        danhMucXa = await _context.DanhMucXas
                            .FirstOrDefaultAsync(x => x.ten.Contains(ma) || ma.Contains(x.ten));

                        if (danhMucXa == null)
                        {
                            return NotFound($"Không tìm thấy xã/phường với tên: {ma}");
                        }
                    }
                }
                else
                {
                    // Tìm theo mã xã
                    danhMucXa = await _context.DanhMucXas
                        .FirstOrDefaultAsync(x => x.ma == ma);

                    if (danhMucXa == null)
                    {
                        _logger.LogWarning($"Không tìm thấy xã/phường với mã: {ma}");
                        return NotFound($"Không tìm thấy xã/phường với mã: {ma}");
                    }
                }

                return Ok(danhMucXa);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tìm xã/phường với mã hoặc tên: {ma}");
                return StatusCode(500, "Có lỗi xảy ra khi tìm xã/phường");
            }
        }
    }
}