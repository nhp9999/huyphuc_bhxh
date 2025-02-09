using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LocationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("provinces")]
        public async Task<ActionResult<IEnumerable<DanhMucTinh>>> GetProvinces()
        {
            try
            {
                var provinces = await _context.DanhMucTinhs
                    .OrderBy(p => p.ma)
                    .ToListAsync();
                    
                return Ok(provinces);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách tỉnh thành", error = ex.Message });
            }
        }

        [HttpGet("districts/{provinceId}")]
        public async Task<ActionResult<IEnumerable<DanhMucHuyen>>> GetDistricts(string provinceId)
        {
            try
            {
                var districts = await _context.DanhMucHuyens
                    .Where(d => d.ma_tinh == provinceId)
                    .OrderBy(d => d.ma)
                    .ToListAsync();

                if (!districts.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy quận/huyện nào thuộc tỉnh/thành phố có mã {provinceId}" });
                }

                return Ok(districts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách quận/huyện", error = ex.Message });
            }
        }

        [HttpGet("communes/{districtCode}")]
        public async Task<ActionResult<object>> GetCommunes(string districtCode)
        {
            try
            {
                var communes = await _context.DanhMucXas
                    .Where(c => c.ma_huyen == districtCode)
                    .OrderBy(c => c.ma)
                    .Select(c => new
                    {
                        text = c.text,
                        value = c.ma,
                        ten = c.ten,
                        ma = c.ma
                    })
                    .ToListAsync();

                if (!communes.Any())
                {
                    return NotFound(new { 
                        success = false,
                        message = $"Không tìm thấy xã/phường nào thuộc quận/huyện có mã {districtCode}",
                        data = new List<object>(),
                        errors = new List<string>(),
                        status = 404,
                        traceId = ""
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "",
                    data = communes,
                    errors = new List<string>(),
                    status = 200,
                    traceId = ""
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi lấy danh sách xã/phường",
                    data = new List<object>(),
                    errors = new List<string> { ex.Message },
                    status = 500,
                    traceId = ""
                });
            }
        }
    }
} 