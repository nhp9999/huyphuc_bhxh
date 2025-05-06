using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Route("api/danh-muc-huyen")]
    [ApiController]
    public class DanhMucHuyenController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DanhMucHuyenController> _logger;

        public DanhMucHuyenController(
            ApplicationDbContext context,
            ILogger<DanhMucHuyenController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/danh-muc-huyen
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMucHuyen>>> GetDanhMucHuyen()
        {
            try
            {
                _logger.LogInformation("Đang lấy danh sách quận/huyện");

                var danhMucHuyens = await _context.DanhMucHuyens
                    .OrderBy(p => p.ten)
                    .ToListAsync();

                if (!danhMucHuyens.Any())
                {
                    _logger.LogWarning("Không tìm thấy dữ liệu quận/huyện");
                    return NotFound("Không tìm thấy dữ liệu quận/huyện");
                }

                _logger.LogInformation($"Đã tìm thấy {danhMucHuyens.Count} quận/huyện");
                return Ok(danhMucHuyens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách quận/huyện");
                return StatusCode(500, "Có lỗi xảy ra khi lấy danh sách quận/huyện");
            }
        }

        // GET: api/danh-muc-huyen/ma-tinh/01
        [HttpGet("ma-tinh/{maTinh}")]
        public async Task<ActionResult<IEnumerable<DanhMucHuyen>>> GetDanhMucHuyenByMaTinh(string maTinh)
        {
            try
            {
                if (string.IsNullOrEmpty(maTinh))
                {
                    _logger.LogWarning("Mã tỉnh không được để trống");
                    return BadRequest("Mã tỉnh không được để trống");
                }

                _logger.LogInformation($"Đang lấy danh sách quận/huyện theo mã tỉnh: {maTinh}");

                var danhMucHuyens = await _context.DanhMucHuyens
                    .Where(d => d.ma_tinh == maTinh)
                    .OrderBy(d => d.ten)
                    .AsNoTracking()
                    .ToListAsync();

                if (!danhMucHuyens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy quận/huyện cho mã tỉnh: {maTinh}");
                    return Ok(new List<DanhMucHuyen>()); // Trả về mảng rỗng thay vì NotFound
                }

                _logger.LogInformation($"Đã tìm thấy {danhMucHuyens.Count} quận/huyện cho mã tỉnh: {maTinh}");
                return Ok(danhMucHuyens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy danh sách quận/huyện cho mã tỉnh: {maTinh}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách quận/huyện", error = ex.Message });
            }
        }

        // GET: api/danh-muc-huyen/ma/001
        [HttpGet("ma/{ma}")]
        public async Task<ActionResult<DanhMucHuyen>> GetDanhMucHuyenByMa(string ma)
        {
            try
            {
                _logger.LogInformation($"Đang tìm quận/huyện với mã hoặc tên: {ma}");

                // Kiểm tra nếu tham số là tên huyện thay vì mã huyện
                bool isTenHuyen = ma.StartsWith("Huyện ") || ma.StartsWith("Quận ") ||
                                  ma.StartsWith("Thị xã ") || ma.StartsWith("Thành phố ");

                DanhMucHuyen danhMucHuyen;

                if (isTenHuyen)
                {
                    // Tìm theo tên huyện
                    danhMucHuyen = await _context.DanhMucHuyens
                        .FirstOrDefaultAsync(d => d.ten == ma);

                    if (danhMucHuyen == null)
                    {
                        _logger.LogWarning($"Không tìm thấy quận/huyện với tên: {ma}");

                        // Thử tìm kiếm tương đối
                        danhMucHuyen = await _context.DanhMucHuyens
                            .FirstOrDefaultAsync(d => d.ten.Contains(ma) || ma.Contains(d.ten));

                        if (danhMucHuyen == null)
                        {
                            return NotFound($"Không tìm thấy quận/huyện với tên: {ma}");
                        }
                    }
                }
                else
                {
                    // Tìm theo mã huyện
                    danhMucHuyen = await _context.DanhMucHuyens
                        .FirstOrDefaultAsync(d => d.ma == ma);

                    if (danhMucHuyen == null)
                    {
                        _logger.LogWarning($"Không tìm thấy quận/huyện với mã: {ma}");
                        return NotFound($"Không tìm thấy quận/huyện với mã: {ma}");
                    }
                }

                return Ok(danhMucHuyen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tìm quận/huyện với mã hoặc tên: {ma}");
                return StatusCode(500, "Có lỗi xảy ra khi tìm quận/huyện");
            }
        }
    }
}