using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using noDoom.Services.Reddit.Interfaces;
using noDoom.Repositories.Interfaces;

namespace noDoom.Services.Reddit
{
    public class RedditAuthService : IRedditAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IRedisService _redisService;
        private readonly IConnectionRepository _connectionRepository;
        private readonly ILogger<RedditAuthService> _logger;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _redirectUri;

        public RedditAuthService(
            HttpClient httpClient,
            IRedisService redisService,
            IConnectionRepository connectionRepository,
            ILogger<RedditAuthService> logger,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _redisService = redisService;
            _connectionRepository = connectionRepository;
            _logger = logger;
            _clientId = configuration["Reddit:ClientId"];
            _clientSecret = configuration["Reddit:ClientSecret"];
            _redirectUri = configuration["Reddit:RedirectUri"];
        }

        public string GetAuthorizationUrl(string state)
        {
            var scopes = "identity read";
            return $"https://www.reddit.com/api/v1/authorize?" +
                   $"client_id={_clientId}&" +
                   $"response_type=code&" +
                   $"state={state}&" +
                   $"redirect_uri={_redirectUri}&" +
                   $"duration=permanent&" +
                   $"scope={scopes}";
        }

        public async Task<RedditAuthResponse> CreateSessionAsync(string code)
        {
            var auth = Convert.ToBase64String(
                System.Text.Encoding.UTF8.GetBytes($"{_clientId}:{_clientSecret}")
            );
            
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Basic", auth);

            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                {"grant_type", "authorization_code"},
                {"code", code},
                {"redirect_uri", _redirectUri}
            });

            var response = await _httpClient.PostAsync(
                "https://www.reddit.com/api/v1/access_token",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException("Failed to create Reddit session");
            }

            return await response.Content.ReadFromJsonAsync<RedditAuthResponse>();
        }

        public async Task<string> GetValidAccessTokenAsync(string username, Guid userId)
        {
            // Try to get access token from Redis
            var accessToken = await _redisService.GetAccessTokenAsync($"reddit:{username}");
            if (!string.IsNullOrEmpty(accessToken))
            {
                return accessToken;
            }

            // If not in Redis, get refresh token from database
            var connection = await _connectionRepository.GetConnectionAsync(userId, "reddit");
            if (connection == null)
            {
                throw new UnauthorizedAccessException("No Reddit connection found");
            }

            // Use refresh token to get new access token
            var auth = Convert.ToBase64String(
                System.Text.Encoding.UTF8.GetBytes($"{_clientId}:{_clientSecret}")
            );
            
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Basic", auth);

            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                {"grant_type", "refresh_token"},
                {"refresh_token", connection.RefreshToken}
            });

            var response = await _httpClient.PostAsync(
                "https://www.reddit.com/api/v1/access_token",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException("Failed to refresh Reddit token");
            }

            var tokenResponse = await response.Content.ReadFromJsonAsync<RedditAuthResponse>();
            
            // Store new access token in Redis
            await _redisService.SetAccessTokenAsync($"reddit:{username}", tokenResponse.AccessToken);

            return tokenResponse.AccessToken;
        }

        public async Task DeleteSessionAsync(string refreshToken, Guid userId, string username)
        {
            await _connectionRepository.DeleteConnectionAsync(userId, "reddit");
            await _redisService.RemoveAccessTokenAsync($"reddit:{username}");
        }
    }
}