using StackExchange.Redis;
using System.Text.Json;

namespace noDoom.Services;

public interface IRedisService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task RemoveAsync(string key);
    Task<string?> GetAccessTokenAsync(string did);
    Task<string?> GetRefreshTokenAsync(string did);
    Task SetTokensAsync(string did, string accessToken, string refreshToken, TimeSpan? expiry = null);
    Task SetAccessTokenAsync(string did, string accessToken);
    Task RemoveAccessTokenAsync(string did);
}

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _db;
    private static readonly TimeSpan AccessTokenTTL = TimeSpan.FromHours(2);

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

    public async Task<string?> GetRefreshTokenAsync(string did)
    {
        return await GetAsync<string>($"bluesky_refresh_token:{did}");
    }

    public async Task SetTokensAsync(string did, string accessToken, string refreshToken, TimeSpan? expiry = null)
    {
        await SetAsync($"bluesky_access_token:{did}", accessToken, expiry);
        await SetAsync($"bluesky_refresh_token:{did}", refreshToken, expiry);
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
} 