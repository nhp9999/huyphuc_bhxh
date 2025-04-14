using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.API.Models.BienlaiDienTu;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/bien-lai-dien-tu")]
    public class BienLaiDienTuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BienLaiDienTuController> _logger;

        public BienLaiDienTuController(ApplicationDbContext context, ILogger<BienLaiDienTuController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var bienLais = await _context.BienLaiDienTus
                .Include(b => b.KeKhaiBHYT)
                .Include(b => b.QuyenBienLaiDienTu)
                .OrderByDescending(b => b.ngay_tao)
                .ToListAsync();
            return Ok(bienLais);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var bienLai = await _context.BienLaiDienTus
                .Include(b => b.KeKhaiBHYT)
                .Include(b => b.QuyenBienLaiDienTu)
                .FirstOrDefaultAsync(b => b.id == id);

            if (bienLai == null)
                return NotFound();

            return Ok(bienLai);
        }

        [HttpPost]
        public async Task<IActionResult> Create(BienLaiDienTu bienLai)
        {
            try
            {
                _logger.LogInformation($"Received request to create BienLaiDienTu: {JsonSerializer.Serialize(bienLai)}");

                if (bienLai == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                var quyenBienLai = await _context.QuyenBienLaiDienTus.FindAsync(bienLai.quyen_bien_lai_dien_tu_id);
                if (quyenBienLai == null)
                {
                    return BadRequest(new { message = "Quyển biên lai điện tử không tồn tại" });
                }

                if (quyenBienLai.trang_thai == "da_su_dung_het")
                {
                    return BadRequest(new { message = "Quyển biên lai điện tử đã sử dụng hết" });
                }

                if (string.IsNullOrEmpty(quyenBienLai.so_hien_tai))
                {
                    quyenBienLai.so_hien_tai = quyenBienLai.tu_so;
                }

                // Kiểm tra số hiện tại có hợp lệ không
                if (!int.TryParse(quyenBienLai.so_hien_tai, out int soHienTai) || 
                    !int.TryParse(quyenBienLai.den_so, out int denSo))
                {
                    return BadRequest(new { message = "Số biên lai không hợp lệ" });
                }

                if (soHienTai > denSo)
                {
                    quyenBienLai.trang_thai = "da_su_dung_het";
                    await _context.SaveChangesAsync();
                    return BadRequest(new { message = "Quyển biên lai điện tử đã sử dụng hết" });
                }

                // Đảm bảo ký hiệu biên lai đúng định dạng
                bienLai.ky_hieu = "BH25-AG/08907/E";
                
                // Lấy số biên lai hiện tại và cập nhật
                bienLai.so_bien_lai = quyenBienLai.so_hien_tai.PadLeft(7, '0');
                
                // Cập nhật số hiện tại của quyển biên lai
                int nextNumber = soHienTai + 1;
                quyenBienLai.so_hien_tai = nextNumber.ToString();
                
                // Cập nhật trạng thái quyển biên lai nếu đã sử dụng hết
                if (nextNumber > denSo)
                {
                    quyenBienLai.trang_thai = "da_su_dung_het";
                }
                else
                {
                    quyenBienLai.trang_thai = "dang_su_dung";
                }

                // Cập nhật ngày tạo và ngày biên lai
                bienLai.ngay_tao = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                bienLai.ngay_bien_lai = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                
                // Lưu biên lai và cập nhật quyển biên lai
                _context.BienLaiDienTus.Add(bienLai);
                await _context.SaveChangesAsync();

                var createdBienLai = await _context.BienLaiDienTus
                    .Include(b => b.KeKhaiBHYT)
                    .Include(b => b.QuyenBienLaiDienTu)
                    .FirstOrDefaultAsync(b => b.id == bienLai.id);

                return CreatedAtAction(
                    nameof(GetById), 
                    new { id = bienLai.id }, 
                    new { 
                        message = "Thêm biên lai điện tử thành công",
                        data = createdBienLai 
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thêm biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi thêm biên lai điện tử", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, BienLaiDienTu bienLai)
        {
            if (id != bienLai.id)
                return BadRequest();

            var existingBienLai = await _context.BienLaiDienTus.FindAsync(id);
            if (existingBienLai == null)
                return NotFound();

            // Không cho phép cập nhật số biên lai và ký hiệu
            bienLai.so_bien_lai = existingBienLai.so_bien_lai;
            bienLai.ky_hieu = existingBienLai.ky_hieu;
            
            // Cập nhật các trường khác
            existingBienLai.ten_nguoi_dong = bienLai.ten_nguoi_dong;
            existingBienLai.so_tien = bienLai.so_tien;
            existingBienLai.ghi_chu = bienLai.ghi_chu;
            existingBienLai.trang_thai = bienLai.trang_thai;
            existingBienLai.ma_so_bhxh = bienLai.ma_so_bhxh;
            existingBienLai.ma_nhan_vien = bienLai.ma_nhan_vien;
            existingBienLai.tinh_chat = bienLai.tinh_chat;
            existingBienLai.ma_co_quan_bhxh = bienLai.ma_co_quan_bhxh;
            existingBienLai.ma_so_bhxh_don_vi = bienLai.ma_so_bhxh_don_vi;
            existingBienLai.is_bhyt = bienLai.is_bhyt;
            existingBienLai.is_bhxh = bienLai.is_bhxh;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await BienLaiExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var bienLai = await _context.BienLaiDienTus.FindAsync(id);
            if (bienLai == null)
                return NotFound();

            // Xóa biên lai
            _context.BienLaiDienTus.Remove(bienLai);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> BienLaiExists(int id)
        {
            return await _context.BienLaiDienTus.AnyAsync(e => e.id == id);
        }
    }
} 