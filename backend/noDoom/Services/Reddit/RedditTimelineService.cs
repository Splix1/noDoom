using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using noDoom.Services.Reddit.Interfaces;

namespace noDoom.Services.Reddit
{
    public class RedditTimelineService : IRedditTimelineService
    {
        private readonly HttpClient _httpClient;
        private readonly IRedditAuthService _authService;
        private readonly IRedditPostEnricher _postEnricher;
        private readonly ILogger<RedditTimelineService> _logger;

        public RedditTimelineService(
            HttpClient httpClient,
            IRedditAuthService authService,
            IRedditPostEnricher postEnricher,
            ILogger<RedditTimelineService> logger)
        {
            _httpClient = httpClient;
            _authService = authService;
            _postEnricher = postEnricher;
            _logger = logger;
        }

        public async Task<List<UnifiedPost>> GetTimelinePostsAsync(string username, Guid userId)
        {
            var accessToken = await _authService.GetValidAccessTokenAsync(username, userId);
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.GetAsync(
                "https://oauth.reddit.com/best?limit=100"
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Failed to fetch Reddit timeline");
            }

            var timeline = await response.Content.ReadFromJsonAsync<RedditTimelineResponse>();
            
            // Filter and take top 15 posts
            var filteredPosts = timeline.Data.Children
                .Where(post => !post.Data.Permalink.Contains("/comments/"))
                .OrderByDescending(post => post.Data.CreatedUtc)
                .Take(15)
                .ToList();

            var filteredTimeline = new RedditTimelineResponse
            {
                Data = new RedditListingData
                {
                    Children = filteredPosts,
                    After = timeline.Data.After
                }
            };
            
            return _postEnricher.EnrichPostsWithMetrics(filteredTimeline);
        }
    }
}