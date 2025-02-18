using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Supabase;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using noDoom.Controllers;
using noDoom.Services;

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
builder.Services.AddScoped<IBlueskyService, BlueskyService>();
builder.Services.AddHttpClient<BlueskyService>();
builder.Services.AddScoped<BlueskyController>();

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


var app = builder.Build();

// Configure the HTTP request pipeline.

// Commented out for local development
// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireAuthorization();


app.Run();
