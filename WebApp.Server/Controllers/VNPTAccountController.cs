using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WebApp.API.Data;
using WebApp.API.Models.BienlaiDienTu;
using WebApp.API.Services;

namespace WebApp.API.Controllers
{
    public class CloneAccountRequest
    {
        [Required(ErrorMessage = "Mã nhân viên không được để trống")]
        public string MaNhanVien { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/vnpt-accounts")]
    [Authorize(Roles = "admin,super_admin")]
    public class VNPTAccountController : ControllerBase
    {
        private readonly ILogger<VNPTAccountController> _logger;
        private readonly VNPTAccountService _vnptAccountService;
        private readonly ApplicationDbContext _context;

        public VNPTAccountController(
            ILogger<VNPTAccountController> logger,
            VNPTAccountService vnptAccountService,
            ApplicationDbContext context)
        {
            _logger = logger;
            _vnptAccountService = vnptAccountService;
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách tất cả tài khoản VNPT
        /// </summary>
        /// <returns>Danh sách tài khoản VNPT</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllAccounts()
        {
            try
            {
                var accounts = await _vnptAccountService.GetAllAccounts();

                // Chuyển đổi sang định dạng phù hợp với client
                var result = accounts.Select(a => new
                {
                    id = a.Id,
                    maNhanVien = a.MaNhanVien,
                    account = a.Account,
                    acpass = a.ACPass,
                    username = a.Username,
                    password = a.Password,
                    pattern = a.Pattern,
                    serial = a.Serial,
                    serviceUrl = a.ServiceUrl,
                    isActive = a.IsActive,
                    createdAt = a.CreatedAt,
                    updatedAt = a.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tài khoản VNPT");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách tài khoản VNPT" });
            }
        }

        /// <summary>
        /// Lấy thông tin tài khoản VNPT theo ID
        /// </summary>
        /// <param name="id">ID tài khoản VNPT</param>
        /// <returns>Thông tin tài khoản VNPT</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccountById(int id)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu lấy thông tin tài khoản VNPT với ID: {id}");
                var account = await _vnptAccountService.GetAccountById(id);
                _logger.LogInformation($"Kết quả tìm kiếm tài khoản VNPT với ID {id}: {(account != null ? "Tìm thấy" : "Không tìm thấy")}");

                if (account == null)
                {
                    return NotFound(new { message = $"Không tìm thấy tài khoản VNPT với ID {id}" });
                }

                // Chuyển đổi sang định dạng phù hợp với client
                var result = new
                {
                    id = account.Id,
                    maNhanVien = account.MaNhanVien,
                    account = account.Account,
                    acpass = account.ACPass,
                    username = account.Username,
                    password = account.Password,
                    pattern = account.Pattern,
                    serial = account.Serial,
                    serviceUrl = account.ServiceUrl,
                    isActive = account.IsActive,
                    createdAt = account.CreatedAt,
                    updatedAt = account.UpdatedAt
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin tài khoản VNPT với ID {id}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin tài khoản VNPT" });
            }
        }

        /// <summary>
        /// Lấy thông tin tài khoản VNPT theo mã nhân viên
        /// </summary>
        /// <param name="maNhanVien">Mã nhân viên</param>
        /// <returns>Thông tin tài khoản VNPT</returns>
        [HttpGet("ma-nhan-vien/{maNhanVien}")]
        public async Task<IActionResult> GetAccountByMaNhanVien(string maNhanVien)
        {
            try
            {
                var account = await _vnptAccountService.GetAccountByMaNhanVien(maNhanVien);
                if (account == null)
                {
                    return NotFound(new { message = $"Không tìm thấy tài khoản VNPT với mã nhân viên {maNhanVien}" });
                }

                // Chuyển đổi sang định dạng phù hợp với client
                var result = new
                {
                    id = account.Id,
                    maNhanVien = account.MaNhanVien,
                    account = account.Account,
                    acpass = account.ACPass,
                    username = account.Username,
                    password = account.Password,
                    pattern = account.Pattern,
                    serial = account.Serial,
                    serviceUrl = account.ServiceUrl,
                    isActive = account.IsActive,
                    createdAt = account.CreatedAt,
                    updatedAt = account.UpdatedAt
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin tài khoản VNPT với mã nhân viên {maNhanVien}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin tài khoản VNPT" });
            }
        }

        /// <summary>
        /// Tạo mới tài khoản VNPT
        /// </summary>
        /// <param name="account">Thông tin tài khoản VNPT</param>
        /// <returns>Tài khoản VNPT đã tạo</returns>
        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] VNPTAccount account)
        {
            try
            {
                if (account == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                var createdAccount = await _vnptAccountService.CreateAccount(account);
                if (createdAccount == null)
                {
                    return BadRequest(new { message = $"Mã nhân viên {account.MaNhanVien} đã tồn tại trong hệ thống" });
                }

                return CreatedAtAction(nameof(GetAccountByMaNhanVien), new { maNhanVien = createdAccount.MaNhanVien }, createdAccount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo tài khoản VNPT");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo tài khoản VNPT" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin tài khoản VNPT
        /// </summary>
        /// <param name="id">ID tài khoản VNPT</param>
        /// <param name="account">Thông tin tài khoản VNPT</param>
        /// <returns>Tài khoản VNPT đã cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccount(int id, [FromBody] VNPTAccount account)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu cập nhật tài khoản VNPT với ID: {id}");
                _logger.LogInformation($"Dữ liệu gửi lên: {System.Text.Json.JsonSerializer.Serialize(account)}");

                if (account == null)
                {
                    _logger.LogWarning("Dữ liệu gửi lên là null");
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                if (id != account.Id)
                {
                    _logger.LogWarning($"ID không khớp: ID trong URL = {id}, ID trong dữ liệu = {account.Id}");
                    return BadRequest(new { message = "Dữ liệu không hợp lệ: ID không khớp" });
                }

                var updatedAccount = await _vnptAccountService.UpdateAccount(account);
                if (updatedAccount == null)
                {
                    return NotFound(new { message = $"Không tìm thấy tài khoản VNPT với ID {id}" });
                }

                // Chuyển đổi sang định dạng phù hợp với client
                var result = new
                {
                    id = updatedAccount.Id,
                    maNhanVien = updatedAccount.MaNhanVien,
                    account = updatedAccount.Account,
                    acpass = updatedAccount.ACPass,
                    username = updatedAccount.Username,
                    password = updatedAccount.Password,
                    pattern = updatedAccount.Pattern,
                    serial = updatedAccount.Serial,
                    serviceUrl = updatedAccount.ServiceUrl,
                    isActive = updatedAccount.IsActive,
                    createdAt = updatedAccount.CreatedAt,
                    updatedAt = updatedAccount.UpdatedAt
                };

                _logger.LogInformation($"Cập nhật tài khoản VNPT thành công: ID={updatedAccount.Id}, MaNhanVien={updatedAccount.MaNhanVien}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật tài khoản VNPT với ID {id}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật tài khoản VNPT" });
            }
        }

        /// <summary>
        /// Xóa tài khoản VNPT
        /// </summary>
        /// <param name="id">ID tài khoản VNPT</param>
        /// <returns>Kết quả xóa tài khoản</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _vnptAccountService.DeleteAccount(id);
                if (!result)
                {
                    return NotFound(new { message = $"Không tìm thấy tài khoản VNPT với ID {id}" });
                }

                return Ok(new { message = "Xóa tài khoản VNPT thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa tài khoản VNPT với ID {id}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa tài khoản VNPT" });
            }
        }

        /// <summary>
        /// Tạo bản sao tài khoản VNPT
        /// </summary>
        /// <param name="id">ID tài khoản VNPT gốc</param>
        /// <param name="maNhanVien">Mã nhân viên mới</param>
        /// <returns>Tài khoản VNPT đã tạo</returns>
        [HttpPost("{id}/clone")]
        public async Task<IActionResult> CloneAccount(int id, [FromBody] CloneAccountRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.MaNhanVien))
                {
                    return BadRequest(new { message = "Mã nhân viên mới không được để trống" });
                }

                _logger.LogInformation($"Yêu cầu tạo bản sao tài khoản VNPT với ID {id} và mã nhân viên mới {request.MaNhanVien}");
                _logger.LogInformation($"Account sẽ được gán bằng mã nhân viên mới: {request.MaNhanVien}");
                var clonedAccount = await _vnptAccountService.CloneAccount(id, request.MaNhanVien);
                if (clonedAccount == null)
                {
                    _logger.LogWarning($"Không thể tạo bản sao tài khoản VNPT với ID {id} và mã nhân viên mới {request.MaNhanVien}");
                    return BadRequest(new { message = $"Không thể tạo bản sao tài khoản VNPT. Có thể không tìm thấy tài khoản gốc hoặc mã nhân viên {request.MaNhanVien} đã tồn tại" });
                }

                _logger.LogInformation($"Tạo bản sao tài khoản VNPT thành công: ID={clonedAccount.Id}, MaNhanVien={clonedAccount.MaNhanVien}");

                // Trả về tài khoản đã tạo
                var result = new
                {
                    id = clonedAccount.Id,
                    maNhanVien = clonedAccount.MaNhanVien,
                    account = clonedAccount.Account,
                    acpass = clonedAccount.ACPass,
                    username = clonedAccount.Username,
                    password = clonedAccount.Password,
                    pattern = clonedAccount.Pattern,
                    serial = clonedAccount.Serial,
                    serviceUrl = clonedAccount.ServiceUrl,
                    isActive = clonedAccount.IsActive,
                    createdAt = clonedAccount.CreatedAt
                };

                _logger.LogInformation($"Dữ liệu trả về: {System.Text.Json.JsonSerializer.Serialize(result)}");
                return CreatedAtAction(nameof(GetAccountByMaNhanVien), new { maNhanVien = clonedAccount.MaNhanVien }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo bản sao tài khoản VNPT với ID {id}");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo bản sao tài khoản VNPT" });
            }
        }
    }
}
