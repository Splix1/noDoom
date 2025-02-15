using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("Users")]
class User : BaseModel 
{

    [PrimaryKey("id", false)]    
    public int Id { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("bluesky_show_following_only")]
    public bool BlueskyShowFollowingOnly { get; set; } = true;

    [Column("reddit_show_following_only")]
    public bool RedditShowFollowingOnly { get; set; } = true;

}