using noDoom.Models;

namespace noDoom.Repositories.Interfaces;

public interface IFavoriteRepository
{
    Task<List<Favorite>> GetUserFavoritesAsync(Guid userId);
    Task<bool> IsFavoriteAsync(Guid userId, string postId);
    Task AddFavoriteAsync(Guid userId, string postId);
    Task RemoveFavoriteAsync(Guid userId, string postId);
} 