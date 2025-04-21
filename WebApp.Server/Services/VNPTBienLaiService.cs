using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebApp.API.Models.BienlaiDienTu;

namespace WebApp.API.Services
{
    public class VNPTBienLaiService
    {
        private readonly ILogger<VNPTBienLaiService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _serviceUrl;
        private readonly string _username;
        private readonly string _password;
        private readonly string _pattern;
        private readonly string _serial;

        public VNPTBienLaiService(ILogger<VNPTBienLaiService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;

            // Lấy thông tin cấu hình từ appsettings.json
            _serviceUrl = _configuration["VNPTBienLai:ServiceUrl"] ?? "https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx";
            _username = _configuration["VNPTBienLai:Username"] ?? "ctyhuyphucpws";
            _password = _configuration["VNPTBienLai:Password"] ?? "Vnpt@1234";
            _pattern = _configuration["VNPTBienLai:Pattern"] ?? "";
            _serial = _configuration["VNPTBienLai:Serial"] ?? "";
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
      <username>NV089182025056</username>
      <pass>Dinh@56789</pass>
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
        /// Phát hành biên lai
        /// </summary>
        /// <param name="xmlInvData">XML dữ liệu biên lai</param>
        /// <returns>Kết quả phát hành</returns>
        public async Task<string> PublishInvoice(string xmlInvData, string? serial = null)
        {
            try
            {
                _logger.LogInformation($"Gọi API ImportInv với dữ liệu: {xmlInvData}");

                // Sử dụng serial từ tham số hoặc từ cấu hình
                string serialToUse = serial ?? _serial;

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <ImportInv xmlns=""http://tempuri.org/"">
      <xmlInvData><![CDATA[{xmlInvData}]]></xmlInvData>
      <username>ctyhuyphucpws</username>
      <password>Vnpt@1234</password>
      <convert>0</convert>
      <tkTao>NV089182025056</tkTao>
      <pattern>{_pattern}</pattern>
      <serial>{serialToUse}</serial>
    </ImportInv>
  </soap:Body>
</soap:Envelope>";

                _logger.LogInformation($"Pattern: {_pattern}, Serial: {serialToUse}");

                _logger.LogInformation($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi(_serviceUrl, "http://tempuri.org/ImportInv", soapRequest);

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
                _logger.LogError(ex, "Lỗi khi gọi API ImportAndPublishInv");
                throw;
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
                      <Account>NV089182025056</Account>
                      <ACpass>Dinh@56789</ACpass>
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
                      <Account>NV089182025056</Account>
                      <Acpass>Dinh@56789</Acpass>
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
      <username>ctyhuyphucpws</username>
      <password>Vnpt@1234</password>
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
        /// Hủy biên lai
        /// </summary>
        /// <param name="fkey">Chuỗi xác định biên lai cần hủy</param>
        /// <returns>Kết quả hủy</returns>
        public async Task<string> CancelInvoice(string fkey)
        {
            try
            {
                _logger.LogInformation($"Gọi API cancelInv với fkey: {fkey}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
                <soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
                  <soap:Body>
                    <cancelInv xmlns=""http://tempuri.org/"">
                      <Account>NV089182025056</Account>
                      <ACpass>Dinh@56789</ACpass>
                      <fkey>{fkey}</fkey>
                      <userName>{_username}</userName>
                      <userPass>{_password}</userPass>
                    </cancelInv>
                  </soap:Body>
                </soap:Envelope>";

                // Gọi SOAP API
                string response = await CallSoapApi(_serviceUrl, "http://tempuri.org/cancelInv", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:cancelInvResult", nsManager)?.InnerText ?? "";
                _logger.LogInformation($"Kết quả cancelInv: {result}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi API cancelInv");
                throw;
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
                request.Headers.Add("SOAPAction", action);
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
                        return soapResult;
                    }
                }
            }
            catch (WebException ex)
            {
                _logger.LogError($"SOAP Error: {ex.Message}");

                if (ex.Response != null)
                {
                    using (StreamReader rd = new StreamReader(ex.Response.GetResponseStream()))
                    {
                        string soapResult = await rd.ReadToEndAsync();
                        _logger.LogError($"SOAP Error Response: {soapResult}");
                        return $"Error: {ex.Message}\nResponse: {soapResult}";
                    }
                }

                return $"Error: {ex.Message}";
            }
            catch (Exception ex)
            {
                _logger.LogError($"General Error: {ex.Message}");
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

        /// <summary>
        /// Tạo XML dữ liệu biên lai
        /// </summary>
        /// <param name="bienLai">Thông tin biên lai</param>
        /// <returns>XML dữ liệu biên lai</returns>
        public string CreateInvoiceXml(BienLaiDienTu bienLai)
        {
            string key = bienLai.vnpt_key ?? $"{bienLai.ma_so_bhxh}_{DateTime.Now.Ticks}";
            // Sử dụng ngày tạo biên lai làm ngày tạo biên lai VNPT
            string arisingDate = bienLai.ngay_tao.ToString("dd/MM/yyyy");
            string amountInWords = ConvertNumberToWords(bienLai.so_tien);

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

            if (bienLai.KeKhaiBHYT != null)
            {
                // Lấy địa chỉ từ KeKhaiBHYT
                string tinh = bienLai.KeKhaiBHYT.tinh_nkq;
                string huyen = bienLai.KeKhaiBHYT.huyen_nkq;
                string xa = bienLai.KeKhaiBHYT.xa_nkq;
                string diaChi = bienLai.KeKhaiBHYT.dia_chi_nkq;

                // Tạo địa chỉ đầy đủ
                address = $"{diaChi}, {xa}, {huyen}, {tinh}";

                // Nếu là BHYT, lấy thông tin hạn thẻ
                if (bienLai.is_bhyt)
                {
                    string hanTheTu = bienLai.KeKhaiBHYT.han_the_moi_tu.ToString("dd/MM/yyyy");
                    string hanTheDen = bienLai.KeKhaiBHYT.han_the_moi_den.ToString("dd/MM/yyyy");
                    int soThangDong = bienLai.KeKhaiBHYT.so_thang_dong;
                    productName = $"Thu tiền đóng BHYT - Số tháng đóng {soThangDong} tháng (từ ngày {hanTheTu} đến ngày {hanTheDen})";
                }
            }
            else if (bienLai.is_bhyt)
            {
                productName = "Thu tiền đóng BHYT";
            }

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
