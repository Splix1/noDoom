using noDoom.Models;

public interface IConnectionRepository
{
    Task<Connection?> GetConnectionAsync(Guid userId, string platform);
    Task<List<Connection>> GetConnectionsAsync(Guid userId);
    Task CreateConnectionAsync(Connection connection);
    Task DeleteConnectionAsync(Guid userId, string platform);
    Task UpdateConnectionAsync(Connection connection);
} 