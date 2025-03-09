namespace noDoom.Models;

using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Favorites")]
public class Favorite : BaseModel {
    
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }
    
    [Column("post_id")]
    public string PostId { get; set; }
    
}
