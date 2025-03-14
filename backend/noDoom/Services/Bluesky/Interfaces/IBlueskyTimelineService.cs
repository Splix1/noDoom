namespace noDoom.Services.Bluesky.Interfaces
{
    public interface IBlueskyTimelineService
    {
        Task<List<UnifiedPost>> GetTimelinePostsAsync(string did, Guid userId);
    } 
}