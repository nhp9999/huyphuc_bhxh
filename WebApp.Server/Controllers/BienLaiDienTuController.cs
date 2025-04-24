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

                var bienLais = await _context.BienLaiDienTus
                    .Where(b => dto.ids.Contains(b.id))
                    .ToListAsync();

                if (bienLais.Count == 0)
                {
                    return NotFound(new { message = "Không tìm thấy biên lai điện tử nào" });
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

                // Phát hành biên lai trên VNPT với link
                // Tạo key tạm thời cho XML
                string key = $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
                _logger.LogInformation($"Generated temporary key for XML: {key}");

                // Gán key tạm thời vào biên lai để sử dụng trong XML
                bienLai.vnpt_key = key;

                // Tạo XML với key tạm thời
                string invoiceXml = _vnptBienLaiService.CreateInvoiceXml(bienLai);
                _logger.LogInformation($"Invoice XML: {invoiceXml}");

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
                                    // Tách serial và key nếu có dấu '-'
                                    string[] serialParts = parts[1].Split('-');
                                    if (serialParts.Length >= 1)
                                    {
                                        bienLai.vnpt_serial = serialParts[0];
                                        _logger.LogInformation($"Lưu serial: {serialParts[0]}");
                                    }

                                    if (serialParts.Length >= 2)
                                    {
                                        // Nếu có phần thứ 2 sau dấu '-', đó là key/fkey
                                        string fkey = serialParts[1];

                                        // Nếu có dấu ',' trong key, lấy phần đầu tiên
                                        if (fkey.Contains(","))
                                        {
                                            fkey = fkey.Split(',')[0];
                                        }

                                        // Lưu cả key và transaction_id
                                        bienLai.vnpt_key = key; // Giữ lại key gốc đã tạo
                                        bienLai.vnpt_transaction_id = fkey;
                                        _logger.LogInformation($"Lưu transaction_id: {fkey}");

                                        // Lấy số biên lai từ key nếu có thể
                                        bienLai.vnpt_invoice_no = fkey;
                                        _logger.LogInformation($"Lưu invoice_no: {fkey}");
                                    }
                                    else
                                    {
                                        // Nếu không có phần thứ 2, sử dụng serial làm fkey
                                        bienLai.vnpt_transaction_id = serialParts[0];
                                        _logger.LogInformation($"Lưu transaction_id từ serial: {serialParts[0]}");
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

                                // Lấy transaction_id (phần sau dấu gạch ngang cuối cùng)
                                string fkey = parts[1].Substring(lastDashIndex + 1);

                                // Nếu có dấu ',' trong key, lấy phần đầu tiên
                                if (fkey.Contains(","))
                                {
                                    fkey = fkey.Split(',')[0];
                                }

                                // Lưu transaction_id
                                bienLai.vnpt_transaction_id = fkey;
                                _logger.LogInformation($"Lưu transaction_id: {fkey}");

                                // Lấy số biên lai từ key nếu có thể
                                bienLai.vnpt_invoice_no = fkey;
                                _logger.LogInformation($"Lưu invoice_no: {fkey}");

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

        #region PortalService Endpoints

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

                // Lấy nội dung biên lai từ VNPT, ưu tiên sử dụng transaction_id nếu có
                string fkey = !string.IsNullOrEmpty(bienLai.vnpt_transaction_id) ? bienLai.vnpt_transaction_id : bienLai.vnpt_key;
                _logger.LogInformation($"Sử dụng fkey: {fkey} để xem biên lai");
                string result = await _vnptBienLaiService.GetInvViewByFkey(fkey, vnptAccount);

                if (result.StartsWith("Error:"))
                {
                    return BadRequest(new { message = "Lỗi khi lấy nội dung biên lai từ VNPT", error = result });
                }

                if (result == "ERR:6")
                {
                    // Lấy link biên lai thay thế
                    string link = await _vnptBienLaiService.GetLinkInvByFkey(fkey, vnptAccount);
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
                        return BadRequest(new { message = "Lỗi khi lấy nội dung biên lai từ VNPT (ERR:6 - Dải biên lai cũ đã hết)", error = "ERR:6" });
                    }
                }

                // Trả về nội dung HTML của biên lai
                return Content(result, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xem biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi xem biên lai điện tử", error = ex.Message });
            }
        }

        /// <summary>
        /// Tải xuống biên lai điện tử dạng PDF
        /// </summary>
        /// <param name="id">ID biên lai</param>
        /// <returns>File PDF của biên lai</returns>
        [HttpGet("{id}/download-pdf")]
        public async Task<IActionResult> DownloadInvoicePDF(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu tải xuống biên lai điện tử dạng PDF: {id}");

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

                // Lấy nội dung PDF của biên lai từ VNPT, ưu tiên sử dụng transaction_id nếu có
                string fkey = !string.IsNullOrEmpty(bienLai.vnpt_transaction_id) ? bienLai.vnpt_transaction_id : bienLai.vnpt_key;
                _logger.LogInformation($"Sử dụng fkey: {fkey} để tải xuống PDF biên lai");
                string base64PDF = await _vnptBienLaiService.DownloadInvPDFByFkey(fkey, vnptAccount);

                if (base64PDF.StartsWith("Error:"))
                {
                    // Kiểm tra xem lỗi có chứa link biên lai không
                    if (base64PDF.Contains("Vui lòng sử dụng link sau để xem biên lai:"))
                    {
                        // Trích xuất link từ thông báo lỗi
                        string link = base64PDF.Substring(base64PDF.IndexOf("http"));

                        // Chuyển hướng người dùng đến link biên lai
                        return Redirect(link);
                    }

                    return BadRequest(new { message = "Lỗi khi tải xuống biên lai dạng PDF từ VNPT", error = base64PDF });
                }

                if (base64PDF == "ERR:6")
                {
                    // Lấy link biên lai thay thế
                    string link = await _vnptBienLaiService.GetLinkInvByFkey(fkey, vnptAccount);
                    if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                    {
                        // Cập nhật link vào database
                        bienLai.vnpt_link = link;
                        await _context.SaveChangesAsync();

                        // Chuyển hướng người dùng đến link biên lai
                        return Redirect(link);
                    }
                    else
                    {
                        return BadRequest(new { message = "Lỗi khi tải xuống biên lai dạng PDF từ VNPT (ERR:6 - Dải biên lai cũ đã hết)", error = "ERR:6" });
                    }
                }

                // Chuyển đổi base64 thành byte array
                byte[] pdfBytes = Convert.FromBase64String(base64PDF);

                // Tạo tên file
                string fileName = $"BienLai_{bienLai.ma_so_bhxh}_{bienLai.so_bien_lai}.pdf";

                // Trả về file PDF
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tải xuống biên lai điện tử dạng PDF");
                return StatusCode(500, new { message = "Lỗi khi tải xuống biên lai điện tử dạng PDF", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy link biên lai điện tử
        /// </summary>
        /// <param name="id">ID biên lai</param>
        /// <returns>Link đến biên lai</returns>
        [HttpGet("{id}/get-link")]
        public async Task<IActionResult> GetInvoiceLink(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu lấy link biên lai điện tử: {id}");

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

                // Nếu đã có link trong database, trả về luôn
                if (!string.IsNullOrEmpty(bienLai.vnpt_link))
                {
                    return Ok(new { link = bienLai.vnpt_link });
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

                // Lấy link biên lai từ VNPT, ưu tiên sử dụng transaction_id nếu có
                string fkey = !string.IsNullOrEmpty(bienLai.vnpt_transaction_id) ? bienLai.vnpt_transaction_id : bienLai.vnpt_key;
                _logger.LogInformation($"Sử dụng fkey: {fkey} để lấy link biên lai");
                string link = await _vnptBienLaiService.GetLinkInvByFkey(fkey, vnptAccount);

                if (link.StartsWith("Error:"))
                {
                    return BadRequest(new { message = "Lỗi khi lấy link biên lai từ VNPT", error = link });
                }

                // Cập nhật link vào database
                bienLai.vnpt_link = link;
                await _context.SaveChangesAsync();

                // Trả về link
                return Ok(new { link = link });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy link biên lai điện tử");
                return StatusCode(500, new { message = "Lỗi khi lấy link biên lai điện tử", error = ex.Message });
            }
        }

        #endregion
    }

    // Sử dụng DeleteMultipleDto đã được định nghĩa trong KeKhaiBHYTController
}