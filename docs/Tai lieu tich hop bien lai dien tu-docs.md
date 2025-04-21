TÀI LIỆU TÍCH HỢP KỸ THUẬT 
NGHIỆP VỤ BIÊN LAI
 (thinp@vnpt.vn)
I.	Phương thức tích hợp
•	Giao thức trao đổi thông tin giữa phần mềm và hệ thống HĐĐT: Thông qua cuộc gọi hàm webservice.
 
II.	Mô tả đầu hàm
1.	Cập nhật dữ liệu khách hàng
Int  UpdateCus (string XMLCusData, string username, string pass, int convert)
Mô tả
•	XMLCusData: String XML dữ liệu khách hàng 
•	Username/pass: Tài khoản cung cấp cho nhân viên có quyền để gọi service
•	Trả về: giá trị Int  thông báo kết quả/Lỗi gặp phải
Kết quả trả về	Mô tả	Ghi chú
-1	Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng	
-2	Không import được khách hàng vào db	Có rollback db
-3	Dữ liệu xml đầu vào không đúng quy định	Chỉ cần 1 customer trong chuỗi xml không hợp lệ, không thực hiện update trên tất cả dữ liệu đưa vào
N	Số lượng khách hàng đã import và update	N>0, N là kiểu integer

Cấu trúc của xmlCusData (các trường * là bắt buộc):
<Customers>
<Customer>
<Name>Tên khách hàng*(String length=200)</Name>
<Code>Mã khách hàng*(string length=50)</Code>
<TaxCode>Mã số thuế (bắt buộc với khách hàng là doanh nghiệp)(string  length=100)</TaxCode>
<Address>Địa chỉ khách hàng (string length=300)</Address>
            <BankAccountName>Tên tài khoản ngân hàng(string length= 200) </BankAccountName>
<BankName>Tên ngân hàng (string length=50)</BankName>
<BankNumber>Số tài khoản(string length=50)</BankNumber>
<Email>Email*(string length=50)</Email>
<Fax>Số fax (string length=50)</Fax>
<Phone>Điện thoại(string length=50)</Phone>
<ContactPerson>Liên hệ(string length=150)</ContactPerson>
<RepresentPerson>Người đại diện (string length= 150)</RepresentPerson>
<CusType>Loại khách hàng (1: Doanh nghiệp/0: Cá nhân)*</CusType>
</Customer>
<Customer>...</Customer>
</Customers>
2.	Phát hành biên lai
String ImportAndPublishInv(string Account, string ACpass, string xmlInvData, string username, string password, string pattern, string serial, int convert).
Mô tả
•	Account/ACPass :  Tài khoản được cấp phát cho nhân viên gọi lệnh phát hành biên lai
•	Username/pass: Tài khoản được cấp phát cho khách hàng để gọi service.
•	xmlInvData: String XML dữ liệu biên lai
•	convert: Mặc định là 0, 0 – Không cần convert  từ TCVN3 sang Unicode. 1- Cần convert từ TCVN3 sang Unicode 
•	pattern: pattern biên lai
•	serial: serial biên lai
•	Trả về: String kết quả

Kết quả trả về	Mô tả	Ghi chú
ERR:1	Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng	Kiểu string
ERR:3	Dữ liệu xml đầu vào không đúng quy định	Chỉ cần 1 invoice trong chuỗi xml không hợp lệ, không thực hiện phát hành trên tất cả dữ liệu đưa vào
ERR:7	User name không phù hợp, không tìm thấy company tương ứng cho user.	Kiểu string
ERR:20
	Pattern và serial không phù hợp, hoặc không tồn tại biên lai đã đăng kí có sử dụng Pattern và serial truyền vào	Kiểu string
Chỉ chấp nhận đồng thời nhập cả Pattern và serial hoặc đồng thời để trống cả pattern và serial
ERR:5
	Không phát hành được biên lai	DB roll back
OK: pattern;serial1-num11,num12,num13…;serial2-num21,num22,num23

(Ví dụ:
OK:01GTKT3/001;AA/12E-key1_1,key2_2,key3_3….	•	OK → đã phát hành biên lai thành công
•	Pattern → Mẫu số của các biên lai đã phát hành
•	Serial1 → serial của dãy các biên lai phát hành 
•	num1, num2… là các số biên lai
•	key1, key2… dùng để nhận biết biên lai phát hành cho khách hàng nào(lấy từ đầu vào)	•  Cách biên lai có serial khác nhau phân cách bởi dấu “;”
•  Các số biên lai phân cách bởi “,”
•  Số biên lai và key ngăn cách bởi “_”


Note: 
Tiền tố ERR → có lỗi khi thực hiện hàm
Tiền tố OK → thực hiện phát hành biên lai thành công
Chỉ cho phép truyền vào 1 lúc 5000 biên lai.

Cấu trúc của xmlCusData (các trường * là bắt buộc):
<Invoices> 
 <Inv>
<key>abcd</key> <!--Key duy nhất ứng với từng biên lai. Theo trao đổi với các anh đây sẽ là mã 1 cửa-->
  <Invoice>
        <CusCode>KH000356</CusCode> <!--Mã ứng với người nộp tiền. -->
                        <ArisingDate>22/08/2017</ArisingDate> <!--Ngày nộp tiền-->
        <CusName>Trần Văn Hảo</CusName> <!--Tên người nộp tiền-->
        <Total>0</Total> <!--Chỉ cần có thẻ, không cần truyền giá trị. Total nên truyền luôngía trị số tiền nộp-->
        <Amount>90000</Amount> <!--Số tiền nộp-->
        <AmountInWords>Chín mươi ngàn đồng</AmountInWords> <!--Số tiền nộp bằng chữ-->
        <VATAmount>0</VATAmount> <!--Bắt buộc có thẻ. Để mặc định bằng 0-->
        <VATRate>0</VATRate><!--Bắt buộc có thẻ. Để mặc định bằng 0-->
        <CusAddress></CusAddress><!--Chỉ cần có thẻ, không cần truyền giá trị-->
       <PaymentMethod>TM</PaymentMethod> <!--Hình thức thanh toán-->
       <Extra>Phí thành lập doanh nghiệp</Extra><!--tên loại phí lệ phí hiển thị trên biên lai-->
        <Products><!--Bắt buộc có thẻ. -->
            <Product><!--Bắt buộc có thẻ. -->
              <Code></Code><!--Bắt buộc có thẻ. -->
              <ProdName></ProdName><!--Bắt buộc có thẻ. -->
              <ProdUnit>ai</ProdUnit><!--Bắt buộc có thẻ. -->
              <ProdQuantity></ProdQuantity><!--Bắt buộc có thẻ. -->
              <ProdPrice></ProdPrice><!--Bắt buộc có thẻ. -->
              <Total></Total><!--Bắt buộc có thẻ.-->
              <Amount></Amount><!--Bắt buộc có thẻ-->
            </Product>
        </Products>
  </Invoice>
</Inv>
</Invoices>
3.	Điều chỉnh biên lai
String AdjustInvoiceAction (string Account, string ACpass, string xmlInvData, string username, string pass, string fkey,string AttachFile, int convert,string pattern,string serial): thêm serial(ký hiệu biên lai) và pattern(ký hiệu mẫu) nếu nhiều giải biên lai

Mô tả
•	Account/ACPass :  Tài khoản được cấp phát cho nhân viên gọi lệnh phát hành biên lai
•	username/pass: Tài khoản được cấp phát cho khách hàng để gọi service.
•	xmlInvData: String XML dữ liệu biên lai cũ và biên lai điều chỉnh
•	fkey:Chuỗi xác định biên lai cần điều chỉnh
•	AttachFile: “”;
•	convert: Mặc định là 0, 0 – Không cần convert từ TCVN3 sang Unicode. 1- Cần convert từ TCVN3 sang Unicode 
•	serial: ký hiệu biên lai.
•	pattern: ký hiệu mẫu biên lai.
•	Trả về: String kết quả

Kết quả trả về	Mô tả	Ghi chú
ERR:1	Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng	Kiểu string
ERR:2	Biên lai cần điều chỉnh không tồn tại	
ERR:3	Dữ liệu xml đầu vào không đúng quy định	
ERR:5	Không phát hành được biên lai	
ERR:6	Dải biên lai cũ đã hết	
ERR:7	User name không phù hợp, không tìm thấy company tương ứng cho user.	Kiểu string
ERR:8	Biên lai cần điều chỉnh đã bị thay thế. Không thể điều chỉnh được nữa.	
ERR:9
	Trạng thái biên lai không được điều chỉnh	
OK: pattern;serial;invNumber
(Ví dụ:
OK:01GTKT3/001;AA/12E;0000002)	•	OK :đã phát hành biên lai thành công
•	Patter: Mẫu số của biên lai điều chỉnh 
•	Serial : serial của biên lai điều chỉnh 
•	invNumber: số biên lai điều chỉnh 	

Note: 
Tiền tố ERR: có lỗi khi thực hiện hàm
Tiền tố OK : thực hiện điều chỉnh biên lai thành công

Cấu trúc của xmlCusData (các trường * là bắt buộc):
<AdjustInv>
<key>chuỗi xác định biên lai mới* (string length= 100)</key >
<CusCode>Mã khách hàng* (string length=50) </CusCode>
<CusName>Tên khách hàng* (string length=200)</CusName>
<CusAddress>Địa chỉ khách hàng* (string length=300)</CusAddress>
<CusPhone>Điện thoại khách hàng (string length=50) </CusPhone>
<CusTaxCode>Mã số thuế KH (Bắt buộc với KH là Doanh nghiệp)(string length= 50) </CusTaxCode>
<PaymentMethod>Phương thức thanh toán (string length=150) </PaymentMethod>
<KindOfService>Tháng biên lai (string length=200) </KindOfService>
<Type>Loại biên lai chỉnh sửa(int-mặc định lấy là 2)  2-Điều chỉnh tăng, 3-Điều chỉnh giảm, 4- Biên lai điều chỉnh thông tin</Type>
<Products>
<Product>
<ProdName>Tên khoản thu*(string length=200)</ProdName>
<ProdUnit>Đơn vị tính (string length=50) </ProdUnit>
<ProdQuantity>Số lượng(Decimal in c#)</ProdQuantity>
<ProdPrice>Đơn giá (Decimal in c#)</ProdPrice>
<Amount>Tổng tiền*  (decimal in c#)</Amount>
</Product>
</Products>
<Total>Tổng tiền trước thuế*(decimail in c#)</Total>
<VATRate>Thuế GTGT* (float in c#)</VATRate>
<VATAmount>Tiền thuế GTGT* (Decimal in c#)</VATAmount>
<Amount>Tổng tiền*(Decimal in c#)</Amount>
<AmountInWords>Số tiền viết bằng chữ*(string length=255)</AmountInWords>
       <Extra>Phí thành lập doanh nghiệp</Extra><!--tên loại phí lệ phí hiển thị trên biên lai-->
</AdjustInv>
4.	Thay thế biên lai
String ReplaceInvoiceAction(string Account, string Acpass, string xmlInvData, string username, string pass, string fkey, string Attachfile, string convert, string pattern, string serial)

Mô tả
•	Account/ACpass :  Tài khoản được cấp phát cho nhân viên gọi lệnh phát hành biên lai
•	xmlInvData: String XML dữ liệu biên lai cũ và biên lai thay thế
•	Username/pass: Tài khoản được cấp phát cho khách hàng để gọi service.
•	fkey: Chuỗi xác định biên lai cần thay thế
•	 Attachfile: Chưa sử dụng để Null;
•	convert: Mặc định là 0, 0 – Không cần convert từ TCVN3 sang Unicode. 1- Cần convert từ TCVN3 sang Unicode
•	pattern: ký hiệu mẫu 
•	serial: ký hiệu biên lai
•	Trả về: String kết quả

Kết quả trả về	Mô tả	Ghi chú
ERR:1	Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng	Kiểu string
ERR:2	Không tồn tại biên lai cần thay thế	
ERR:3	Dữ liệu xml đầu vào không đúng quy định	
ERR:5	Có lỗi trong quá trình thay thế biên lai	DB roll back
ERR:6	Dải biên lai cũ đã hết	
ERR:7	User name không phù hợp, không tìm thấy company tương ứng cho user.	Kiểu string
ERR:8	Biên lai đã được thay thế rồi. Không thể thay thế nữa.	
ERR:20
	Pattern và serial không phù hợp	
ERR:9
	Trạng thái biên lai ko được thay thế	
OK: pattern;serial;invNumber
(Ví dụ:
OK:01GTKT3/001;AA/12E;0000001)	•	OK  đã thay thế biên lai thành công
•	Patterm  Mẫu số của biên lai thay thế
•	Serial  serial của biên lai thay thế 
•	invNumber:số biên lai thay thế cho biên lai cũ
	

Note: 
Tiền tố ERR : có lỗi khi thực hiện hàm
Tiền tố OK : thực hiện thay thế biên lai thành công

Cấu trúc của xmlCusData (các trường * là bắt buộc):
<ReplaceInv>
<key>chuỗi xác định biên lai mới* (string length= 100)</key >
<CusCode>Mã khách hàng* (string length=50) </CusCode>
<CusName>Tên khách hàng* (string length=200)</CusName>
<CusAddress>Địa chỉ khách hàng* (string length=300)</CusAddress>
<CusPhone>Điện thoại khách hàng (string length=50) </CusPhone>
<CusTaxCode>Mã số thuế KH (Bắt buộc với KH là Doanh nghiệp)(string length= 50) </CusTaxCode>
<PaymentMethod>Phương thức thanh toán (string length=150) </PaymentMethod>
<KindOfService>Tháng biên lai (string length=200) </KindOfService>
<Products>
<Product>
<ProdName>Tên sản phẩm*(string length=200)</ProdName>
<ProdUnit>Đơn vị tính (string length=50) </ProdUnit>
<ProdQuantity>Số lượng(Decimal in c#)</ProdQuantity>
<ProdPrice>Đơn giá (Decimal in c#)</ProdPrice>
<Amount>Tổng tiền*  (decimal in c#)</Amount>
</Product>
</Products>
<Total>Tổng tiền trước thuế*(decimail in c#)</Total>
<VATRate>Thuế GTGT* (float in c#)</VATRate>
<VATAmount>Tiền thuế GTGT* (Decimal in c#)</VATAmount>
<Amount>Tổng tiền*(Decimal in c#)</Amount>
<AmountInWords>Số tiền viết bằng chữ*(string length=255)</AmountInWords>
       <Extra>Phí thành lập doanh nghiệp</Extra><!--tên loại phí lệ phí hiển thị trên biên lai--></ReplaceInv>
5.	Hủy biên lai(không thay thế, điều chỉnh)
String cancelInv (string Account, string ACpass, string fkey, string userName, string userPass).
Mô tả
•	Account/ACPass :  Tài khoản được cấp phát cho nhân viên gọi lệnh hủy biên lai
•	userName/userPass: Tài khoản được cấp phát cho khách hàng để gọi service.
•	fkey: Chuỗi xác định biên lai cần hủy
•	Trả về: String kết quả

Kết quả trả về	Mô tả	Ghi chú
ERR:1	Tài khoản đăng nhập sai hoặc không có quyền thêm khách hàng	
ERR:2	Không tồn tại biên lai cần hủy	
ERR:8	Biên lai đã được thay thế rồi, hủy rồi	
ERR:9
	Trạng thái biên lai ko được hủy	Tùy thuộc vào yêu cầu nghiệp vụ
OK:
	Hủy thành công	


https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/
ctyhuyphucpagadmin/..... (mày tự điền)
https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PublishService.asmx
https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/BusinessService.asmx
https://ctyhuyphucpagadmin.vnpt-invoice.com.vn/PortalService.asmx
tài khoản:ctyhuyphucpws
mật khẩu:Vnpt@1234

