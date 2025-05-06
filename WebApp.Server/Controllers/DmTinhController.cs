using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Route("api/danh-muc-tinh")]
    [ApiController]
    public class DanhMucTinhController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DanhMucTinhController> _logger;

        public DanhMucTinhController(
            ApplicationDbContext context,
            ILogger<DanhMucTinhController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/danh-muc-tinh
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMucTinh>>> GetDanhMucTinh()
        {
            try
            {
                _logger.LogInformation("Đang lấy danh sách tỉnh/thành phố");

                var danhMucTinhs = await _context.DanhMucTinhs
                    .OrderBy(p => p.ten)
                    .ToListAsync();

                if (!danhMucTinhs.Any())
                {
                    _logger.LogWarning("Không tìm thấy dữ liệu tỉnh/thành phố");
                    return NotFound("Không tìm thấy dữ liệu tỉnh/thành phố");
                }

                _logger.LogInformation($"Đã tìm thấy {danhMucTinhs.Count} tỉnh/thành phố");
                return Ok(danhMucTinhs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tỉnh/thành phố");
                return StatusCode(500, "Có lỗi xảy ra khi lấy danh sách tỉnh/thành phố");
            }
        }

        // GET: api/danh-muc-tinh/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DanhMucTinh>> GetDanhMucTinh(int id)
        {
            try
            {
                _logger.LogInformation($"Đang tìm tỉnh/thành phố với ID: {id}");

                var danhMucTinh = await _context.DanhMucTinhs.FindAsync(id);

                if (danhMucTinh == null)
                {
                    _logger.LogWarning($"Không tìm thấy tỉnh/thành phố với ID: {id}");
                    return NotFound($"Không tìm thấy tỉnh/thành phố với ID: {id}");
                }

                return Ok(danhMucTinh);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tìm tỉnh/thành phố với ID: {id}");
                return StatusCode(500, "Có lỗi xảy ra khi tìm tỉnh/thành phố");
            }
        }

        // GET: api/danh-muc-tinh/ma/01
        [HttpGet("ma/{ma}")]
        public async Task<ActionResult<DanhMucTinh>> GetDanhMucTinhByMa(string ma)
        {
            try
            {
                _logger.LogInformation($"Đang tìm tỉnh/thành phố với mã hoặc tên: {ma}");

                // Kiểm tra nếu tham số là tên tỉnh thay vì mã tỉnh
                bool isTenTinh = ma.StartsWith("Tỉnh ") || ma.StartsWith("Thành phố ");

                DanhMucTinh danhMucTinh;

                if (isTenTinh)
                {
                    // Tìm theo tên tỉnh
                    danhMucTinh = await _context.DanhMucTinhs
                        .FirstOrDefaultAsync(p => p.ten == ma);

                    if (danhMucTinh == null)
                    {
                        _logger.LogWarning($"Không tìm thấy tỉnh/thành phố với tên: {ma}");

                        // Thử tìm kiếm tương đối
                        danhMucTinh = await _context.DanhMucTinhs
                            .FirstOrDefaultAsync(p => p.ten.Contains(ma) || ma.Contains(p.ten));

                        if (danhMucTinh == null)
                        {
                            return NotFound($"Không tìm thấy tỉnh/thành phố với tên: {ma}");
                        }
                    }
                }
                else
                {
                    // Tìm theo mã tỉnh
                    danhMucTinh = await _context.DanhMucTinhs
                        .FirstOrDefaultAsync(p => p.ma == ma);

                    if (danhMucTinh == null)
                    {
                        _logger.LogWarning($"Không tìm thấy tỉnh/thành phố với mã: {ma}");
                        return NotFound($"Không tìm thấy tỉnh/thành phố với mã: {ma}");
                    }
                }

                return Ok(danhMucTinh);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tìm tỉnh/thành phố với mã hoặc tên: {ma}");
                return StatusCode(500, "Có lỗi xảy ra khi tìm tỉnh/thành phố");
            }
        }
    }
}