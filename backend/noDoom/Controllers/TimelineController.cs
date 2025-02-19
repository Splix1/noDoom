using Microsoft.AspNetCore.Mvc;
using Supabase;
using noDoom.Models;
using System.Security.Claims;
using noDoom.Services;
using Microsoft.Extensions.Logging;

namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/timeline")]
    public class TimelineController : ControllerBase
    {
        private readonly IBlueskyService _blueskyService;
        private readonly Client _supabaseClient;
        private readonly ILogger<TimelineController> _logger;
        private readonly IRedisService _redisService;

        public TimelineController(
            IBlueskyService blueskyService, 
            Client supabaseClient,
            IRedisService redisService,
            ILogger<TimelineController> logger)
        {
            _blueskyService = blueskyService;
            _supabaseClient = supabaseClient;
            _redisService = redisService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UnifiedPost>>>> GetTimeline()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse<List<UnifiedPost>>.CreateError("User not authenticated"));
                }

                // Try to get from cache first
                var cachedPosts = await _redisService.GetCachedTimelinePostsAsync(userId, "timeline");
                if (cachedPosts != null)
                {
                    return Ok(ApiResponse<List<UnifiedPost>>.CreateSuccess(cachedPosts));
                }

                // If not in cache, fetch from Bluesky
                var parsedUserId = Guid.Parse(userId);
                var connection = await _supabaseClient
                    .From<Connection>()
                    .Where(x => x.UserId == parsedUserId && x.Platform == "bluesky")
                    .Single();

                if (connection == null)
                {
                    return BadRequest(ApiResponse<List<UnifiedPost>>.CreateError("No Bluesky connection found"));
                }

                var posts = await _blueskyService.GetTimelinePostsAsync(connection.AccessToken, connection.DID, connection.RefreshToken);
                var sortedPosts = posts.OrderByDescending(p => p.LikeCount).Take(15).ToList();
                
                // Cache the posts
                await _redisService.CacheTimelinePostsAsync(userId, "timeline", sortedPosts);
                
                return Ok(ApiResponse<List<UnifiedPost>>.CreateSuccess(sortedPosts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch timeline");
                return BadRequest(ApiResponse<List<UnifiedPost>>.CreateError("Failed to fetch timeline"));
            }
        }
    }
} 