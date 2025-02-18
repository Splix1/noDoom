using Microsoft.AspNetCore.Mvc;
using Supabase;
using noDoom.Models;
using System.Security.Claims;
using noDoom.Services;

namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/timeline")]
    public class TimelineController : ControllerBase
    {
        private readonly IBlueskyService _blueskyService;
        private readonly Client _supabaseClient;

        public TimelineController(IBlueskyService blueskyService, Client supabaseClient)
        {
            _blueskyService = blueskyService;
            _supabaseClient = supabaseClient;
        }

        [HttpGet]
        public async Task<IActionResult> GetTimeline()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized(new { message = "User not authenticated" });

                var parsedUserId = Guid.Parse(userId);

                var connection = await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Single();

                if (connection == null) return BadRequest(new { message = "No Bluesky connection found" });

                var posts = await _blueskyService.GetTimelinePostsAsync(connection.AccessToken);
                return Ok(posts.OrderByDescending(p => p.LikeCount).Take(15));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Timeline error: {ex.Message}");
                return BadRequest(new { message = "Failed to fetch timeline" });
            }
        }
    }
} 