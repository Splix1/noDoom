namespace noDoom.Services.Reddit.Interfaces
{
    public interface IRedditAuthService
    {
        string GetAuthorizationUrl(string state);
        Task<RedditAuthResponse> CreateSessionAsync(string code);
        Task<string> GetValidAccessTokenAsync(string username, Guid userId);
        Task DeleteSessionAsync(string refreshToken, Guid userId, string username);
    }
}