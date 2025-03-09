using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Supabase;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StackExchange.Redis;
using noDoom.Services;
using noDoom.Services.Bluesky;
using noDoom.Repositories;
using noDoom.Services.Bluesky.Interfaces;
using noDoom.Repositories.Interfaces;
using noDoom.Services.Reddit;
using noDoom.Services.Reddit.Interfaces;
var builder = WebApplication.CreateBuilder(args);

string supabaseUrl = builder.Configuration["Supabase:Url"];
string supabaseKey = builder.Configuration["Supabase:Key"];
string jwtSecretKey = builder.Configuration["Supabase:JWT-secret"];


// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") 
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

var supabaseOptions = new Supabase.SupabaseOptions
{
    AutoConnectRealtime = true
};

var supabaseClient = new Supabase.Client(supabaseUrl, supabaseKey, supabaseOptions);
await supabaseClient.InitializeAsync();


builder.Services.AddSingleton(supabaseClient);

builder.Services.AddHttpClient<IBlueskyAuthService, BlueskyAuthService>();
builder.Services.AddHttpClient<IBlueskyTimelineService, BlueskyTimelineService>();
builder.Services.AddScoped<IBlueskyPostEnricher, BlueskyPostEnricher>();
builder.Services.AddScoped<IConnectionRepository, ConnectionRepository>();

// Add Redis configuration
var redisConnection = ConnectionMultiplexer.Connect(builder.Configuration["Redis:ConnectionString"]);
builder.Services.AddSingleton<IConnectionMultiplexer>(redisConnection);
builder.Services.AddSingleton<IRedisService, RedisService>();

var bytes = Encoding.UTF8.GetBytes(jwtSecretKey!);

builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = false,
        IssuerSigningKey = new SymmetricSecurityKey(bytes),
        ValidAudience = builder.Configuration["Authentication:ValidAudience"],
        ValidIssuer = builder.Configuration["Authentication:ValidIssuer"],
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
    };
});

builder.Services.AddScoped<IRedditAuthService, RedditAuthService>();
builder.Services.AddScoped<IRedditTimelineService, RedditTimelineService>();
builder.Services.AddScoped<IRedditPostEnricher, RedditPostEnricher>();
builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.

// Commented out for local development
// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireAuthorization();


app.Run();
