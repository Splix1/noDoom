using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using noDoom.Models;
using noDoom.Services.Bluesky.Interfaces;

namespace noDoom.Services.Bluesky
{
    public class BlueskyTimelineService : IBlueskyTimelineService
    {
        private readonly HttpClient _httpClient;
        private readonly IBlueskyAuthService _authService;
        private readonly IBlueskyPostEnricher _postEnricher;
        private readonly ILogger<BlueskyTimelineService> _logger;

        public BlueskyTimelineService(
            HttpClient httpClient,
            IBlueskyAuthService authService,
            IBlueskyPostEnricher postEnricher,
            ILogger<BlueskyTimelineService> logger)
        {
            _httpClient = httpClient;
            _authService = authService;
            _postEnricher = postEnricher;
            _logger = logger;
        }

        public async Task<List<UnifiedPost>> GetTimelinePostsAsync(string did, Guid userId)
        {
            var accessToken = await _authService.GetValidAccessTokenAsync(did, userId);
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.GetAsync(
                "https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=100"
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Failed to fetch timeline");
            }

            var timeline = await response.Content.ReadFromJsonAsync<BlueskyTimelineResponse>();

            // Filter out replies, quotes, and Twitch stream announcements
            var uniquePosts = timeline.Feed
                .Where(feed => 
                    feed.Reply == null && 
                    feed.Post.Record.Embed?.Record == null &&
                    !(feed.Post.Record.Embed?.External?.Uri?.Contains("twitch.tv") == true) &&
                    !feed.Post.Record.Text.Contains("twitch.tv/")
                )
                .GroupBy(feed => feed.Post.Uri)
                .Select(group => group.First())
                .OrderByDescending(feed => feed.Post.IndexedAt)
                .Take(15)
                .ToArray();
            
            timeline.Feed = uniquePosts;
            
            return await _postEnricher.EnrichPostsWithMetrics(timeline, userId);
        }
    }
} 