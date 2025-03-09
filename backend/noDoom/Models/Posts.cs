namespace noDoom.Models;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Posts")]
public class Post : BaseModel {
    
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("external_id")]
    public string ExternalId { get; set; }

    [Column("platform")]
    public string Platform { get; set; }

    [Column("URL")]
    public string URL { get; set; }

    [Column("content")]
    public string Content { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("media")]
    public string Media { get; set; }

    [Column("author_name")]
    public string AuthorName { get; set; }

    [Column("author_handle")]
    public string AuthorHandle { get; set; }

    [Column("author_avatar")]
    public string AuthorAvatar { get; set; }
}
