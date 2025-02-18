namespace noDoom.Models;

public class PostsResponse
{
    public PostWithMetrics[] Posts { get; set; }
}

public class PostWithMetrics
{
    public string Uri { get; set; }
    public string Cid { get; set; }
    public int LikeCount { get; set; }
    public int RepostCount { get; set; }
    public int ReplyCount { get; set; }
}

public class PostMetrics
{
    public LikeCount? LikeCount { get; set; }
}

public class LikeCount
{
    public int Count { get; set; }
} 