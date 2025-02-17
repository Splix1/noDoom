using Microsoft.AspNetCore.Mvc;
using Supabase;
using noDoom.Models;
using System.Security.Claims;
namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/bluesky")]
    public class BlueskyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly Client _supabaseClient;

        public BlueskyController(IHttpClientFactory httpClientFactory, Client supabaseClient)
        {
            _httpClient = httpClientFactory.CreateClient();
            _supabaseClient = supabaseClient;
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

                var response = await _httpClient.PostAsJsonAsync("https://bsky.social/xrpc/com.atproto.server.createSession", new { identifier = credentials.Username, password = credentials.AppPassword });
                var authData = await response.Content.ReadFromJsonAsync<BlueskyAuthResponse>();
                
                var newConnection = new Connection {
                    Platform = "bluesky",
                    AccessToken = authData.AccessJwt,
                    RefreshToken = authData.RefreshJwt,
                    DID = authData.Did,
                    Handle = authData.Handle,
                    UserId = Guid.Parse(userId),
                };

                await _supabaseClient.From<Connection>().Insert(newConnection);
                
                return Ok(new { message = "Bluesky account connected successfully!"});
            } catch (Exception ex) {
                Console.WriteLine($"Bluesky connection error: {ex.Message}");
                if (ex.InnerException != null) {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
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

                // Unable to pass Guid.Parse in Where clause due to Supabase C# library not being able to parse it correctly
                var parsedUserId = Guid.Parse(userId);
                
                await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Delete();
                    
                return Ok(new { message = "Bluesky account disconnected successfully!" });
            } catch (Exception ex) {
                Console.WriteLine($"Bluesky disconnect error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null) {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = "Failed to disconnect from Bluesky." });
            }
        }
    }
}


