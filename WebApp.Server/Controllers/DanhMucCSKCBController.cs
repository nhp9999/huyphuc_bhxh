using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Route("api/danh-muc-cskcb")]
    [ApiController]
    public class DanhMucCSKCBController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DanhMucCSKCBController> _logger;

        public DanhMucCSKCBController(ApplicationDbContext context, ILogger<DanhMucCSKCBController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMucCSKCB>>> GetAll()
        {
            try
            {
                var danhSach = await _context.DanhMucCSKCBs
                    .OrderBy(x => x.ten)
                    .ToListAsync();

                return Ok(danhSach);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting danh muc CSKCB: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách cơ sở khám chữa bệnh", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DanhMucCSKCB>> GetById(int id)
        {
            try
            {
                var cskcb = await _context.DanhMucCSKCBs.FindAsync(id);

                if (cskcb == null)
                {
                    return NotFound(new { message = "Không tìm thấy cơ sở khám chữa bệnh" });
                }

                return Ok(cskcb);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting CSKCB {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin cơ sở khám chữa bệnh", error = ex.Message });
            }
        }
    }
} 