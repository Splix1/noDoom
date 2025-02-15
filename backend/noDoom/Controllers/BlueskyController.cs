using Microsoft.AspNetCore.Mvc;

namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/bluesky")]
    public class BlueskyController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public BlueskyController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("connect")]
        public async Task<IActionResult> Connect([FromBody] BlueskyCredentials credentials)
        {
            try {
                var response = await _httpClient.PostAsJsonAsync("https://bsky.social/xrpc/com.atproto.server.createSession", credentials);
                var authData = await response.Content.ReadFromJsonAsync<BlueskyAuthResponse>();
                // TODO: Store auth response in Supabase

            } catch (Exception ex) {
                Console.WriteLine(ex.Message);
                return BadRequest(new { message = "Failed to connect to Bluesky." });
            }

            return Ok(new { message = "Bluesky account connected successfully!"});
        }
    }
}


