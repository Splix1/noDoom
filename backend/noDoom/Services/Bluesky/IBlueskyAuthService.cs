using noDoom.Models;

namespace noDoom.Services.Bluesky
{
    public interface IBlueskyAuthService
    {
        Task<string> GetValidAccessTokenAsync(string did);
        Task<BlueskyAuthResponse> CreateSessionAsync(BlueskyCredentials credentials);
        Task DeleteSessionAsync(string refreshToken);
    }
} 