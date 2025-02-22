public class BlueskyConfig
{
    public string BaseUrl { get; set; } = "https://bsky.social";
    public string ApiVersion { get; set; } = "xrpc";
    public TimeSpan AccessTokenTTL { get; set; } = TimeSpan.FromHours(2);
} 