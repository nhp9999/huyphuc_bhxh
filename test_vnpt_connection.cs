using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace TestVNPTConnection
{
    class Program
    {
        static async Task Main(string[] args)
        {
            try
            {
                // Thông tin đăng nhập
                string username = "ctyhuyphucpws";
                string password = "Vnpt@1234";
                string pattern = "01BLP0/001"; // Mẫu biên lai
                string serial = "AA/22E"; // Serial biên lai

                // Tạo XML dữ liệu khách hàng
                string customerXml = CreateCustomerXml("8925326963", "Lê Thị Kiều Oanh");
                Console.WriteLine($"Customer XML: {customerXml}");

                // Gọi API UpdateCus
                string customerResult = await UpdateCustomer(username, password, customerXml);
                Console.WriteLine($"Customer Result: {customerResult}");

                // Tạo XML dữ liệu biên lai
                string invoiceXml = CreateInvoiceXml("8925326963", "Lê Thị Kiều Oanh", 1263600);
                Console.WriteLine($"Invoice XML: {invoiceXml}");

                // Gọi API ImportAndPublishInv
                string invoiceResult = await PublishInvoice(username, password, invoiceXml, pattern, serial);
                Console.WriteLine($"Invoice Result: {invoiceResult}");

                Console.WriteLine("Hoàn thành!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
            }
        }

        static string CreateCustomerXml(string maSoBHXH, string tenNguoiDong)
        {
            StringBuilder xml = new StringBuilder();
            xml.AppendLine("<Customers>");
            xml.AppendLine("<Customer>");
            xml.AppendLine($"<n>{tenNguoiDong}</n>");
            xml.AppendLine($"<Code>{maSoBHXH}</Code>");
            xml.AppendLine($"<TaxCode>{maSoBHXH}</TaxCode>");
            xml.AppendLine($"<Address>BHXH Việt Nam</Address>");
            xml.AppendLine($"<BankAccountName></BankAccountName>");
            xml.AppendLine($"<BankName></BankName>");
            xml.AppendLine($"<BankNumber></BankNumber>");
            xml.AppendLine($"<Email></Email>");
            xml.AppendLine($"<Fax></Fax>");
            xml.AppendLine($"<Phone></Phone>");
            xml.AppendLine($"<ContactPerson></ContactPerson>");
            xml.AppendLine($"<RepresentPerson></RepresentPerson>");
            xml.AppendLine($"<CusType>0</CusType>");
            xml.AppendLine("</Customer>");
            xml.AppendLine("</Customers>");
            return xml.ToString();
        }

        static string CreateInvoiceXml(string maSoBHXH, string tenNguoiDong, decimal soTien)
        {
            string key = $"{maSoBHXH}_{DateTime.Now.Ticks}";
            string arisingDate = DateTime.Now.ToString("dd/MM/yyyy");
            string amountInWords = ConvertNumberToWords(soTien);

            StringBuilder xml = new StringBuilder();
            xml.AppendLine("<Invoices>");
            xml.AppendLine("<Inv>");
            xml.AppendLine($"<key>{key}</key>");
            xml.AppendLine("<Invoice>");
            xml.AppendLine($"<CusCode>{maSoBHXH}</CusCode>");
            xml.AppendLine($"<ArisingDate>{arisingDate}</ArisingDate>");
            xml.AppendLine($"<CusName>{tenNguoiDong}</CusName>");
            xml.AppendLine($"<Total>{soTien}</Total>");
            xml.AppendLine($"<Amount>{soTien}</Amount>");
            xml.AppendLine($"<AmountInWords>{amountInWords}</AmountInWords>");
            xml.AppendLine("<VATAmount>0</VATAmount>");
            xml.AppendLine("<VATRate>0</VATRate>");
            xml.AppendLine("<CusAddress>BHXH Việt Nam</CusAddress>");
            xml.AppendLine("<PaymentMethod>TM</PaymentMethod>");
            xml.AppendLine("<Extra>Phí BHYT</Extra>");
            xml.AppendLine("<Products>");
            xml.AppendLine("<Product>");
            xml.AppendLine("<Code>BL001</Code>");
            xml.AppendLine("<ProdName>Phí BHYT</ProdName>");
            xml.AppendLine("<ProdUnit>Lần</ProdUnit>");
            xml.AppendLine("<ProdQuantity>1</ProdQuantity>");
            xml.AppendLine($"<ProdPrice>{soTien}</ProdPrice>");
            xml.AppendLine($"<Total>{soTien}</Total>");
            xml.AppendLine($"<Amount>{soTien}</Amount>");
            xml.AppendLine("</Product>");
            xml.AppendLine("</Products>");
            xml.AppendLine("</Invoice>");
            xml.AppendLine("</Inv>");
            xml.AppendLine("</Invoices>");
            return xml.ToString();
        }

        static async Task<string> UpdateCustomer(string username, string password, string xmlCusData)
        {
            try
            {
                Console.WriteLine($"Gọi API UpdateCus với dữ liệu: {xmlCusData}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <UpdateCus xmlns=""http://tempuri.org/"">
      <XMLCusData><![CDATA[{xmlCusData}]]></XMLCusData>
      <username>{username}</username>
      <pass>{password}</pass>
      <convert>0</convert>
    </UpdateCus>
  </soap:Body>
</soap:Envelope>";

                Console.WriteLine($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi("https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx", "http://tempuri.org/UpdateCus", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:UpdateCusResult", nsManager)?.InnerText ?? "";
                Console.WriteLine($"Kết quả UpdateCus: {result}");

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi gọi API UpdateCus: {ex.Message}");
                throw;
            }
        }

        static async Task<string> PublishInvoice(string username, string password, string xmlInvData, string pattern, string serial)
        {
            try
            {
                Console.WriteLine($"Gọi API ImportAndPublishInv với dữ liệu: {xmlInvData}");

                // Tạo SOAP request
                string soapRequest = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <ImportAndPublishInv xmlns=""http://tempuri.org/"">
      <Account>{username}</Account>
      <ACpass>{password}</ACpass>
      <xmlInvData><![CDATA[{xmlInvData}]]></xmlInvData>
      <username>{username}</username>
      <password>{password}</password>
      <pattern>{pattern}</pattern>
      <serial>{serial}</serial>
      <convert>0</convert>
    </ImportAndPublishInv>
  </soap:Body>
</soap:Envelope>";

                Console.WriteLine($"SOAP Request: {soapRequest}");

                // Gọi SOAP API
                string response = await CallSoapApi("https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx", "http://tempuri.org/ImportAndPublishInv", soapRequest);

                // Xử lý response
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(response);
                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsManager.AddNamespace("ns", "http://tempuri.org/");

                string result = xmlDoc.SelectSingleNode("//ns:ImportAndPublishInvResult", nsManager)?.InnerText ?? "";
                Console.WriteLine($"Kết quả ImportAndPublishInv: {result}");

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi gọi API ImportAndPublishInv: {ex.Message}");
                throw;
            }
        }

        static async Task<string> CallSoapApi(string url, string action, string soapRequest)
        {
            try
            {
                Console.WriteLine($"Gọi SOAP API: {url}, Action: {action}");
                
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
                        Console.WriteLine($"SOAP Response: {soapResult}");
                        return soapResult;
                    }
                }
            }
            catch (WebException ex)
            {
                Console.WriteLine($"SOAP Error: {ex.Message}");
                
                if (ex.Response != null)
                {
                    using (StreamReader rd = new StreamReader(ex.Response.GetResponseStream()))
                    {
                        string soapResult = await rd.ReadToEndAsync();
                        Console.WriteLine($"SOAP Error Response: {soapResult}");
                        return $"Error: {ex.Message}\nResponse: {soapResult}";
                    }
                }
                
                return $"Error: {ex.Message}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General Error: {ex.Message}");
                return $"Error: {ex.Message}";
            }
        }

        static string ConvertNumberToWords(decimal number)
        {
            // Đây chỉ là một phiên bản đơn giản, bạn có thể thay thế bằng một hàm chuyển đổi số thành chữ đầy đủ
            return $"{number} đồng";
        }
    }
}
