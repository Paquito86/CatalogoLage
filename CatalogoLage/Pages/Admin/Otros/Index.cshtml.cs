using System.Text;
using System.Text.Json;
using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.Otros;

[Authorize(Roles = "Admin")]
public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    private static readonly HttpClient Http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };

    public IndexModel(ApplicationDbContext ctx)
    {
        _ctx = ctx;
    }

    [BindProperty(SupportsGet = true)]
    public bool BackupReady { get; set; }

    [BindProperty(SupportsGet = true)]
    public bool CanRunMigration { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Message { get; set; }

    public string? StatusMessage { get; set; }

    public void OnGet()
    {
        StatusMessage = Message;
    }

    public async Task<IActionResult> OnPostExportLinksAsync()
    {
        var products = await _ctx.Products
            .Where(p => !string.IsNullOrEmpty(p.ImageUrl) && !p.ImageUrl!.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
            .Select(p => new { p.Id, p.Name, p.ImageUrl })
            .ToListAsync();

        var json = JsonSerializer.Serialize(products, new JsonSerializerOptions { WriteIndented = true });
        var bytes = Encoding.UTF8.GetBytes(json);
        var fileName = $"catalogo_imagenes_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";

        // Intentar guardar una copia en Program Files (si hay permisos). Si falla, probar ProgramData.
        try
        {
            var pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            var backupDir = Path.Combine(pf, "CatalogoLage", "Backups");
            Directory.CreateDirectory(backupDir);
            await System.IO.File.WriteAllBytesAsync(Path.Combine(backupDir, fileName), bytes);
        }
        catch
        {
            try
            {
                var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
                var backupDir = Path.Combine(programData, "CatalogoLage", "Backups");
                Directory.CreateDirectory(backupDir);
                await System.IO.File.WriteAllBytesAsync(Path.Combine(backupDir, fileName), bytes);
            }
            catch
            {
                // Ignorar si no se puede guardar en el servidor
            }
        }

        return File(bytes, "application/json", fileName);
    }

    public IActionResult OnPostConfirmBackup()
    {
        return RedirectToPage(new { BackupReady = true, CanRunMigration = true });
    }

    public async Task<IActionResult> OnPostRunMigrationAsync()
    {
        // Asegurar confirmación previa
        if (!BackupReady || !CanRunMigration)
        {
            StatusMessage = "Debes descargar y confirmar el JSON antes de ejecutar la migración.";
            return Page();
        }

        var products = await _ctx.Products
            .Where(p => !string.IsNullOrEmpty(p.ImageUrl) && !p.ImageUrl!.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
            .ToListAsync();

        int okCount = 0, failCount = 0;
        foreach (var p in products)
        {
            try
            {
                var (ok, dataUri) = await DownloadToDataUriAsync(p.ImageUrl!);
                if (!ok) { failCount++; continue; }
                p.ImageUrl = dataUri;
                okCount++;
            }
            catch
            {
                failCount++;
            }
        }
        await _ctx.SaveChangesAsync();
        var msg = $"Migración completada. Exitosos: {okCount}, fallidos: {failCount}.";
        return RedirectToPage(new { BackupReady = true, CanRunMigration = false, message = msg });
    }

    private static async Task<(bool ok, string dataUri)> DownloadToDataUriAsync(string url)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        using var resp = await Http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return (false, "");
        var contentType = resp.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
        var bytes = await resp.Content.ReadAsByteArrayAsync();
        var base64 = Convert.ToBase64String(bytes);
        var dataUri = $"data:{contentType};base64,{base64}";
        return (true, dataUri);
    }
}
