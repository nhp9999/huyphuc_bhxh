using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonViController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonViController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DonVi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonVi>>> GetDonVis()
        {
            try 
            {
                var donVis = await _context.DonVis
                    .OrderBy(d => d.TenDonVi)
                    .ToListAsync();
                return Ok(donVis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách đơn vị", error = ex.Message });
            }
        }

        // GET: api/DonVi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DonVi>> GetDonVi(int id)
        {
            try
            {
                var donVi = await _context.DonVis.FindAsync(id);

                if (donVi == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn vị" });
                }

                return Ok(donVi);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin đơn vị", error = ex.Message });
            }
        }
    }
} 