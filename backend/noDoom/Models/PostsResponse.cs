namespace noDoom.Models;

public class PostsResponse
{
    public PostWithMetrics[] Posts { get; set; }
}

public class PostWithMetrics
{
    public string PostUri { get; set; }
    public string Cid { get; set; }
    public PostAuthor PostAuthor { get; set; }
    public PostRecord PostRecord { get; set; }
    public PostMetrics Metrics { get; set; }
}

public class PostAuthor
{
    public string Did { get; set; }
    public string Handle { get; set; }
    public string DisplayName { get; set; }
    public string Avatar { get; set; }
}

public class PostRecord
{
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public Embed? Embed { get; set; }
}

public class PostMetrics
{
    public int LikeCount { get; set; }
} 