using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Connections")]
public class Connection : BaseModel
{
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }
    
    [Column("platform")]
    public string Platform { get; set; }

    [Column("access_token")]
    public string AccessToken { get; set; }

    [Column("refresh_token")]
    public string RefreshToken { get; set; }

    [Column("DID")]
    public string? DID { get; set; }

    [Column("handle")]
    public string? Handle { get; set; }
}
