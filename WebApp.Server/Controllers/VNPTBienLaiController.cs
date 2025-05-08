using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WebApp.API.Data;
using WebApp.API.Models.BienlaiDienTu;
using WebApp.API.Services;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/vnpt-bien-lai")]
    public class VNPTBienLaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VNPTBienLaiController> _logger;
        private readonly VNPTBienLaiService _vnptBienLaiService;

        public VNPTBienLaiController(
            ApplicationDbContext context,
            ILogger<VNPTBienLaiController> logger,
            VNPTBienLaiService vnptBienLaiService)
        {
            _context = context;
            _logger = logger;
            _vnptBienLaiService = vnptBienLaiService;
        }

        [HttpPost("create-customer")]
        public async Task<IActionResult> CreateCustomer(CreateCustomerRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu tạo khách hàng: {JsonSerializer.Serialize(request)}");

                if (request == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Tạo XML dữ liệu khách hàng
                string xmlCusData = $@"<Customers>
                    <Customer>
                        <n>{request.TenNguoiDong}</n>
                        <Code>{request.MaSoBHXH}</Code>
                        <TaxCode>{request.MaSoBHXH}</TaxCode>
                        <Address>{request.DiaChi}</Address>
                        <BankAccountName></BankAccountName>
                        <BankName></BankName>
                        <BankNumber></BankNumber>
                        <Email>{request.Email}</Email>
                        <Fax></Fax>
                        <Phone>{request.SoDienThoai}</Phone>
                        <ContactPerson></ContactPerson>
                        <RepresentPerson></RepresentPerson>
                        <CusType>{request.LoaiKhachHang}</CusType>
                    </Customer>
                </Customers>";

                // Gọi API UpdateCus
                string result = await _vnptBienLaiService.UpdateCustomer(xmlCusData);

                // Xử lý kết quả
                if (result.StartsWith("-"))
                {
                    string errorMessage = "Lỗi không xác định";
                    switch (result)
                    {
                        case "-1":
                            errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng";
                            break;
                        case "-2":
                            errorMessage = "Không import được khách hàng vào db";
                            break;
                        case "-3":
                            errorMessage = "Dữ liệu xml đầu vào không đúng quy định";
                            break;
                    }

                    return BadRequest(new VNPTBienLaiResponse
                    {
                        Success = false,
                        Message = errorMessage,
                        Data = result
                    });
                }

                return Ok(new VNPTBienLaiResponse
                {
                    Success = true,
                    Message = "Tạo khách hàng thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo khách hàng");
                return StatusCode(500, new VNPTBienLaiResponse
                {
                    Success = false,
                    Message = "Lỗi khi tạo khách hàng: " + ex.Message
                });
            }
        }

        [HttpPost("publish-invoice")]
        public async Task<IActionResult> PublishInvoice(PublishInvoiceRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu phát hành biên lai: {JsonSerializer.Serialize(request)}");

                if (request == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Lấy thông tin biên lai từ database
                BienLaiDienTu bienLai = null;
                if (request.BienLaiId > 0)
                {
                    bienLai = await _context.BienLaiDienTus.FindAsync(request.BienLaiId);
                    if (bienLai == null)
                    {
                        return NotFound(new { message = "Không tìm thấy biên lai" });
                    }
                }
                else
                {
                    // Tạo biên lai mới nếu không có ID
                    bienLai = new BienLaiDienTu
                    {
                        ten_nguoi_dong = request.TenNguoiDong,
                        ma_so_bhxh = request.MaSoBHXH,
                        so_tien = request.SoTien,
                        ghi_chu = request.GhiChu,
                        is_bhyt = request.IsBHYT,
                        is_bhxh = request.IsBHXH,
                        ngay_tao = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
                        ngay_bien_lai = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)
                    };
                }

                // Tạo XML dữ liệu biên lai
                string key = $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
                // Sử dụng ngày tạo biên lai làm ngày tạo biên lai VNPT
                string arisingDate = bienLai.ngay_tao.ToString("dd/MM/yyyy");
                string extra = bienLai.is_bhyt ? "Phí BHYT" : "Phí BHXH";

                string xmlInvData = $@"<Invoices>
                    <Inv>
                        <key>{key}</key>
                        <Invoice>
                            <CusCode>{bienLai.ma_so_bhxh}</CusCode>
                            <ArisingDate>{arisingDate}</ArisingDate>
                            <CusName>{bienLai.ten_nguoi_dong}</CusName>
                            <Total>0</Total>
                            <Amount>{bienLai.so_tien}</Amount>
                            <AmountInWords></AmountInWords>
                            <VATAmount>0</VATAmount>
                            <VATRate>0</VATRate>
                            <CusAddress></CusAddress>
                            <PaymentMethod>TM</PaymentMethod>
                            <Extra>{extra}</Extra>
                            <Products>
                                <Product>
                                    <Code></Code>
                                    <ProdName></ProdName>
                                    <ProdUnit></ProdUnit>
                                    <ProdQuantity></ProdQuantity>
                                    <ProdPrice></ProdPrice>
                                    <Total></Total>
                                    <Amount></Amount>
                                </Product>
                            </Products>
                        </Invoice>
                    </Inv>
                </Invoices>";

                // Gọi API ImportAndPublishInv theo tài liệu tích hợp
                string result = await _vnptBienLaiService.ImportAndPublishInv(xmlInvData);

                // Xử lý kết quả
                if (result.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi không xác định";
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

                    return BadRequest(new VNPTBienLaiResponse
                    {
                        Success = false,
                        Message = errorMessage,
                        Data = result
                    });
                }

                // Cập nhật thông tin biên lai
                if (result.StartsWith("OK:"))
                {
                    // Phân tích kết quả theo tài liệu tích hợp
                    string[] parts = result.Replace("OK:", "").Split(';');
                    _logger.LogInformation($"Phân tích kết quả VNPT: {result}, số phần: {parts.Length}");

                    // Đảm bảo lưu key gốc đã tạo
                    bienLai.vnpt_key = key;
                    _logger.LogInformation($"Lưu key gốc: {key}");

                    // Lưu kết quả trả về từ API
                    bienLai.vnpt_response = result;
                    _logger.LogInformation($"Lưu kết quả trả về: {result}");

                    // Lưu XML content nếu model đã có trường này
                    if (bienLai.GetType().GetProperty("vnpt_xml_content") != null)
                    {
                        bienLai.vnpt_xml_content = xmlInvData;
                        _logger.LogInformation($"Lưu XML content");
                    }

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
                    }

                    // Lưu thông tin biên lai vào database nếu là biên lai mới
                    if (request.BienLaiId == 0)
                    {
                        _context.BienLaiDienTus.Add(bienLai);
                        await _context.SaveChangesAsync();
                    }

                    // Cập nhật trạng thái biên lai
                    bienLai.trang_thai = "da_phat_hanh";
                    bienLai.is_published_to_vnpt = true;
                    bienLai.vnpt_publish_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                    bienLai.vnpt_response = result;
                    await _context.SaveChangesAsync();
                }

                return Ok(new VNPTBienLaiResponse
                {
                    Success = true,
                    Message = "Phát hành biên lai thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi phát hành biên lai");
                return StatusCode(500, new VNPTBienLaiResponse
                {
                    Success = false,
                    Message = "Lỗi khi phát hành biên lai: " + ex.Message
                });
            }
        }

        [HttpPost("adjust-invoice")]
        public async Task<IActionResult> AdjustInvoice(AdjustInvoiceRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu điều chỉnh biên lai: {JsonSerializer.Serialize(request)}");

                if (request == null || string.IsNullOrEmpty(request.FKey))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Tạo XML dữ liệu biên lai điều chỉnh
                string key = $"{request.MaSoBHXH}_{DateTime.Now.Ticks}";
                string extra = request.IsBHYT ? "Phí BHYT" : "Phí BHXH";

                string xmlInvData = $@"<AdjustInv>
                    <key>{key}</key>
                    <CusCode>{request.MaSoBHXH}</CusCode>
                    <CusName>{request.TenNguoiDong}</CusName>
                    <CusAddress></CusAddress>
                    <CusPhone></CusPhone>
                    <CusTaxCode>{request.MaSoBHXH}</CusTaxCode>
                    <PaymentMethod>TM</PaymentMethod>
                    <KindOfService></KindOfService>
                    <Type>{request.LoaiDieuChinh}</Type>
                    <Products>
                        <Product>
                            <ProdName>{extra}</ProdName>
                            <ProdUnit></ProdUnit>
                            <ProdQuantity>1</ProdQuantity>
                            <ProdPrice>{request.SoTien}</ProdPrice>
                            <Amount>{request.SoTien}</Amount>
                        </Product>
                    </Products>
                    <Total>{request.SoTien}</Total>
                    <VATRate>0</VATRate>
                    <VATAmount>0</VATAmount>
                    <Amount>{request.SoTien}</Amount>
                    <AmountInWords></AmountInWords>
                    <Extra>{extra}</Extra>
                </AdjustInv>";

                // Gọi API AdjustInvoiceAction
                string result = await _vnptBienLaiService.AdjustInvoice(xmlInvData, request.FKey);

                // Xử lý kết quả
                if (result.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi không xác định";
                    switch (result)
                    {
                        case "ERR:1":
                            errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng";
                            break;
                        case "ERR:2":
                            errorMessage = "Biên lai cần điều chỉnh không tồn tại";
                            break;
                        case "ERR:3":
                            errorMessage = "Dữ liệu xml đầu vào không đúng quy định";
                            break;
                        case "ERR:5":
                            errorMessage = "Không phát hành được biên lai";
                            break;
                        case "ERR:6":
                            errorMessage = "Dải biên lai cũ đã hết";
                            break;
                        case "ERR:7":
                            errorMessage = "User name không phù hợp, không tìm thấy company tương ứng cho user";
                            break;
                        case "ERR:8":
                            errorMessage = "Biên lai cần điều chỉnh đã bị thay thế. Không thể điều chỉnh được nữa";
                            break;
                        case "ERR:9":
                            errorMessage = "Trạng thái biên lai không được điều chỉnh";
                            break;
                    }

                    return BadRequest(new VNPTBienLaiResponse
                    {
                        Success = false,
                        Message = errorMessage,
                        Data = result
                    });
                }

                return Ok(new VNPTBienLaiResponse
                {
                    Success = true,
                    Message = "Điều chỉnh biên lai thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi điều chỉnh biên lai");
                return StatusCode(500, new VNPTBienLaiResponse
                {
                    Success = false,
                    Message = "Lỗi khi điều chỉnh biên lai: " + ex.Message
                });
            }
        }

        [HttpPost("replace-invoice")]
        public async Task<IActionResult> ReplaceInvoice(ReplaceInvoiceRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu thay thế biên lai: {JsonSerializer.Serialize(request)}");

                if (request == null || string.IsNullOrEmpty(request.FKey))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Tạo XML dữ liệu biên lai thay thế
                string key = $"{request.MaSoBHXH}_{DateTime.Now.Ticks}";
                string extra = request.IsBHYT ? "Phí BHYT" : "Phí BHXH";

                string xmlInvData = $@"<ReplaceInv>
                    <key>{key}</key>
                    <CusCode>{request.MaSoBHXH}</CusCode>
                    <CusName>{request.TenNguoiDong}</CusName>
                    <CusAddress></CusAddress>
                    <CusPhone></CusPhone>
                    <CusTaxCode>{request.MaSoBHXH}</CusTaxCode>
                    <PaymentMethod>TM</PaymentMethod>
                    <KindOfService></KindOfService>
                    <Products>
                        <Product>
                            <ProdName>{extra}</ProdName>
                            <ProdUnit></ProdUnit>
                            <ProdQuantity>1</ProdQuantity>
                            <ProdPrice>{request.SoTien}</ProdPrice>
                            <Amount>{request.SoTien}</Amount>
                        </Product>
                    </Products>
                    <Total>{request.SoTien}</Total>
                    <VATRate>0</VATRate>
                    <VATAmount>0</VATAmount>
                    <Amount>{request.SoTien}</Amount>
                    <AmountInWords></AmountInWords>
                    <Extra>{extra}</Extra>
                </ReplaceInv>";

                // Gọi API ReplaceInvoiceAction
                string result = await _vnptBienLaiService.ReplaceInvoice(xmlInvData, request.FKey);

                // Xử lý kết quả
                if (result.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi không xác định";
                    switch (result)
                    {
                        case "ERR:1":
                            errorMessage = "Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng";
                            break;
                        case "ERR:2":
                            errorMessage = "Không tồn tại biên lai cần thay thế";
                            break;
                        case "ERR:3":
                            errorMessage = "Dữ liệu xml đầu vào không đúng quy định";
                            break;
                        case "ERR:5":
                            errorMessage = "Có lỗi trong quá trình thay thế biên lai";
                            break;
                        case "ERR:6":
                            errorMessage = "Dải biên lai cũ đã hết";
                            break;
                        case "ERR:7":
                            errorMessage = "User name không phù hợp, không tìm thấy company tương ứng cho user";
                            break;
                        case "ERR:8":
                            errorMessage = "Biên lai đã được thay thế rồi. Không thể thay thế nữa";
                            break;
                        case "ERR:20":
                            errorMessage = "Pattern và serial không phù hợp";
                            break;
                        case "ERR:9":
                            errorMessage = "Trạng thái biên lai ko được thay thế";
                            break;
                    }

                    return BadRequest(new VNPTBienLaiResponse
                    {
                        Success = false,
                        Message = errorMessage,
                        Data = result
                    });
                }

                return Ok(new VNPTBienLaiResponse
                {
                    Success = true,
                    Message = "Thay thế biên lai thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thay thế biên lai");
                return StatusCode(500, new VNPTBienLaiResponse
                {
                    Success = false,
                    Message = "Lỗi khi thay thế biên lai: " + ex.Message
                });
            }
        }

        [HttpPost("cancel-invoice")]
        public async Task<IActionResult> CancelInvoice(CancelInvoiceRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu hủy biên lai: {JsonSerializer.Serialize(request)}");

                if (request == null || string.IsNullOrEmpty(request.FKey))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Gọi API cancelInv
                string result = await _vnptBienLaiService.CancelInvoice(request.FKey);

                // Xử lý kết quả
                if (result.StartsWith("ERR:"))
                {
                    string errorMessage = "Lỗi không xác định";
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
                        _logger.LogInformation($"Thử hủy biên lai không kiểm tra thanh toán với fkey: {request.FKey}");
                        string noPayResult = await _vnptBienLaiService.CancelInvoiceNoPay(request.FKey);

                        if (!noPayResult.StartsWith("ERR:"))
                        {
                            return Ok(new VNPTBienLaiResponse
                            {
                                Success = true,
                                Message = "Hủy biên lai thành công (không kiểm tra thanh toán)",
                                Data = noPayResult
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

                            return BadRequest(new VNPTBienLaiResponse
                            {
                                Success = false,
                                Message = errorMessage,
                                Data = noPayResult
                            });
                        }
                    }

                    return BadRequest(new VNPTBienLaiResponse
                    {
                        Success = false,
                        Message = errorMessage,
                        Data = result
                    });
                }

                return Ok(new VNPTBienLaiResponse
                {
                    Success = true,
                    Message = "Hủy biên lai thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi hủy biên lai");
                return StatusCode(500, new VNPTBienLaiResponse
                {
                    Success = false,
                    Message = "Lỗi khi hủy biên lai: " + ex.Message
                });
            }
        }
    }
}
