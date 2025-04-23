using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace WebApp.API.Models.BienlaiDienTu
{
    #region Customer Models

    [XmlRoot("Customers")]
    public class CustomerList
    {
        [XmlElement("Customer")]
        public List<Customer> Customers { get; set; } = new List<Customer>();
    }

    public class Customer
    {
        [XmlElement("n")]
        public string Name { get; set; } = string.Empty;

        [XmlElement("Code")]
        public string Code { get; set; } = string.Empty;

        [XmlElement("TaxCode")]
        public string TaxCode { get; set; } = string.Empty;

        [XmlElement("Address")]
        public string Address { get; set; } = string.Empty;

        [XmlElement("BankAccountName")]
        public string BankAccountName { get; set; } = string.Empty;

        [XmlElement("BankName")]
        public string BankName { get; set; } = string.Empty;

        [XmlElement("BankNumber")]
        public string BankNumber { get; set; } = string.Empty;

        [XmlElement("Email")]
        public string Email { get; set; } = string.Empty;

        [XmlElement("Fax")]
        public string Fax { get; set; } = string.Empty;

        [XmlElement("Phone")]
        public string Phone { get; set; } = string.Empty;

        [XmlElement("ContactPerson")]
        public string ContactPerson { get; set; } = string.Empty;

        [XmlElement("RepresentPerson")]
        public string RepresentPerson { get; set; } = string.Empty;

        [XmlElement("CusType")]
        public int CusType { get; set; } = 0; // 1: Doanh nghiệp/0: Cá nhân
    }

    #endregion

    #region Invoice Models

    [XmlRoot("Invoices")]
    public class InvoiceList
    {
        [XmlElement("Inv")]
        public List<InvoiceWrapper> Invoices { get; set; } = new List<InvoiceWrapper>();
    }

    public class InvoiceWrapper
    {
        [XmlElement("key")]
        public string Key { get; set; } = string.Empty;

        [XmlElement("Invoice")]
        public Invoice Invoice { get; set; } = new Invoice();
    }

    public class Invoice
    {
        [XmlElement("CusCode")]
        public string CusCode { get; set; } = string.Empty;

        [XmlElement("ArisingDate")]
        public string ArisingDate { get; set; } = string.Empty;

        [XmlElement("CusName")]
        public string CusName { get; set; } = string.Empty;

        [XmlElement("Total")]
        public decimal Total { get; set; } = 0;

        [XmlElement("Amount")]
        public decimal Amount { get; set; } = 0;

        [XmlElement("AmountInWords")]
        public string AmountInWords { get; set; } = string.Empty;

        [XmlElement("VATAmount")]
        public decimal VATAmount { get; set; } = 0;

        [XmlElement("VATRate")]
        public decimal VATRate { get; set; } = 0;

        [XmlElement("CusAddress")]
        public string CusAddress { get; set; } = string.Empty;

        [XmlElement("PaymentMethod")]
        public string PaymentMethod { get; set; } = "TM";

        [XmlElement("Extra")]
        public string Extra { get; set; } = string.Empty;

        [XmlElement("Products")]
        public ProductList Products { get; set; } = new ProductList();
    }

    public class ProductList
    {
        [XmlElement("Product")]
        public List<Product> Products { get; set; } = new List<Product>();
    }

    public class Product
    {
        [XmlElement("Code")]
        public string Code { get; set; } = string.Empty;

        [XmlElement("ProdName")]
        public string ProdName { get; set; } = string.Empty;

        [XmlElement("ProdUnit")]
        public string ProdUnit { get; set; } = string.Empty;

        [XmlElement("ProdQuantity")]
        public decimal ProdQuantity { get; set; } = 0;

        [XmlElement("ProdPrice")]
        public decimal ProdPrice { get; set; } = 0;

        [XmlElement("Total")]
        public decimal Total { get; set; } = 0;

        [XmlElement("Amount")]
        public decimal Amount { get; set; } = 0;
    }

    #endregion

    #region Adjust Invoice Models

    [XmlRoot("AdjustInv")]
    public class AdjustInvoice
    {
        [XmlElement("key")]
        public string Key { get; set; } = string.Empty;

        [XmlElement("CusCode")]
        public string CusCode { get; set; } = string.Empty;

        [XmlElement("CusName")]
        public string CusName { get; set; } = string.Empty;

        [XmlElement("CusAddress")]
        public string CusAddress { get; set; } = string.Empty;

        [XmlElement("CusPhone")]
        public string CusPhone { get; set; } = string.Empty;

        [XmlElement("CusTaxCode")]
        public string CusTaxCode { get; set; } = string.Empty;

        [XmlElement("PaymentMethod")]
        public string PaymentMethod { get; set; } = string.Empty;

        [XmlElement("KindOfService")]
        public string KindOfService { get; set; } = string.Empty;

        [XmlElement("Type")]
        public int Type { get; set; } = 2; // 2-Điều chỉnh tăng, 3-Điều chỉnh giảm, 4- Biên lai điều chỉnh thông tin

        [XmlElement("Products")]
        public AdjustProductList Products { get; set; } = new AdjustProductList();

        [XmlElement("Total")]
        public decimal Total { get; set; } = 0;

        [XmlElement("VATRate")]
        public float VATRate { get; set; } = 0;

        [XmlElement("VATAmount")]
        public decimal VATAmount { get; set; } = 0;

        [XmlElement("Amount")]
        public decimal Amount { get; set; } = 0;

        [XmlElement("AmountInWords")]
        public string AmountInWords { get; set; } = string.Empty;

        [XmlElement("Extra")]
        public string Extra { get; set; } = string.Empty;
    }

    public class AdjustProductList
    {
        [XmlElement("Product")]
        public List<AdjustProduct> Products { get; set; } = new List<AdjustProduct>();
    }

    public class AdjustProduct
    {
        [XmlElement("ProdName")]
        public string ProdName { get; set; } = string.Empty;

        [XmlElement("ProdUnit")]
        public string ProdUnit { get; set; } = string.Empty;

        [XmlElement("ProdQuantity")]
        public decimal ProdQuantity { get; set; } = 0;

        [XmlElement("ProdPrice")]
        public decimal ProdPrice { get; set; } = 0;

        [XmlElement("Amount")]
        public decimal Amount { get; set; } = 0;
    }

    #endregion

    #region Replace Invoice Models

    [XmlRoot("ReplaceInv")]
    public class ReplaceInvoice
    {
        [XmlElement("key")]
        public string Key { get; set; } = string.Empty;

        [XmlElement("CusCode")]
        public string CusCode { get; set; } = string.Empty;

        [XmlElement("CusName")]
        public string CusName { get; set; } = string.Empty;

        [XmlElement("CusAddress")]
        public string CusAddress { get; set; } = string.Empty;

        [XmlElement("CusPhone")]
        public string CusPhone { get; set; } = string.Empty;

        [XmlElement("CusTaxCode")]
        public string CusTaxCode { get; set; } = string.Empty;

        [XmlElement("PaymentMethod")]
        public string PaymentMethod { get; set; } = string.Empty;

        [XmlElement("KindOfService")]
        public string KindOfService { get; set; } = string.Empty;

        [XmlElement("Products")]
        public ReplaceProductList Products { get; set; } = new ReplaceProductList();

        [XmlElement("Total")]
        public decimal Total { get; set; } = 0;

        [XmlElement("VATRate")]
        public float VATRate { get; set; } = 0;

        [XmlElement("VATAmount")]
        public decimal VATAmount { get; set; } = 0;

        [XmlElement("Amount")]
        public decimal Amount { get; set; } = 0;

        [XmlElement("AmountInWords")]
        public string AmountInWords { get; set; } = string.Empty;

        [XmlElement("Extra")]
        public string Extra { get; set; } = string.Empty;
    }

    public class ReplaceProductList
    {
        [XmlElement("Product")]
        public List<ReplaceProduct> Products { get; set; } = new List<ReplaceProduct>();
    }

    public class ReplaceProduct
    {
        [XmlElement("ProdName")]
        public string ProdName { get; set; } = string.Empty;

        [XmlElement("ProdUnit")]
        public string ProdUnit { get; set; } = string.Empty;

        [XmlElement("ProdQuantity")]
        public decimal ProdQuantity { get; set; } = 0;

        [XmlElement("ProdPrice")]
        public decimal ProdPrice { get; set; } = 0;

        [XmlElement("Amount")]
        public decimal Amount { get; set; } = 0;
    }

    #endregion

    #region Request/Response Models

    public class CreateCustomerRequest
    {
        public string TenNguoiDong { get; set; } = string.Empty;
        public string MaSoBHXH { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public int LoaiKhachHang { get; set; } = 0; // 0: Cá nhân, 1: Doanh nghiệp
    }

    public class PublishInvoiceRequest
    {
        public int BienLaiId { get; set; }
        public string TenNguoiDong { get; set; } = string.Empty;
        public string MaSoBHXH { get; set; } = string.Empty;
        public decimal SoTien { get; set; } = 0;
        public string GhiChu { get; set; } = string.Empty;
        public bool IsBHYT { get; set; } = true;
        public bool IsBHXH { get; set; } = false;
    }

    public class AdjustInvoiceRequest
    {
        public string FKey { get; set; } = string.Empty;
        public string TenNguoiDong { get; set; } = string.Empty;
        public string MaSoBHXH { get; set; } = string.Empty;
        public decimal SoTien { get; set; } = 0;
        public string GhiChu { get; set; } = string.Empty;
        public int LoaiDieuChinh { get; set; } = 2; // 2-Điều chỉnh tăng, 3-Điều chỉnh giảm, 4- Biên lai điều chỉnh thông tin
        public bool IsBHYT { get; set; } = true;
        public bool IsBHXH { get; set; } = false;
    }

    public class ReplaceInvoiceRequest
    {
        public string FKey { get; set; } = string.Empty;
        public string TenNguoiDong { get; set; } = string.Empty;
        public string MaSoBHXH { get; set; } = string.Empty;
        public decimal SoTien { get; set; } = 0;
        public string GhiChu { get; set; } = string.Empty;
        public bool IsBHYT { get; set; } = true;
        public bool IsBHXH { get; set; } = false;
    }

    public class CancelInvoiceRequest
    {
        public string FKey { get; set; } = string.Empty;
    }

    public class VNPTBienLaiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Data { get; set; } = string.Empty;
    }

    #region ImportAndPublishInvWithLink Response Models

    public class VNPTBienLaiWithLinkResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public ImportAndPublishInvWithLinkResult Data { get; set; } = new ImportAndPublishInvWithLinkResult();
    }

    [XmlRoot("ImportAndPublishInvWithLinkResult")]
    public class ImportAndPublishInvWithLinkResult
    {
        [XmlElement("Status")]
        public string Status { get; set; } = string.Empty;

        [XmlElement("LstResult")]
        public ResultDetailList LstResult { get; set; } = new ResultDetailList();

        [XmlElement("Message")]
        public string Message { get; set; } = string.Empty;

        [XmlIgnore]
        public string ResultXml { get; set; } = string.Empty;
    }

    public class ResultDetailList
    {
        [XmlElement("ResultDetail")]
        public List<ResultDetail> Results { get; set; } = new List<ResultDetail>();
    }

    public class ResultDetail
    {
        [XmlElement("pattern")]
        public string Pattern { get; set; } = string.Empty;

        [XmlElement("serial")]
        public string Serial { get; set; } = string.Empty;

        [XmlElement("no")]
        public decimal No { get; set; }

        [XmlElement("link")]
        public string Link { get; set; } = string.Empty;

        [XmlElement("xmlDownload")]
        public string XmlDownload { get; set; } = string.Empty;

        [XmlElement("fkey")]
        public string Fkey { get; set; } = string.Empty;

        [XmlElement("xmlContent")]
        public string XmlContent { get; set; } = string.Empty;
    }

    #endregion

    #endregion
}
