namespace noDoom.Services.Reddit.Interfaces
{
    public interface IRedditPostEnricher
    {
        List<UnifiedPost> EnrichPostsWithMetrics(RedditTimelineResponse posts);
        List<MediaContent> CreateMediaContent(RedditPost post);
    }
}
