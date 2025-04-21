using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.API.Models.BienlaiDienTu;
using WebApp.API.Services;

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

        [HttpPost("{id}/publish-to-vnpt")]
        public async Task<IActionResult> PublishToVNPT(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu phát hành biên lai điện tử lên VNPT: {id}");

                var bienLai = await _context.BienLaiDienTus
                    .Include(b => b.KeKhaiBHYT)
                    .FirstOrDefaultAsync(b => b.id == id);
                if (bienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                }

                if (bienLai.is_published_to_vnpt)
                {
                    return BadRequest(new { message = "Biên lai điện tử đã được phát hành lên VNPT" });
                }

                // Bỏ qua bước cập nhật khách hàng trên VNPT

                // Phát hành biên lai trên VNPT
                string invoiceXml = _vnptBienLaiService.CreateInvoiceXml(bienLai);
                _logger.LogInformation($"Invoice XML: {invoiceXml}");

                // Lưu key vào biên lai
                string key = $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
                bienLai.vnpt_key = key;
                _logger.LogInformation($"Generated key: {key}");

                // Sử dụng serial mặc định từ cấu hình
                string invoiceResult = await _vnptBienLaiService.PublishInvoice(invoiceXml);
                _logger.LogInformation($"Pattern: {_vnptBienLaiService.GetPattern()}, Serial: {_vnptBienLaiService.GetSerial()}");
                _logger.LogInformation($"Invoice Result: {invoiceResult}");

                if (invoiceResult.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi khi phát hành biên lai trên VNPT";
                    switch (invoiceResult)
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

                    return BadRequest(new { message = errorMessage, error = invoiceResult });
                }

                // Cập nhật thông tin biên lai
                if (invoiceResult.StartsWith("OK:"))
                {
                    // Phân tích kết quả để lấy thông tin pattern, serial và số biên lai
                    // Ví dụ: OK:01GTKT3/001;AA/12E;0000001
                    string[] parts = invoiceResult.Replace("OK:", "").Split(';');
                    if (parts.Length >= 3)
                    {
                        bienLai.vnpt_pattern = parts[0];
                        bienLai.vnpt_serial = parts[1];
                        bienLai.vnpt_invoice_no = parts[2];
                    }

                    bienLai.is_published_to_vnpt = true;
                    bienLai.vnpt_publish_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                    bienLai.vnpt_response = invoiceResult;
                    bienLai.trang_thai = "da_phat_hanh";

                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        message = "Phát hành biên lai điện tử lên VNPT thành công",
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

                return BadRequest(new { message = "Lỗi không xác định khi phát hành biên lai", error = invoiceResult });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi phát hành biên lai điện tử lên VNPT");
                return StatusCode(500, new { message = "Lỗi khi phát hành biên lai điện tử lên VNPT", error = ex.Message });
            }
        }

        [HttpPost("{id}/cancel-vnpt")]
        public async Task<IActionResult> CancelVNPT(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu hủy biên lai điện tử trên VNPT: {id}");

                var bienLai = await _context.BienLaiDienTus
                    .Include(b => b.KeKhaiBHYT)
                    .FirstOrDefaultAsync(b => b.id == id);
                if (bienLai == null)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử" });
                }

                if (!bienLai.is_published_to_vnpt)
                {
                    return BadRequest(new { message = "Biên lai điện tử chưa được phát hành lên VNPT" });
                }

                if (string.IsNullOrEmpty(bienLai.vnpt_key))
                {
                    return BadRequest(new { message = "Không tìm thấy thông tin key của biên lai trên VNPT" });
                }

                // Hủy biên lai trên VNPT
                string result = await _vnptBienLaiService.CancelInvoice(bienLai.vnpt_key);

                if (result.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi khi hủy biên lai trên VNPT";
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
                            errorMessage = "Trạng thái biên lai ko được hủy";
                            break;
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
    }
}