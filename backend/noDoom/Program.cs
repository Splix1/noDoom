using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

string supabaseUrl = builder.Configuration["Supabase:Url"];
string supabaseKey = builder.Configuration["Supabase:Key"];


// Add services to the container.

builder.Services.AddControllers();

var supabaseOptions = new Supabase.SupabaseOptions
{
    AutoConnectRealtime = true
};

var supabaseClient = new Supabase.Client(supabaseUrl, supabaseKey, supabaseOptions);
await supabaseClient.InitializeAsync();

builder.Services.AddSingleton(supabaseClient);

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
