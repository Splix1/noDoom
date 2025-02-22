using System;

public class BlueskyException : Exception
{
    public int StatusCode { get; }

    public BlueskyException(string message, int statusCode = 500) 
        : base(message)
    {
        StatusCode = statusCode;
    }
} 