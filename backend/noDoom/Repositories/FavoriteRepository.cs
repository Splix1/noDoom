using noDoom.Models;
using Supabase;
using noDoom.Repositories.Interfaces;

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

    public async Task<bool> IsFavoriteAsync(Guid userId, string postId)
    {
        var response = await _supabaseClient
            .From<Favorite>()
            .Where(x => x.UserId == userId && x.PostId == postId)
            .Get();

        return response.Models.Any();
    }

    private async Task EnsurePostExistsAsync(string postId)
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
                Platform = postId.StartsWith("at://") ? "bluesky" : "reddit",
                URL = postId
            };

            await _supabaseClient
                .From<Post>()
                .Insert(newPost);
        }
    }

    public async Task AddFavoriteAsync(Guid userId, string postId)
    {
        await EnsurePostExistsAsync(postId);

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