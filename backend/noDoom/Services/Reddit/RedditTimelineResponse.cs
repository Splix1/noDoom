using System.Text.Json.Serialization;
public class RedditTimelineResponse
{
    [JsonPropertyName("data")]
    public RedditListingData Data { get; set; }
}

public class RedditListingData
{
    [JsonPropertyName("children")]
    public List<RedditPostContainer> Children { get; set; }

    [JsonPropertyName("after")]
    public string After { get; set; }
}

public class RedditPostContainer
{
    [JsonPropertyName("data")]
    public RedditPost Data { get; set; }
}

public class RedditPost
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("selftext")]
    public string SelfText { get; set; }

    [JsonPropertyName("author")]
    public string Author { get; set; }

    [JsonPropertyName("created_utc")]
    public double CreatedUtc { get; set; }

    [JsonPropertyName("url")]
    public string Url { get; set; }

    [JsonPropertyName("permalink")]
    public string Permalink { get; set; }

    [JsonPropertyName("is_video")]
    public bool IsVideo { get; set; }

    [JsonPropertyName("media")]
    public RedditMedia Media { get; set; }

    [JsonPropertyName("preview")]
    public RedditPreview Preview { get; set; }
}

public class RedditMedia
{
    [JsonPropertyName("reddit_video")]
    public RedditVideo RedditVideo { get; set; }
}

public class RedditVideo
{
    [JsonPropertyName("fallback_url")]
    public string FallbackUrl { get; set; }
}

public class RedditPreview
{
    [JsonPropertyName("images")]
    public List<RedditImage> Images { get; set; }
}

public class RedditImage
{
    [JsonPropertyName("source")]
    public RedditImageSource Source { get; set; }
}

public class RedditImageSource
{
    [JsonPropertyName("url")]
    public string Url { get; set; }
}