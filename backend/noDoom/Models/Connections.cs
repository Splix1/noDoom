using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Connections")]
class Connection : BaseModel {
    
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }
    
    [Column("platform")]
    public required string Platform { get; set; }

    [Column("access_token")]
    public required string AccessToken { get; set; }

    [Column("refresh_token")]
    public required string RefreshToken { get; set; }
    
    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    [Column("DID")]
    public required string DID { get; set; }

    [Column("handle")]
    public required string Handle { get; set; }
}
