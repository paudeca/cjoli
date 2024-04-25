using cjoli.Server.Datas;
using cjoli.Server.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddSingleton<CJoliService>();

builder.Services.AddDbContextPool<CJoliContext>(options =>
{
    var cnx = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(cnx, ServerVersion.AutoDetect(cnx));
}
);


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<CJoliContext>();
context.Database.Migrate();

app.Run();
