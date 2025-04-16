using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class D03Controller : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public D03Controller(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy dữ liệu cho biểu mẫu D03-TS từ đợt kê khai
        /// </summary>
        /// <param name="dotKeKhaiId">ID của đợt kê khai</param>
        /// <returns>Danh sách dữ liệu D03</returns>
        [HttpGet("data/{dotKeKhaiId}")]
        public async Task<ActionResult<IEnumerable<D03TSData>>> GetD03Data(int dotKeKhaiId)
        {
            try
            {
                // Kiểm tra đợt kê khai có tồn tại không
                var dotKeKhai = await _context.DotKeKhais.FindAsync(dotKeKhaiId);
                if (dotKeKhai == null)
                {
                    return NotFound($"Không tìm thấy đợt kê khai có ID = {dotKeKhaiId}");
                }

                // Lấy danh sách kê khai BHYT từ đợt kê khai
                var keKhaiBHYTs = await _context.KeKhaiBHYTs
                    .Where(kk => kk.dot_ke_khai_id == dotKeKhaiId)
                    .Include(kk => kk.ThongTinThe)
                    .ToListAsync();

                if (keKhaiBHYTs == null || !keKhaiBHYTs.Any())
                {
                    return Ok(new List<D03TSData>());
                }

                // Danh sách kết quả
                var result = new List<D03TSData>();

                // Xử lý từng bản ghi
                for (int i = 0; i < keKhaiBHYTs.Count; i++)
                {
                    var kk = keKhaiBHYTs[i];
                    var diaChi = await GetFullAddress(kk.ThongTinThe, kk);

                    result.Add(new D03TSData
                    {
                        STT = i + 1,
                        HoTen = kk.ThongTinThe.ho_ten,
                        NgaySinh = kk.ThongTinThe.ngay_sinh,
                        GioiTinh = kk.ThongTinThe.gioi_tinh,
                        CCCD = kk.ThongTinThe.cccd,
                        DiaChi = diaChi,
                        NoiDangKyKCBBD = kk.benh_vien_kcb,
                        NgayBienLai = kk.ngay_bien_lai,
                        SoBienLai = kk.so_bien_lai,
                        MaSoBHXH = kk.ThongTinThe.ma_so_bhxh,
                        SoTheBHYT = kk.ThongTinThe.so_the_bhyt ?? "",
                        GhiChu = kk.ma_ho_so ?? "",
                        MaHoGD = kk.ThongTinThe.ma_hgd,
                        SoDT = kk.ThongTinThe.so_dien_thoai,
                        SoTien = kk.so_tien_can_dong,
                        TuThang = kk.han_the_moi_tu,
                        SoThangDong = kk.so_thang_dong,
                        MaNhanVien = kk.nguoi_tao,
                        MaTinh = kk.ThongTinThe.ma_tinh_nkq,
                        MaHuyen = kk.ThongTinThe.ma_huyen_nkq,
                        MaXa = kk.ThongTinThe.ma_xa_nkq
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lấy dữ liệu D03-TS: {ex.Message}");
            }
        }

        // Hàm hỗ trợ để tạo địa chỉ đầy đủ từ ThongTinThe và KeKhaiBHYT
        private async Task<string> GetFullAddress(ThongTinThe thongTinThe, KeKhaiBHYT keKhaiBHYT = null)
        {
            if (thongTinThe == null) return "";

            var addressParts = new List<string>();
            
            // Thêm địa chỉ nkq từ KeKhaiBHYT nếu có
            if (keKhaiBHYT != null && !string.IsNullOrEmpty(keKhaiBHYT.dia_chi_nkq))
            {
                addressParts.Add(keKhaiBHYT.dia_chi_nkq);
            }

            // Lấy tên xã/phường, huyện/quận, tỉnh/thành phố từ mã
            string tenXa = "";
            string tenHuyen = "";
            string tenTinh = "";

            // Lấy tên xã từ mã xã
            if (!string.IsNullOrEmpty(thongTinThe.ma_xa_nkq))
            {
                var xa = await _context.DanhMucXas.FirstOrDefaultAsync(x => x.ma == thongTinThe.ma_xa_nkq);
                if (xa != null)
                {
                    tenXa = xa.ten;
                    addressParts.Add(tenXa);
                }
            }

            // Lấy tên huyện từ mã huyện
            if (!string.IsNullOrEmpty(thongTinThe.ma_huyen_nkq))
            {
                var huyen = await _context.DanhMucHuyens.FirstOrDefaultAsync(h => h.ma == thongTinThe.ma_huyen_nkq);
                if (huyen != null)
                {
                    tenHuyen = huyen.ten;
                    addressParts.Add(tenHuyen);
                }
            }

            // Lấy tên tỉnh từ mã tỉnh
            if (!string.IsNullOrEmpty(thongTinThe.ma_tinh_nkq))
            {
                var tinh = await _context.DanhMucTinhs.FirstOrDefaultAsync(t => t.ma == thongTinThe.ma_tinh_nkq);
                if (tinh != null)
                {
                    tenTinh = tinh.ten;
                    addressParts.Add(tenTinh);
                }
            }

            return string.Join(", ", addressParts);
        }
    }

    /// <summary>
    /// DTO chứa dữ liệu cho mẫu D03-TS
    /// </summary>
    public class D03TSData
    {
        public int STT { get; set; }
        public string HoTen { get; set; } = "";
        public string NgaySinh { get; set; } = "";
        public string GioiTinh { get; set; } = "";
        public string CCCD { get; set; } = "";
        public string DiaChi { get; set; } = "";
        public string NoiDangKyKCBBD { get; set; } = "";
        public DateTime? NgayBienLai { get; set; }
        public string? SoBienLai { get; set; }
        public string MaSoBHXH { get; set; } = "";
        public string SoTheBHYT { get; set; } = "";
        public string GhiChu { get; set; } = "";
        public string? MaHoGD { get; set; }
        public string? SoDT { get; set; }
        public decimal SoTien { get; set; }
        public DateTime TuThang { get; set; }
        public int SoThangDong { get; set; }
        public string? MaNhanVien { get; set; }
        public string? MaTinh { get; set; }
        public string? MaHuyen { get; set; }
        public string? MaXa { get; set; }
    }
}
