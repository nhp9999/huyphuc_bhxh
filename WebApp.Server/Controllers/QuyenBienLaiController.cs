using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/quyen-bien-lai")]
    public class QuyenBienLaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuyenBienLaiController(ApplicationDbContext context)
        {
            _context = context;
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
                quyenBienLai.ngay_cap = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                quyenBienLai.so_hien_tai = quyenBienLai.tu_so;

                _context.QuyenBienLais.Add(quyenBienLai);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = quyenBienLai.id }, quyenBienLai);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
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
            existingQuyenBienLai.nguoi_thu = quyenBienLai.nguoi_thu;
            existingQuyenBienLai.trang_thai = quyenBienLai.trang_thai;

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