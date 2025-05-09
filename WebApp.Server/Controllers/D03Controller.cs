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

        /// <summary>
        /// Lấy dữ liệu cho biểu mẫu D03-TS từ một bảng ghi kê khai cụ thể
        /// </summary>
        /// <param name="keKhaiId">ID của bảng ghi kê khai</param>
        /// <param name="loaiKeKhai">Loại kê khai: 'bhyt' hoặc 'bhxh'</param>
        /// <returns>Dữ liệu D03 cho bảng ghi</returns>
        [HttpGet("record/{loaiKeKhai}/{keKhaiId}")]
        public async Task<ActionResult<D03TSData>> GetD03DataForRecord(string loaiKeKhai, int keKhaiId)
        {
            try
            {
                if (loaiKeKhai.ToLower() != "bhyt" && loaiKeKhai.ToLower() != "bhxh")
                {
                    return BadRequest("Loại kê khai không hợp lệ. Chỉ chấp nhận 'bhyt' hoặc 'bhxh'.");
                }

                if (loaiKeKhai.ToLower() == "bhyt")
                {
                    // Lấy thông tin kê khai BHYT
                    var keKhaiBHYT = await _context.KeKhaiBHYTs
                        .Include(kk => kk.ThongTinThe)
                        .FirstOrDefaultAsync(kk => kk.id == keKhaiId);

                    if (keKhaiBHYT == null)
                    {
                        return NotFound($"Không tìm thấy kê khai BHYT có ID = {keKhaiId}");
                    }

                    var diaChi = await GetFullAddress(keKhaiBHYT.ThongTinThe, keKhaiBHYT);

                    var result = new D03TSData
                    {
                        STT = 1,
                        HoTen = keKhaiBHYT.ThongTinThe.ho_ten,
                        NgaySinh = keKhaiBHYT.ThongTinThe.ngay_sinh,
                        GioiTinh = keKhaiBHYT.ThongTinThe.gioi_tinh,
                        CCCD = keKhaiBHYT.ThongTinThe.cccd,
                        DiaChi = diaChi,
                        NoiDangKyKCBBD = keKhaiBHYT.benh_vien_kcb,
                        NgayBienLai = keKhaiBHYT.ngay_bien_lai,
                        SoBienLai = keKhaiBHYT.so_bien_lai,
                        MaSoBHXH = keKhaiBHYT.ThongTinThe.ma_so_bhxh,
                        SoTheBHYT = keKhaiBHYT.ThongTinThe.so_the_bhyt ?? "",
                        GhiChu = keKhaiBHYT.ma_ho_so ?? "",
                        MaHoGD = keKhaiBHYT.ThongTinThe.ma_hgd,
                        SoDT = keKhaiBHYT.ThongTinThe.so_dien_thoai,
                        SoTien = keKhaiBHYT.so_tien_can_dong,
                        TuThang = keKhaiBHYT.han_the_moi_tu,
                        SoThangDong = keKhaiBHYT.so_thang_dong,
                        MaNhanVien = keKhaiBHYT.nguoi_tao,
                        MaTinh = keKhaiBHYT.ThongTinThe.ma_tinh_nkq,
                        MaHuyen = keKhaiBHYT.ThongTinThe.ma_huyen_nkq,
                        MaXa = keKhaiBHYT.ThongTinThe.ma_xa_nkq
                    };

                    return Ok(result);
                }
                else // BHXH
                {
                    // Lấy thông tin kê khai BHXH
                    var keKhaiBHXH = await _context.KeKhaiBHXHs
                        .Include(kk => kk.ThongTinThe)
                        .FirstOrDefaultAsync(kk => kk.id == keKhaiId);

                    if (keKhaiBHXH == null)
                    {
                        return NotFound($"Không tìm thấy kê khai BHXH có ID = {keKhaiId}");
                    }

                    var diaChi = await GetFullAddress(keKhaiBHXH.ThongTinThe ?? new ThongTinThe());

                    var result = new D03TSData
                    {
                        STT = 1,
                        HoTen = keKhaiBHXH.ThongTinThe.ho_ten,
                        NgaySinh = keKhaiBHXH.ThongTinThe.ngay_sinh,
                        GioiTinh = keKhaiBHXH.ThongTinThe.gioi_tinh,
                        CCCD = keKhaiBHXH.ThongTinThe.cccd,
                        DiaChi = diaChi,
                        NoiDangKyKCBBD = "",
                        NgayBienLai = keKhaiBHXH.ngay_bien_lai,
                        SoBienLai = keKhaiBHXH.so_bien_lai,
                        MaSoBHXH = keKhaiBHXH.ThongTinThe.ma_so_bhxh,
                        SoTheBHYT = keKhaiBHXH.ThongTinThe.so_the_bhyt ?? "",
                        GhiChu = keKhaiBHXH.ma_ho_so ?? "",
                        MaHoGD = keKhaiBHXH.ThongTinThe.ma_hgd,
                        SoDT = keKhaiBHXH.ThongTinThe.so_dien_thoai,
                        SoTien = keKhaiBHXH.so_tien_can_dong,
                        TuThang = keKhaiBHXH.thang_bat_dau != null ? DateTime.TryParse(keKhaiBHXH.thang_bat_dau, out var date) ? date : DateTime.Now : DateTime.Now,
                        SoThangDong = keKhaiBHXH.so_thang_dong,
                        MaNhanVien = keKhaiBHXH.nguoi_tao,
                        MaTinh = keKhaiBHXH.ThongTinThe.ma_tinh_nkq,
                        MaHuyen = keKhaiBHXH.ThongTinThe.ma_huyen_nkq,
                        MaXa = keKhaiBHXH.ThongTinThe.ma_xa_nkq
                    };

                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lấy dữ liệu D03-TS cho bảng ghi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy dữ liệu cho biểu mẫu D03-TS từ mã số BHXH
        /// </summary>
        /// <param name="maSoBHXH">Mã số BHXH</param>
        /// <returns>Dữ liệu D03 cho mã số BHXH</returns>
        [HttpGet("ma-so-bhxh/{maSoBHXH}")]
        public async Task<ActionResult<D03TSData>> GetD03DataByMaSoBHXH(string maSoBHXH)
        {
            try
            {
                // Kiểm tra mã số BHXH có tồn tại không
                var thongTinThe = await _context.ThongTinThes
                    .FirstOrDefaultAsync(t => t.ma_so_bhxh == maSoBHXH);

                if (thongTinThe == null)
                {
                    return NotFound($"Không tìm thấy thông tin thẻ với mã số BHXH = {maSoBHXH}");
                }

                // Lấy địa chỉ đầy đủ
                var diaChi = await GetFullAddress(thongTinThe);

                // Lấy thông tin bệnh viện KCB ban đầu
                string noiDangKyKCBBD = "";
                if (!string.IsNullOrEmpty(thongTinThe.ma_benh_vien))
                {
                    // Tìm thông tin bệnh viện từ mã bệnh viện
                    var benhVien = await _context.DanhMucCSKCBs
                        .FirstOrDefaultAsync(bv => bv.value == thongTinThe.ma_benh_vien);

                    if (benhVien != null)
                    {
                        // Hiển thị mã bệnh viện trước tên bệnh viện
                        noiDangKyKCBBD = $"{benhVien.value} - {benhVien.ten}";
                    }
                    else
                    {
                        // Nếu không tìm thấy thông tin bệnh viện, hiển thị mã bệnh viện
                        noiDangKyKCBBD = thongTinThe.ma_benh_vien;
                    }
                }

                // Lấy thông tin người dùng hiện tại từ token
                var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                string maNhanVien = "";

                if (!string.IsNullOrEmpty(username))
                {
                    // Lấy thông tin người dùng từ database
                    var currentUser = await _context.NguoiDungs
                        .FirstOrDefaultAsync(u => u.user_name == username);

                    if (currentUser != null && !string.IsNullOrEmpty(currentUser.ma_nhan_vien))
                    {
                        maNhanVien = currentUser.ma_nhan_vien;
                    }
                }

                // Tạo ngày đầu tiên của tháng hiện tại (01/MM/YYYY)
                DateTime now = DateTime.Now;
                DateTime firstDayOfMonth = new DateTime(now.Year, now.Month, 1);

                // Tạo dữ liệu D03 từ thông tin thẻ
                var result = new D03TSData
                {
                    STT = 1,
                    HoTen = thongTinThe.ho_ten,
                    NgaySinh = thongTinThe.ngay_sinh,
                    GioiTinh = thongTinThe.gioi_tinh,
                    CCCD = thongTinThe.cccd,
                    DiaChi = diaChi,
                    NoiDangKyKCBBD = noiDangKyKCBBD,
                    NgayBienLai = DateTime.Now,
                    SoBienLai = "",
                    MaSoBHXH = thongTinThe.ma_so_bhxh,
                    SoTheBHYT = thongTinThe.so_the_bhyt ?? "",
                    GhiChu = "",
                    MaHoGD = thongTinThe.ma_hgd,
                    SoDT = thongTinThe.so_dien_thoai,
                    SoTien = 0,
                    TuThang = firstDayOfMonth, // Sử dụng ngày đầu tiên của tháng hiện tại
                    SoThangDong = 0,
                    MaNhanVien = maNhanVien,
                    MaTinh = thongTinThe.ma_tinh_nkq,
                    MaHuyen = thongTinThe.ma_huyen_nkq,
                    MaXa = thongTinThe.ma_xa_nkq
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lấy dữ liệu D03-TS cho mã số BHXH: {ex.Message}");
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
