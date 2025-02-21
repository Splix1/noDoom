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
            Console.WriteLine(await response.Content.ReadAsStringAsync());
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
            var response = await _httpClient.GetAsync("https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=100");
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to fetch Bluesky timeline. Status: {StatusCode}, Error: {Error}", 
                    response.StatusCode, error);
                
                // If token is invalid, clear it from Redis and retry once
                if (error.Contains("InvalidToken"))
                {
                    _logger.LogInformation("Invalid token detected, clearing cache and retrying");
                    await _redisService.RemoveAccessTokenAsync(did);
                    
                    // Recursive call to retry with new token
                    return await GetTimelinePostsAsync(did);
                }
                
                throw new Exception($"Failed to fetch timeline: {error}");
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
        const int batchSize = 25;
        var nonReplyPosts = timeline.Feed.Where(f => f.Reply == null).ToList();
        var metricsDict = new Dictionary<string, PostWithMetrics>();

        // Process posts in batches
        for (int i = 0; i < nonReplyPosts.Count; i += batchSize)
        {
            var batch = nonReplyPosts.Skip(i).Take(batchSize);
            var batchUris = batch.Select(f => f.Post.Uri).ToList();
            var urisParam = string.Join("&", batchUris.Select(uri => $"uris={Uri.EscapeDataString(uri)}"));
            
            var metricsResponse = await _httpClient.GetAsync(
                $"https://bsky.social/xrpc/app.bsky.feed.getPosts?{urisParam}"
            );

            if (!metricsResponse.IsSuccessStatusCode) continue; // Skip failed batch instead of failing entirely

            var batchMetrics = await metricsResponse.Content.ReadFromJsonAsync<PostsResponse>();
            foreach (var post in batchMetrics.Posts.Where(p => p != null && p.PostUri != null))
            {
                metricsDict[post.PostUri] = post;
            }
        }

        var tasks = nonReplyPosts
            .Select(async feed => new UnifiedPost
            {
                Id = feed.Post.Uri,
                Platform = "bluesky",
                AuthorName = feed.Post.Author.DisplayName ?? "",
                AuthorHandle = feed.Post.Author.Handle ?? "",
                AuthorAvatar = feed.Post.Author.Avatar ?? "",
                Content = feed.Post.Record.Text ?? "",
                CreatedAt = feed.Post.Record.CreatedAt,
                Media = CreateMediaContent(feed.Post.Record.Embed, feed.Post.Author.Did),
                LikeCount = metricsDict.ContainsKey(feed.Post.Uri) ? metricsDict[feed.Post.Uri].Metrics.LikeCount : 0,
                QuotedPost = await CreateQuotedPost(feed.Post.Record)
            });

        return (await Task.WhenAll(tasks)).ToList();
    }

    private List<MediaContent>? CreateMediaContent(Embed? embed, string did)
    {
        if (embed?.Images == null || embed.Images.Length == 0) return null;

        return embed.Images.Select(image => {
            var format = image.Image.MimeType?.Split('/').LastOrDefault() ?? "jpeg";
            var imageUrl = $"https://cdn.bsky.app/img/feed_thumbnail/plain/{did}/{image.Image.Ref.Link}@{format}";
            
            return new MediaContent
            {
                Type = "image",
                Url = imageUrl,
                ThumbnailUrl = imageUrl,
                Description = image.Alt
            };
        }).ToList();
    }

    private async Task<UnifiedPost?> CreateQuotedPost(Record? record)
    {
        if (record?.Embed?.Record == null) return null;

        try 
        {
            var uri = record.Embed.Record.Uri;
            if (string.IsNullOrEmpty(uri)) return null;

            _logger.LogInformation("Fetching quoted post data for URI: {Uri}", uri);
            
            var response = await _httpClient.GetAsync(
                $"https://bsky.social/xrpc/app.bsky.feed.getPosts?uris={Uri.EscapeDataString(uri)}"
            );

            if (!response.IsSuccessStatusCode) return null;

            var postData = await response.Content.ReadFromJsonAsync<PostsResponse>();
            var quotedPost = postData?.Posts?.FirstOrDefault();
            
            if (quotedPost?.PostAuthor == null || quotedPost?.PostRecord == null) return null;

            return new UnifiedPost
            {
                Id = quotedPost.PostUri,
                Platform = "bluesky",
                AuthorName = quotedPost.PostAuthor.DisplayName ?? "",
                AuthorHandle = quotedPost.PostAuthor.Handle ?? "",
                AuthorAvatar = quotedPost.PostAuthor.Avatar,
                Content = quotedPost.PostRecord.Text ?? "",
                CreatedAt = quotedPost.PostRecord.CreatedAt,
                Media = CreateMediaContent(quotedPost.PostRecord.Embed, quotedPost.PostAuthor.Did),
                LikeCount = quotedPost.Metrics?.LikeCount ?? 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quoted post");
            return null;
        }
    }
}