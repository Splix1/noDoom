using noDoom.Models;
using Supabase;
using noDoom.Repositories.Interfaces;
using System.Text.Json;

namespace noDoom.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly Client _supabaseClient;

    public FavoriteRepository(Client supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    public async Task<List<Favorite>> GetUserFavoritesAsync(Guid userId)
    {
        var response = await _supabaseClient
            .From<Favorite>()
            .Where(x => x.UserId == userId)
            .Get();

        return response.Models;
    }

    public async Task<List<UnifiedPost>> GetFavoritedPostsAsync(Guid userId)
    {
        // First get all favorites
        var favorites = await GetUserFavoritesAsync(userId);
        if (!favorites.Any()) return new List<UnifiedPost>();

        // Then get all the posts
        var posts = new List<UnifiedPost>();
        foreach (var favorite in favorites)
        {
            var post = await _supabaseClient
                .From<Post>()
                .Where(x => x.ExternalId == favorite.PostId)
                .Single();

            if (post != null)
            {
                posts.Add(new UnifiedPost
                {
                    Id = post.ExternalId,
                    Platform = post.Platform,
                    Content = post.Content,
                    CreatedAt = post.CreatedAt,
                    Media = post.Media != null ? JsonSerializer.Deserialize<List<MediaContent>>(post.Media) : null,
                    IsFavorite = true,
                    AuthorName = post.AuthorName,
                    AuthorHandle = post.AuthorHandle,
                    AuthorAvatar = post.AuthorAvatar
                });
            }
        }

        return posts.OrderByDescending(p => p.CreatedAt).ToList();
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, string postId)
    {
        var response = await _supabaseClient
            .From<Favorite>()
            .Where(x => x.UserId == userId && x.PostId == postId)
            .Get();

        return response.Models.Any();
    }

    private async Task EnsurePostExistsAsync(string postId, UnifiedPost postDetails)
    {
        var existingPost = await _supabaseClient
            .From<Post>()
            .Where(x => x.ExternalId == postId)
            .Single();

        if (existingPost == null)
        {
            var newPost = new Post
            {
                ExternalId = postId,
                Platform = postDetails?.Platform ?? (postId.StartsWith("at://") ? "bluesky" : "reddit"),
                URL = postId,
                Content = postDetails?.Content,
                CreatedAt = postDetails?.CreatedAt ?? DateTime.UtcNow,
                Media = postDetails?.Media != null ? JsonSerializer.Serialize(postDetails.Media) : null,
                AuthorName = postDetails?.AuthorName ?? "Unknown",
                AuthorHandle = postDetails?.AuthorHandle ?? "unknown",
                AuthorAvatar = postDetails?.AuthorAvatar
            };

            await _supabaseClient
                .From<Post>()
                .Insert(newPost);
        }
        else if (postDetails != null)
        {
            var updatePost = new Post
            {
                ExternalId = postId,
                Platform = postDetails.Platform,
                URL = postId,
                Content = postDetails.Content,
                CreatedAt = postDetails.CreatedAt,
                Media = postDetails.Media != null ? JsonSerializer.Serialize(postDetails.Media) : null,
                AuthorName = postDetails.AuthorName,
                AuthorHandle = postDetails.AuthorHandle,
                AuthorAvatar = postDetails.AuthorAvatar
            };

            await _supabaseClient
                .From<Post>()
                .Where(x => x.ExternalId == postId)
                .Update(updatePost);
        }
    }

    public async Task AddFavoriteAsync(Guid userId, string postId, UnifiedPost postDetails = null)
    {
        await EnsurePostExistsAsync(postId, postDetails);

        var favorite = new Favorite
        {
            UserId = userId,
            PostId = postId
        };

        await _supabaseClient
            .From<Favorite>()
            .Insert(favorite);
    }

    public async Task RemoveFavoriteAsync(Guid userId, string postId)
    {
        await _supabaseClient
            .From<Favorite>()
            .Where(x => x.UserId == userId && x.PostId == postId)
            .Delete();
    }
} 