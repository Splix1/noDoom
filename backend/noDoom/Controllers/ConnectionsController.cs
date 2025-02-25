using Microsoft.AspNetCore.Mvc;
using noDoom.Models;
using noDoom.Services;
using System.Security.Claims;

namespace noDoom.Controllers;

[ApiController]
[Route("api/connections")]
public class ConnectionsController : ControllerBase
{
    private readonly IConnectionRepository _connectionRepository;

    public ConnectionsController(IConnectionRepository connectionRepository)
    {
        _connectionRepository = connectionRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetConnections()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var connections = await _connectionRepository.GetConnectionsAsync(Guid.Parse(userId));
        var connectionDtos = connections.Select(c => new ConnectionDTO 
        {
            Platform = c.Platform,
            Handle = c.Handle
        }).ToList();
        
        return Ok(connectionDtos);
    }
}