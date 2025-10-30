using CatalogoLage.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CatalogoLage.Models;
using System.Text;

// Configurar encoding UTF-8 globalmente
Console.OutputEncoding = Encoding.UTF8;
Console.InputEncoding = Encoding.UTF8;

var builder = WebApplication.CreateBuilder(args);

// Configurar encoding para la aplicación
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("es-ES");
    options.SupportedCultures = new[] { new System.Globalization.CultureInfo("es-ES") };
    options.SupportedUICultures = new[] { new System.Globalization.CultureInfo("es-ES") };
});

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DatabaseConnectionDE28")
    ?? throw new InvalidOperationException("Connection string 'DatabaseConnectionDE28' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => {
    options.SignIn.RequireConfirmedAccount = false; // Cambia a true en producción si deseas confirmación
}).AddRoles<IdentityRole>()
  .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CatalogViewer", p => p.RequireRole("CatalogViewer","Admin"));
    options.AddPolicy("CatalogAdmin", p => p.RequireRole("Admin"));
});

builder.Services.AddControllers();

builder.Services.AddRazorPages(options =>
{
    options.Conventions.AuthorizeFolder("/Admin", "CatalogAdmin");
});

var app = builder.Build();

// Configurar localización
app.UseRequestLocalization();

// Seed roles + usuario admin (solo desarrollo / inicialización)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

    string[] roles = ["Admin", "CatalogViewer"];
    foreach (var r in roles)
    {
        if (!await roleManager.RoleExistsAsync(r))
            await roleManager.CreateAsync(new IdentityRole(r));
    }

    // Lee de configuración (User Secrets recomendado) o usa valores por defecto de desarrollo
    var adminEmail = builder.Configuration["Seed:Admin:Email"] ?? "admin@demo.local";
    var adminPassword = builder.Configuration["Seed:Admin:Password"] ?? "Admin123$!"; // Usa Secrets en real

    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new IdentityUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true
        };
        var createResult = await userManager.CreateAsync(adminUser, adminPassword);
        if (!createResult.Succeeded)
        {
            throw new Exception("No se pudo crear el usuario admin: " + string.Join(",", createResult.Errors.Select(e=>e.Description)));
        }
    }

    // Asegurar roles
    foreach (var r in roles)
    {
        if (!await userManager.IsInRoleAsync(adminUser, r))
            await userManager.AddToRoleAsync(adminUser, r);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapRazorPages();

app.Run();
