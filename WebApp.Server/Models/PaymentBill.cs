using System;

namespace WebApp.API.Models
{
    public class PaymentBill
    {
        public int id { get; set; }
        public int? batch_id { get; set; }
        public string file_url { get; set; }
        public string cloudinary_public_id { get; set; }
        public int? uploaded_by { get; set; }
        public DateTime uploaded_at { get; set; }
    }
} 