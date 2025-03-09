using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using noDoom.Repositories.Interfaces;
using System.Text.Json;
using System.Security.Claims;

namespace noDoom.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteRepository _favoriteRepository;

    public FavoriteController(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
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
        await _favoriteRepository.AddFavoriteAsync(userId, request.PostId);
        var isFavorite = await _favoriteRepository.IsFavoriteAsync(userId, request.PostId);
        return Ok(new { isFavorite });
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveFavorite([FromBody] RemoveFavoriteRequest request)
    {
        Console.WriteLine($"Removing favorite for post {request.PostId}");
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        await _favoriteRepository.RemoveFavoriteAsync(userId, request.PostId);
        return Ok(new { isFavorite = false });
    }
}

public class AddFavoriteRequest
{
    public string PostId { get; set; }
}

public class RemoveFavoriteRequest
{
    public string PostId { get; set; }
} 