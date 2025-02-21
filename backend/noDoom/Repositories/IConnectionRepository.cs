using noDoom.Models;

public interface IConnectionRepository
{
    Task<Connection?> GetConnectionAsync(Guid userId, string platform);
    Task CreateConnectionAsync(Connection connection);
    Task DeleteConnectionAsync(Guid userId, string platform);
} 