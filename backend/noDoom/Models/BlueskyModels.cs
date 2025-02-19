using System.Text.Json.Serialization;

namespace noDoom.Models
{
    public class BlueskyImage
    {
        public string? Alt { get; set; }
        public AspectRatio? AspectRatio { get; set; }
        public ImageObject? Image { get; set; }
    }

    public class ImageObject
    {
        [JsonPropertyName("$type")]
        public string? Type { get; set; }
        public ImageRef? Ref { get; set; }
        public string? MimeType { get; set; }
        public int Size { get; set; }
    }

    public class AspectRatio
    {
        public int Height { get; set; }
        public int Width { get; set; }
    }

    public class ImageData
    {
        [JsonPropertyName("$type")]
        public string? Type { get; set; }
        public ImageRef? Ref { get; set; }
        public string? MimeType { get; set; }
        public int Size { get; set; }
    }

    public class ImageRef
    {
        [JsonPropertyName("$link")]
        public string? Link { get; set; }
    }

    public class External
    {
        public string Uri { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public object? Thumb { get; set; }
    }
} 