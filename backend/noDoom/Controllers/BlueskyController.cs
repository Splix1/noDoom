using Microsoft.AspNetCore.Mvc;
using Supabase;
using noDoom.Models;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using noDoom.Services;
using noDoom.Services.Bluesky;
namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/bluesky")]
    public class BlueskyController : ControllerBase
    {
        private readonly IBlueskyAuthService _authService;
        private readonly Client _supabaseClient;
        private readonly IRedisService _redisService;
        private readonly ILogger<BlueskyController> _logger;

        public BlueskyController(
            IBlueskyAuthService authService,
            Client supabaseClient,
            IRedisService redisService,
            ILogger<BlueskyController> logger)
        {
            _authService = authService;
            _supabaseClient = supabaseClient;
            _redisService = redisService;
            _logger = logger;
        }

        [HttpPost("connect")]
        public async Task<IActionResult> Connect([FromBody] BlueskyCredentials credentials)
        {
            try {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var authData = await _authService.CreateSessionAsync(credentials);
                
                // Store access token in Redis with 2-hour TTL
                await _redisService.SetAccessTokenAsync(authData.Did, authData.AccessJwt);

                // Store connection with refresh token in Supabase
                var newConnection = new Connection {
                    Platform = "bluesky",
                    RefreshToken = authData.RefreshJwt,
                    DID = authData.Did,
                    Handle = authData.Handle,
                    UserId = Guid.Parse(userId),
                };

                await _supabaseClient.From<Connection>().Insert(newConnection);
                
                return Ok(new { message = "Bluesky account connected successfully!"});
            } catch (Exception ex) {
                _logger.LogError(ex, "Failed to connect to Bluesky");
                return BadRequest(new { message = "Failed to connect to Bluesky." });
            }
        }

        [HttpDelete("disconnect")]
        public async Task<IActionResult> Disconnect()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }
            
            try {
                // Get the connection first to get the access token
                var parsedUserId = Guid.Parse(userId);
                var connection = await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Single();

                if (connection != null)
                {
                    // Call Bluesky's deleteSession endpoint with refresh token
                    await _authService.DeleteSessionAsync(connection.RefreshToken);
                }

                // Delete the connection from Supabase
                await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Delete();
                    
                return Ok(new { message = "Bluesky account disconnected successfully!" });
            } catch (Exception ex) {
                Console.WriteLine($"Bluesky disconnect error: {ex.Message}");
                if (ex.InnerException != null) {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = "Failed to disconnect from Bluesky." });
            }
        }
    }
}


