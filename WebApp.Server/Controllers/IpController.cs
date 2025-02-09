using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;

namespace WebApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IpController : ControllerBase
    {
        private readonly ILogger<IpController> _logger;

        public IpController(ILogger<IpController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetIpAddress()
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            _logger.LogInformation($"Client IP address: {ip}");
            return Ok(ip);
        }
    }
} 