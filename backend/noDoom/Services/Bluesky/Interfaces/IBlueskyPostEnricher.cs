using noDoom.Models;

namespace noDoom.Services.Bluesky.Interfaces
{
    public interface IBlueskyPostEnricher
    {
        Task<List<UnifiedPost>> EnrichPostsWithMetrics(BlueskyTimelineResponse timeline, Guid userId);
        UnifiedPost CreateQuotedPost(Record record);
        List<MediaContent> CreateMediaContent(Embed embed, string did);
    }
} 