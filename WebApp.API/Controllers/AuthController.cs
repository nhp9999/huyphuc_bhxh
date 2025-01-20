using Microsoft.AspNetCore.Mvc;
using WebApp.API.Models;

namespace WebApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // Kiểm tra null
            if (model == null)
                return BadRequest("Invalid request data");

            // TODO: Implement actual authentication logic
            if (model.Username == "admin" && model.Password == "admin")
            {
                return Ok(new { 
                    token = "sample-jwt-token",
                    username = model.Username
                });
            }

            return Unauthorized(new { message = "Username or password is incorrect" });
        }
    }
} 