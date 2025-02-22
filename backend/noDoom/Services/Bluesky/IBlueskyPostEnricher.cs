using noDoom.Models;

namespace noDoom.Services.Bluesky
{
    public interface IBlueskyPostEnricher
    {
        Task<List<UnifiedPost>> EnrichPostsWithMetrics(BlueskyTimelineResponse timeline);
        Task<UnifiedPost?> CreateQuotedPost(Record? record);
        List<MediaContent>? CreateMediaContent(Embed? embed, string did);
    }
} 