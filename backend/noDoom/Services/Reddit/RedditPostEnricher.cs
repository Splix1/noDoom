using noDoom.Services.Reddit.Interfaces;
using noDoom.Repositories.Interfaces;

namespace noDoom.Services.Reddit
{
    public class RedditPostEnricher : IRedditPostEnricher
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public RedditPostEnricher(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<List<UnifiedPost>> EnrichPostsWithMetrics(RedditTimelineResponse posts, Guid userId)
        {
            var unifiedPosts = new List<UnifiedPost>();
            
            foreach (var post in posts.Data.Children)
            {
                var unifiedPost = new UnifiedPost
                {
                    Id = $"reddit_{post.Data.Id}",
                    Platform = "reddit",
                    AuthorName = post.Data.Author,
                    AuthorHandle = post.Data.Author,
                    Content = string.IsNullOrEmpty(post.Data.SelfText) 
                        ? post.Data.Title 
                        : $"{post.Data.Title}\n\n{post.Data.SelfText}",
                    CreatedAt = DateTimeOffset.FromUnixTimeSeconds((long)post.Data.CreatedUtc).UtcDateTime,
                    Media = CreateMediaContent(post.Data)
                };

                unifiedPost.IsFavorite = await _favoriteRepository.IsFavoriteAsync(userId, unifiedPost.Id);
                
                unifiedPosts.Add(unifiedPost);
            }

            return unifiedPosts;
        }

        public List<MediaContent> CreateMediaContent(RedditPost post)
        {
            var mediaList = new List<MediaContent>();

            // Handle direct image links
            if (post.Url.EndsWith(".jpg") || post.Url.EndsWith(".png") || post.Url.EndsWith(".gif"))
            {
                mediaList.Add(new MediaContent
                {
                    Type = "image",
                    Url = post.Url
                });
            }
            // Handle Reddit video
            else if (post.IsVideo && post.Media?.RedditVideo != null)
            {
                mediaList.Add(new MediaContent
                {
                    Type = "video",
                    Url = post.Media.RedditVideo.FallbackUrl
                });
            }
            // Handle preview images
            else if (post.Preview.Images.Any() == true)
            {
                mediaList.Add(new MediaContent
                {
                    Type = "image",
                    Url = post.Preview.Images[0].Source.Url.Replace("&amp;", "&")
                });
            }
            // Handle external links
            else if (!string.IsNullOrEmpty(post.Url) && !post.Url.Contains("reddit.com"))
            {
                mediaList.Add(new MediaContent
                {
                    Type = "link",
                    Url = post.Url,
                    Title = post.Title
                });
            }

            return mediaList.Count > 0 ? mediaList : null;
        }
    }
}