using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Xml;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.API.Models.BienlaiDienTu;
using WebApp.API.Services;
using static WebApp.API.Controllers.KeKhaiBHYTController; // Sử dụng DeleteMultipleDto từ KeKhaiBHYTController

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/bien-lai-dien-tu")]
    public class BienLaiDienTuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BienLaiDienTuController> _logger;
        private readonly VNPTBienLaiService _vnptBienLaiService;

        public BienLaiDienTuController(
            ApplicationDbContext context,
            ILogger<BienLaiDienTuController> logger,
            VNPTBienLaiService vnptBienLaiService)
        {
            _context = context;
            _logger = logger;
            _vnptBienLaiService = vnptBienLaiService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? ky_hieu, [FromQuery] string? so_bien_lai,
            [FromQuery] string? ten_nguoi_dong, [FromQuery] string? ma_so_bhxh, [FromQuery] string? ma_nhan_vien,
            [FromQuery] bool? is_bhyt, [FromQuery] bool? is_bhxh)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var currentUser = User.Identity?.Name;
                var isAdmin = User.IsInRole("admin") || User.IsInRole("super_admin") || User.HasClaim("IsSuperAdmin", "true");

                // Lấy mã nhân viên từ người dùng hiện tại
                var currentUserMaNhanVien = string.Empty;
                if (!string.IsNullOrEmpty(currentUser))
                {
                    var nguoiDung = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == currentUser);
                    if (nguoiDung != null)
                    {
                        currentUserMaNhanVien = nguoiDung.ma_nhan_vien ?? nguoiDung.user_name;
                    }
                }

                var query = _context.BienLaiDienTus
                    .Include(b => b.QuyenBienLaiDienTu)
                    .AsQueryable();

                // Nếu không phải admin, chỉ hiển thị biên lai của người dùng hiện tại
                if (!isAdmin && !string.IsNullOrEmpty(currentUserMaNhanVien))
                {
                    query = query.Where(b => b.ma_nhan_vien == currentUserMaNhanVien);
                }

                // Áp dụng các bộ lọc
                if (!string.IsNullOrEmpty(ky_hieu))
                {
                    query = query.Where(b => b.ky_hieu.Contains(ky_hieu));
                }

                if (!string.IsNullOrEmpty(so_bien_lai))
                {
                    query = query.Where(b => b.so_bien_lai.Contains(so_bien_lai));
                }

                if (!string.IsNullOrEmpty(ten_nguoi_dong))
                {
                    query = query.Where(b => b.ten_nguoi_dong.Contains(ten_nguoi_dong));
                }

                if (!string.IsNullOrEmpty(ma_so_bhxh))
                {
                    query = query.Where(b => b.ma_so_bhxh.Contains(ma_so_bhxh));
                }

                if (!string.IsNullOrEmpty(ma_nhan_vien))
                {
                    query = query.Where(b => b.ma_nhan_vien.Contains(ma_nhan_vien));
                }

                // Lọc theo loại kê khai
                if (is_bhyt.HasValue)
                {
                    query = query.Where(b => b.is_bhyt == is_bhyt.Value);
                }

                if (is_bhxh.HasValue)
                {
                    query = query.Where(b => b.is_bhxh == is_bhxh.Value);
                }

                var bienLais = await query
                    .Select(b => new
                    {
                        b.id,
                        b.ky_hieu,
                        b.so_bien_lai,
                        b.ten_nguoi_dong,
                        b.so_tien,
                        b.ghi_chu,
                        b.trang_thai,
                        b.ngay_tao,
                        b.ngay_bien_lai,
                        b.ke_khai_bhyt_id,
                        b.quyen_bien_lai_dien_tu_id,
                        b.ma_so_bhxh,
                        b.ma_nhan_vien,
                        b.tinh_chat,
                        b.ma_co_quan_bhxh,
                        b.ma_so_bhxh_don_vi,
                        b.is_bhyt,
                        b.is_bhxh,
                        b.is_published_to_vnpt,
                        b.vnpt_key,
                        b.vnpt_response,
                        b.vnpt_pattern,
                        b.vnpt_serial,
                        b.vnpt_invoice_no,
                        b.vnpt_publish_date,
                        b.vnpt_link,
                        b.vnpt_transaction_id,
                        b.vnpt_xml_content,
                        QuyenBienLaiDienTu = b.QuyenBienLaiDienTu == null ? null : new
                        {
                            b.QuyenBienLaiDienTu.id,
                            b.QuyenBienLaiDienTu.ky_hieu,
                            b.QuyenBienLaiDienTu.tu_so,
                            b.QuyenBienLaiDienTu.den_so,
                            b.QuyenBienLaiDienTu.so_hien_tai,
                            b.QuyenBienLaiDienTu.trang_thai,
                            b.QuyenBienLaiDienTu.ngay_cap,
                            b.QuyenBienLaiDienTu.nguoi_cap,
                            b.QuyenBienLaiDienTu.ma_co_quan_bhxh
                        },
                        KeKhaiBHYT = b.KeKhaiBHYT == null ? null : new
                        {
                            b.KeKhaiBHYT.id,
                            b.KeKhaiBHYT.dot_ke_khai_id,
                            b.KeKhaiBHYT.thong_tin_the_id,
                            b.KeKhaiBHYT.nguoi_thu,
                            b.KeKhaiBHYT.so_thang_dong,
                            b.KeKhaiBHYT.phuong_an_dong,
                            b.KeKhaiBHYT.han_the_cu,
                            b.KeKhaiBHYT.han_the_moi_tu,
                            b.KeKhaiBHYT.han_the_moi_den,
                            b.KeKhaiBHYT.tinh_nkq,
                            b.KeKhaiBHYT.huyen_nkq,
                            b.KeKhaiBHYT.xa_nkq,
                            b.KeKhaiBHYT.dia_chi_nkq,
                            b.KeKhaiBHYT.benh_vien_kcb,
                            b.KeKhaiBHYT.nguoi_tao,
                            b.KeKhaiBHYT.ngay_tao,
                            b.KeKhaiBHYT.ngay_bien_lai,
                            b.KeKhaiBHYT.so_tien_can_dong,
                            b.KeKhaiBHYT.is_urgent,
                            b.KeKhaiBHYT.trang_thai,
                            b.KeKhaiBHYT.so_bien_lai,
                            b.KeKhaiBHYT.ma_ho_so,
                            b.KeKhaiBHYT.quyen_bien_lai_id
                        }
                    })
                    .OrderByDescending(b => b.ngay_tao)
                    .ToListAsync();

                return Ok(bienLais);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách biên lai điện tử", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var currentUser = User.Identity?.Name;
                var isAdmin = User.IsInRole("admin") || User.IsInRole("super_admin") || User.HasClaim("IsSuperAdmin", "true");

                // Lấy mã nhân viên từ người dùng hiện tại
                var currentUserMaNhanVien = string.Empty;
                if (!string.IsNullOrEmpty(currentUser))
                {
                    var nguoiDung = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == currentUser);
                    if (nguoiDung != null)
                    {
                        currentUserMaNhanVien = nguoiDung.ma_nhan_vien ?? nguoiDung.user_name;
                    }
                }

                var query = _context.BienLaiDienTus
                    .Include(b => b.QuyenBienLaiDienTu)
                    .Where(b => b.id == id);

                // Nếu không phải admin, chỉ cho phép xem biên lai của người dùng hiện tại
                if (!isAdmin && !string.IsNullOrEmpty(currentUserMaNhanVien))
                {
                    query = query.Where(b => b.ma_nhan_vien == currentUserMaNhanVien);
                }

                var bienLai = await query
                    .Select(b => new
                    {
                        b.id,
                        b.ky_hieu,
                        b.so_bien_lai,
                        b.ten_nguoi_dong,
                        b.so_tien,
                        b.ghi_chu,
                        b.trang_thai,
                        b.ngay_tao,
                        b.ngay_bien_lai,
                        b.ke_khai_bhyt_id,
                        b.quyen_bien_lai_dien_tu_id,
                        b.ma_so_bhxh,
                        b.ma_nhan_vien,
                        b.tinh_chat,
                        b.ma_co_quan_bhxh,
                        b.ma_so_bhxh_don_vi,
                        b.is_bhyt,
                        b.is_bhxh,
                        b.is_published_to_vnpt,
                        b.vnpt_key,
                        b.vnpt_response,
                        b.vnpt_pattern,
                        b.vnpt_serial,
                        b.vnpt_invoice_no,
                        b.vnpt_publish_date,
                        b.vnpt_link,
                        b.vnpt_transaction_id,
                        b.vnpt_xml_content,
                        QuyenBienLaiDienTu = b.QuyenBienLaiDienTu == null ? null : new
                        {
                            b.QuyenBienLaiDienTu.id,
                            b.QuyenBienLaiDienTu.ky_hieu,
                            b.QuyenBienLaiDienTu.tu_so,
                            b.QuyenBienLaiDienTu.den_so,
                            b.QuyenBienLaiDienTu.so_hien_tai,
                            b.QuyenBienLaiDienTu.trang_thai,
                            b.QuyenBienLaiDienTu.ngay_cap,
                            b.QuyenBienLaiDienTu.nguoi_cap,
                            b.QuyenBienLaiDienTu.ma_co_quan_bhxh
                        },
                        KeKhaiBHYT = b.KeKhaiBHYT == null ? null : new
                        {
                            b.KeKhaiBHYT.id,
                            b.KeKhaiBHYT.dot_ke_khai_id,
                            b.KeKhaiBHYT.thong_tin_the_id,
                            b.KeKhaiBHYT.nguoi_thu,
                            b.KeKhaiBHYT.so_thang_dong,
                            b.KeKhaiBHYT.phuong_an_dong,
                            b.KeKhaiBHYT.han_the_cu,
                            b.KeKhaiBHYT.han_the_moi_tu,
                            b.KeKhaiBHYT.han_the_moi_den,
                            b.KeKhaiBHYT.tinh_nkq,
                            b.KeKhaiBHYT.huyen_nkq,
                            b.KeKhaiBHYT.xa_nkq,
                            b.KeKhaiBHYT.dia_chi_nkq,
                            b.KeKhaiBHYT.benh_vien_kcb,
                            b.KeKhaiBHYT.nguoi_tao,
                            b.KeKhaiBHYT.ngay_tao,
                            b.KeKhaiBHYT.ngay_bien_lai,
                            b.KeKhaiBHYT.so_tien_can_dong,
                            b.KeKhaiBHYT.is_urgent,
                            b.KeKhaiBHYT.trang_thai,
                            b.KeKhaiBHYT.so_bien_lai,
                            b.KeKhaiBHYT.ma_ho_so,
                            b.KeKhaiBHYT.quyen_bien_lai_id
                        }
                    })
                    .FirstOrDefaultAsync();

                if (bienLai == null)
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử hoặc bạn không có quyền xem biên lai này" });

                return Ok(bienLai);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy biên lai điện tử với ID {id}");
                return StatusCode(500, new { message = $"Lỗi khi lấy biên lai điện tử với ID {id}", error = ex.Message });
            }
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
                    .Include(b => b.QuyenBienLaiDienTu)
                    .Select(b => new
                    {
                        b.id,
                        b.ky_hieu,
                        b.so_bien_lai,
                        b.ten_nguoi_dong,
                        b.so_tien,
                        b.ghi_chu,
                        b.trang_thai,
                        b.ngay_tao,
                        b.ngay_bien_lai,
                        b.ke_khai_bhyt_id,
                        b.quyen_bien_lai_dien_tu_id,
                        b.ma_so_bhxh,
                        b.ma_nhan_vien,
                        b.tinh_chat,
                        b.ma_co_quan_bhxh,
                        b.ma_so_bhxh_don_vi,
                        b.is_bhyt,
                        b.is_bhxh,
                        QuyenBienLaiDienTu = b.QuyenBienLaiDienTu == null ? null : new
                        {
                            b.QuyenBienLaiDienTu.id,
                            b.QuyenBienLaiDienTu.ky_hieu,
                            b.QuyenBienLaiDienTu.tu_so,
                            b.QuyenBienLaiDienTu.den_so,
                            b.QuyenBienLaiDienTu.so_hien_tai,
                            b.QuyenBienLaiDienTu.trang_thai,
                            b.QuyenBienLaiDienTu.ngay_cap,
                            b.QuyenBienLaiDienTu.nguoi_cap,
                            b.QuyenBienLaiDienTu.ma_co_quan_bhxh
                        }
                    })
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
            try
            {
                if (id != bienLai.id)
                    return BadRequest(new { message = "ID không khớp" });

                // Lấy thông tin người dùng hiện tại
                var currentUser = User.Identity?.Name;
                var isAdmin = User.IsInRole("admin") || User.IsInRole("super_admin") || User.HasClaim("IsSuperAdmin", "true");

                // Lấy mã nhân viên từ người dùng hiện tại
                var currentUserMaNhanVien = string.Empty;
                if (!string.IsNullOrEmpty(currentUser))
                {
                    var nguoiDung = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == currentUser);
                    if (nguoiDung != null)
                    {
                        currentUserMaNhanVien = nguoiDung.ma_nhan_vien ?? nguoiDung.user_name;
                    }
                }

                var existingBienLai = await _context.BienLaiDienTus.FindAsync(id);
                if (existingBienLai == null)
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });

                // Kiểm tra quyền: chỉ admin hoặc người tạo biên lai mới có thể cập nhật
                if (!isAdmin && existingBienLai.ma_nhan_vien != currentUserMaNhanVien)
                {
                    return Forbid();
                }

                // Không cho phép cập nhật số biên lai và ký hiệu
                bienLai.so_bien_lai = existingBienLai.so_bien_lai;
                bienLai.ky_hieu = existingBienLai.ky_hieu;

                // Cập nhật các trường khác
                existingBienLai.ten_nguoi_dong = bienLai.ten_nguoi_dong;
                existingBienLai.so_tien = bienLai.so_tien;
                existingBienLai.ghi_chu = bienLai.ghi_chu;
                existingBienLai.trang_thai = bienLai.trang_thai;
                existingBienLai.ma_so_bhxh = bienLai.ma_so_bhxh;
                // Không cho phép thay đổi mã nhân viên nếu không phải admin
                if (isAdmin)
                {
                    existingBienLai.ma_nhan_vien = bienLai.ma_nhan_vien;
                }
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
                        return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                    throw;
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật biên lai điện tử với ID {id}");
                return StatusCode(500, new { message = $"Lỗi khi cập nhật biên lai điện tử với ID {id}", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var currentUser = User.Identity?.Name;
                var isAdmin = User.IsInRole("admin") || User.IsInRole("super_admin") || User.HasClaim("IsSuperAdmin", "true");

                // Lấy mã nhân viên từ người dùng hiện tại
                var currentUserMaNhanVien = string.Empty;
                if (!string.IsNullOrEmpty(currentUser))
                {
                    var nguoiDung = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == currentUser);
                    if (nguoiDung != null)
                    {
                        currentUserMaNhanVien = nguoiDung.ma_nhan_vien ?? nguoiDung.user_name;
                    }
                }

                var bienLai = await _context.BienLaiDienTus.FindAsync(id);
                if (bienLai == null)
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });

                // Kiểm tra quyền: chỉ admin hoặc người tạo biên lai mới có thể xóa
                if (!isAdmin && bienLai.ma_nhan_vien != currentUserMaNhanVien)
                {
                    return Forbid();
                }

                // Xóa biên lai
                _context.BienLaiDienTus.Remove(bienLai);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa biên lai điện tử với ID {id}");
                return StatusCode(500, new { message = $"Lỗi khi xóa biên lai điện tử với ID {id}", error = ex.Message });
            }
        }

        [HttpPost("delete-multiple")]
        public async Task<IActionResult> DeleteMultiple([FromBody] DeleteMultipleDto dto)
        {
            try
            {
                if (dto.ids == null || dto.ids.Length == 0)
                {
                    return BadRequest(new { message = "Danh sách ID không hợp lệ" });
                }

                _logger.LogInformation($"Nhận yêu cầu xóa nhiều biên lai điện tử: {string.Join(", ", dto.ids)}");

                // Lấy thông tin người dùng hiện tại
                var currentUser = User.Identity?.Name;
                var isAdmin = User.IsInRole("admin") || User.IsInRole("super_admin") || User.HasClaim("IsSuperAdmin", "true");

                // Lấy mã nhân viên từ người dùng hiện tại
                var currentUserMaNhanVien = string.Empty;
                if (!string.IsNullOrEmpty(currentUser))
                {
                    var nguoiDung = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == currentUser);
                    if (nguoiDung != null)
                    {
                        currentUserMaNhanVien = nguoiDung.ma_nhan_vien ?? nguoiDung.user_name;
                    }
                }

                var query = _context.BienLaiDienTus.Where(b => dto.ids.Contains(b.id));

                // Nếu không phải admin, chỉ cho phép xóa biên lai của người dùng hiện tại
                if (!isAdmin && !string.IsNullOrEmpty(currentUserMaNhanVien))
                {
                    query = query.Where(b => b.ma_nhan_vien == currentUserMaNhanVien);
                }

                var bienLais = await query.ToListAsync();

                if (bienLais.Count == 0)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử nào hoặc bạn không có quyền xóa các biên lai này" });
                }

                // Xóa các biên lai
                _context.BienLaiDienTus.RemoveRange(bienLais);
                await _context.SaveChangesAsync();

                return Ok(new {
                    message = $"Xóa thành công {bienLais.Count} biên lai điện tử",
                    count = bienLais.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa nhiều biên lai điện tử: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi xóa nhiều biên lai điện tử", error = ex.Message });
            }
        }

        private async Task<bool> BienLaiExists(int id)
        {
            return await _context.BienLaiDienTus.AnyAsync(e => e.id == id);
        }

        /// <summary>
        /// Phát hành nhiều biên lai điện tử lên VNPT theo thứ tự số biên lai từ bé đến lớn
        /// </summary>
        /// <param name="dto">Danh sách ID biên lai cần phát hành</param>
        /// <returns>Kết quả phát hành</returns>
        [HttpPost("publish-multiple")]
        public async Task<IActionResult> PublishMultiple([FromBody] DeleteMultipleDto dto)
        {
            try
            {
                if (dto.ids == null || dto.ids.Length == 0)
                {
                    return BadRequest(new { message = "Danh sách ID không hợp lệ" });
                }

                _logger.LogInformation($"Nhận yêu cầu phát hành nhiều biên lai điện tử: {string.Join(", ", dto.ids)}");

                // Lấy thông tin người dùng hiện tại
                var currentUser = User.Identity?.Name;
                var isAdmin = User.IsInRole("admin") || User.IsInRole("super_admin") || User.HasClaim("IsSuperAdmin", "true");

                // Lấy mã nhân viên từ người dùng hiện tại
                var currentUserMaNhanVien = string.Empty;
                if (!string.IsNullOrEmpty(currentUser))
                {
                    var nguoiDung = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == currentUser);
                    if (nguoiDung != null)
                    {
                        currentUserMaNhanVien = nguoiDung.ma_nhan_vien ?? nguoiDung.user_name;
                    }
                }

                // Lấy danh sách biên lai cần phát hành
                var query = _context.BienLaiDienTus
                    .Where(b => dto.ids.Contains(b.id) && !b.is_published_to_vnpt);

                // Nếu không phải admin, chỉ cho phép phát hành biên lai của người dùng hiện tại
                if (!isAdmin && !string.IsNullOrEmpty(currentUserMaNhanVien))
                {
                    query = query.Where(b => b.ma_nhan_vien == currentUserMaNhanVien);
                }

                var bienLais = await query
                    .OrderBy(b => b.so_bien_lai) // Sắp xếp theo số biên lai từ bé đến lớn
                    .ToListAsync();

                if (bienLais.Count == 0)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử nào cần phát hành" });
                }

                // Kết quả phát hành
                var results = new List<object>();
                var successCount = 0;
                var errorCount = 0;

                // Phát hành từng biên lai theo thứ tự
                foreach (var bienLai in bienLais)
                {
                    try
                    {
                        // Tạo key tạm thời cho XML
                        string key = $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
                        _logger.LogInformation($"Generated temporary key for XML for receipt {bienLai.so_bien_lai}: {key}");

                        // Gán key tạm thời vào biên lai để sử dụng trong XML
                        bienLai.vnpt_key = key;

                        // Đảm bảo KeKhaiBHYT được tải đầy đủ
                        if (bienLai.ke_khai_bhyt_id.HasValue && bienLai.KeKhaiBHYT == null)
                        {
                            bienLai.KeKhaiBHYT = await _context.KeKhaiBHYTs.FindAsync(bienLai.ke_khai_bhyt_id.Value);
                            _logger.LogInformation($"Đã tải KeKhaiBHYT cho biên lai {bienLai.id}: {bienLai.KeKhaiBHYT?.id}");
                        }

                        // Tạo XML với key tạm thời
                        string invoiceXml = _vnptBienLaiService.CreateInvoiceXml(bienLai);

                        // Kiểm tra xem nội dung thu có được truyền đúng không
                        bool containsFullFormatBHYT = invoiceXml.Contains("Thu tiền đóng BHYT - Số tháng đóng");
                        bool containsSimpleFormatBHYT = invoiceXml.Contains("Thu tiền đóng BHYT") && !containsFullFormatBHYT;
                        bool containsFullFormatBHXH = invoiceXml.Contains("Thu tiền đóng BHXH tự nguyện - Số tháng đóng");
                        bool containsSimpleFormatBHXH = invoiceXml.Contains("Thu tiền đóng BHXH tự nguyện") && !containsFullFormatBHXH;

                        _logger.LogInformation($"Kiểm tra nội dung thu trong XML cho biên lai {bienLai.id}: " +
                            $"BHYT ĐầyĐủ={containsFullFormatBHYT}, BHYT ĐơnGiản={containsSimpleFormatBHYT}, " +
                            $"BHXH ĐầyĐủ={containsFullFormatBHXH}, BHXH ĐơnGiản={containsSimpleFormatBHXH}");

                        // Kiểm tra mã nhân viên
                        if (string.IsNullOrEmpty(bienLai.ma_nhan_vien))
                        {
                            results.Add(new
                            {
                                id = bienLai.id,
                                so_bien_lai = bienLai.so_bien_lai,
                                success = false,
                                message = "Biên lai điện tử không có mã nhân viên"
                            });
                            errorCount++;
                            continue;
                        }

                        // Sử dụng tài khoản VNPT của nhân viên
                        var vnptAccount = await _vnptBienLaiService.GetVNPTAccountByMaNhanVien(bienLai.ma_nhan_vien);
                        if (vnptAccount == null)
                        {
                            results.Add(new
                            {
                                id = bienLai.id,
                                so_bien_lai = bienLai.so_bien_lai,
                                success = false,
                                message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {bienLai.ma_nhan_vien}"
                            });
                            errorCount++;
                            continue;
                        }

                        // Sử dụng ImportAndPublishInv với tài khoản VNPT của nhân viên theo tài liệu tích hợp
                        string result = await _vnptBienLaiService.ImportAndPublishInv(invoiceXml, vnptAccount);
                        _logger.LogInformation($"ImportAndPublishInv Result for receipt {bienLai.so_bien_lai}: {result}");

                        if (result.StartsWith("ERR:"))
                        {
                            // Xử lý lỗi
                            results.Add(new
                            {
                                id = bienLai.id,
                                so_bien_lai = bienLai.so_bien_lai,
                                success = false,
                                message = $"Lỗi khi phát hành: {result}"
                            });
                            errorCount++;
                            continue;
                        }
                        else if (result.StartsWith("Error:"))
                        {
                            // Xử lý lỗi máy chủ
                            results.Add(new
                            {
                                id = bienLai.id,
                                so_bien_lai = bienLai.so_bien_lai,
                                success = false,
                                message = $"Lỗi máy chủ: {result}"
                            });
                            errorCount++;
                            continue;
                        }

                        // Cập nhật thông tin biên lai
                        if (result.StartsWith("OK:"))
                        {
                            // Xử lý kết quả dạng chuỗi theo tài liệu tích hợp
                            string[] parts = result.Replace("OK:", "").Split(';');
                            _logger.LogInformation($"Phân tích kết quả VNPT cho biên lai {bienLai.so_bien_lai}: {result}, số phần: {parts.Length}");

                            // Đảm bảo lưu key gốc đã tạo
                            bienLai.vnpt_key = key;
                            bienLai.vnpt_response = result;

                            if (parts.Length >= 2)
                            {
                                // Lưu pattern
                                bienLai.vnpt_pattern = parts[0];

                                if (parts.Length >= 3)
                                {
                                    // Định dạng chuẩn: OK:pattern;serial;invoiceNo
                                    bienLai.vnpt_serial = parts[1];
                                    bienLai.vnpt_invoice_no = parts[2];

                                    // Theo tài liệu, fkey có thể là một phần của chuỗi kết quả
                                    if (parts.Length >= 4 && !string.IsNullOrEmpty(parts[3]))
                                    {
                                        // Nếu có phần thứ 4, có thể đó là fkey
                                        bienLai.vnpt_transaction_id = parts[3];
                                    }
                                    else
                                    {
                                        // Nếu không có phần thứ 4, sử dụng invoiceNo làm fkey
                                        bienLai.vnpt_transaction_id = parts[2];
                                    }
                                }
                                else
                                {
                                    // Định dạng khác: OK:pattern;serial-key
                                    // Tìm vị trí của dấu gạch ngang cuối cùng
                                    int lastDashIndex = parts[1].LastIndexOf('-');

                                    if (lastDashIndex > 0)
                                    {
                                        // Lưu serial đầy đủ (ví dụ: "BH25-AG/08907/E")
                                        string fullSerial = parts[1].Substring(0, lastDashIndex);
                                        bienLai.vnpt_serial = fullSerial;

                                        // Lấy phần sau dấu gạch ngang cuối cùng
                                        string transactionPart = parts[1].Substring(lastDashIndex + 1);

                                        // Kiểm tra xem có dấu gạch dưới cuối cùng không
                                        int lastUnderscoreIndex = transactionPart.LastIndexOf('_');

                                        if (lastUnderscoreIndex > 0)
                                        {
                                            // Lấy invoice_no (phần sau dấu gạch dưới cuối cùng)
                                            string invoiceNo = transactionPart.Substring(lastUnderscoreIndex + 1);
                                            bienLai.vnpt_invoice_no = invoiceNo;

                                            // Lấy transaction_id (phần trước dấu gạch dưới cuối cùng)
                                            string transactionId = transactionPart.Substring(0, lastUnderscoreIndex);
                                            bienLai.vnpt_transaction_id = transactionId;
                                        }
                                        else
                                        {
                                            // Nếu không có dấu gạch dưới, sử dụng toàn bộ phần sau dấu gạch ngang
                                            bienLai.vnpt_transaction_id = transactionPart;
                                            bienLai.vnpt_invoice_no = transactionPart;
                                        }
                                    }
                                    else
                                    {
                                        // Nếu không có dấu gạch ngang, sử dụng toàn bộ chuỗi làm serial và transaction_id
                                        bienLai.vnpt_serial = parts[1];
                                        bienLai.vnpt_transaction_id = parts[1];
                                    }
                                }
                            }

                            // Cập nhật trạng thái biên lai
                            bienLai.is_published_to_vnpt = true;
                            bienLai.vnpt_publish_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                            bienLai.trang_thai = "da_phat_hanh";

                            // Lưu thay đổi vào database
                            await _context.SaveChangesAsync();

                            // Tạo link xem biên lai nếu có transaction_id
                            string link = "";
                            if (!string.IsNullOrEmpty(bienLai.vnpt_transaction_id))
                            {
                                try
                                {
                                    link = await _vnptBienLaiService.GetLinkInvByFkey(bienLai.vnpt_transaction_id, vnptAccount);
                                    if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                                    {
                                        bienLai.vnpt_link = link;
                                        await _context.SaveChangesAsync();
                                    }
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(ex, $"Không thể lấy link biên lai cho biên lai {bienLai.so_bien_lai}");
                                }
                            }

                            // Thêm kết quả thành công
                            results.Add(new
                            {
                                id = bienLai.id,
                                so_bien_lai = bienLai.so_bien_lai,
                                success = true,
                                message = "Phát hành thành công",
                                data = new
                                {
                                    pattern = bienLai.vnpt_pattern,
                                    serial = bienLai.vnpt_serial,
                                    invoiceNo = bienLai.vnpt_invoice_no,
                                    publishDate = bienLai.vnpt_publish_date,
                                    link = bienLai.vnpt_link,
                                    transactionId = bienLai.vnpt_transaction_id
                                }
                            });
                            successCount++;
                        }
                        else
                        {
                            // Kết quả không xác định
                            results.Add(new
                            {
                                id = bienLai.id,
                                so_bien_lai = bienLai.so_bien_lai,
                                success = false,
                                message = $"Kết quả không xác định: {result}"
                            });
                            errorCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Lỗi khi phát hành biên lai {bienLai.so_bien_lai}");
                        results.Add(new
                        {
                            id = bienLai.id,
                            so_bien_lai = bienLai.so_bien_lai,
                            success = false,
                            message = $"Lỗi: {ex.Message}"
                        });
                        errorCount++;
                    }
                }

                return Ok(new
                {
                    message = $"Đã xử lý {bienLais.Count} biên lai: {successCount} thành công, {errorCount} lỗi",
                    successCount,
                    errorCount,
                    results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi phát hành nhiều biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi phát hành nhiều biên lai điện tử", error = ex.Message });
            }
        }

        // Phương thức này đã được hợp nhất vào PublishToVNPTWithLink
        [HttpPost("{id}/publish-to-vnpt-with-employee-account")]
        public async Task<IActionResult> PublishToVNPTWithEmployeeAccount(int id)
        {
            _logger.LogInformation($"Chuyển hướng yêu cầu phát hành biên lai điện tử lên VNPT với tài khoản nhân viên sang phương thức hợp nhất: {id}");
            return await PublishToVNPTWithLink(id);
        }

        // Phương thức này đã được hợp nhất vào PublishToVNPTWithLink
        [HttpPost("{id}/publish-to-vnpt")]
        public async Task<IActionResult> PublishToVNPT(int id)
        {
            _logger.LogInformation($"Chuyển hướng yêu cầu phát hành biên lai điện tử lên VNPT sang phương thức hợp nhất: {id}");
            return await PublishToVNPTWithLink(id);
        }

        // Phương thức này đã được hợp nhất vào PublishToVNPTWithLink
        [HttpPost("{id}/publish-to-vnpt-direct")]
        public async Task<IActionResult> PublishToVNPTDirect(int id)
        {
            _logger.LogInformation($"Chuyển hướng yêu cầu phát hành biên lai điện tử lên VNPT trực tiếp sang phương thức hợp nhất: {id}");
            return await PublishToVNPTWithLink(id);
        }

        [HttpPost("{id}/publish-to-vnpt-with-link")]
        public async Task<IActionResult> PublishToVNPTWithLink(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu phát hành biên lai điện tử lên VNPT với link: {id}");

                var bienLai = await _context.BienLaiDienTus
                    .FirstOrDefaultAsync(b => b.id == id);
                if (bienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                }

                if (bienLai.is_published_to_vnpt)
                {
                    return BadRequest(new { message = "Biên lai điện tử đã được phát hành lên VNPT" });
                }

                // Phát hành biên lai trên VNPT với link
                // Tạo key tạm thời cho XML
                string key = $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
                _logger.LogInformation($"Generated temporary key for XML: {key}");

                // Gán key tạm thời vào biên lai để sử dụng trong XML
                bienLai.vnpt_key = key;

                // Đảm bảo KeKhaiBHYT được tải đầy đủ
                if (bienLai.ke_khai_bhyt_id.HasValue && bienLai.KeKhaiBHYT == null)
                {
                    bienLai.KeKhaiBHYT = await _context.KeKhaiBHYTs.FindAsync(bienLai.ke_khai_bhyt_id.Value);
                    _logger.LogInformation($"Đã tải KeKhaiBHYT cho biên lai {bienLai.id}: {bienLai.KeKhaiBHYT?.id}");
                }

                // Tạo XML với key tạm thời
                string invoiceXml = _vnptBienLaiService.CreateInvoiceXml(bienLai);
                _logger.LogInformation($"Invoice XML: {invoiceXml}");

                // Kiểm tra xem nội dung thu có được truyền đúng không
                bool containsFullFormatBHYT = invoiceXml.Contains("Thu tiền đóng BHYT - Số tháng đóng");
                bool containsSimpleFormatBHYT = invoiceXml.Contains("Thu tiền đóng BHYT") && !containsFullFormatBHYT;
                bool containsFullFormatBHXH = invoiceXml.Contains("Thu tiền đóng BHXH tự nguyện - Số tháng đóng");
                bool containsSimpleFormatBHXH = invoiceXml.Contains("Thu tiền đóng BHXH tự nguyện") && !containsFullFormatBHXH;

                _logger.LogInformation($"Kiểm tra nội dung thu trong XML: " +
                    $"BHYT ĐầyĐủ={containsFullFormatBHYT}, BHYT ĐơnGiản={containsSimpleFormatBHYT}, " +
                    $"BHXH ĐầyĐủ={containsFullFormatBHXH}, BHXH ĐơnGiản={containsSimpleFormatBHXH}");

                // Kiểm tra mã nhân viên
                if (string.IsNullOrEmpty(bienLai.ma_nhan_vien))
                {
                    return BadRequest(new { message = "Biên lai điện tử không có mã nhân viên" });
                }

                // Sử dụng tài khoản VNPT của nhân viên
                var vnptAccount = await _vnptBienLaiService.GetVNPTAccountByMaNhanVien(bienLai.ma_nhan_vien);
                if (vnptAccount == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {bienLai.ma_nhan_vien}" });
                }

                // Sử dụng ImportAndPublishInv với tài khoản VNPT của nhân viên theo tài liệu tích hợp
                string result = await _vnptBienLaiService.ImportAndPublishInv(invoiceXml, vnptAccount);
                _logger.LogInformation($"Pattern: {vnptAccount.Pattern}, Serial: {vnptAccount.Serial}");
                _logger.LogInformation($"ImportAndPublishInv Result: {result}");

                if (result.StartsWith("ERR:"))
                {
                    // Xử lý các mã lỗi cụ thể từ VNPT
                    string errorMessage = $"Lỗi khi phát hành biên lai trên VNPT: {result}";

                    switch (result)
                    {
                        case "ERR:1":
                            errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng";
                            break;
                        case "ERR:3":
                            errorMessage = "Dữ liệu xml đầu vào không đúng quy định";
                            break;
                        case "ERR:7":
                            errorMessage = "User name không phù hợp, không tìm thấy company tương ứng cho user";
                            break;
                        case "ERR:20":
                            errorMessage = "Pattern và serial không phù hợp, hoặc không tồn tại biên lai đã đăng kí có sử dụng Pattern và serial truyền vào";
                            break;
                        case "ERR:5":
                            errorMessage = "Không phát hành được biên lai";
                            break;
                    }

                    return BadRequest(new { message = errorMessage, error = result });
                }
                else if (result.StartsWith("Error:"))
                {
                    // Xử lý lỗi máy chủ VNPT
                    _logger.LogWarning($"Gặp lỗi máy chủ VNPT với ImportAndPublishInv: {result}");
                    _logger.LogWarning("Thử sử dụng ImportInv thay thế...");

                    string errorMessage = $"Lỗi khi phát hành biên lai trên VNPT: {result}";

                    // Thử sử dụng ImportInv thay thế
                    try
                    {
                        string importResult = await _vnptBienLaiService.PublishInvoice(invoiceXml);
                        _logger.LogInformation($"Kết quả ImportInv: {importResult}");

                        if (importResult.StartsWith("OK:"))
                        {
                            // Phân tích kết quả
                            string[] parts = importResult.Replace("OK:", "").Split(';');
                            _logger.LogInformation($"Phân tích kết quả VNPT: {importResult}, số phần: {parts.Length}");

                            // Xử lý cả trường hợp có 2 hoặc 3 phần
                            if (parts.Length >= 2)
                            {
                                // Cập nhật thông tin biên lai
                                // Lưu pattern
                                bienLai.vnpt_pattern = parts[0];
                                _logger.LogInformation($"Lưu pattern: {parts[0]}");

                                if (parts.Length >= 3)
                                {
                                    // Định dạng chuẩn: OK:pattern;serial;invoiceNo
                                    bienLai.vnpt_serial = parts[1];
                                    bienLai.vnpt_invoice_no = parts[2];
                                    _logger.LogInformation($"Lưu serial: {parts[1]}, invoiceNo: {parts[2]}");

                                    // Theo tài liệu, fkey có thể là một phần của chuỗi kết quả
                                    // Thử tìm fkey trong chuỗi kết quả
                                    if (parts.Length >= 4 && !string.IsNullOrEmpty(parts[3]))
                                    {
                                        // Nếu có phần thứ 4, có thể đó là fkey
                                        bienLai.vnpt_transaction_id = parts[3];
                                        _logger.LogInformation($"Lưu transaction_id từ phần thứ 4: {parts[3]}");
                                    }
                                    else
                                    {
                                        // Nếu không có phần thứ 4, sử dụng invoiceNo làm fkey
                                        bienLai.vnpt_transaction_id = parts[2];
                                        _logger.LogInformation($"Lưu transaction_id từ invoiceNo: {parts[2]}");
                                    }
                                }
                                else
                                {
                                    // Định dạng khác: OK:pattern;serial-key
                                    // Tìm vị trí của dấu gạch ngang cuối cùng
                                    int lastDashIndex = parts[1].LastIndexOf('-');

                                    if (lastDashIndex > 0)
                                    {
                                        // Lưu serial đầy đủ (ví dụ: "BH25-AG/08907/E")
                                        string fullSerial = parts[1].Substring(0, lastDashIndex);
                                        bienLai.vnpt_serial = fullSerial;
                                        _logger.LogInformation($"Lưu serial đầy đủ: {fullSerial}");

                                        // Lấy phần sau dấu gạch ngang cuối cùng
                                        string transactionPart = parts[1].Substring(lastDashIndex + 1);
                                        _logger.LogInformation($"Phần transaction: {transactionPart}");

                                        // Kiểm tra xem có dấu gạch dưới cuối cùng không
                                        int lastUnderscoreIndex = transactionPart.LastIndexOf('_');

                                        if (lastUnderscoreIndex > 0)
                                        {
                                            // Lấy invoice_no (phần sau dấu gạch dưới cuối cùng)
                                            string invoiceNo = transactionPart.Substring(lastUnderscoreIndex + 1);
                                            bienLai.vnpt_invoice_no = invoiceNo;
                                            _logger.LogInformation($"Lưu invoice_no: {invoiceNo}");

                                            // Lấy transaction_id (phần trước dấu gạch dưới cuối cùng)
                                            string transactionId = transactionPart.Substring(0, lastUnderscoreIndex);
                                            bienLai.vnpt_transaction_id = transactionId;
                                            _logger.LogInformation($"Lưu transaction_id: {transactionId}");
                                        }
                                        else
                                        {
                                            // Nếu không có dấu gạch dưới, sử dụng toàn bộ phần sau dấu gạch ngang
                                            bienLai.vnpt_transaction_id = transactionPart;
                                            bienLai.vnpt_invoice_no = transactionPart;
                                            _logger.LogInformation($"Lưu transaction_id và invoice_no: {transactionPart}");
                                        }
                                    }
                                    else
                                    {
                                        // Nếu không có dấu gạch ngang, sử dụng toàn bộ chuỗi làm serial và transaction_id
                                        bienLai.vnpt_serial = parts[1];
                                        bienLai.vnpt_transaction_id = parts[1];
                                        _logger.LogInformation($"Lưu serial và transaction_id: {parts[1]}");
                                    }
                                }

                                bienLai.is_published_to_vnpt = true;
                                bienLai.vnpt_publish_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                                bienLai.vnpt_response = importResult;
                                bienLai.trang_thai = "da_phat_hanh";

                                await _context.SaveChangesAsync();

                                return Ok(new
                                {
                                    message = "Phát hành biên lai điện tử lên VNPT thành công (sử dụng ImportInv)",
                                    data = new
                                    {
                                        id = bienLai.id,
                                        pattern = bienLai.vnpt_pattern,
                                        serial = bienLai.vnpt_serial,
                                        invoiceNo = bienLai.vnpt_invoice_no,
                                        publishDate = bienLai.vnpt_publish_date
                                    }
                                });
                            }
                        }

                        // Nếu ImportInv cũng lỗi, hiển thị thông báo lỗi
                        if (importResult.StartsWith("ERR:"))
                        {
                            switch (importResult)
                            {
                                case "ERR:1":
                                    errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng";
                                    break;
                                case "ERR:3":
                                    errorMessage = "Dữ liệu xml đầu vào không đúng quy định";
                                    break;
                                case "ERR:7":
                                    errorMessage = "User name không phù hợp, không tìm thấy company tương ứng cho user";
                                    break;
                                case "ERR:20":
                                    errorMessage = "Pattern và serial không phù hợp, hoặc không tồn tại biên lai đã đăng kí có sử dụng Pattern và serial truyền vào";
                                    break;
                                case "ERR:5":
                                    errorMessage = "Không phát hành được biên lai";
                                    break;
                                default:
                                    errorMessage = $"Lỗi khi phát hành biên lai trên VNPT: {importResult}";
                                    break;
                            }
                        }
                        else
                        {
                            errorMessage = $"Lỗi không xác định khi phát hành biên lai trên VNPT: {importResult}";
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi thử sử dụng ImportInv thay thế");
                        errorMessage = "Máy chủ VNPT đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ kỹ thuật của VNPT.";
                    }

                    return BadRequest(new { message = errorMessage, error = result });
                }

                // Cập nhật thông tin biên lai
                if (result.StartsWith("OK:"))
                {
                    // Xử lý kết quả dạng chuỗi theo tài liệu tích hợp
                    string[] parts = result.Replace("OK:", "").Split(';');
                    _logger.LogInformation($"Phân tích kết quả VNPT: {result}, số phần: {parts.Length}");

                    // Đảm bảo lưu key gốc đã tạo
                    bienLai.vnpt_key = key;
                    _logger.LogInformation($"Lưu key gốc: {key}");

                    // Lưu kết quả trả về từ API
                    bienLai.vnpt_response = result;
                    _logger.LogInformation($"Lưu kết quả trả về: {result}");

                    if (parts.Length >= 2)
                    {
                        // Lưu pattern
                        bienLai.vnpt_pattern = parts[0];
                        _logger.LogInformation($"Lưu pattern: {parts[0]}");

                        if (parts.Length >= 3)
                        {
                            // Định dạng chuẩn: OK:pattern;serial;invoiceNo
                            bienLai.vnpt_serial = parts[1];
                            bienLai.vnpt_invoice_no = parts[2];
                            _logger.LogInformation($"Lưu serial: {parts[1]}, invoiceNo: {parts[2]}");

                            // Theo tài liệu, fkey có thể là một phần của chuỗi kết quả
                            // Thử tìm fkey trong chuỗi kết quả
                            if (parts.Length >= 4 && !string.IsNullOrEmpty(parts[3]))
                            {
                                // Nếu có phần thứ 4, có thể đó là fkey
                                bienLai.vnpt_transaction_id = parts[3];
                                _logger.LogInformation($"Lưu transaction_id từ phần thứ 4: {parts[3]}");
                            }
                            else
                            {
                                // Nếu không có phần thứ 4, sử dụng invoiceNo làm fkey
                                bienLai.vnpt_transaction_id = parts[2];
                                _logger.LogInformation($"Lưu transaction_id từ invoiceNo: {parts[2]}");
                            }

                            // Lưu XML response nếu model đã có trường này
                            if (bienLai.GetType().GetProperty("vnpt_xml_content") != null)
                            {
                                bienLai.vnpt_xml_content = invoiceXml;
                                _logger.LogInformation($"Lưu XML content");
                            }
                        }
                        else
                        {
                            // Định dạng khác: OK:pattern;serial-key
                            // Tìm vị trí của dấu gạch ngang cuối cùng
                            int lastDashIndex = parts[1].LastIndexOf('-');

                            if (lastDashIndex > 0)
                            {
                                // Lưu serial đầy đủ (ví dụ: "BH25-AG/08907/E")
                                string fullSerial = parts[1].Substring(0, lastDashIndex);
                                bienLai.vnpt_serial = fullSerial;
                                _logger.LogInformation($"Lưu serial đầy đủ: {fullSerial}");

                                // Lấy phần sau dấu gạch ngang cuối cùng
                                string transactionPart = parts[1].Substring(lastDashIndex + 1);
                                _logger.LogInformation($"Phần transaction: {transactionPart}");

                                // Kiểm tra xem có dấu gạch dưới cuối cùng không
                                int lastUnderscoreIndex = transactionPart.LastIndexOf('_');

                                if (lastUnderscoreIndex > 0)
                                {
                                    // Lấy invoice_no (phần sau dấu gạch dưới cuối cùng)
                                    string invoiceNo = transactionPart.Substring(lastUnderscoreIndex + 1);
                                    bienLai.vnpt_invoice_no = invoiceNo;
                                    _logger.LogInformation($"Lưu invoice_no: {invoiceNo}");

                                    // Lấy transaction_id (phần trước dấu gạch dưới cuối cùng)
                                    string transactionId = transactionPart.Substring(0, lastUnderscoreIndex);
                                    bienLai.vnpt_transaction_id = transactionId;
                                    _logger.LogInformation($"Lưu transaction_id: {transactionId}");
                                }
                                else
                                {
                                    // Nếu không có dấu gạch dưới, sử dụng toàn bộ phần sau dấu gạch ngang
                                    bienLai.vnpt_transaction_id = transactionPart;
                                    bienLai.vnpt_invoice_no = transactionPart;
                                    _logger.LogInformation($"Lưu transaction_id và invoice_no: {transactionPart}");
                                }

                                // Lưu XML response nếu model đã có trường này
                                if (bienLai.GetType().GetProperty("vnpt_xml_content") != null)
                                {
                                    bienLai.vnpt_xml_content = invoiceXml;
                                    _logger.LogInformation($"Lưu XML content");
                                }
                            }
                            else
                            {
                                // Nếu không có dấu gạch ngang, sử dụng toàn bộ chuỗi làm serial và transaction_id
                                bienLai.vnpt_serial = parts[1];
                                bienLai.vnpt_transaction_id = parts[1];
                                _logger.LogInformation($"Lưu serial và transaction_id: {parts[1]}");

                                // Lưu XML response nếu model đã có trường này
                                if (bienLai.GetType().GetProperty("vnpt_xml_content") != null)
                                {
                                    bienLai.vnpt_xml_content = invoiceXml;
                                    _logger.LogInformation($"Lưu XML content");
                                }
                            }
                        }
                    }

                    // Cập nhật trạng thái biên lai
                    bienLai.is_published_to_vnpt = true;
                    bienLai.vnpt_publish_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                    bienLai.vnpt_response = result;
                    bienLai.trang_thai = "da_phat_hanh";

                    await _context.SaveChangesAsync();

                    // Tạo link xem biên lai nếu có transaction_id
                    if (!string.IsNullOrEmpty(bienLai.vnpt_transaction_id))
                    {
                        try
                        {
                            string link = await _vnptBienLaiService.GetLinkInvByFkey(bienLai.vnpt_transaction_id, vnptAccount);
                            if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                            {
                                bienLai.vnpt_link = link;
                                await _context.SaveChangesAsync();
                                _logger.LogInformation($"Lưu link biên lai: {link}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Không thể lấy link biên lai");
                        }
                    }

                    return Ok(new
                    {
                        message = "Phát hành biên lai điện tử lên VNPT thành công",
                        data = new
                        {
                            id = bienLai.id,
                            pattern = bienLai.vnpt_pattern,
                            serial = bienLai.vnpt_serial,
                            invoiceNo = bienLai.vnpt_invoice_no,
                            publishDate = bienLai.vnpt_publish_date,
                            link = bienLai.vnpt_link,
                            transactionId = bienLai.vnpt_transaction_id
                        }
                    });
                }

                return BadRequest(new { message = "Không nhận được kết quả hợp lệ từ VNPT" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi phát hành biên lai điện tử lên VNPT với link");
                return StatusCode(500, new { message = "Lỗi khi phát hành biên lai điện tử lên VNPT với link", error = ex.Message });
            }
        }

        [HttpPost("{id}/cancel-vnpt")]
        public async Task<IActionResult> CancelVNPT(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu hủy biên lai điện tử trên VNPT: {id}");

                var bienLai = await _context.BienLaiDienTus
                    .FirstOrDefaultAsync(b => b.id == id);
                if (bienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                }

                if (!bienLai.is_published_to_vnpt)
                {
                    return BadRequest(new { message = "Biên lai điện tử chưa được phát hành lên VNPT" });
                }

                // Kiểm tra xem có transaction_id hoặc key không
                if (string.IsNullOrEmpty(bienLai.vnpt_transaction_id) && string.IsNullOrEmpty(bienLai.vnpt_key))
                {
                    return BadRequest(new { message = "Không tìm thấy thông tin key hoặc transaction_id của biên lai trên VNPT" });
                }

                // Kiểm tra mã nhân viên
                if (string.IsNullOrEmpty(bienLai.ma_nhan_vien))
                {
                    return BadRequest(new { message = "Biên lai điện tử không có mã nhân viên" });
                }

                // Sử dụng tài khoản VNPT của nhân viên
                var vnptAccount = await _vnptBienLaiService.GetVNPTAccountByMaNhanVien(bienLai.ma_nhan_vien);
                if (vnptAccount == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {bienLai.ma_nhan_vien}" });
                }

                // Hủy biên lai trên VNPT với tài khoản VNPT của nhân viên, ưu tiên sử dụng transaction_id nếu có
                string fkey = !string.IsNullOrEmpty(bienLai.vnpt_transaction_id) ? bienLai.vnpt_transaction_id : bienLai.vnpt_key;
                _logger.LogInformation($"Sử dụng fkey: {fkey} để hủy biên lai");
                string result = await _vnptBienLaiService.CancelInvoice(fkey, vnptAccount);

                if (result.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi khi hủy biên lai trên VNPT";
                    bool shouldTryNoPayMethod = false;

                    switch (result)
                    {
                        case "ERR:1":
                            errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng";
                            break;
                        case "ERR:2":
                            errorMessage = "Không tồn tại biên lai cần hủy";
                            break;
                        case "ERR:8":
                            errorMessage = "Biên lai đã được thay thế rồi, hủy rồi";
                            break;
                        case "ERR:9":
                            errorMessage = "Trạng thái biên lai không được hủy (đã thanh toán)";
                            shouldTryNoPayMethod = true; // Thử sử dụng phương thức không kiểm tra thanh toán
                            break;
                        case "ERR:6":
                            errorMessage = "Lỗi không xác định";
                            break;
                        case "ERR:7":
                            errorMessage = "Không tìm thấy thông tin công ty tương ứng";
                            break;
                    }

                    // Nếu lỗi ERR:9 (đã thanh toán), thử sử dụng cancelInvNoPay
                    if (shouldTryNoPayMethod)
                    {
                        _logger.LogInformation($"Thử hủy biên lai không kiểm tra thanh toán với fkey: {fkey}");
                        string noPayResult = await _vnptBienLaiService.CancelInvoiceNoPay(fkey, vnptAccount);

                        if (!noPayResult.StartsWith("ERR:"))
                        {
                            _logger.LogInformation($"Hủy biên lai thành công với phương thức không kiểm tra thanh toán: {noPayResult}");

                            // Cập nhật thông tin biên lai
                            bienLai.tinh_chat = "bien_lai_huy_bo";
                            bienLai.trang_thai = "da_huy";
                            await _context.SaveChangesAsync();

                            return Ok(new
                            {
                                message = "Hủy biên lai điện tử trên VNPT thành công (không kiểm tra thanh toán)",
                                data = new
                                {
                                    id = bienLai.id,
                                    tinhChat = bienLai.tinh_chat,
                                    trangThai = bienLai.trang_thai
                                }
                            });
                        }
                        else
                        {
                            // Nếu vẫn lỗi, trả về lỗi mới
                            _logger.LogWarning($"Vẫn gặp lỗi khi hủy biên lai không kiểm tra thanh toán: {noPayResult}");

                            switch (noPayResult)
                            {
                                case "ERR:1":
                                    errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền";
                                    break;
                                case "ERR:2":
                                    errorMessage = "Không tìm thấy biên lai";
                                    break;
                                case "ERR:8":
                                    errorMessage = "Biên lai đã bị điều chỉnh / hủy / hóa đơn mới tạo không thể hủy được";
                                    break;
                                case "ERR:20":
                                    errorMessage = "Dải hóa đơn hết, User/Account không có quyền với Serial/Pattern và serial không phù hợp";
                                    break;
                                default:
                                    errorMessage = $"Lỗi khi hủy biên lai: {noPayResult}";
                                    break;
                            }
                        }
                    }

                    return BadRequest(new { message = errorMessage, error = result });
                }

                // Cập nhật thông tin biên lai
                bienLai.tinh_chat = "bien_lai_huy_bo";
                bienLai.trang_thai = "da_huy";
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Hủy biên lai điện tử trên VNPT thành công",
                    data = new
                    {
                        id = bienLai.id,
                        tinhChat = bienLai.tinh_chat,
                        trangThai = bienLai.trang_thai
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi hủy biên lai điện tử trên VNPT");
                return StatusCode(500, new { message = "Lỗi khi hủy biên lai điện tử trên VNPT", error = ex.Message });
            }
        }

        #region PortalService Endpoints

        /// <summary>
        /// Tải biên lai điện tử dưới dạng PDF
        /// </summary>
        /// <param name="id">ID biên lai</param>
        /// <returns>File PDF của biên lai</returns>
        [HttpGet("{id}/download-pdf")]
        public async Task<IActionResult> DownloadPdf(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu tải PDF biên lai điện tử: {id}");

                var bienLai = await _context.BienLaiDienTus
                    .FirstOrDefaultAsync(b => b.id == id);
                if (bienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                }

                // Kiểm tra mã nhân viên
                if (string.IsNullOrEmpty(bienLai.ma_nhan_vien))
                {
                    return BadRequest(new { message = "Biên lai điện tử không có mã nhân viên" });
                }

                // Sử dụng tài khoản VNPT của nhân viên
                var vnptAccount = await _vnptBienLaiService.GetVNPTAccountByMaNhanVien(bienLai.ma_nhan_vien);
                if (vnptAccount == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {bienLai.ma_nhan_vien}" });
                }

                // Lấy fkey từ biên lai
                string fkey = !string.IsNullOrEmpty(bienLai.vnpt_transaction_id) ? bienLai.vnpt_transaction_id : bienLai.vnpt_key;
                if (string.IsNullOrEmpty(fkey))
                {
                    return BadRequest(new { message = "Không tìm thấy thông tin key hoặc transaction_id của biên lai trên VNPT" });
                }

                _logger.LogInformation($"Sử dụng fkey: {fkey} để tải PDF biên lai");

                // Tải PDF biên lai
                string base64Pdf = await _vnptBienLaiService.DownloadInvPDFFkeyNoPay(fkey, vnptAccount);

                // Kiểm tra lỗi
                if (base64Pdf.StartsWith("ERR:") || base64Pdf.StartsWith("Error:"))
                {
                    return BadRequest(new { message = $"Lỗi khi tải PDF biên lai từ VNPT: {base64Pdf}" });
                }

                // Chuyển đổi base64 thành byte array
                byte[] pdfBytes = Convert.FromBase64String(base64Pdf);

                // Tạo tên file
                string fileName = $"BienLai_{bienLai.ky_hieu}_{bienLai.so_bien_lai}.pdf";

                // Trả về file PDF
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tải PDF biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi tải PDF biên lai điện tử", error = ex.Message });
            }
        }

        /// <summary>
        /// Xem nội dung biên lai điện tử
        /// </summary>
        /// <param name="id">ID biên lai</param>
        /// <returns>Nội dung HTML của biên lai</returns>
        [HttpGet("{id}/view")]
        public async Task<IActionResult> ViewInvoice(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu xem biên lai điện tử: {id}");

                var bienLai = await _context.BienLaiDienTus
                    .FirstOrDefaultAsync(b => b.id == id);
                if (bienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                }

                if (!bienLai.is_published_to_vnpt)
                {
                    // Kiểm tra xem có XML content không
                    if (!string.IsNullOrEmpty(bienLai.vnpt_xml_content))
                    {
                        _logger.LogInformation($"Biên lai {id} chưa được phát hành lên VNPT nhưng có XML content, thử hiển thị từ XML");

                        // Kiểm tra mã nhân viên
                        if (string.IsNullOrEmpty(bienLai.ma_nhan_vien))
                        {
                            return BadRequest(new { message = "Biên lai điện tử không có mã nhân viên" });
                        }

                        // Sử dụng tài khoản VNPT của nhân viên
                        var vnptAccount = await _vnptBienLaiService.GetVNPTAccountByMaNhanVien(bienLai.ma_nhan_vien);
                        if (vnptAccount == null)
                        {
                            return BadRequest(new { message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {bienLai.ma_nhan_vien}" });
                        }

                        // Tạo key tạm thời nếu không có
                        string fkey = !string.IsNullOrEmpty(bienLai.vnpt_key) ? bienLai.vnpt_key : $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
                        _logger.LogInformation($"Sử dụng fkey: {fkey} để xem biên lai từ XML");

                        // Sử dụng getInvViewFkeyNoPay để hiển thị biên lai từ XML mà không kiểm tra trạng thái thanh toán
                        string result = await _vnptBienLaiService.GetInvViewFkeyNoPay(fkey, vnptAccount);

                        if (!result.StartsWith("Error:") && !result.StartsWith("ERR:"))
                        {
                            // Trả về nội dung HTML của biên lai
                            return Content(result, "text/html");
                        }
                        else
                        {
                            _logger.LogWarning($"Không thể hiển thị biên lai từ XML: {result}");
                        }
                    }

                    return BadRequest(new { message = "Biên lai điện tử chưa được phát hành lên VNPT" });
                }

                // Kiểm tra xem có transaction_id hoặc key không
                if (string.IsNullOrEmpty(bienLai.vnpt_transaction_id) && string.IsNullOrEmpty(bienLai.vnpt_key))
                {
                    return BadRequest(new { message = "Không tìm thấy thông tin key hoặc transaction_id của biên lai trên VNPT" });
                }

                // Kiểm tra mã nhân viên
                if (string.IsNullOrEmpty(bienLai.ma_nhan_vien))
                {
                    return BadRequest(new { message = "Biên lai điện tử không có mã nhân viên" });
                }

                // Sử dụng tài khoản VNPT của nhân viên
                var vnptAccount2 = await _vnptBienLaiService.GetVNPTAccountByMaNhanVien(bienLai.ma_nhan_vien);
                if (vnptAccount2 == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {bienLai.ma_nhan_vien}" });
                }

                // Lấy nội dung biên lai từ VNPT, ưu tiên sử dụng transaction_id nếu có
                string fkey2 = !string.IsNullOrEmpty(bienLai.vnpt_transaction_id) ? bienLai.vnpt_transaction_id : bienLai.vnpt_key;
                _logger.LogInformation($"Sử dụng fkey: {fkey2} để xem biên lai");

                // Thử sử dụng getInvViewFkeyNoPay trước (không kiểm tra trạng thái thanh toán)
                string result2 = await _vnptBienLaiService.GetInvViewFkeyNoPay(fkey2, vnptAccount2);

                // Nếu không thành công, thử sử dụng getInvViewByFkey
                if (result2.StartsWith("Error:") || result2.StartsWith("ERR:"))
                {
                    _logger.LogWarning($"Không thể hiển thị biên lai bằng getInvViewFkeyNoPay: {result2}, thử sử dụng getInvViewByFkey");
                    result2 = await _vnptBienLaiService.GetInvViewByFkey(fkey2, vnptAccount2);
                }

                if (result2.StartsWith("Error:"))
                {
                    return BadRequest(new { message = "Lỗi khi lấy nội dung biên lai từ VNPT", error = result2 });
                }

                if (result2 == "ERR:6")
                {
                    // Lấy link biên lai thay thế
                    string link = await _vnptBienLaiService.GetLinkInvByFkey(fkey2, vnptAccount2);
                    if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                    {
                        // Cập nhật link vào database
                        bienLai.vnpt_link = link;
                        await _context.SaveChangesAsync();

                        // Trả về trang HTML với link
                        string html = $"<html><body><h2>Biên lai điện tử</h2><p>Biên lai điện tử của bạn đã được tạo thành công.</p><p>Bạn có thể xem biên lai tại đường dẫn sau:</p><p><a href='{link}' target='_blank'>{link}</a></p></body></html>";
                        return Content(html, "text/html");
                    }
                    else
                    {
                        return BadRequest(new { message = "Lỗi khi lấy nội dung biên lai từ VNPT (ERR:6 - Không tìm thấy hóa đơn)", error = "ERR:6" });
                    }
                }

                // Trả về nội dung HTML của biên lai
                return Content(result2, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xem biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi xem biên lai điện tử", error = ex.Message });
            }
        }

        #endregion
    }

    // Sử dụng DeleteMultipleDto đã được định nghĩa trong KeKhaiBHYTController
}