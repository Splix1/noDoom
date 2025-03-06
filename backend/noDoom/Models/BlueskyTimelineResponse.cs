namespace noDoom.Models;
using System.Text.Json.Serialization;

public class BlueskyTimelineResponse
{
    public TimelineFeed[] Feed { get; set; }
    public string Cursor { get; set; }
}

public class TimelineFeed
{
    public TimelinePost Post { get; set; }
    public Reply Reply { get; set; }
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
    public Embed Embed { get; set; }
}

public class Embed
{
    public BlueskyImage[] Images { get; set; }
    public EmbedExternal External { get; set; }
    public EmbeddedRecord Record { get; set; }
}

public class EmbedExternal
{
    public string Uri { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public object Thumb { get; set; }
}

public class Image
{
    public string Alt { get; set; }
    public AspectRatio AspectRatio { get; set; }
    public ImageObject ImageObject { get; set; }
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

public class EmbeddedRecord
{
    public string Uri { get; set; }
    public Author Author { get; set; }
    public RecordValue Value { get; set; }
}

public class RecordValue
{
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public Embed Embed { get; set; }
}