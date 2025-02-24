using noDoom.Models;

namespace noDoom.Services.Bluesky
{
    public interface IBlueskyPostEnricher
    {
        List<UnifiedPost> EnrichPostsWithMetrics(BlueskyTimelineResponse timeline);
        UnifiedPost CreateQuotedPost(Record? record);
        List<MediaContent>? CreateMediaContent(Embed? embed, string did);
    }
} 