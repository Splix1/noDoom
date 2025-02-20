using StackExchange.Redis;
using System.Text.Json;

namespace noDoom.Services;

public interface IRedisService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task RemoveAsync(string key);
    Task<string?> GetAccessTokenAsync(string did);
    Task SetTokensAsync(string did, string accessToken, TimeSpan? expiry = null);
    Task SetAccessTokenAsync(string did, string accessToken);
    Task RemoveAccessTokenAsync(string did);
    Task<List<UnifiedPost>?> GetCachedTimelinePostsAsync(string userId, string timelineType);
    Task CacheTimelinePostsAsync(string userId, string timelineType, List<UnifiedPost> posts);
}

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _db;
    private static readonly TimeSpan AccessTokenTTL = TimeSpan.FromHours(2);
    private static readonly TimeSpan TimelinePostsTTL = TimeSpan.FromHours(6);

    public RedisService(IConnectionMultiplexer redis)
    {
        _redis = redis;
        _db = redis.GetDatabase();
    }

    public async Task<T?> GetAsync<T>(string key)
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

    public async Task<string?> GetAccessTokenAsync(string did)
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

    public async Task<List<UnifiedPost>?> GetCachedTimelinePostsAsync(string userId, string timelineType)
    {
        return await GetAsync<List<UnifiedPost>>($"timeline:{userId}:{timelineType}");
    }

    public async Task CacheTimelinePostsAsync(string userId, string timelineType, List<UnifiedPost> posts)
    {
        await SetAsync($"timeline:{userId}:{timelineType}", posts, TimelinePostsTTL);
    }
} 