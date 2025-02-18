using noDoom.Models;
using Microsoft.Extensions.Logging;

namespace noDoom.Services;
public interface IBlueskyService
{
    Task<List<UnifiedPost>> GetTimelinePostsAsync(string accessToken);
}

public class BlueskyService : IBlueskyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BlueskyService> _logger;

    public BlueskyService(HttpClient httpClient, ILogger<BlueskyService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<UnifiedPost>> GetTimelinePostsAsync(string accessToken)
    {
        try
        {
            _logger.LogInformation("Fetching Bluesky timeline");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.GetAsync("https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=15");
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to fetch Bluesky timeline. Status: {StatusCode}, Error: {Error}", 
                    response.StatusCode, error);
                throw new Exception("Failed to fetch timeline");
            }

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
                Media = CreateMediaContent(feed.Post.Record.Embed),
                LikeCount = metricsDict.ContainsKey(feed.Post.Uri) ? metricsDict[feed.Post.Uri].LikeCount : 0
            })
            .ToList();
    }

    private MediaContent? CreateMediaContent(Embed? embed)
    {
        if (embed == null) return null;

        if (embed.Images?.Length > 0)
        {
            return new MediaContent
            {
                Type = "image",
                Url = embed.Images[0].Ref
            };
        }

        if (embed.External != null)
        {
            return new MediaContent
            {
                Type = "link",
                Url = embed.External.Uri,
                ThumbnailUrl = embed.External.Thumb?.ToString(),
                Title = embed.External.Title,
                Description = embed.External.Description
            };
        }

        return null;
    }
} 