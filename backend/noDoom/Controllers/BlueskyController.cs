using Microsoft.AspNetCore.Mvc;
using Supabase;
using noDoom.Models;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using noDoom.Services;
namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/bluesky")]
    public class BlueskyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly Client _supabaseClient;
        private readonly IRedisService _redisService;
        private readonly ILogger<BlueskyController> _logger;

        public BlueskyController(
            IHttpClientFactory httpClientFactory, 
            Client supabaseClient,
            IRedisService redisService,
            ILogger<BlueskyController> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
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

                var response = await _httpClient.PostAsJsonAsync("https://bsky.social/xrpc/com.atproto.server.createSession", new { identifier = credentials.Username, password = credentials.AppPassword });
                var authData = await response.Content.ReadFromJsonAsync<BlueskyAuthResponse>();
                
                // Cache tokens in Redis
                await _redisService.SetTokensAsync(
                    authData.Did, 
                    authData.AccessJwt, 
                    authData.RefreshJwt, 
                    TimeSpan.FromDays(1)
                );

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
                // Get the connection first to get the access token
                var parsedUserId = Guid.Parse(userId);
                var connection = await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Single();

                if (connection != null)
                {
                    // Call Bluesky's deleteSession endpoint with refresh token
                    _httpClient.DefaultRequestHeaders.Clear();
                    _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", connection.RefreshToken);
                    var response = await _httpClient.PostAsync("https://bsky.social/xrpc/com.atproto.server.deleteSession", null);
                    
                    if (!response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Failed to delete Bluesky session: {response.StatusCode}");
                        Console.WriteLine($"Response content: {content}");
                        return BadRequest(new { message = "Failed to disconnect from Bluesky." });
                    }
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

        [HttpGet("timeline")]
        public async Task<IActionResult> GetTimeline()
        {
            try {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Get the user's Bluesky connection
                var parsedUserId = Guid.Parse(userId);
                var connection = await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Single();

                if (connection == null)
                {
                    return BadRequest(new { message = "No Bluesky connection found" });
                }

                // Set up the request to Bluesky
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", connection.AccessToken);

                // Make the request to get the timeline
                var response = await _httpClient.GetAsync("https://bsky.social/xrpc/app.bsky.feed.getTimeline");
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Failed to fetch Bluesky timeline: {response.StatusCode}");
                    Console.WriteLine($"Error content: {errorContent}");
                    return BadRequest(new { message = "Failed to fetch Bluesky timeline" });
                }

                var timeline = await response.Content.ReadFromJsonAsync<BlueskyTimelineResponse>();
                return Ok(timeline);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Bluesky timeline error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = "Failed to fetch Bluesky timeline" });
            }
        }
    }
}


