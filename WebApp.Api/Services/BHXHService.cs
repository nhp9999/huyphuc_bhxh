using System;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using WebApp.Api.Models.BHXH;

namespace WebApp.Api.Services
{
    public interface IBHXHService
    {
        Task<TraCuuBHXHResponse> TraCuuMaSoBHXH(TraCuuBHXHRequest request);
    }

    public class BHXHService : IBHXHService
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public BHXHService(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DefaultConnection") ?? "";
        }

        public async Task<TraCuuBHXHResponse> TraCuuMaSoBHXH(TraCuuBHXHRequest request)
        {
            var response = new TraCuuBHXHResponse { Success = false };

            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var sql = @"
                        SELECT 
                            ma_so_bhxh as MaSoBHXH,
                            ho_ten as HoTen,
                            ngay_sinh as NgaySinh,
                            gioi_tinh as GioiTinh,
                            so_cccd as SoCCCD,
                            dia_chi as DiaChi,
                            trang_thai as TrangThai,
                            ngay_cap as NgayCap
                        FROM nguoi_tham_gia_bhxh
                        WHERE 1=1";

                    var parameters = new DynamicParameters();

                    if (!string.IsNullOrEmpty(request.MaSoBHXH))
                    {
                        sql += " AND ma_so_bhxh = @MaSoBHXH";
                        parameters.Add("MaSoBHXH", request.MaSoBHXH);
                    }

                    if (!string.IsNullOrEmpty(request.HoTen))
                    {
                        sql += " AND LOWER(ho_ten) LIKE LOWER(@HoTen)";
                        parameters.Add("HoTen", $"%{request.HoTen}%");
                    }

                    if (!string.IsNullOrEmpty(request.SoCCCD))
                    {
                        sql += " AND so_cccd = @SoCCCD";
                        parameters.Add("SoCCCD", request.SoCCCD);
                    }

                    sql += " LIMIT 1";

                    var result = await connection.QueryFirstOrDefaultAsync<BHXHData>(sql, parameters);

                    if (result != null)
                    {
                        response.Success = true;
                        response.Data = result;
                    }
                    else
                    {
                        response.Message = "Không tìm thấy thông tin BHXH phù hợp";
                    }
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Đã xảy ra lỗi khi tra cứu: " + ex.Message;
            }

            return response;
        }
    }
} 