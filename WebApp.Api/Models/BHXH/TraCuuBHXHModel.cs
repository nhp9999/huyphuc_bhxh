using System;

namespace WebApp.Api.Models.BHXH
{
    public class TraCuuBHXHRequest
    {
        public string? MaSoBHXH { get; set; }
        public string? HoTen { get; set; }
        public string? SoCCCD { get; set; }
    }

    public class TraCuuBHXHResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public BHXHData? Data { get; set; }
    }

    public class BHXHData
    {
        public string MaSoBHXH { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public DateTime NgaySinh { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string SoCCCD { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayCap { get; set; }
    }
} 