using noDoom.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Linq;

namespace noDoom.Services;
public interface IBlueskyService
{
    Task<List<UnifiedPost>> GetTimelinePostsAsync(string accessToken, string did, string refreshToken);
}

public class BlueskyService : IBlueskyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BlueskyService> _logger;
    private readonly IRedisService _redisService;

    public BlueskyService(HttpClient httpClient, ILogger<BlueskyService> logger, IRedisService redisService)
    {
        _httpClient = httpClient;
        _logger = logger;
        _redisService = redisService;
    }

    public async Task<List<UnifiedPost>> GetTimelinePostsAsync(string accessToken, string did, string refreshToken)
    {
        try
        {
            var validToken = await RefreshTokenIfNeededAsync(accessToken, did, refreshToken);
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", validToken);

            _logger.LogInformation("Fetching Bluesky timeline");
            var response = await _httpClient.GetAsync("https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=15");
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to fetch Bluesky timeline. Status: {StatusCode}, Error: {Error}", 
                    response.StatusCode, error);
                throw new Exception("Failed to fetch timeline");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Complete Timeline Response:\n{@TimelineJson}", 
                JsonSerializer.Serialize(
                    JsonSerializer.Deserialize<object>(responseJson), 
                    new JsonSerializerOptions { WriteIndented = true }
                )
            );

            var blueskyTimeline = await response.Content.ReadFromJsonAsync<BlueskyTimelineResponse>();
            return await EnrichPostsWithMetrics(blueskyTimeline);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Bluesky timeline");
            throw;
        }
    }

    private async Task<List<UnifiedPost>> EnrichPostsWithMetrics(BlueskyTimelineResponse timeline)
    {
        var postUris = timeline.Feed.Select(f => f.Post.Uri).ToList();
        var urisParam = string.Join("&", postUris.Select(uri => $"uris={Uri.EscapeDataString(uri)}"));
        
        var metricsResponse = await _httpClient.GetAsync(
            $"https://bsky.social/xrpc/app.bsky.feed.getPosts?{urisParam}"
        );

        if (!metricsResponse.IsSuccessStatusCode) throw new Exception("Failed to fetch metrics");

        var postsWithMetrics = await metricsResponse.Content.ReadFromJsonAsync<PostsResponse>();
        var metricsDict = postsWithMetrics.Posts
            .Where(p => p != null && p.Uri != null)
            .ToDictionary(p => p.Uri, p => p);

        return timeline.Feed
            .Select(feed => new UnifiedPost
            {
                Id = feed.Post.Uri,
                Platform = "bluesky",
                AuthorName = feed.Post.Author.DisplayName ?? "",
                AuthorHandle = feed.Post.Author.Handle ?? "",
                AuthorAvatar = feed.Post.Author.Avatar ?? "",
                Content = feed.Post.Record.Text ?? "",
                CreatedAt = feed.Post.Record.CreatedAt,
                Media = CreateMediaContent(feed.Post.Record.Embed, feed.Post.Author.Did),
                LikeCount = metricsDict.ContainsKey(feed.Post.Uri) ? metricsDict[feed.Post.Uri].LikeCount : 0
            })
            .ToList();
    }

    private MediaContent? CreateMediaContent(Embed? embed, string did)
    {
        if (embed?.Images == null || embed.Images.Length == 0) return null;

        var image = embed.Images[0];
        Console.WriteLine(JsonSerializer.Serialize(image, new JsonSerializerOptions { WriteIndented = true }));
        if (image == null) return null;

        // Extract the format from MimeType (e.g., "jpeg" from "image/jpeg")
        var format = image.Image.MimeType?.Split('/').LastOrDefault() ?? "jpeg";
        var imageUrl = $"https://cdn.bsky.app/img/feed_thumbnail/plain/{did}/{image.Image.Ref.Link}@{format}";
        
        return new MediaContent
        {
            Type = "image",
            Url = imageUrl,
            ThumbnailUrl = imageUrl,
            Description = image.Alt
        };
    }

    private async Task<string> RefreshTokenIfNeededAsync(string accessToken, string did, string refreshToken)
    {
        try
        {
            // Try the current token first
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            var testResponse = await _httpClient.GetAsync("https://bsky.social/xrpc/app.bsky.actor.getProfile");
            
            if (testResponse.IsSuccessStatusCode)
            {
                return accessToken;
            }

            // If we get here, token needs refresh
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new UnauthorizedAccessException("No refresh token found");
            }

            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", refreshToken);
            
            var response = await _httpClient.PostAsync("https://bsky.social/xrpc/com.atproto.server.refreshSession", null);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException("Failed to refresh token");
            }

            var authData = await response.Content.ReadFromJsonAsync<BlueskyAuthResponse>();
            return authData.AccessJwt;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            throw;
        }
    }
}