using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dot-ke-khai")]
    public class KeKhaiBHYTController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<KeKhaiBHYTController> _logger;

        public KeKhaiBHYTController(
            ApplicationDbContext context,
            ILogger<KeKhaiBHYTController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{dotKeKhaiId}/ke-khai-bhyt")]
        public async Task<ActionResult<IEnumerable<KeKhaiBHYT>>> GetByDotKeKhai(int dotKeKhaiId)
        {
            try
            {
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Include(k => k.DotKeKhai)
                    .Include(k => k.ThongTinThe)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId)
                    .Select(k => new KeKhaiBHYT
                    {
                        id = k.id,
                        dot_ke_khai_id = k.dot_ke_khai_id,
                        thong_tin_the_id = k.thong_tin_the_id,
                        nguoi_thu = k.nguoi_thu,
                        so_thang_dong = k.so_thang_dong,
                        phuong_an_dong = k.phuong_an_dong,
                        han_the_cu = k.han_the_cu,
                        han_the_moi_tu = k.han_the_moi_tu,
                        han_the_moi_den = k.han_the_moi_den,
                        tinh_nkq = k.tinh_nkq,
                        huyen_nkq = k.huyen_nkq,
                        xa_nkq = k.xa_nkq,
                        dia_chi_nkq = k.dia_chi_nkq,
                        benh_vien_kcb = k.benh_vien_kcb,
                        nguoi_tao = k.nguoi_tao,
                        ngay_tao = k.ngay_tao,
                        ngay_bien_lai = k.ngay_bien_lai,
                        so_tien_can_dong = k.so_tien_can_dong,
                        DotKeKhai = k.DotKeKhai,
                        ThongTinThe = k.ThongTinThe
                    })
                    .ToListAsync();

                return Ok(keKhaiBHYTs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting ke khai BHYT list by dot ke khai {dotKeKhaiId}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kê khai BHYT", error = ex.Message });
            }
        }

        [HttpGet("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<ActionResult<KeKhaiBHYT>> GetKeKhaiBHYT(int dotKeKhaiId, int id)
        {
            try
            {
                // Sử dụng truy vấn với Select để chỉ lấy các trường cần thiết
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id)
                    .Select(k => new KeKhaiBHYT
                    {
                        id = k.id,
                        dot_ke_khai_id = k.dot_ke_khai_id,
                        thong_tin_the_id = k.thong_tin_the_id,
                        nguoi_thu = k.nguoi_thu,
                        so_thang_dong = k.so_thang_dong,
                        phuong_an_dong = k.phuong_an_dong,
                        han_the_cu = k.han_the_cu,
                        han_the_moi_tu = k.han_the_moi_tu,
                        han_the_moi_den = k.han_the_moi_den,
                        tinh_nkq = k.tinh_nkq,
                        huyen_nkq = k.huyen_nkq,
                        xa_nkq = k.xa_nkq,
                        dia_chi_nkq = k.dia_chi_nkq,
                        benh_vien_kcb = k.benh_vien_kcb,
                        nguoi_tao = k.nguoi_tao,
                        ngay_tao = k.ngay_tao,
                        ngay_bien_lai = k.ngay_bien_lai,
                        so_tien_can_dong = k.so_tien_can_dong,
                        trang_thai = k.trang_thai,
                        so_bien_lai = k.so_bien_lai,
                        quyen_bien_lai_id = k.quyen_bien_lai_id,
                        ma_ho_so = k.ma_ho_so,
                        is_urgent = k.is_urgent,
                        DotKeKhai = k.DotKeKhai,
                        ThongTinThe = k.ThongTinThe,
                        QuyenBienLai = k.QuyenBienLai
                    })
                    .FirstOrDefaultAsync();

                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                return Ok(keKhaiBHYT);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPost("{dotKeKhaiId}/ke-khai-bhyt")]
        public async Task<IActionResult> CreateKeKhaiBHYT(int dotKeKhaiId, KeKhaiBHYT keKhaiBHYT)
        {
            // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Kiểm tra đợt kê khai tồn tại
                var dotKeKhai = await _context.DotKeKhais
                    .Include(d => d.DonVi)
                    .FirstOrDefaultAsync(d => d.id == dotKeKhaiId);

                if (dotKeKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy đợt kê khai" });
                }

                // Kiểm tra trạng thái đợt kê khai
                if (dotKeKhai.trang_thai != "chua_gui")
                {
                    return BadRequest(new { message = "Đợt kê khai đã được gửi, không thể thêm mới" });
                }

                // Gán đợt kê khai cho kê khai BHYT
                keKhaiBHYT.dot_ke_khai_id = dotKeKhaiId;
                keKhaiBHYT.DotKeKhai = dotKeKhai;

                // Gán mã hồ sơ từ đợt kê khai nếu có
                if (!string.IsNullOrEmpty(dotKeKhai.ma_ho_so))
                {
                    keKhaiBHYT.ma_ho_so = dotKeKhai.ma_ho_so;
                }

                // Lấy thông tin người dùng đăng nhập
                var userName = User.Identity != null ? User.Identity.Name : null;
                if (string.IsNullOrEmpty(userName))
                {
                    _logger.LogWarning("Không tìm thấy thông tin người dùng đăng nhập");
                    return BadRequest(new { message = "Không tìm thấy thông tin người dùng đăng nhập" });
                }

                // Gán thông tin người tạo
                keKhaiBHYT.nguoi_tao = userName;
                keKhaiBHYT.ngay_tao = DateTime.Now;

                // Kiểm tra xem thông tin thẻ đã tồn tại chưa
                if (keKhaiBHYT.ThongTinThe != null)
                {
                    // Kiểm tra dựa trên mã số BHXH hoặc CCCD
                    var existingThongTinThe = await _context.ThongTinThes
                        .FirstOrDefaultAsync(t =>
                            (!string.IsNullOrEmpty(keKhaiBHYT.ThongTinThe.ma_so_bhxh) && t.ma_so_bhxh == keKhaiBHYT.ThongTinThe.ma_so_bhxh) ||
                            (!string.IsNullOrEmpty(keKhaiBHYT.ThongTinThe.cccd) && t.cccd == keKhaiBHYT.ThongTinThe.cccd));

                    if (existingThongTinThe != null)
                    {
                        _logger.LogInformation($"Thông tin thẻ với mã số BHXH {keKhaiBHYT.ThongTinThe.ma_so_bhxh} hoặc CCCD {keKhaiBHYT.ThongTinThe.cccd} đã tồn tại trong database, cập nhật thông tin thẻ");

                        // Sử dụng thông tin thẻ đã tồn tại
                        keKhaiBHYT.thong_tin_the_id = existingThongTinThe.id;

                        // Lưu ID của thông tin thẻ hiện tại
                        int existingId = existingThongTinThe.id;

                        // Tạo một bản sao của thông tin thẻ mới để cập nhật
                        var updatedThongTinThe = keKhaiBHYT.ThongTinThe;

                        // Đảm bảo ID không bị thay đổi
                        updatedThongTinThe.id = existingId;

                        // Cập nhật các trường thông tin (ngoại trừ ID)
                        existingThongTinThe.ho_ten = updatedThongTinThe.ho_ten;
                        existingThongTinThe.cccd = updatedThongTinThe.cccd;
                        existingThongTinThe.ngay_sinh = updatedThongTinThe.ngay_sinh;
                        existingThongTinThe.gioi_tinh = updatedThongTinThe.gioi_tinh;
                        existingThongTinThe.so_dien_thoai = updatedThongTinThe.so_dien_thoai;
                        existingThongTinThe.ma_tinh_ks = updatedThongTinThe.ma_tinh_ks;
                        existingThongTinThe.ma_huyen_ks = updatedThongTinThe.ma_huyen_ks;
                        existingThongTinThe.ma_xa_ks = updatedThongTinThe.ma_xa_ks;
                        existingThongTinThe.ma_dan_toc = updatedThongTinThe.ma_dan_toc;
                        existingThongTinThe.ma_hgd = updatedThongTinThe.ma_hgd;
                        existingThongTinThe.quoc_tich = updatedThongTinThe.quoc_tich;

                        // Cập nhật thông tin nơi khám chữa bệnh
                        existingThongTinThe.ma_benh_vien = updatedThongTinThe.ma_benh_vien;

                        // Cập nhật thông tin nơi khám quán
                        existingThongTinThe.ma_tinh_nkq = updatedThongTinThe.ma_tinh_nkq;
                        existingThongTinThe.ma_huyen_nkq = updatedThongTinThe.ma_huyen_nkq;
                        existingThongTinThe.ma_xa_nkq = updatedThongTinThe.ma_xa_nkq;

                        // Cập nhật entity trong context
                        _context.ThongTinThes.Update(existingThongTinThe);

                        // Gán lại thông tin thẻ đã cập nhật
                        keKhaiBHYT.ThongTinThe = existingThongTinThe;

                        // Kiểm tra xem mã số BHYT này đã tồn tại trong đợt kê khai hiện tại chưa
                        var existingKeKhai = await _context.KeKhaiBHYTs
                            .Include(k => k.ThongTinThe)
                            .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId &&
                                                     k.thong_tin_the_id == existingThongTinThe.id);

                        if (existingKeKhai != null)
                        {
                            _logger.LogInformation($"Mã số BHYT {keKhaiBHYT.ThongTinThe.ma_so_bhxh} đã tồn tại trong đợt kê khai {dotKeKhaiId}, thực hiện cập nhật thay vì tạo mới");

                            // Lưu giá trị quyen_bien_lai_id hiện tại nếu không được cung cấp trong request
                            if (keKhaiBHYT.quyen_bien_lai_id == null && existingKeKhai.quyen_bien_lai_id != null)
                            {
                                keKhaiBHYT.quyen_bien_lai_id = existingKeKhai.quyen_bien_lai_id;
                            }

                            // Lưu giá trị trang_thai hiện tại nếu không được cung cấp trong request hoặc là giá trị mặc định
                            if (string.IsNullOrEmpty(keKhaiBHYT.trang_thai) || keKhaiBHYT.trang_thai == "chua_gui")
                            {
                                keKhaiBHYT.trang_thai = existingKeKhai.trang_thai;
                            }

                            // Giữ lại ID của bản ghi hiện tại
                            keKhaiBHYT.id = existingKeKhai.id;

                            // Cập nhật thông tin kê khai
                            _context.Entry(existingKeKhai).CurrentValues.SetValues(keKhaiBHYT);

                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();

                            return Ok(new {
                                success = true,
                                message = "Cập nhật kê khai BHYT thành công",
                                data = existingKeKhai,
                                updated = true
                            });
                        }
                    }
                }

                // Nếu không tìm thấy bản ghi hiện có, tạo mới
                _context.KeKhaiBHYTs.Add(keKhaiBHYT);
                await _context.SaveChangesAsync();

                // Nếu mọi thứ OK thì commit transaction
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetKeKhaiBHYT),
                    new { dotKeKhaiId, id = keKhaiBHYT.id },
                    new { success = true, message = "Tạo kê khai BHYT thành công", data = keKhaiBHYT }
                );
            }
            catch (Exception ex)
            {
                // Có lỗi thì rollback transaction
                await transaction.RollbackAsync();
                _logger.LogError($"Error creating ke khai BHYT: {ex.Message}");
                return StatusCode(500, new {
                    success = false,
                    message = "Lỗi khi tạo kê khai BHYT",
                    error = ex.Message
                });
            }
        }

        [HttpPut("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<IActionResult> UpdateKeKhaiBHYT(int dotKeKhaiId, int id, KeKhaiBHYT keKhaiBHYT)
        {
            if (id != keKhaiBHYT.id || dotKeKhaiId != keKhaiBHYT.dot_ke_khai_id)
            {
                return BadRequest(new { message = "ID không khớp" });
            }

            try
            {
                // Log dữ liệu được gửi lên để debug
                _logger.LogInformation($"Dữ liệu cập nhật KeKhaiBHYT: {JsonSerializer.Serialize(keKhaiBHYT)}");

                // Sử dụng truy vấn với Select để chỉ lấy các trường cần thiết
                var existingKeKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.ThongTinThe)
                    .Include(k => k.DotKeKhai)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id)
                    .FirstOrDefaultAsync();

                if (existingKeKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Cập nhật thông tin thẻ
                if (existingKeKhaiBHYT.ThongTinThe != null && keKhaiBHYT.ThongTinThe != null)
                {
                    var existingThongTinThe = existingKeKhaiBHYT.ThongTinThe;
                    var updatedThongTinThe = keKhaiBHYT.ThongTinThe;

                    // Cập nhật các trường thông tin (ngoại trừ ID)
                    existingThongTinThe.ho_ten = updatedThongTinThe.ho_ten;
                    existingThongTinThe.cccd = updatedThongTinThe.cccd;
                    existingThongTinThe.ngay_sinh = updatedThongTinThe.ngay_sinh;
                    existingThongTinThe.gioi_tinh = updatedThongTinThe.gioi_tinh;
                    existingThongTinThe.so_dien_thoai = updatedThongTinThe.so_dien_thoai;
                    existingThongTinThe.ma_tinh_ks = updatedThongTinThe.ma_tinh_ks;
                    existingThongTinThe.ma_huyen_ks = updatedThongTinThe.ma_huyen_ks;
                    existingThongTinThe.ma_xa_ks = updatedThongTinThe.ma_xa_ks;
                    existingThongTinThe.ma_dan_toc = updatedThongTinThe.ma_dan_toc;
                    existingThongTinThe.ma_hgd = updatedThongTinThe.ma_hgd;
                    existingThongTinThe.quoc_tich = updatedThongTinThe.quoc_tich;

                    // Cập nhật thông tin nơi khám chữa bệnh
                    existingThongTinThe.ma_benh_vien = updatedThongTinThe.ma_benh_vien;

                    // Cập nhật thông tin nơi khám quán
                    existingThongTinThe.ma_tinh_nkq = updatedThongTinThe.ma_tinh_nkq;
                    existingThongTinThe.ma_huyen_nkq = updatedThongTinThe.ma_huyen_nkq;
                    existingThongTinThe.ma_xa_nkq = updatedThongTinThe.ma_xa_nkq;

                    // Cập nhật entity trong context
                    _context.ThongTinThes.Update(existingThongTinThe);
                }

                // Lưu giá trị quyen_bien_lai_id hiện tại nếu không được cung cấp trong request
                if (keKhaiBHYT.quyen_bien_lai_id == null && existingKeKhaiBHYT.quyen_bien_lai_id != null)
                {
                    keKhaiBHYT.quyen_bien_lai_id = existingKeKhaiBHYT.quyen_bien_lai_id;
                }

                // Lưu giá trị trang_thai hiện tại nếu không được cung cấp trong request hoặc là giá trị mặc định
                if (string.IsNullOrEmpty(keKhaiBHYT.trang_thai) || keKhaiBHYT.trang_thai == "chua_gui")
                {
                    keKhaiBHYT.trang_thai = existingKeKhaiBHYT.trang_thai;
                }

                // Cập nhật từng trường thông tin thay vì sử dụng SetValues
                existingKeKhaiBHYT.nguoi_thu = keKhaiBHYT.nguoi_thu;
                existingKeKhaiBHYT.so_thang_dong = keKhaiBHYT.so_thang_dong;
                existingKeKhaiBHYT.phuong_an_dong = keKhaiBHYT.phuong_an_dong;
                existingKeKhaiBHYT.han_the_cu = keKhaiBHYT.han_the_cu;
                existingKeKhaiBHYT.han_the_moi_tu = keKhaiBHYT.han_the_moi_tu;
                existingKeKhaiBHYT.han_the_moi_den = keKhaiBHYT.han_the_moi_den;
                existingKeKhaiBHYT.tinh_nkq = keKhaiBHYT.tinh_nkq;
                existingKeKhaiBHYT.huyen_nkq = keKhaiBHYT.huyen_nkq;
                existingKeKhaiBHYT.xa_nkq = keKhaiBHYT.xa_nkq;
                existingKeKhaiBHYT.dia_chi_nkq = keKhaiBHYT.dia_chi_nkq;
                existingKeKhaiBHYT.benh_vien_kcb = keKhaiBHYT.benh_vien_kcb;
                existingKeKhaiBHYT.ngay_bien_lai = keKhaiBHYT.ngay_bien_lai;
                existingKeKhaiBHYT.so_tien_can_dong = keKhaiBHYT.so_tien_can_dong;
                existingKeKhaiBHYT.is_urgent = keKhaiBHYT.is_urgent;
                existingKeKhaiBHYT.so_bien_lai = keKhaiBHYT.so_bien_lai;
                existingKeKhaiBHYT.quyen_bien_lai_id = keKhaiBHYT.quyen_bien_lai_id;

                // Đảm bảo mã hồ sơ được đồng bộ với đợt kê khai
                if (existingKeKhaiBHYT.DotKeKhai != null && !string.IsNullOrEmpty(existingKeKhaiBHYT.DotKeKhai.ma_ho_so))
                {
                    existingKeKhaiBHYT.ma_ho_so = existingKeKhaiBHYT.DotKeKhai.ma_ho_so;
                }

                await _context.SaveChangesAsync();

                // Log thông tin sau khi cập nhật
                _logger.LogInformation($"Đã cập nhật thành công KeKhaiBHYT với ID: {id}");

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KeKhaiBHYTExists(dotKeKhaiId, id))
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật kê khai BHYT", error = ex.Message });
            }
        }

        [HttpDelete("{dotKeKhaiId}/ke-khai-bhyt/{id}")]
        public async Task<IActionResult> DeleteKeKhaiBHYT(int dotKeKhaiId, int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Lấy thông tin kê khai và quyển biên lai
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .Include(k => k.QuyenBienLai)
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);

                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Lấy biên lai liên quan
                var bienLai = await _context.BienLais
                    .FirstOrDefaultAsync(b => b.ke_khai_bhyt_id == keKhaiBHYT.id);

                if (bienLai != null && keKhaiBHYT.QuyenBienLai != null)
                {
                    // Xóa biên lai
                    _context.BienLais.Remove(bienLai);
                    await _context.SaveChangesAsync();

                    // Reset số hiện tại về số của biên lai bị xóa
                    keKhaiBHYT.QuyenBienLai.so_hien_tai = keKhaiBHYT.so_bien_lai;

                    // Nếu trạng thái là đã sử dụng thì chuyển về đang sử dụng
                    if (keKhaiBHYT.QuyenBienLai.trang_thai == "da_su_dung")
                    {
                        keKhaiBHYT.QuyenBienLai.trang_thai = "dang_su_dung";
                    }
                }

                // Xóa kê khai BHYT
                _context.KeKhaiBHYTs.Remove(keKhaiBHYT);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error deleting ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa kê khai BHYT", error = ex.Message });
            }
        }

        [HttpPost("{dotKeKhaiId}/ke-khai-bhyt/delete-multiple")]
        public async Task<IActionResult> DeleteMultiple(int dotKeKhaiId, [FromBody] DeleteMultipleDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Include(k => k.BienLai)
                    .Where(k => k.dot_ke_khai_id == dotKeKhaiId && dto.ids.Contains(k.id))
                    .ToListAsync();

                foreach (var keKhai in keKhaiBHYTs)
                {
                    var quyenBienLai = await _context.QuyenBienLais
                        .FirstOrDefaultAsync(q => q.id == keKhai.quyen_bien_lai_id);

                    if (quyenBienLai != null)
                    {
                        quyenBienLai.so_hien_tai = keKhai.so_bien_lai;
                        if (quyenBienLai.trang_thai == "da_su_dung")
                        {
                            quyenBienLai.trang_thai = "dang_su_dung";
                        }
                        _context.QuyenBienLais.Update(quyenBienLai);
                    }
                }

                _context.KeKhaiBHYTs.RemoveRange(keKhaiBHYTs);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError($"Error deleting multiple ke khai BHYT: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa nhiều kê khai BHYT", error = ex.Message });
            }
        }

        private bool KeKhaiBHYTExists(int dotKeKhaiId, int id)
        {
            return _context.KeKhaiBHYTs.Any(e => e.dot_ke_khai_id == dotKeKhaiId && e.id == id);
        }

        [HttpPatch("{dotKeKhaiId}/ke-khai-bhyt/{id}/toggle-urgent")]
        public async Task<IActionResult> ToggleUrgent(int dotKeKhaiId, int id)
        {
            try
            {
                var keKhaiBHYT = await _context.KeKhaiBHYTs
                    .FirstOrDefaultAsync(k => k.dot_ke_khai_id == dotKeKhaiId && k.id == id);

                if (keKhaiBHYT == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                // Toggle trạng thái urgent
                keKhaiBHYT.is_urgent = !keKhaiBHYT.is_urgent;
                await _context.SaveChangesAsync();

                return Ok(new { is_urgent = keKhaiBHYT.is_urgent });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error toggling urgent status for ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái gấp", error = ex.Message });
            }
        }

        [HttpPost("{id}/cap-nhat-so-bien-lai")]
        public async Task<IActionResult> CapNhatSoBienLai(int id, [FromBody] CapNhatSoBienLaiDto dto)
        {
            try
            {
                var keKhai = await _context.KeKhaiBHYTs
                    .Include(k => k.QuyenBienLai)
                    .FirstOrDefaultAsync(k => k.id == id);

                if (keKhai == null)
                {
                    return NotFound(new { message = "Không tìm thấy kê khai BHYT" });
                }

                if (keKhai.QuyenBienLai == null)
                {
                    return BadRequest(new { message = "Kê khai chưa được gán quyển biên lai" });
                }

                // Kiểm tra số biên lai có hợp lệ không
                var quyenBienLai = keKhai.QuyenBienLai;
                var soBienLai = int.Parse(dto.so_bien_lai);
                var tuSo = int.Parse(quyenBienLai.tu_so);
                var denSo = int.Parse(quyenBienLai.den_so);

                if (soBienLai < tuSo || soBienLai > denSo)
                {
                    return BadRequest(new { message = "Số biên lai không nằm trong khoảng cho phép" });
                }

                // Kiểm tra số biên lai đã được sử dụng chưa
                var daCoSoBienLai = await _context.KeKhaiBHYTs
                    .AnyAsync(k => k.id != id &&
                                  k.quyen_bien_lai_id == quyenBienLai.id &&
                                  k.so_bien_lai == dto.so_bien_lai);

                if (daCoSoBienLai)
                {
                    return BadRequest(new { message = "Số biên lai đã được sử dụng" });
                }

                keKhai.so_bien_lai = dto.so_bien_lai;
                quyenBienLai.so_hien_tai = dto.so_bien_lai;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật số biên lai thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating so bien lai for ke khai BHYT {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật số biên lai", error = ex.Message });
            }
        }

        [HttpPost("create-bien-lai")]
        public async Task<IActionResult> CreateBienLai([FromBody] BienLaiCreateDto dto)
        {
            try
            {
                // Kiểm tra quyển biên lai
                var quyenBienLai = await _context.QuyenBienLais
                    .FirstOrDefaultAsync(q => q.quyen_so == dto.quyen_so);

                if (quyenBienLai == null)
                {
                    return BadRequest(new { message = "Quyển biên lai không tồn tại" });
                }

                // Tạo biên lai mới
                var bienLai = new BienLai
                {
                    quyen_so = dto.quyen_so,
                    so_bien_lai = dto.so_bien_lai,
                    ten_nguoi_dong = dto.ten_nguoi_dong,
                    so_tien = dto.so_tien,
                    ghi_chu = dto.ghi_chu,
                    trang_thai = "active",
                    ngay_tao = DateTime.Now
                };

                _context.BienLais.Add(bienLai);
                await _context.SaveChangesAsync();

                return Ok(bienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo biên lai");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo biên lai" });
            }
        }

        /// <summary>
        /// Kiểm tra xem mã số BHXH đã được kê khai trong 7 ngày gần đây hay chưa
        /// </summary>
        /// <param name="dto">Đối tượng chứa mã số BHXH cần kiểm tra</param>
        /// <returns>Thông tin về việc mã số BHXH đã được kê khai trong 7 ngày gần đây hay chưa</returns>
        [HttpPost("check-ma-so-bhxh")]
        public async Task<IActionResult> CheckMaSoBHXH([FromBody] CheckMaSoBHXHDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.ma_so_bhxh))
                {
                    return BadRequest(new { success = false, message = "Mã số BHXH không được để trống" });
                }

                // Lấy ngày 7 ngày trước
                var sevenDaysAgo = DateTime.Now.AddDays(-7);

                // Tìm thông tin thẻ có mã số BHXH tương ứng
                var thongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(t => t.ma_so_bhxh == dto.ma_so_bhxh);

                if (thongTinThe == null)
                {
                    return Ok(new { success = true, exists = false, message = "Mã số BHXH chưa được kê khai trong 7 ngày gần đây" });
                }

                // Tìm các kê khai trong 7 ngày gần đây, chỉ chọn các trường cần thiết
                var recentKeKhaiQuery = from k in _context.KeKhaiBHYTs
                                       join d in _context.DotKeKhais on k.dot_ke_khai_id equals d.id
                                       where k.thong_tin_the_id == thongTinThe.id && k.ngay_tao >= sevenDaysAgo
                                       orderby k.ngay_tao descending
                                       select new {
                                           k.id,
                                           k.dot_ke_khai_id,
                                           dot_ke_khai_name = d.ten_dot,
                                           k.ngay_tao
                                       };

                var recentKeKhai = await recentKeKhaiQuery.ToListAsync();

                if (recentKeKhai.Any())
                {
                    // Nếu có kê khai trong 7 ngày gần đây, trả về thông tin chi tiết
                    var latestKeKhai = recentKeKhai.First();
                    return Ok(new {
                        success = true,
                        exists = true,
                        message = "Mã số BHXH đã được kê khai trong 7 ngày gần đây",
                        data = new {
                            id = latestKeKhai.id,
                            dot_ke_khai_id = latestKeKhai.dot_ke_khai_id,
                            dot_ke_khai_name = latestKeKhai.dot_ke_khai_name,
                            ngay_tao = latestKeKhai.ngay_tao,
                            ho_ten = thongTinThe.ho_ten,
                            ma_so_bhxh = thongTinThe.ma_so_bhxh,
                            all_records = recentKeKhai.Select(k => new {
                                id = k.id,
                                dot_ke_khai_id = k.dot_ke_khai_id,
                                dot_ke_khai_name = k.dot_ke_khai_name,
                                ngay_tao = k.ngay_tao,
                                ho_ten = thongTinThe.ho_ten
                            }).ToList()
                        }
                    });
                }

                // Nếu không có kê khai nào trong 7 ngày gần đây
                return Ok(new { success = true, exists = false, message = "Mã số BHXH chưa được kê khai trong 7 ngày gần đây" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi kiểm tra mã số BHXH: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Lỗi khi kiểm tra mã số BHXH", error = ex.Message });
            }
        }
    }

    public class DeleteMultipleDto
    {
        [Required]
        public int[] ids { get; set; } = Array.Empty<int>();
    }

    public class CapNhatSoBienLaiDto
    {
        [Required]
        public string so_bien_lai { get; set; }
    }

    public class BienLaiCreateDto
    {
        [Required]
        public string quyen_so { get; set; }
        [Required]
        public string so_bien_lai { get; set; }
        [Required]
        public string ten_nguoi_dong { get; set; }
        [Required]
        public decimal so_tien { get; set; }
        public string ghi_chu { get; set; }
    }

    public class CheckMaSoBHXHDto
    {
        [Required]
        public string ma_so_bhxh { get; set; }
    }
}