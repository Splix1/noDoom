namespace noDoom.Services.Reddit.Interfaces
{
    public interface IRedditPostEnricher
    {
        Task<List<UnifiedPost>> EnrichPostsWithMetrics(RedditTimelineResponse posts, Guid userId);
        List<MediaContent> CreateMediaContent(RedditPost post);
    }
}
