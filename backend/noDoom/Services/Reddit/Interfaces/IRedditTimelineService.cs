namespace noDoom.Services.Reddit.Interfaces
{
    public interface IRedditTimelineService
    {
        Task<List<UnifiedPost>> GetTimelinePostsAsync(string username, Guid userId);
    }
}
