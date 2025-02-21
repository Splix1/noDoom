using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using noDoom.Models;
using Supabase;

namespace noDoom.Services.Bluesky
{
    public class BlueskyAuthService : IBlueskyAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IRedisService _redisService;
        private readonly Client _supabaseClient;
        private readonly ILogger<BlueskyAuthService> _logger;

        public BlueskyAuthService(
            HttpClient httpClient,
            IRedisService redisService,
            Client supabaseClient,
            ILogger<BlueskyAuthService> logger)
        {
            _httpClient = httpClient;
            _redisService = redisService;
            _supabaseClient = supabaseClient;
            _logger = logger;
        }

        public async Task<string> GetValidAccessTokenAsync(string did)
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
                new AuthenticationHeaderValue("Bearer", connection.RefreshToken);
            
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

        public async Task<BlueskyAuthResponse> CreateSessionAsync(BlueskyCredentials credentials)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "https://bsky.social/xrpc/com.atproto.server.createSession",
                new { identifier = credentials.Username, password = credentials.AppPassword }
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException("Failed to create Bluesky session");
            }

            return await response.Content.ReadFromJsonAsync<BlueskyAuthResponse>();
        }

        public async Task DeleteSessionAsync(string refreshToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", refreshToken);
            
            var response = await _httpClient.PostAsync(
                "https://bsky.social/xrpc/com.atproto.server.deleteSession", 
                null
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new UnauthorizedAccessException("Failed to delete Bluesky session");
            }
        }
    }
} 