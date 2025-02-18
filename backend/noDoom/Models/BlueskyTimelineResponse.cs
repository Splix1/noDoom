namespace noDoom.Models;

public class BlueskyTimelineResponse
{
    public TimelineFeed[] Feed { get; set; }
    public string? Cursor { get; set; }
}

public class TimelineFeed
{
    public TimelinePost Post { get; set; }
    public Reply? Reply { get; set; }
}

public class TimelinePost
{
    public string Uri { get; set; }
    public string Cid { get; set; }
    public Author Author { get; set; }
    public Record Record { get; set; }
    public DateTime IndexedAt { get; set; }
}

public class Author
{
    public string Did { get; set; }
    public string Handle { get; set; }
    public string DisplayName { get; set; }
    public string Avatar { get; set; }
}

public class Record
{
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public Embed? Embed { get; set; }
}

public class Embed
{
    public Image[]? Images { get; set; }
    public External? External { get; set; }
}

public class Image
{
    public string Ref { get; set; }
    public string MimeType { get; set; }
    public int Size { get; set; }
}

public class External
{
    public string Uri { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public object? Thumb { get; set; }
}

public class Reply
{
    public ReplyReference Root { get; set; }
    public ReplyReference Parent { get; set; }
}

public class ReplyReference
{
    public string Uri { get; set; }
    public string Cid { get; set; }
}