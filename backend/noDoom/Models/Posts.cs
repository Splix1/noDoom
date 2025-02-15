using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Posts")]
class Post : BaseModel {
    
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("platform")]
    public required string Platform { get; set; }

    [Column("URL")]
    public required string URL { get; set; }
    
}
