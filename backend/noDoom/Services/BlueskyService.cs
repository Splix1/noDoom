using noDoom.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Linq;
using Supabase;

namespace noDoom.Services;
public interface IBlueskyService
{
    Task<List<UnifiedPost>> GetTimelinePostsAsync(string did);
}

public class BlueskyService : IBlueskyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BlueskyService> _logger;
    private readonly IRedisService _redisService;
    private readonly Client _supabaseClient;

    public BlueskyService(
        HttpClient httpClient, 
        ILogger<BlueskyService> logger, 
        IRedisService redisService,
        Client supabaseClient)
    {
        _httpClient = httpClient;
        _logger = logger;
        _redisService = redisService;
        _supabaseClient = supabaseClient;
    }

    private async Task<string> GetValidAccessTokenAsync(string did)
    {
        // Try to get access token from Redis
        var accessToken = await _redisService.GetAccessTokenAsync(did);
        if (!string.IsNullOrEmpty(accessToken))
        {
            return accessToken;
        }

        // If not in Redis, get refresh token from Supabase
        var connection = await _supabaseClient
            .From<Connection>()
            .Where(x => x.DID == did)
            .Single();

        if (connection == null)
        {
            throw new UnauthorizedAccessException("No connection found");
        }

        // Use refresh token to get new access token
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", connection.RefreshToken);
        
        var response = await _httpClient.PostAsync(
            "https://bsky.social/xrpc/com.atproto.server.refreshSession", 
            null
        );
        
        if (!response.IsSuccessStatusCode)
        {
            throw new UnauthorizedAccessException("Failed to refresh token");
        }

        var authData = await response.Content.ReadFromJsonAsync<BlueskyAuthResponse>();
        
        // Store new access token in Redis
        await _redisService.SetAccessTokenAsync(did, authData.AccessJwt);

        return authData.AccessJwt;
    }

    public async Task<List<UnifiedPost>> GetTimelinePostsAsync(string did)
    {
        try
        {
            var validToken = await GetValidAccessTokenAsync(did);
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
}