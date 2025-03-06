using noDoom.Models;
using Supabase;
using noDoom.Repositories.Interfaces;

namespace noDoom.Repositories
{
    public class ConnectionRepository : IConnectionRepository
    {
        private readonly Client _supabaseClient;

        public ConnectionRepository(Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<Connection> GetConnectionAsync(Guid userId, string platform)
        {
            return await _supabaseClient
                .From<Connection>()
                .Where(x => x.UserId == userId && x.Platform == platform)
                .Single();
        }

        public async Task<List<Connection>> GetConnectionsAsync(Guid userId)
        {
            var response = await _supabaseClient
                .From<Connection>()
                .Where(x => x.UserId == userId)
                .Get();

            return response.Models;
        }

        public async Task CreateConnectionAsync(Connection connection)
        {
            await _supabaseClient
                .From<Connection>()
                .Insert(connection);
        }
        
        public async Task DeleteConnectionAsync(Guid userId, string platform)
        {
            await _supabaseClient
                .From<Connection>()
                .Where(x => x.UserId == userId && x.Platform == platform)
                .Delete();
        }

        public async Task UpdateConnectionAsync(Connection connection)
        {
            await _supabaseClient
                .From<Connection>()
                .Where(x => x.UserId == connection.UserId && x.Platform == connection.Platform)
                .Update(connection);
        }
    }
}
