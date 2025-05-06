# Tài liệu API getInvViewFkey của VNPT

## Tổng quan

API `getInvViewFkey` là một phương thức SOAP được cung cấp bởi VNPT trong dịch vụ PortalService, cho phép lấy nội dung HTML của biên lai điện tử dựa trên khóa biên lai (fkey). API này được sử dụng để hiển thị biên lai điện tử cho người dùng sau khi biên lai đã được phát hành thành công.

## Thông tin cơ bản

- **Endpoint**: https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PortalService.asmx
- **Phương thức**: SOAP
- **Action**: http://tempuri.org/getInvViewFkey
- **Mục đích**: Lấy nội dung HTML của biên lai điện tử để hiển thị

## Tham số

| Tham số | Mô tả |
|---------|-------|
| fkey | Khóa biên lai, có thể là transaction_id hoặc vnpt_key được trả về sau khi phát hành biên lai |
| userName | Tên đăng nhập được cấp bởi VNPT |
| userPass | Mật khẩu được cấp bởi VNPT |

## SOAP Request

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getInvViewFkey xmlns="http://tempuri.org/">
      <fkey>{fkey}</fkey>
      <userName>{userName}</userName>
      <userPass>{userPass}</userPass>
    </getInvViewFkey>
  </soap:Body>
</soap:Envelope>
```

## Kết quả trả về

Kết quả trả về là một chuỗi HTML chứa nội dung biên lai điện tử. Nếu có lỗi, kết quả sẽ bắt đầu bằng "ERR:" theo sau là mã lỗi.

### Các mã lỗi phổ biến

| Mã lỗi | Mô tả | Xử lý |
|--------|-------|-------|
| ERR:1 | Tài khoản đăng nhập sai hoặc không có quyền | Kiểm tra lại thông tin đăng nhập |
| ERR:2 | Không tìm thấy biên lai | Kiểm tra lại fkey |
| ERR:6 | Dải biên lai cũ đã hết | Sử dụng getLinkInvFkey để lấy link biên lai thay thế |

## Cách sử dụng trong hệ thống

Trong hệ thống của chúng ta, API này được triển khai trong lớp `VNPTBienLaiService` với phương thức `GetInvViewByFkey`:

```csharp
public async Task<string> GetInvViewByFkey(string fkey, VNPTAccount? vnptAccount = null)
{
    try
    {
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

        // Gọi SOAP API
        string response = await CallSoapApi(portalServiceUrl, "http://tempuri.org/getInvViewFkey", soapRequest);

        // Xử lý response
        XmlDocument xmlDoc = new XmlDocument();
        xmlDoc.LoadXml(response);
        XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
        nsManager.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
        nsManager.AddNamespace("ns", "http://tempuri.org/");

        string result = xmlDoc.SelectSingleNode("//ns:getInvViewFkeyResult", nsManager)?.InnerText ?? "";

        // Kiểm tra lỗi ERR:6
        if (result == "ERR:6")
        {
            // Thử sử dụng getLinkInvFkey thay thế
            string link = await GetLinkInvByFkey(fkey, vnptAccount);
            if (!link.StartsWith("Error:") && !link.StartsWith("ERR:"))
            {
                return $"<html><body><h2>Biên lai điện tử</h2><p>Biên lai điện tử của bạn đã được tạo thành công.</p><p>Bạn có thể xem biên lai tại đường dẫn sau:</p><p><a href='{link}' target='_blank'>{link}</a></p></body></html>";
            }
        }

        return result;
    }
    catch (Exception ex)
    {
        return $"Error: {ex.Message}";
    }
}
```

## Luồng xử lý trong BienLaiDienTuController

Trong `BienLaiDienTuController`, phương thức `ViewInvoice` sử dụng `GetInvViewByFkey` để lấy nội dung biên lai:

1. Tìm biên lai theo ID
2. Kiểm tra biên lai đã được phát hành chưa
3. Lấy fkey (ưu tiên sử dụng transaction_id nếu có)
4. Lấy tài khoản VNPT của nhân viên
5. Gọi `GetInvViewByFkey` để lấy nội dung biên lai
6. Xử lý các trường hợp lỗi, đặc biệt là ERR:6
7. Trả về nội dung HTML cho client

## Các API liên quan

Ngoài `getInvViewFkey`, VNPT còn cung cấp các API khác để làm việc với biên lai:

1. **downloadInvPDFFkey**: Tải xuống biên lai dạng PDF
2. **getLinkInvFkey**: Lấy link để xem biên lai trên cổng thông tin của VNPT

## Lưu ý quan trọng

- Khi gặp lỗi ERR:6 (Dải biên lai cũ đã hết), nên sử dụng `getLinkInvFkey` để lấy link biên lai thay thế
- Nên lưu cả `transaction_id` và `vnpt_key` khi phát hành biên lai để đảm bảo có thể truy xuất biên lai sau này
- Nên lưu `vnpt_link` vào database sau khi lấy được để tránh phải gọi API nhiều lần

## Ví dụ sử dụng trực tiếp

Để test API này trực tiếp, bạn có thể sử dụng công cụ như Postman hoặc SoapUI với cấu hình sau:

- URL: https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PortalService.asmx
- SOAPAction: http://tempuri.org/getInvViewFkey
- Content-Type: text/xml; charset=utf-8
- Body: SOAP request như đã mô tả ở trên

## Tài khoản VNPT

Tài khoản mặc định:
- Username: ctyhuyphucpws
- Password: Vnpt@1234

Tuy nhiên, mỗi nhân viên có thể có tài khoản VNPT riêng được cấu hình trong hệ thống.
