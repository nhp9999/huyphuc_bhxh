using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WebApp.API.Data;
using WebApp.API.Models.BienlaiDienTu;

namespace WebApp.API.Services
{
    public class VNPTAccountService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VNPTAccountService> _logger;

        public VNPTAccountService(ApplicationDbContext context, ILogger<VNPTAccountService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy tài khoản VNPT theo ID
        /// </summary>
        /// <param name="id">ID tài khoản VNPT</param>
        /// <returns>Thông tin tài khoản VNPT</returns>
        public async Task<VNPTAccount> GetAccountById(int id)
        {
            try
            {
                _logger.LogInformation($"Tìm kiếm tài khoản VNPT với ID: {id}");
                var account = await _context.VNPTAccounts
                    .Where(a => a.Id == id)
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Kết quả tìm kiếm tài khoản VNPT với ID {id}: {(account != null ? "Tìm thấy" : "Không tìm thấy")}");
                return account;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy tài khoản VNPT theo ID {id}");
                return null;
            }
        }

        /// <summary>
        /// Lấy tài khoản VNPT theo mã nhân viên
        /// </summary>
        /// <param name="maNhanVien">Mã nhân viên</param>
        /// <returns>Thông tin tài khoản VNPT</returns>
        public async Task<VNPTAccount> GetAccountByMaNhanVien(string maNhanVien)
        {
            try
            {
                return await _context.VNPTAccounts
                    .Where(a => a.MaNhanVien == maNhanVien && a.IsActive)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy tài khoản VNPT theo mã nhân viên {maNhanVien}");
                return null;
            }
        }

        /// <summary>
        /// Lấy danh sách tất cả tài khoản VNPT
        /// </summary>
        /// <returns>Danh sách tài khoản VNPT</returns>
        public async Task<List<VNPTAccount>> GetAllAccounts()
        {
            try
            {
                return await _context.VNPTAccounts
                    .OrderBy(a => a.MaNhanVien)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tài khoản VNPT");
                return new List<VNPTAccount>();
            }
        }

        /// <summary>
        /// Tạo mới tài khoản VNPT
        /// </summary>
        /// <param name="account">Thông tin tài khoản VNPT</param>
        /// <returns>Tài khoản VNPT đã tạo</returns>
        public async Task<VNPTAccount> CreateAccount(VNPTAccount account)
        {
            try
            {
                // Kiểm tra xem mã nhân viên đã tồn tại chưa
                var existingAccount = await _context.VNPTAccounts
                    .Where(a => a.MaNhanVien == account.MaNhanVien)
                    .FirstOrDefaultAsync();

                if (existingAccount != null)
                {
                    _logger.LogWarning($"Mã nhân viên {account.MaNhanVien} đã tồn tại trong hệ thống");
                    return null;
                }

                account.CreatedAt = DateTime.UtcNow;
                _context.VNPTAccounts.Add(account);
                await _context.SaveChangesAsync();
                return account;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo tài khoản VNPT cho mã nhân viên {account.MaNhanVien}");
                return null;
            }
        }

        /// <summary>
        /// Cập nhật thông tin tài khoản VNPT
        /// </summary>
        /// <param name="account">Thông tin tài khoản VNPT</param>
        /// <returns>Tài khoản VNPT đã cập nhật</returns>
        public async Task<VNPTAccount> UpdateAccount(VNPTAccount account)
        {
            try
            {
                var existingAccount = await _context.VNPTAccounts
                    .Where(a => a.Id == account.Id)
                    .FirstOrDefaultAsync();

                if (existingAccount == null)
                {
                    _logger.LogWarning($"Không tìm thấy tài khoản VNPT với ID {account.Id}");
                    return null;
                }

                // Cập nhật thông tin
                existingAccount.Account = account.Account;
                existingAccount.ACPass = account.ACPass;
                existingAccount.Username = account.Username;
                existingAccount.Password = account.Password;
                existingAccount.Pattern = account.Pattern;
                existingAccount.Serial = account.Serial;
                existingAccount.ServiceUrl = account.ServiceUrl;
                existingAccount.IsActive = account.IsActive;
                existingAccount.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return existingAccount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật tài khoản VNPT với ID {account.Id}");
                return null;
            }
        }

        /// <summary>
        /// Xóa tài khoản VNPT
        /// </summary>
        /// <param name="id">ID tài khoản VNPT</param>
        /// <returns>True nếu xóa thành công, ngược lại là False</returns>
        public async Task<bool> DeleteAccount(int id)
        {
            try
            {
                var account = await _context.VNPTAccounts
                    .Where(a => a.Id == id)
                    .FirstOrDefaultAsync();

                if (account == null)
                {
                    _logger.LogWarning($"Không tìm thấy tài khoản VNPT với ID {id}");
                    return false;
                }

                _context.VNPTAccounts.Remove(account);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa tài khoản VNPT với ID {id}");
                return false;
            }
        }

        /// <summary>
        /// Tạo bản sao tài khoản VNPT
        /// </summary>
        /// <param name="id">ID tài khoản VNPT gốc</param>
        /// <param name="newMaNhanVien">Mã nhân viên mới</param>
        /// <returns>Tài khoản VNPT đã tạo</returns>
        public async Task<VNPTAccount> CloneAccount(int id, string newMaNhanVien)
        {
            try
            {
                // Kiểm tra tài khoản gốc
                var originalAccount = await _context.VNPTAccounts
                    .Where(a => a.Id == id)
                    .FirstOrDefaultAsync();

                if (originalAccount == null)
                {
                    _logger.LogWarning($"Không tìm thấy tài khoản VNPT gốc với ID {id}");
                    return null;
                }

                // Kiểm tra xem mã nhân viên mới đã tồn tại chưa
                var existingAccount = await _context.VNPTAccounts
                    .Where(a => a.MaNhanVien == newMaNhanVien)
                    .FirstOrDefaultAsync();

                if (existingAccount != null)
                {
                    _logger.LogWarning($"Mã nhân viên {newMaNhanVien} đã tồn tại trong hệ thống");
                    return null;
                }

                // Tạo bản sao tài khoản
                _logger.LogInformation($"Tạo bản sao tài khoản VNPT với mã nhân viên mới: {newMaNhanVien}");
                var newAccount = new VNPTAccount
                {
                    MaNhanVien = newMaNhanVien,
                    Account = newMaNhanVien, // Sử dụng mã nhân viên mới làm Account
                    ACPass = originalAccount.ACPass,
                    Username = originalAccount.Username,
                    Password = originalAccount.Password,
                    Pattern = originalAccount.Pattern,
                    Serial = originalAccount.Serial,
                    ServiceUrl = originalAccount.ServiceUrl,
                    IsActive = originalAccount.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _logger.LogInformation($"Thông tin tài khoản mới: MaNhanVien={newAccount.MaNhanVien}, Account={newAccount.Account}, Username={newAccount.Username}");

                _context.VNPTAccounts.Add(newAccount);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã tạo bản sao tài khoản VNPT từ ID {id} cho mã nhân viên {newMaNhanVien}");
                return newAccount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo bản sao tài khoản VNPT từ ID {id} cho mã nhân viên {newMaNhanVien}");
                return null;
            }
        }
    }
}
