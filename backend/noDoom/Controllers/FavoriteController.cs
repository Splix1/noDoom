using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using noDoom.Repositories.Interfaces;
using noDoom.Services;
using System.Text.Json;
using System.Security.Claims;

namespace noDoom.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IRedisService _redisService;

    public FavoriteController(
        IFavoriteRepository favoriteRepository,
        IRedisService redisService)
    {
        _favoriteRepository = favoriteRepository;
        _redisService = redisService;
    }

    [HttpGet("posts")]
    public async Task<IActionResult> GetFavoritedPosts()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        
        // Try to get from Redis first
        var cachedPosts = await _redisService.GetCachedTimelinePostsAsync(userId.ToString(), "favorites");
        if (cachedPosts != null)
        {
            return Ok(new { success = true, data = cachedPosts });
        }

        // If not in Redis, get from database
        var posts = await _favoriteRepository.GetFavoritedPostsAsync(userId);
        
        // Cache the posts
        if (posts.Any())
        {
            await _redisService.CacheTimelinePostsAsync(userId.ToString(), "favorites", posts);
        }

        return Ok(new { success = true, data = posts });
    }

    [HttpGet]
    public async Task<IActionResult> IsFavorite([FromQuery] string postId)
    {
        Console.WriteLine($"Checking favorite status for post {postId}");
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        var isFavorite = await _favoriteRepository.IsFavoriteAsync(userId, postId);
        return Ok(new { isFavorite });
    }

    [HttpPost]
    public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequest request)
    {
        Console.WriteLine($"Received request body: {JsonSerializer.Serialize(request)}");
        if (request == null)
        {
            return BadRequest("Request body is required");
        }

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        await _favoriteRepository.AddFavoriteAsync(userId, request.PostId, request.PostDetails);

        // Update Redis cache for timeline
        var cachedPosts = await _redisService.GetCachedTimelinePostsAsync(userId.ToString(), "timeline");
        if (cachedPosts != null)
        {
            var post = cachedPosts.FirstOrDefault(p => p.Id == request.PostId);
            if (post != null)
            {
                post.IsFavorite = true;
                await _redisService.UpdateCachedTimelinePostsAsync(userId.ToString(), "timeline", cachedPosts);
            }
        }

        // Update Redis cache for favorites
        await _redisService.RemoveAsync($"{userId}:favorites");

        var isFavorite = await _favoriteRepository.IsFavoriteAsync(userId, request.PostId);
        return Ok(new { isFavorite });
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveFavorite([FromBody] RemoveFavoriteRequest request)
    {
        Console.WriteLine($"Removing favorite for post {request.PostId}");
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        await _favoriteRepository.RemoveFavoriteAsync(userId, request.PostId);

        // Update Redis cache for timeline
        var cachedPosts = await _redisService.GetCachedTimelinePostsAsync(userId.ToString(), "timeline");
        if (cachedPosts != null)
        {
            var post = cachedPosts.FirstOrDefault(p => p.Id == request.PostId);
            if (post != null)
            {
                post.IsFavorite = false;
                await _redisService.UpdateCachedTimelinePostsAsync(userId.ToString(), "timeline", cachedPosts);
            }
        }

        // Update Redis cache for favorites
        await _redisService.RemoveAsync($"{userId}:favorites");

        return Ok(new { isFavorite = false });
    }
}

public class AddFavoriteRequest
{
    public string PostId { get; set; }
    public UnifiedPost PostDetails { get; set; }
}

public class RemoveFavoriteRequest
{
    public string PostId { get; set; }
} 