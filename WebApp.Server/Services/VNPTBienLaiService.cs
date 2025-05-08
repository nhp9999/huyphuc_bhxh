using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebApp.API.Data;
using WebApp.API.Models.BienlaiDienTu;

namespace WebApp.API.Services
{
    public class VNPTBienLaiService
    {
        private readonly ILogger<VNPTBienLaiService> _logger;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly string _serviceUrl;
        private readonly string _portalServiceUrl;
        private readonly string _username;
        private readonly string _password;
        private readonly string _account;
        private readonly string _acpass;
        private readonly string _pattern;
        private readonly string _serial;

        public VNPTBienLaiService(ILogger<VNPTBienLaiService> logger, IConfiguration configuration, ApplicationDbContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _context = context;

            // Lấy thông tin cấu hình từ appsettings.json
            _serviceUrl = _configuration["VNPTBienLai:ServiceUrl"] ?? "https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx";
            _portalServiceUrl = _configuration["VNPTBienLai:PortalServiceUrl"] ?? "https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PortalService.asmx";
            _username = _configuration["VNPTBienLai:Username"] ?? "ctyhuyphucpws";
            _password = _configuration["VNPTBienLai:Password"] ?? "Vnpt@1234";
            _account = _configuration["VNPTBienLai:Account"] ?? "NV089182025056";
            _acpass = _configuration["VNPTBienLai:ACPass"] ?? "Dinh@56789";
            _pattern = _configuration["VNPTBienLai:Pattern"] ?? "C45-BB0/002";
            _serial = _configuration["VNPTBienLai:Serial"] ?? "BH25-AG/08907/E";
        }

        /// <summary>
        /// Lấy Pattern từ cấu hình
        /// </summary>
        /// <returns>Pattern</returns>
        public string GetPattern()
        {
            return _pattern;
        }

        /// <summary>
        /// Lấy Serial từ cấu hình
        /// </summary>
        /// <returns>Serial</returns>
        public string GetSerial()
        {
            return _serial;
        }

        /// <summary>
        /// Lấy thông tin tài khoản VNPT theo mã nhân viên
        /// </summary>
        /// <param name="maNhanVien">Mã nhân viên</param>
        /// <returns>Thông tin tài khoản VNPT</returns>
        public async Task<VNPTAccount> GetVNPTAccountByMaNhanVien(string maNhanVien)
        {
            try
            {
                return await _context.VNPTAccounts
                    .Where(a => a.MaNhanVien == maNhanVien && a.IsActive)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy tài khoản VNPT theo mã nhân viên {maNhanVien}");
                return null;
            }
        }

        /// <summary>
        /// Tạo và phát hành biên lai với tài khoản VNPT của nhân viên
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai</param>
        /// <param name="maNhanVien">Mã nhân viên</param>
        /// <returns>Kết quả phát hành với link</returns>
        public async Task<ImportAndPublishInvWithLinkResult> ImportAndPublishInvWithLinkByMaNhanVien(string xmlInvData, string maNhanVien)
        {
            try
            {
                // Lấy thông tin tài khoản VNPT của nhân viên
                var vnptAccount = await GetVNPTAccountByMaNhanVien(maNhanVien);
                if (vnptAccount == null)
                {
                    _logger.LogWarning($"Không tìm thấy tài khoản VNPT cho mã nhân viên {maNhanVien}");
                    return new ImportAndPublishInvWithLinkResult
                    {
                        Status = "ERROR",
                        Message = $"Không tìm thấy tài khoản VNPT cho mã nhân viên {maNhanVien}"
                    };
                }

                // Sử dụng phương thức chung ImportAndPublishInvWithLink
                return await ImportAndPublishInvWithLink(xmlInvData, vnptAccount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi gọi API ImportAndPublishInvWithLink với mã nhân viên {maNhanVien}");
                return new ImportAndPublishInvWithLinkResult
                {
                    Status = "ERROR",
                    Message = $"Lỗi: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Cập nhật dữ liệu khách hàng
        /// </summary>
        /// <param name="xmlCusData">XML dữ liệu khách hàng</param>
        /// <returns>Kết quả cập nhật</returns>
        public async Task<string> UpdateCustomer(string xmlCusData)
        {
            try
            {
                _logger.LogInformation($"Gọi API UpdateCus với dữ liệu: {xmlCusData}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <UpdateCus xmlns=""http://tempuri.org/"">
      <XMLCusData><![CDATA[{xmlCusData}]]></XMLCusData>
      <username>{_account}</username>
      <pass>{_acpass}</pass>
      <convert>0</convert>
    </UpdateCus>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(_serviceUrl, "http://tempuri.org/UpdateCus", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:UpdateCusResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả UpdateCus: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API UpdateCus");
                throw;
            }
        }

        /// <summary>
        /// Tạo biên lai (ImportInv) - Chỉ tạo biên lai, không phát hành
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <param name="serial">Serial biên lai (tùy chọn)</param>
        /// <returns>Kết quả tạo biên lai</returns>
        public async Task<string> PublishInvoice(string xmlInvData, VNPTAccount? vnptAccount = null, string? serial = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API ImportInv với dữ liệu: {xmlInvData}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string account = vnptAccount?.Account ?? _account;
                string pattern = vnptAccount?.Pattern ?? _pattern;
                string serialToUse = serial ?? vnptAccount?.Serial ?? _serial;
                string serviceUrl = vnptAccount?.ServiceUrl ?? _serviceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <ImportInv xmlns=""http://tempuri.org/"">
      <xmlInvData><![CDATA[{xmlInvData}]]></xmlInvData>
      <username>{username}</username>
      <password>{password}</password>
      <convert>0</convert>
      <tkTao>{account}</tkTao>
      <pattern>{pattern}</pattern>
      <serial>{serialToUse}</serial>
    </ImportInv>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"Pattern: {pattern}, Serial: {serialToUse}");
                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(serviceUrl, "http://tempuri.org/ImportInv", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:ImportInvResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả ImportInv: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API ImportInv");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Điều chỉnh biên lai
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai điều chỉnh</param>
        /// <param name="fkey">Chuỗi xác định biên lai cần điều chỉnh</param>
        /// <returns>Kết quả điều chỉnh</returns>
        public async Task<string> AdjustInvoice(string xmlInvData, string fkey)
        {
            try
            {
                _logger.LogInformation($"Gọi API AdjustInvoiceAction với dữ liệu: {xmlInvData}, fkey: {fkey}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
                <soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
                  <soap:Body>
                    <AdjustInvoiceAction xmlns=""http://tempuri.org/"">
                      <Account>{_account}</Account>
                      <ACpass>{_acpass}</ACpass>
                      <xmlInvData>{xmlInvData}</xmlInvData>
                      <username>{_username}</username>
                      <pass>{_password}</pass>
                      <fkey>{fkey}</fkey>
                      <AttachFile></AttachFile>
                      <convert>0</convert>
                      <pattern>{_pattern}</pattern>
                      <serial>{_serial}</serial>
                    </AdjustInvoiceAction>
                  </soap:Body>
                </soap:Envelope>";

                // Gọi SOAP API
                string response = await CallSoapApi(_serviceUrl, "http://tempuri.org/AdjustInvoiceAction", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:AdjustInvoiceActionResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả AdjustInvoiceAction: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API AdjustInvoiceAction");
                throw;
            }
        }

        /// <summary>
        /// Thay thế biên lai
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai thay thế</param>
        /// <param name="fkey">Chuỗi xác định biên lai cần thay thế</param>
        /// <returns>Kết quả thay thế</returns>
        public async Task<string> ReplaceInvoice(string xmlInvData, string fkey)
        {
            try
            {
                _logger.LogInformation($"Gọi API ReplaceInvoiceAction với dữ liệu: {xmlInvData}, fkey: {fkey}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
                <soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
                  <soap:Body>
                    <ReplaceInvoiceAction xmlns=""http://tempuri.org/"">
                      <Account>{_account}</Account>
                      <Acpass>{_acpass}</Acpass>
                      <xmlInvData>{xmlInvData}</xmlInvData>
                      <username>{_username}</username>
                      <pass>{_password}</pass>
                      <fkey>{fkey}</fkey>
                      <Attachfile></Attachfile>
                      <convert>0</convert>
                      <pattern>{_pattern}</pattern>
                      <serial>{_serial}</serial>
                    </ReplaceInvoiceAction>
                  </soap:Body>
                </soap:Envelope>";

                // Gọi SOAP API
                string response = await CallSoapApi(_serviceUrl, "http://tempuri.org/ReplaceInvoiceAction", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:ReplaceInvoiceActionResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả ReplaceInvoiceAction: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API ReplaceInvoiceAction");
                throw;
            }
        }

        /// <summary>
        /// Phát hành biên lai đã import
        /// </summary>
        /// <param name="invIDs">Danh sách ID biên lai cần phát hành</param>
        /// <returns>Kết quả phát hành biên lai</returns>
        public async Task<string> PublishImportedInvoice(List<int> invIDs)
        {
            try
            {
                _logger.LogInformation($"Gọi API publishInv với dữ liệu: {string.Join(",", invIDs)}");

                // Tạo SOAP request
                string invIDsXml = string.Join("", invIDs.Select(id => $"<int>{id}</int>"));
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <publishInv xmlns=""http://tempuri.org/"">
      <invIDs>
        {invIDsXml}
      </invIDs>
      <username>{_username}</username>
      <password>{_password}</password>
      <pattern>{_pattern}</pattern>
      <serial>{_serial}</serial>
    </publishInv>
  </soap:Body>
</soap:Envelope>";

                // Gọi SOAP API
                string response = await CallSoapApi(_serviceUrl, "http://tempuri.org/publishInv", soapRequest);

                // Xử lý kết quả
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);

                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:publishInvResult", nsManager)?.InnerText ?? "";

                _logger.LogInformation($"Kết quả publishInv: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API publishInv");
                throw;
            }
        }

        /// <summary>
        /// Tạo và phát hành biên lai (ImportAndPublishInv) theo tài liệu tích hợp
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <param name="serial">Serial biên lai (tùy chọn)</param>
        /// <returns>Kết quả tạo và phát hành biên lai</returns>
        public async Task<string> ImportAndPublishInv(string xmlInvData, VNPTAccount? vnptAccount = null, string? serial = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API ImportAndPublishInv với dữ liệu: {xmlInvData}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string account = vnptAccount?.Account ?? _account;
                string acpass = vnptAccount?.ACPass ?? _acpass;
                string pattern = vnptAccount?.Pattern ?? _pattern;
                string serialToUse = serial ?? vnptAccount?.Serial ?? _serial;
                string serviceUrl = vnptAccount?.ServiceUrl ?? _serviceUrl;

                // Tạo SOAP request theo tài liệu tích hợp
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <ImportAndPublishInv xmlns=""http://tempuri.org/"">
      <Account>{account}</Account>
      <ACpass>{acpass}</ACpass>
      <xmlInvData><![CDATA[{xmlInvData}]]></xmlInvData>
      <username>{username}</username>
      <password>{password}</password>
      <pattern>{pattern}</pattern>
      <serial>{serialToUse}</serial>
      <convert>0</convert>
    </ImportAndPublishInv>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"Pattern: {pattern}, Serial: {serialToUse}");
                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(serviceUrl, "http://tempuri.org/ImportAndPublishInv", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:ImportAndPublishInvResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả ImportAndPublishInv: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API ImportAndPublishInv");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Tạo và phát hành biên lai với link
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <param name="serial">Serial biên lai (tùy chọn)</param>
        /// <returns>Kết quả phát hành với link</returns>
        public async Task<ImportAndPublishInvWithLinkResult> ImportAndPublishInvWithLink(string xmlInvData, VNPTAccount? vnptAccount = null, string? serial = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API ImportAndPublishInvWithLink với dữ liệu: {xmlInvData}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string account = vnptAccount?.Account ?? _account;
                string acpass = vnptAccount?.ACPass ?? _acpass;
                string pattern = vnptAccount?.Pattern ?? _pattern;
                string serialToUse = serial ?? vnptAccount?.Serial ?? _serial;
                string serviceUrl = vnptAccount?.ServiceUrl ?? _serviceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <ImportAndPublishInvWithLink xmlns=""http://tempuri.org/"">
      <Account>{account}</Account>
      <ACpass>{acpass}</ACpass>
      <xmlInvData><![CDATA[{xmlInvData}]]></xmlInvData>
      <username>{username}</username>
      <password>{password}</password>
      <pattern>{pattern}</pattern>
      <serial>{serialToUse}</serial>
      <convert>0</convert>
    </ImportAndPublishInvWithLink>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"Pattern: {pattern}, Serial: {serialToUse}");
                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(serviceUrl, "http://tempuri.org/ImportAndPublishInvWithLink", soapRequest);

                // Kiểm tra xem phản hồi có phải là XML hợp lệ không
                if (response.StartsWith("Error:") || !response.Contains("<"))
                {
                    _logger.LogError($"Phản hồi không phải là XML hợp lệ: {response}");
                    return new ImportAndPublishInvWithLinkResult
                    {
                        Status = "ERROR",
                        Message = response
                    };
                }

                // Xử lý response
                XmlDocument xmlDoc;
                XmlNode resultNode;

                try
                {
                    xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(response);
                    XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                    nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                    nsManager.AddNamespace("ns", "http://tempuri.org/");

                    // Lấy nội dung XML của kết quả
                    resultNode = xmlDoc.SelectSingleNode("//ns:ImportAndPublishInvWithLinkResult", nsManager);
                    if (resultNode == null)
                    {
                        _logger.LogError("Không tìm thấy nút ImportAndPublishInvWithLinkResult trong phản hồi");
                        return new ImportAndPublishInvWithLinkResult
                        {
                            Status = "ERROR",
                            Message = "Không tìm thấy kết quả trong phản hồi"
                        };
                    }
                }
                catch (XmlException ex)
                {
                    _logger.LogError(ex, $"Lỗi khi xử lý XML: {response}");
                    return new ImportAndPublishInvWithLinkResult
                    {
                        Status = "ERROR",
                        Message = $"Lỗi khi xử lý XML: {ex.Message}"
                    };
                }

                try
                {
                    // Ghi log nội dung XML để debug
                    _logger.LogInformation($"Nội dung XML kết quả: {resultNode.OuterXml}");

                    // Kiểm tra xem kết quả có phải là chuỗi lỗi hoặc chuỗi thành công không
                    string innerText = resultNode.InnerText;
                    if (innerText.StartsWith("ERR:"))
                    {
                        return new ImportAndPublishInvWithLinkResult
                        {
                            Status = "ERROR",
                            Message = innerText
                        };
                    }
                    else if (innerText.StartsWith("OK:"))
                    {
                        // Xử lý kết quả thành công dạng chuỗi
                        return new ImportAndPublishInvWithLinkResult
                        {
                            Status = "OK",
                            Message = innerText
                        };
                    }

                    // Thử phân tích kết quả trực tiếp từ XML
                    string status = "OK"; // Mặc định là OK nếu không có lỗi
                    string message = "";

                    // Kiểm tra xem có trường Status và Message không
                    XmlNode statusNode = resultNode.SelectSingleNode("Status");
                    XmlNode messageNode = resultNode.SelectSingleNode("Message");

                    if (statusNode != null)
                    {
                        status = statusNode.InnerText;
                    }

                    if (messageNode != null)
                    {
                        message = messageNode.InnerText;
                    }

                    var result = new ImportAndPublishInvWithLinkResult
                    {
                        Status = status,
                        Message = message,
                        LstResult = new ResultDetailList()
                    };

                    // Phân tích danh sách kết quả chi tiết
                    XmlNodeList detailNodes = resultNode.SelectNodes("LstResult/ResultDetail");
                    if (detailNodes != null && detailNodes.Count > 0)
                    {
                        foreach (XmlNode detailNode in detailNodes)
                        {
                            var detail = new ResultDetail
                            {
                                Pattern = detailNode.SelectSingleNode("pattern")?.InnerText ?? "",
                                Serial = detailNode.SelectSingleNode("serial")?.InnerText ?? "",
                                Link = detailNode.SelectSingleNode("link")?.InnerText ?? "",
                                XmlDownload = detailNode.SelectSingleNode("xmlDownload")?.InnerText ?? "",
                                Fkey = detailNode.SelectSingleNode("fkey")?.InnerText ?? "",
                                XmlContent = detailNode.SelectSingleNode("xmlContent")?.InnerText ?? ""
                            };

                            // Xử lý số biên lai
                            string noStr = detailNode.SelectSingleNode("no")?.InnerText ?? "0";
                            if (decimal.TryParse(noStr, out decimal no))
                            {
                                detail.No = no;
                            }

                            result.LstResult.Results.Add(detail);
                        }
                    }
                    else
                    {
                        // Nếu không có ResultDetail, có thể là kết quả dạng chuỗi
                        // Kiểm tra xem có phải là kết quả dạng OK:pattern;serial;invoiceNo không
                        if (innerText.StartsWith("OK:"))
                        {
                            string[] parts = innerText.Replace("OK:", "").Split(';');
                            if (parts.Length >= 3)
                            {
                                var detail = new ResultDetail
                                {
                                    Pattern = parts[0],
                                    Serial = parts[1]
                                };

                                if (decimal.TryParse(parts[2], out decimal no))
                                {
                                    detail.No = no;
                                }

                                result.LstResult.Results.Add(detail);
                            }
                        }
                    }

                    _logger.LogInformation($"Kết quả ImportAndPublishInvWithLink: {result.Status}, Message: {result.Message}");
                    return result;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi phân tích kết quả XML");

                    // Trả về kết quả lỗi
                    return new ImportAndPublishInvWithLinkResult
                    {
                        Status = "ERROR",
                        Message = $"Lỗi khi phân tích kết quả XML: {ex.Message}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API ImportAndPublishInvWithLink");
                return new ImportAndPublishInvWithLinkResult
                {
                    Status = "ERROR",
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// Hủy biên lai
        /// </summary>
        /// <param name="fkey">Chuỗi xác định biên lai cần hủy</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Kết quả hủy</returns>
        public async Task<string> CancelInvoice(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API cancelInv với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string account = vnptAccount?.Account ?? _account;
                string acpass = vnptAccount?.ACPass ?? _acpass;

                // Đảm bảo sử dụng PublishService.asmx cho API cancelInv
                string serviceUrl = vnptAccount?.ServiceUrl ?? _serviceUrl;
                if (!serviceUrl.EndsWith("PublishService.asmx"))
                {
                    serviceUrl = serviceUrl.Replace("PortalService.asmx", "PublishService.asmx");
                    if (!serviceUrl.EndsWith("PublishService.asmx"))
                    {
                        serviceUrl = "https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx";
                    }
                }

                _logger.LogInformation($"Sử dụng service URL: {serviceUrl}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
                <soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
                  <soap:Body>
                    <cancelInv xmlns=""http://tempuri.org/"">
                      <Account>{account}</Account>
                      <ACpass>{acpass}</ACpass>
                      <Fkey>{fkey}</Fkey>
                      <userName>{username}</userName>
                      <userPass>{password}</userPass>
                    </cancelInv>
                  </soap:Body>
                </soap:Envelope>";

                try
                {
                    // Gọi SOAP API
                    string response = await CallSoapApi(serviceUrl, "http://tempuri.org/cancelInv", soapRequest);

                    // Xử lý response
                    if (response.StartsWith("Error:"))
                    {
                        _logger.LogWarning($"Lỗi khi gọi API cancelInv: {response}");
                        return response;
                    }

                    XmlDocument xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(response);
                    XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                    nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                    nsManager.AddNamespace("ns", "http://tempuri.org/");

                    string result = xmlDoc.SelectSingleNode("//ns:cancelInvResult", nsManager)?.InnerText ?? "";
                    _logger.LogInformation($"Kết quả cancelInv: {result}");

                    return result;
                }
                catch (XmlException xmlEx)
                {
                    _logger.LogError(xmlEx, "Lỗi khi xử lý XML response từ API cancelInv");
                    return $"ERR:6 - Lỗi khi xử lý phản hồi từ máy chủ VNPT: {xmlEx.Message}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API cancelInv");
                return $"ERR:6 - Lỗi không xác định: {ex.Message}";
            }
        }

        /// <summary>
        /// Hủy biên lai không kiểm tra trạng thái thanh toán
        /// </summary>
        /// <param name="fkey">Chuỗi xác định biên lai cần hủy</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Kết quả hủy</returns>
        public async Task<string> CancelInvoiceNoPay(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API cancelInvNoPay với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string account = vnptAccount?.Account ?? _account;
                string acpass = vnptAccount?.ACPass ?? _acpass;

                // Đảm bảo sử dụng PublishService.asmx cho API cancelInvNoPay
                string serviceUrl = vnptAccount?.ServiceUrl ?? _serviceUrl;
                if (!serviceUrl.EndsWith("PublishService.asmx"))
                {
                    serviceUrl = serviceUrl.Replace("PortalService.asmx", "PublishService.asmx");
                    if (!serviceUrl.EndsWith("PublishService.asmx"))
                    {
                        serviceUrl = "https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx";
                    }
                }

                _logger.LogInformation($"Sử dụng service URL: {serviceUrl}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
                <soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
                  <soap:Body>
                    <cancelInvNoPay xmlns=""http://tempuri.org/"">
                      <Account>{account}</Account>
                      <ACpass>{acpass}</ACpass>
                      <Fkey>{fkey}</Fkey>
                      <userName>{username}</userName>
                      <userPass>{password}</userPass>
                    </cancelInvNoPay>
                  </soap:Body>
                </soap:Envelope>";

                try
                {
                    // Gọi SOAP API
                    string response = await CallSoapApi(serviceUrl, "http://tempuri.org/cancelInvNoPay", soapRequest);

                    // Xử lý response
                    if (response.StartsWith("Error:"))
                    {
                        _logger.LogWarning($"Lỗi khi gọi API cancelInvNoPay: {response}");
                        return response;
                    }

                    XmlDocument xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(response);
                    XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                    nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                    nsManager.AddNamespace("ns", "http://tempuri.org/");

                    string result = xmlDoc.SelectSingleNode("//ns:cancelInvNoPayResult", nsManager)?.InnerText ?? "";
                    _logger.LogInformation($"Kết quả cancelInvNoPay: {result}");

                    return result;
                }
                catch (XmlException xmlEx)
                {
                    _logger.LogError(xmlEx, "Lỗi khi xử lý XML response từ API cancelInvNoPay");
                    return $"ERR:6 - Lỗi khi xử lý phản hồi từ máy chủ VNPT: {xmlEx.Message}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API cancelInvNoPay");
                return $"ERR:6 - Lỗi không xác định: {ex.Message}";
            }
        }

        /// <summary>
        /// Gọi SOAP API
        /// </summary>
        /// <param name="url">URL của SOAP API</param>
        /// <param name="action">SOAP action</param>
        /// <param name="soapRequest">SOAP request</param>
        /// <returns>SOAP response</returns>
        private async Task<string> CallSoapApi(string url, string action, string soapRequest)
        {
            try
            {
                _logger.LogInformation($"Gọi SOAP API: {url}, Action: {action}");
                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Bỏ qua kiểm tra SSL
                ServicePointManager.ServerCertificateValidationCallback =
                    (sender, certificate, chain, sslPolicyErrors) => true;

                // Tạo HTTP request
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);

                // Sửa SOAPAction để phù hợp với yêu cầu của VNPT
                // Thêm dấu ngoặc kép xung quanh SOAPAction
                request.Headers.Add("SOAPAction", $"\"{action}\"");

                request.ContentType = "text/xml; charset=utf-8";
                request.Accept = "text/xml";
                request.Method = "POST";
                request.Timeout = 60000; // 60 giây

                // Gửi request
                using (Stream stream = await request.GetRequestStreamAsync())
                {
                    byte[] bytes = Encoding.UTF8.GetBytes(soapRequest);
                    await stream.WriteAsync(bytes, 0, bytes.Length);
                }

                // Nhận response
                using (WebResponse response = await request.GetResponseAsync())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        string soapResult = await rd.ReadToEndAsync();
                        _logger.LogInformation($"SOAP Response: {soapResult}");

                        // Kiểm tra xem response có phải là XML hợp lệ không
                        try
                        {
                            XmlDocument doc = new XmlDocument();
                            doc.LoadXml(soapResult);
                            return soapResult;
                        }
                        catch (XmlException xmlEx)
                        {
                            _logger.LogError(xmlEx, $"SOAP Response không phải là XML hợp lệ: {soapResult}");
                            return $"Error: XML không hợp lệ - {xmlEx.Message}";
                        }
                    }
                }
            }
            catch (WebException ex)
            {
                _logger.LogError(ex, $"SOAP Error: {ex.Message}");

                if (ex.Response != null)
                {
                    try
                    {
                        using (StreamReader rd = new StreamReader(ex.Response.GetResponseStream()))
                        {
                            string soapResult = await rd.ReadToEndAsync();
                            _logger.LogError($"SOAP Error Response: {soapResult}");

                            // Kiểm tra xem error response có chứa SOAP Fault không
                            if (soapResult.Contains("<soap:Fault>") || soapResult.Contains("<Fault>"))
                            {
                                try
                                {
                                    XmlDocument doc = new XmlDocument();
                                    doc.LoadXml(soapResult);

                                    XmlNamespaceManager nsManager = new XmlNamespaceManager(doc.NameTable);
                                    nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");

                                    string faultString = doc.SelectSingleNode("//soap:Fault/faultstring", nsManager)?.InnerText
                                        ?? doc.SelectSingleNode("//Fault/faultstring")?.InnerText
                                        ?? "Không xác định";

                                    _logger.LogError($"SOAP Fault: {faultString}");
                                    return $"Error: SOAP Fault - {faultString}";
                                }
                                catch (Exception xmlEx)
                                {
                                    _logger.LogError(xmlEx, "Lỗi khi xử lý SOAP Fault");
                                }
                            }

                            return $"Error: {ex.Message}\nResponse: {soapResult}";
                        }
                    }
                    catch (Exception rdEx)
                    {
                        _logger.LogError(rdEx, "Lỗi khi đọc error response");
                        return $"Error: {ex.Message} - Không thể đọc error response";
                    }
                }

                return $"Error: {ex.Message}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"General Error: {ex.Message}");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Tạo XML dữ liệu khách hàng
        /// </summary>
        /// <param name="bienLai">Thông tin biên lai</param>
        /// <returns>XML dữ liệu khách hàng</returns>
        public string CreateCustomerXml(BienLaiDienTu bienLai)
        {
            // Đọc file XML mẫu
            string xmlTemplate = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<Customers>
  <Customer>
    <n>{0}</n>
    <Code>{1}</Code>
    <TaxCode>{1}</TaxCode>
    <Address>{2}</Address>
    <BankAccountName></BankAccountName>
    <BankName></BankName>
    <BankNumber></BankNumber>
    <Email>bhxh@vnpt.vn</Email>
    <Fax></Fax>
    <Phone></Phone>
    <ContactPerson></ContactPerson>
    <RepresentPerson></RepresentPerson>
    <CusType>0</CusType>
  </Customer>
</Customers>";

            // Lấy địa chỉ từ KeKhaiBHYT
            string address = "BHXH Việt Nam";
            if (bienLai.KeKhaiBHYT != null)
            {
                string tinh = bienLai.KeKhaiBHYT.tinh_nkq;
                string huyen = bienLai.KeKhaiBHYT.huyen_nkq;
                string xa = bienLai.KeKhaiBHYT.xa_nkq;
                string diaChi = bienLai.KeKhaiBHYT.dia_chi_nkq;
                address = $"{diaChi}, {xa}, {huyen}, {tinh}";
            }

            string xml = string.Format(xmlTemplate,
                bienLai.ten_nguoi_dong,
                bienLai.ma_so_bhxh,
                address);

            _logger.LogInformation($"XML Customer: {xml}");
            return xml;
        }

        #region PortalService Methods

        /// <summary>
        /// Lấy nội dung biên lai dựa trên fkey
        /// </summary>
        /// <param name="fkey">Khóa biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Nội dung HTML của biên lai</returns>
        public async Task<string> GetInvViewByFkey(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API getInvViewFkey với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string portalServiceUrl = vnptAccount?.ServiceUrl.Replace("PublishService.asmx", "PortalService.asmx") ?? _portalServiceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <getInvViewFkey xmlns=""http://tempuri.org/"">
      <fkey>{fkey}</fkey>
      <userName>{username}</userName>
      <userPass>{password}</userPass>
    </getInvViewFkey>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(portalServiceUrl, "http://tempuri.org/getInvViewFkey", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:getInvViewFkeyResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả getInvViewFkey: {result.Substring(0, Math.Min(100, result.Length))}...");

                // Kiểm tra lỗi ERR:6
                if (result == "ERR:6")
                {
                    _logger.LogWarning($"Gặp lỗi ERR:6 (Dải biên lai cũ đã hết) khi xem biên lai với fkey: {fkey}");

                    // Thử sử dụng getLinkInvFkey thay thế
                    string link = await GetLinkInvByFkey(fkey, vnptAccount);
                    if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                    {
                        _logger.LogInformation($"Lấy được link biên lai: {link}");
                        return $"<html><body><h2>Biên lai điện tử</h2><p>Biên lai điện tử của bạn đã được tạo thành công.</p><p>Bạn có thể xem biên lai tại đường dẫn sau:</p><p><a href='{link}' target='_blank'>{link}</a></p></body></html>";
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API getInvViewFkey");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Tải xuống biên lai dạng PDF dựa trên fkey
        /// </summary>
        /// <param name="fkey">Khóa biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Dữ liệu PDF dạng Base64</returns>
        public async Task<string> DownloadInvPDFByFkey(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API downloadInvPDFFkey với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string portalServiceUrl = vnptAccount?.ServiceUrl.Replace("PublishService.asmx", "PortalService.asmx") ?? _portalServiceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <downloadInvPDFFkey xmlns=""http://tempuri.org/"">
      <fkey>{fkey}</fkey>
      <userName>{username}</userName>
      <userPass>{password}</userPass>
    </downloadInvPDFFkey>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(portalServiceUrl, "http://tempuri.org/downloadInvPDFFkey", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:downloadInvPDFFkeyResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả downloadInvPDFFkey: {result.Substring(0, Math.Min(100, result.Length))}...");

                // Kiểm tra lỗi ERR:6
                if (result == "ERR:6")
                {
                    _logger.LogWarning($"Gặp lỗi ERR:6 (Dải biên lai cũ đã hết) khi tải xuống PDF biên lai với fkey: {fkey}");

                    // Thử sử dụng getLinkInvFkey thay thế
                    string link = await GetLinkInvByFkey(fkey, vnptAccount);
                    if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                    {
                        _logger.LogInformation($"Lấy được link biên lai: {link}");
                        return $"Error: Không thể tải xuống biên lai dạng PDF. Vui lòng sử dụng link sau để xem biên lai: {link}";
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API downloadInvPDFFkey");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Lấy nội dung HTML của biên lai điện tử không kiểm tra trạng thái thanh toán
        /// </summary>
        /// <param name="fkey">Chuỗi xác định biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Nội dung HTML của biên lai</returns>
        public async Task<string> GetInvViewFkeyNoPay(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API getInvViewFkeyNoPay với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string portalServiceUrl = vnptAccount?.ServiceUrl.Replace("PublishService.asmx", "PortalService.asmx") ?? _portalServiceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <getInvViewFkeyNoPay xmlns=""http://tempuri.org/"">
      <fkey>{fkey}</fkey>
      <userName>{username}</userName>
      <userPass>{password}</userPass>
    </getInvViewFkeyNoPay>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(portalServiceUrl, "http://tempuri.org/getInvViewFkeyNoPay", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:getInvViewFkeyNoPayResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả getInvViewFkeyNoPay: {result.Substring(0, Math.Min(100, result.Length))}...");

                // Kiểm tra lỗi ERR:6
                if (result == "ERR:6")
                {
                    _logger.LogWarning($"Gặp lỗi ERR:6 (Không tìm thấy hóa đơn) khi xem biên lai với fkey: {fkey}");

                    // Thử sử dụng getLinkInvFkey thay thế
                    string link = await GetLinkInvByFkey(fkey, vnptAccount);
                    if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
                    {
                        _logger.LogInformation($"Lấy được link biên lai: {link}");
                        return $"<html><body><h2>Biên lai điện tử</h2><p>Biên lai điện tử của bạn đã được tạo thành công.</p><p>Bạn có thể xem biên lai tại đường dẫn sau:</p><p><a href='{link}' target='_blank'>{link}</a></p></body></html>";
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API getInvViewFkeyNoPay");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Tải biên lai điện tử dưới dạng PDF không kiểm tra trạng thái thanh toán
        /// </summary>
        /// <param name="fkey">Chuỗi xác định biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Chuỗi base64 của file PDF</returns>
        public async Task<string> DownloadInvPDFFkeyNoPay(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API downloadInvPDFFkeyNoPay với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string portalServiceUrl = vnptAccount?.ServiceUrl.Replace("PublishService.asmx", "PortalService.asmx") ?? _portalServiceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <downloadInvPDFFkeyNoPay xmlns=""http://tempuri.org/"">
      <fkey>{fkey}</fkey>
      <userName>{username}</userName>
      <userPass>{password}</userPass>
    </downloadInvPDFFkeyNoPay>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(portalServiceUrl, "http://tempuri.org/downloadInvPDFFkeyNoPay", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:downloadInvPDFFkeyNoPayResult", nsManager)?.InnerText ?? "";

                // Kiểm tra lỗi
                if (result.StartsWith("ERR:"))
                {
                    _logger.LogWarning($"Gặp lỗi {result} khi tải PDF biên lai với fkey: {fkey}");
                    return result;
                }

                _logger.LogInformation($"Đã tải PDF biên lai thành công với fkey: {fkey}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API downloadInvPDFFkeyNoPay");
                return $"Error: {ex.Message}";
            }
        }

        /// <summary>
        /// Lấy link biên lai dựa trên fkey
        /// </summary>
        /// <param name="fkey">Khóa biên lai</param>
        /// <param name="vnptAccount">Tài khoản VNPT (tùy chọn)</param>
        /// <returns>Link đến biên lai</returns>
        public async Task<string> GetLinkInvByFkey(string fkey, VNPTAccount? vnptAccount = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API getLinkInvFkey với fkey: {fkey}");

                // Sử dụng thông tin từ tài khoản VNPT hoặc từ cấu hình
                string username = vnptAccount?.Username ?? _username;
                string password = vnptAccount?.Password ?? _password;
                string portalServiceUrl = vnptAccount?.ServiceUrl.Replace("PublishService.asmx", "PortalService.asmx") ?? _portalServiceUrl;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <getLinkInvFkey xmlns=""http://tempuri.org/"">
      <fkey>{fkey}</fkey>
      <userName>{username}</userName>
      <userPass>{password}</userPass>
    </getLinkInvFkey>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(portalServiceUrl, "http://tempuri.org/getLinkInvFkey", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:getLinkInvFkeyResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả getLinkInvFkey: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API getLinkInvFkey");
                return $"Error: {ex.Message}";
            }
        }

        #endregion

        /// <summary>
        /// Tạo XML dữ liệu biên lai
        /// </summary>
        /// <param name="bienLai">Thông tin biên lai</param>
        /// <returns>XML dữ liệu biên lai</returns>
        public string CreateInvoiceXml(BienLaiDienTu bienLai)
        {
            // Ưu tiên sử dụng vnpt_key vì đây là key được tạo cho XML
            // transaction_id chỉ được sử dụng khi xem biên lai
            string key = !string.IsNullOrEmpty(bienLai.vnpt_key) ? bienLai.vnpt_key :
                         $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";

            _logger.LogInformation($"Sử dụng key cho XML: {key}");

            // Sử dụng ngày tạo biên lai làm ngày tạo biên lai VNPT
            string arisingDate = bienLai.ngay_tao.ToString("dd/MM/yyyy");
            string amountInWords = ConvertNumberToWords(bienLai.so_tien);

            // Kiểm tra xem KeKhaiBHYT đã được tải chưa
            if (bienLai.ke_khai_bhyt_id.HasValue && bienLai.KeKhaiBHYT == null)
            {
                // Tải KeKhaiBHYT từ database
                _logger.LogInformation($"KeKhaiBHYT chưa được tải, tải từ database với ID: {bienLai.ke_khai_bhyt_id}");
                var keKhaiBHYT = _context.KeKhaiBHYTs.Find(bienLai.ke_khai_bhyt_id.Value);
                if (keKhaiBHYT != null)
                {
                    bienLai.KeKhaiBHYT = keKhaiBHYT;
                    _logger.LogInformation($"Đã tải KeKhaiBHYT: ID={keKhaiBHYT.id}, HanTheMoiTu={keKhaiBHYT.han_the_moi_tu}, HanTheMoiDen={keKhaiBHYT.han_the_moi_den}, SoThangDong={keKhaiBHYT.so_thang_dong}");
                }
            }

            // Đọc file XML mẫu
            string xmlTemplate = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<Invoices>
  <Inv>
    <key>{0}</key>
    <Invoice>
      <CusCode>{1}</CusCode>
      <ArisingDate>{2}</ArisingDate>
      <CusName>{3}</CusName>
      <Buyer>{3}</Buyer>
      <Total>{4}</Total>
      <Amount>{4}</Amount>
      <AmountInWords>{5}</AmountInWords>
      <VATAmount>0</VATAmount>
      <VATRate>0</VATRate>
      <CusAddress>{7}</CusAddress>
      <PaymentMethod>TM</PaymentMethod>
      <Extra>{6}</Extra>
      <Products>
        <Product>
          <Code>BL001</Code>
          <ProdName>{6}</ProdName>
          <ProdUnit>Lần</ProdUnit>
          <ProdQuantity>1</ProdQuantity>
          <ProdPrice>{4}</ProdPrice>
          <Total>{4}</Total>
          <Amount>{4}</Amount>
        </Product>
      </Products>
    </Invoice>
  </Inv>
</Invoices>";

            // Lấy thông tin hạn thẻ từ và hạn thẻ đến từ KeKhaiBHYT
            string productName = "Phí BHXH";
            string address = "BHXH Việt Nam";

            // Xử lý nội dung thu dựa trên loại biên lai
            if (bienLai.is_bhyt)
            {
                // Nếu là BHYT, định dạng nội dung thu theo yêu cầu
                if (bienLai.KeKhaiBHYT != null)
                {
                    // Lấy địa chỉ từ KeKhaiBHYT
                    string tinh = bienLai.KeKhaiBHYT.tinh_nkq;
                    string huyen = bienLai.KeKhaiBHYT.huyen_nkq;
                    string xa = bienLai.KeKhaiBHYT.xa_nkq;
                    string diaChi = bienLai.KeKhaiBHYT.dia_chi_nkq;

                    // Tạo địa chỉ đầy đủ
                    address = $"{diaChi}, {xa}, {huyen}, {tinh}";

                    // Lấy thông tin hạn thẻ và số tháng đóng
                    string hanTheTu = bienLai.KeKhaiBHYT.han_the_moi_tu.ToString("dd/MM/yyyy");
                    string hanTheDen = bienLai.KeKhaiBHYT.han_the_moi_den.ToString("dd/MM/yyyy");
                    int soThangDong = bienLai.KeKhaiBHYT.so_thang_dong;

                    // Định dạng nội dung thu theo yêu cầu
                    productName = $"Thu tiền đóng BHYT - Số tháng đóng {soThangDong} tháng (từ ngày {hanTheTu} đến ngày {hanTheDen})";

                    // Log thông tin để debug
                    _logger.LogInformation($"BHYT - Thông tin biên lai: ID={bienLai.id}, MaSoBHXH={bienLai.ma_so_bhxh}, " +
                        $"HanTheTu={hanTheTu}, HanTheDen={hanTheDen}, SoThangDong={soThangDong}, " +
                        $"NoiDungThu={productName}");
                }
                else
                {
                    // Nếu không có thông tin kê khai BHYT, sử dụng nội dung mặc định
                    productName = "Thu tiền đóng BHYT";
                    _logger.LogWarning($"BHYT - Không có thông tin kê khai BHYT cho biên lai ID={bienLai.id}, MaSoBHXH={bienLai.ma_so_bhxh}");
                }
            }
            else if (bienLai.is_bhxh)
            {
                // Nếu là BHXH, cần lấy thông tin từ KeKhaiBHXH
                // Vì không có mối quan hệ trực tiếp, cần truy vấn từ database
                var keKhaiBHXH = _context.KeKhaiBHXHs
                    .Where(k => k.so_bien_lai == bienLai.so_bien_lai)
                    .FirstOrDefault();

                if (keKhaiBHXH != null)
                {
                    // Lấy thông tin số tháng đóng
                    int soThangDong = keKhaiBHXH.so_thang_dong;

                    // Lấy thông tin tháng bắt đầu
                    string thangBatDau = keKhaiBHXH.thang_bat_dau;

                    // Tính tháng kết thúc
                    DateTime thangBatDauDate;
                    if (DateTime.TryParse(thangBatDau, out thangBatDauDate))
                    {
                        // Tính tháng kết thúc bằng cách cộng số tháng đóng vào tháng bắt đầu
                        DateTime thangKetThucDate = thangBatDauDate.AddMonths(soThangDong - 1);

                        // Format tháng bắt đầu và tháng kết thúc
                        string thangBatDauFormatted = thangBatDauDate.ToString("MM/yyyy");
                        string thangKetThucFormatted = thangKetThucDate.ToString("MM/yyyy");

                        // Định dạng nội dung thu theo yêu cầu
                        productName = $"Thu tiền đóng BHXH tự nguyện - Số tháng đóng {soThangDong} tháng (từ tháng {thangBatDauFormatted} đến tháng {thangKetThucFormatted})";

                        _logger.LogInformation($"BHXH TN - Thông tin biên lai: ID={bienLai.id}, MaSoBHXH={bienLai.ma_so_bhxh}, " +
                            $"ThangBatDau={thangBatDauFormatted}, ThangKetThuc={thangKetThucFormatted}, SoThangDong={soThangDong}, " +
                            $"NoiDungThu={productName}");
                    }
                    else
                    {
                        // Nếu không parse được tháng bắt đầu, sử dụng nội dung mặc định
                        productName = $"Thu tiền đóng BHXH tự nguyện - Số tháng đóng {soThangDong} tháng";
                        _logger.LogWarning($"BHXH TN - Không thể parse tháng bắt đầu '{thangBatDau}' cho biên lai ID={bienLai.id}, MaSoBHXH={bienLai.ma_so_bhxh}");
                    }

                    // Lấy địa chỉ từ KeKhaiBHXH
                    if (!string.IsNullOrEmpty(keKhaiBHXH.tinh_nkq) && !string.IsNullOrEmpty(keKhaiBHXH.huyen_nkq) && !string.IsNullOrEmpty(keKhaiBHXH.xa_nkq))
                    {
                        string tinh = keKhaiBHXH.tinh_nkq;
                        string huyen = keKhaiBHXH.huyen_nkq;
                        string xa = keKhaiBHXH.xa_nkq;
                        address = $"{xa}, {huyen}, {tinh}";
                    }
                }
                else
                {
                    // Nếu không tìm thấy KeKhaiBHXH, sử dụng nội dung mặc định
                    productName = "Thu tiền đóng BHXH tự nguyện";
                    _logger.LogWarning($"BHXH TN - Không tìm thấy thông tin kê khai BHXH cho biên lai ID={bienLai.id}, SoBienLai={bienLai.so_bien_lai}, MaSoBHXH={bienLai.ma_so_bhxh}");

                    // Lấy địa chỉ từ KeKhaiBHYT nếu có
                    if (bienLai.KeKhaiBHYT != null)
                    {
                        string tinh = bienLai.KeKhaiBHYT.tinh_nkq;
                        string huyen = bienLai.KeKhaiBHYT.huyen_nkq;
                        string xa = bienLai.KeKhaiBHYT.xa_nkq;
                        string diaChi = bienLai.KeKhaiBHYT.dia_chi_nkq;
                        address = $"{diaChi}, {xa}, {huyen}, {tinh}";
                    }
                }
            }

            _logger.LogInformation($"Nội dung thu cuối cùng: {productName}");

            string xml = string.Format(xmlTemplate,
                key,
                bienLai.ma_so_bhxh,
                arisingDate,
                bienLai.ten_nguoi_dong,
                bienLai.so_tien,
                amountInWords,
                productName,
                address);

            _logger.LogInformation($"XML Invoice: {xml}");
            return xml;
        }

        /// <summary>
        /// Chuyển đổi số thành chữ
        /// </summary>
        /// <param name="amount">Số tiền</param>
        /// <returns>Số tiền bằng chữ</returns>
        private string ConvertNumberToWords(decimal amount)
        {
            string[] units = { "", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín" };
            string[] teens = { "mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín" };
            string[] tens = { "", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi" };
            string[] thousands = { "", "nghìn", "triệu", "tỷ" };

            if (amount == 0)
                return "Không đồng";

            string words = "";
            int intAmount = (int)amount;
            int decimalAmount = (int)((amount - intAmount) * 100);

            // Xử lý phần nguyên
            int i = 0;
            while (intAmount > 0)
            {
                int group = intAmount % 1000;
                if (group > 0)
                {
                    string groupWords = "";
                    int hundred = group / 100;
                    int ten = (group % 100) / 10;
                    int unit = group % 10;

                    if (hundred > 0)
                        groupWords += units[hundred] + " trăm ";

                    if (ten == 1)
                        groupWords += teens[unit] + " ";
                    else
                    {
                        if (ten > 1)
                            groupWords += tens[ten] + " ";

                        if (unit > 0)
                            groupWords += units[unit] + " ";
                    }

                    words = groupWords + thousands[i] + " " + words;
                }

                intAmount /= 1000;
                i++;
            }

            // Xử lý phần thập phân
            if (decimalAmount > 0)
                words += "phẩy " + decimalAmount;

            // Viết hoa chữ cái đầu tiên
            string result = words.Trim();
            if (result.Length > 0)
            {
                result = char.ToUpper(result[0]) + result.Substring(1);
            }

            return result + " đồng";
        }
    }
}
