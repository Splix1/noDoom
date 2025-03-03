using noDoom.Models;

namespace noDoom.Services.Bluesky.Interfaces
{
    public interface IBlueskyAuthService
    {
        Task<string> GetValidAccessTokenAsync(string did, Guid userId);
        Task<BlueskyAuthResponse> CreateSessionAsync(BlueskyCredentials credentials);
        Task DeleteSessionAsync(string refreshToken, Guid userId, string DID);
    }
} 