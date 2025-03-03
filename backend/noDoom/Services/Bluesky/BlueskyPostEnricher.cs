using noDoom.Models;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using noDoom.Services.Bluesky.Interfaces;

namespace noDoom.Services.Bluesky
{
    public class BlueskyPostEnricher : IBlueskyPostEnricher
    {
        private readonly HttpClient _httpClient;
        private readonly IBlueskyAuthService _authService;

        public BlueskyPostEnricher(
            HttpClient httpClient,
            IBlueskyAuthService authService)
        {
            _httpClient = httpClient;
            _authService = authService;
        }

        public List<UnifiedPost> EnrichPostsWithMetrics(BlueskyTimelineResponse timeline)
        {
            var unifiedPosts = new List<UnifiedPost>();
            
            foreach (var item in timeline.Feed)
            {
                var post = new UnifiedPost
                {
                    Id = item.Post.Uri,
                    Platform = "bluesky",
                    AuthorName = item.Post.Author.DisplayName,
                    AuthorHandle = item.Post.Author.Handle,
                    AuthorAvatar = item.Post.Author.Avatar,
                    Content = item.Post.Record.Text,
                    CreatedAt = item.Post.Record.CreatedAt,
                    Media = CreateMediaContent(item.Post.Record.Embed, item.Post.Author.Did)
                };
                
                unifiedPosts.Add(post);
            }

            return unifiedPosts;
        }

        public UnifiedPost CreateQuotedPost(Record? record)
        {
            if (record == null) return null;
            
            return new UnifiedPost
            {
                Content = record.Text,
                CreatedAt = record.CreatedAt
            };
        }

        public List<MediaContent>? CreateMediaContent(Embed? embed, string did)
        {
            if (embed == null) return null;

            var mediaList = new List<MediaContent>();

            if (embed.Images != null)
            {
                foreach (var image in embed.Images)
                {
                    var imageUrl = image.Image?.Ref?.Link != null
                        ? $"https://cdn.bsky.app/img/feed_thumbnail/plain/{did}/{image.Image.Ref.Link}@jpeg"
                        : null;

                    mediaList.Add(new MediaContent
                    {
                        Type = "image",
                        Url = imageUrl,
                    });
                }
            }

            if (embed.External != null)
            {
                mediaList.Add(new MediaContent
                {
                    Type = "link",
                    Url = embed.External.Uri,
                    Title = embed.External.Title,
                    Description = embed.External.Description,
                    ThumbnailUrl = embed.External.Thumb?.ToString()
                });
            }

            return mediaList.Count > 0 ? mediaList : null;
        }
    }
} 