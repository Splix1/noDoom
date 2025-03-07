namespace noDoom.Models;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Posts")]
class Post : BaseModel {
    
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("platform")]
    public string Platform { get; set; }

    [Column("URL")]
    public string URL { get; set; }
    
}
