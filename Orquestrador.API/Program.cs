using Microsoft.EntityFrameworkCore;
using Orquestrador.Infrastructure.Data;
using Orquestrador.Infrastructure.Services;
using Orquestrador.API.Hubs;
using Orquestrador.Domain.Interfaces;
using Orquestrador.API.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration - PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis configuration - Optional for local development
try
{
    var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnection + ",abortConnect=false"));
}
catch
{
    // Redis not available, skip it for now
    Console.WriteLine("Warning: Redis not available, real-time updates disabled");
}

// HttpClient for agent communication
builder.Services.AddHttpClient();

// Services
builder.Services.AddScoped<AgentOrchestrationService>();
builder.Services.AddScoped<IWorkflowNotifier, SignalRWorkflowNotifier>();

// SignalR
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");

// app.UseHttpsRedirection();

// app.UseCors("AllowAngular"); // Moved up

app.UseAuthorization();

app.MapControllers();
app.MapHub<OrchestrationHub>("/hubs/orchestration");

// Auto-migrate database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // Use EnsureCreated for InMemory database
}

app.Run();

