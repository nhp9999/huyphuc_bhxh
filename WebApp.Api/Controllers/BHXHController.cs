using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebApp.Api.Models.BHXH;
using WebApp.Api.Services;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.IO;

namespace WebApp.Api.Controllers
{
    [ApiController]
    [Route("api/bhxh")]
    public class BHXHController : ControllerBase
    {
        private readonly IBHXHService _bhxhService;
        private readonly IHttpClientFactory _httpClientFactory;

        public BHXHController(IBHXHService bhxhService, IHttpClientFactory httpClientFactory)
        {
            _bhxhService = bhxhService;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("tra-cuu")]
        public async Task<ActionResult<TraCuuBHXHResponse>> TraCuuMaSoBHXH([FromBody] TraCuuBHXHRequest request)
        {
            if (string.IsNullOrEmpty(request.MaSoBHXH) && 
                string.IsNullOrEmpty(request.HoTen) && 
                string.IsNullOrEmpty(request.SoCCCD))
            {
                return BadRequest(new TraCuuBHXHResponse
                {
                    Success = false,
                    Message = "Vui lòng nhập ít nhất một thông tin để tra cứu"
                });
            }

            var response = await _bhxhService.TraCuuMaSoBHXH(request);
            return Ok(response);
        }

        [HttpPost("tra-cuu-vnpost")]
        public async Task<IActionResult> TraCuuMaSoBHXHVNPost()
        {
            try
            {
                // Đọc body request
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();

                // Tạo HTTP client
                var client = _httpClientFactory.CreateClient();
                
                // Lấy token từ header
                string authHeader = Request.Headers["Authorization"];
                if (!string.IsNullOrEmpty(authHeader))
                {
                    client.DefaultRequestHeaders.Add("Authorization", authHeader);
                }

                // Thêm các header khác nếu cần
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                client.DefaultRequestHeaders.Add("Accept", "application/json");

                // Gửi request đến VNPost API
                var content = new StringContent(body, Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://ssmv2.vnpost.vn/connect/tracuu/masobhxh", content);

                // Đọc response
                var responseContent = await response.Content.ReadAsStringAsync();
                
                // Trả về kết quả
                return Content(responseContent, "application/json");
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { success = false, message = $"Lỗi khi gọi API VNPost: {ex.Message}" });
            }
        }
    }
} 