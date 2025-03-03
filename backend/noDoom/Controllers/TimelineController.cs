using Microsoft.AspNetCore.Mvc;
using Supabase;
using noDoom.Models;
using System.Security.Claims;
using noDoom.Services;
using Microsoft.Extensions.Logging;
using noDoom.Services.Bluesky.Interfaces;
using noDoom.Repositories.Interfaces;
using System.Text.Json;

namespace noDoom.Controllers
{
    [ApiController]
    [Route("api/timeline")]
    public class TimelineController : ControllerBase
    {
        private readonly IBlueskyTimelineService _blueskyTimelineService;
        private readonly Client _supabaseClient;
        private readonly ILogger<TimelineController> _logger;
        private readonly IRedisService _redisService;
        private readonly IConnectionRepository _connectionRepository;

        public TimelineController(
            IBlueskyTimelineService blueskyTimelineService, 
            Client supabaseClient,
            IRedisService redisService,
            ILogger<TimelineController> logger,
            IConnectionRepository connectionRepository
        )
        {
            _blueskyTimelineService = blueskyTimelineService;
            _supabaseClient = supabaseClient;
            _redisService = redisService;
            _logger = logger;
            _connectionRepository = connectionRepository;
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
                var connection = await _connectionRepository.GetConnectionAsync(parsedUserId, "bluesky");

                if (connection == null)
                {
                    return BadRequest(ApiResponse<List<UnifiedPost>>.CreateError("No Bluesky connection found"));
                }

                var posts = await _blueskyTimelineService.GetTimelinePostsAsync(connection.DID, connection.UserId);

                
                // Cache the posts
                await _redisService.CacheTimelinePostsAsync(userId, "timeline", posts);
                
                return Ok(ApiResponse<List<UnifiedPost>>.CreateSuccess(posts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch timeline");
                return BadRequest(ApiResponse<List<UnifiedPost>>.CreateError("Failed to fetch timeline"));
            }
        }
    }
} 