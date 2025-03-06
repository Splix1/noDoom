using StackExchange.Redis;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace noDoom.Services;

public interface IRedisService
{
    Task<T> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task RemoveAsync(string key);
    Task<string> GetAccessTokenAsync(string did);
    Task SetTokensAsync(string did, string accessToken, TimeSpan? expiry = null);
    Task SetAccessTokenAsync(string did, string accessToken);
    Task RemoveAccessTokenAsync(string did);
    Task<List<UnifiedPost>> GetCachedTimelinePostsAsync(string userId, string timelineType);
    Task CacheTimelinePostsAsync(string userId, string timelineType, List<UnifiedPost> posts);
    Task UpdateCachedTimelinePostsAsync(string userId, string timelineKey, List<UnifiedPost> posts);
    Task CacheNewConnectionPostsAsync(string userId, string timelineType, List<UnifiedPost> posts);
}

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _db;
    private static readonly TimeSpan AccessTokenTTL = TimeSpan.FromHours(2);
    private static readonly TimeSpan TimelinePostsTTL = TimeSpan.FromHours(6);
    private readonly ILogger<RedisService> _logger;

    public RedisService(IConnectionMultiplexer redis, ILogger<RedisService> logger)
    {
        _redis = redis;
        _db = redis.GetDatabase();
        _logger = logger;
    }

    public async Task<T> GetAsync<T>(string key)
    {
        var value = await _db.StringGetAsync(key);
        return value.HasValue ? JsonSerializer.Deserialize<T>(value!) : default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var serializedValue = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, serializedValue, expiry);
    }

    public async Task RemoveAsync(string key)
    {
        await _db.KeyDeleteAsync(key);
    }

    public async Task<string> GetAccessTokenAsync(string did)
    {
        var value = await _db.StringGetAsync($"bluesky_access_token:{did}");
        return value.HasValue ? value.ToString() : null;
    }

    public async Task SetTokensAsync(string did, string accessToken, TimeSpan? expiry = null)
    {
        await SetAsync($"bluesky_access_token:{did}", accessToken, expiry ?? AccessTokenTTL);
    }

    public async Task SetAccessTokenAsync(string did, string accessToken)
    {
        await _db.StringSetAsync(
            $"bluesky_access_token:{did}",
            accessToken,
            AccessTokenTTL
        );
    }

    public async Task RemoveAccessTokenAsync(string did)
    {
        await _db.KeyDeleteAsync($"bluesky_access_token:{did}");
    }

    public async Task<List<UnifiedPost>> GetCachedTimelinePostsAsync(string userId, string timelineType)
    {
        return await GetAsync<List<UnifiedPost>>($"{userId}:{timelineType}");
    }

    public async Task CacheTimelinePostsAsync(string userId, string timelineType, List<UnifiedPost> posts)
    {
        await SetAsync($"{userId}:{timelineType}", posts, TimelinePostsTTL);
    }

    public async Task UpdateCachedTimelinePostsAsync(string userId, string timelineKey, List<UnifiedPost> posts)
    {
        var key = $"{userId}:{timelineKey}";
        var serializedPosts = JsonSerializer.Serialize(posts);
        await _db.StringSetAsync(key, serializedPosts, keepTtl: true);
    }

    public async Task CacheNewConnectionPostsAsync(string userId, string timelineType, List<UnifiedPost> posts)
    {
        var cachedPosts = await GetCachedTimelinePostsAsync(userId, timelineType);
        
        if (cachedPosts == null)    
        {
            await CacheTimelinePostsAsync(userId, timelineType, posts);
        }
        else
        {
            var newPosts = cachedPosts.Concat(posts).ToList();
            await UpdateCachedTimelinePostsAsync(userId, timelineType, newPosts);
        }
    }
} 