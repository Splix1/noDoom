namespace noDoom.Models;

using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Favorites")]
class Favorite : BaseModel {
    
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }
    
    [Column("post_id")]
    public int PostId { get; set; }
    
}
