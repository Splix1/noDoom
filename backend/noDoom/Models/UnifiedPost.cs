public class UnifiedPost
{
    public string Id { get; set; }
    public string Platform { get; set; }  // "bluesky" or "reddit"
    public string AuthorName { get; set; }
    public string AuthorHandle { get; set; }
    public string AuthorAvatar { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public MediaContent? Media { get; set; }
    public int LikeCount { get; set; }
}

public class MediaContent
{
    public string? Type { get; set; }  // "image" or "link"
    public string? Url { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
} 