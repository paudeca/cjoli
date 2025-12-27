using Azure.AI.OpenAI;
using cjoli.Server.Models;
using cjoli.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog.Sinks.Datadog.Logs;
using Serilog;
using System.Text;
using Serilog.Exceptions;
using cjoli.Server.Exceptions;
using cjoli.Server.Middlewares;
using Serilog.Enrichers.Sensitive;
using cjoli.Server.Authorizations;
using Microsoft.AspNetCore.Authorization;
using PhotoSauce.MagicScaler;
using PhotoSauce.NativeCodecs.Libpng;
using PhotoSauce.NativeCodecs.Libjpeg;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(opt =>
{
    opt.SaveToken = true;
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtKey"] ?? "")),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = false,
        ValidateIssuerSigningKey = true
    };
});
builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("IsRootAdmin", policy =>
    {
        policy.RequireRole("ADMIN");
    });
    opt.AddPolicy("IsAdmin", policy =>
    {
        policy.RequireRole("ADMIN", "ADMIN_LOCAL");
    });
    opt.AddPolicy("EditTourney", policy =>
    {
        policy.AddRequirements(new AdminTourneyRequirement());
    });
});

builder.Services
    .AddApplicationInsightsTelemetryWorkerService();

builder.Services.AddControllers();
builder.Services.AddCors(opt => opt.AddDefaultPolicy(b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please insert JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
   {
     new OpenApiSecurityScheme
     {
       Reference = new OpenApiReference
       {
         Type = ReferenceType.SecurityScheme,
         Id = "Bearer"
       }
      },
      new string[] { }
    }
  });
});
builder.Services.AddDataProtection();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddMemoryCache(opt =>
{
    //opt.SizeLimit = 1024;
});


builder.Services.AddSingleton<CJoliService>();
builder.Services.AddSingleton<SettingService>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<EstimateService>();
builder.Services.AddSingleton<AIService>();
builder.Services.AddSingleton<ServerService>();
builder.Services.AddSingleton<MessageService>();
builder.Services.AddSingleton<TwilioService>();
builder.Services.AddSingleton<StorageService>();
builder.Services.AddSingleton<SynchroService>();
builder.Services.AddSingleton(new OpenAIClient(builder.Configuration["OpenAIKey"]));
builder.Services.AddSingleton<LoggerMiddleware>();
builder.Services.AddSingleton<CancellationMiddleware>();

builder.Services.AddSingleton<IAuthorizationHandler, AdminTourneyAuthorizationHandler>();

builder.Services.AddHostedService<SynchroHostedService>();
builder.Services.AddHostedService<MetricHostedService>();

builder.Services.AddDbContextPool<CJoliContext>(options =>
{
    var cnx = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(cnx, ServerVersion.AutoDetect(cnx), o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));
}
);

builder.Services.AddLogging(configure =>
{
    var logger = new LoggerConfiguration()
    .Enrich.WithExceptionDetails()
    .Enrich.FromLogContext()
    .Enrich.WithSensitiveDataMasking(opt =>
    {
        opt.MaskProperties.Add("Password");
    })
    .WriteTo.DatadogLogs(builder.Configuration["DatadogKey"],
        configuration: new DatadogConfiguration() { Url = "https://http-intake.logs.datadoghq.eu" },
        service: "server",
        host: builder.Configuration["Source"])
    .MinimumLevel.Debug()
    .Filter.ByIncludingOnly("SourceContext like 'cjoli%' OR SourceContext='Microsoft.AspNetCore.Hosting.Diagnostics'")
    .CreateLogger();
    configure.AddSerilog(logger);
});

builder.Services.AddExceptionHandler<LoggerExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseDefaultFiles();
app.UseCors();
app.UseStaticFiles();
app.UseExceptionHandler();

app.UseWebSockets();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Configure the HTTP request pipeline.
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<LoggerMiddleware>();
app.UseMiddleware<CancellationMiddleware>();


app.MapControllers();

app.MapFallbackToFile("/index.html");

CodecManager.Configure(c =>
{
    c.UseLibpng();
    c.UseLibjpeg();
});


app.Run();
