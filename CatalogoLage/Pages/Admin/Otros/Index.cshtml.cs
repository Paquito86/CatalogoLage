using System.Text;
using System.Text.Json;
using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO.Compression;

namespace CatalogoLage.Pages.Admin.Otros;

[Authorize(Roles = "Admin")]
public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    private readonly IWebHostEnvironment _env;
    private static readonly HttpClient Http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };

    public IndexModel(ApplicationDbContext ctx, IWebHostEnvironment env)
    {
        _ctx = ctx;
        _env = env;
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
        // Exportar por separado: enlaces http/https y data:image (base64)
        var external = await _ctx.Products
            .Where(p => p.ImageUrl != null && p.ImageUrl != "" && EF.Functions.Like(p.ImageUrl!, "http%"))
            .Select(p => new { p.Id, p.Name, p.ImageUrl })
            .ToListAsync();

        var base64 = await _ctx.Products
            .Where(p => p.ImageUrl != null && p.ImageUrl != "" && EF.Functions.Like(p.ImageUrl!, "data:image%"))
            .Select(p => new { p.Id, p.Name, p.ImageUrl })
            .ToListAsync();

        var payload = new
        {
            exportedAtUtc = DateTime.UtcNow,
            counts = new { external = external.Count, base64 = base64.Count },
            external,
            base64
        };

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
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

        // Preparar ZIP en memoria con los ficheros bajo carpeta img/
        using var ms = new MemoryStream();
        using var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true);

        // Migrar toda imagen que NO esté ya en /img/
        var products = await _ctx.Products
            .Where(p => p.ImageUrl != null && p.ImageUrl != "" && !EF.Functions.Like(p.ImageUrl!, "/img/%"))
            .ToListAsync();

        int okCount = 0, failCount = 0;
        foreach (var p in products)
        {
            try
            {
                var url = p.ImageUrl!;
                byte[] bytes;
                string contentType;

                if (url.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                {
                    var dl = await DownloadImageAsync(url);
                    if (!dl.ok || dl.bytes.Length == 0) { failCount++; continue; }
                    bytes = dl.bytes; contentType = dl.contentType;
                }
                else if (url.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                {
                    var parsed = TryParseDataUri(url);
                    if (!parsed.ok || parsed.bytes.Length == 0) { failCount++; continue; }
                    bytes = parsed.bytes; contentType = parsed.contentType;
                }
                else
                {
                    // Desconocido (posible ruta local ajena), omitir
                    continue;
                }

                var ext = GetFileExtension(url, contentType);
                var safeName = SanitizeFileName(string.IsNullOrWhiteSpace(p.Name) ? $"prod_{p.Id}" : p.Name);
                var fileName = $"{safeName}{ext}"; // nombre basado en el nombre del producto

                // Añadir sufijo si ya existe un entry con el mismo nombre
                int suffix = 1;
                string entryPath = $"img/{fileName}";
                while (zip.Entries.Any(e => string.Equals(e.FullName, entryPath, StringComparison.OrdinalIgnoreCase)))
                {
                    fileName = $"{safeName}_{suffix}{ext}";
                    entryPath = $"img/{fileName}";
                    suffix++;
                }

                // Añadir al ZIP bajo la carpeta img/
                var entry = zip.CreateEntry(entryPath, CompressionLevel.Optimal);
                using (var entryStream = entry.Open())
                {
                    await entryStream.WriteAsync(bytes, 0, bytes.Length);
                }

                // Actualizar DB a la ruta estática
                p.ImageUrl = "/img/" + fileName;
                okCount++;
            }
            catch
            {
                failCount++;
            }
        }

        // Guardar cambios de DB
        await _ctx.SaveChangesAsync();

        // Añadir manifest con resumen
        var manifest = $"Migración {DateTime.UtcNow:O}. Exitosos: {okCount}, fallidos: {failCount}. Extrae el contenido de 'img/' dentro de wwwroot/img.";
        var manifestEntry = zip.CreateEntry("README.txt", CompressionLevel.Optimal);
        using (var sw = new StreamWriter(manifestEntry.Open(), Encoding.UTF8))
        {
            sw.Write(manifest);
        }

        zip.Dispose(); // finalizar ZIP para completar el stream
        var zipBytes = ms.ToArray();
        var zipName = $"catalogo_imagenes_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip";
        return File(zipBytes, "application/zip", zipName);
    }

    private static async Task<(bool ok, byte[] bytes, string contentType)> DownloadImageAsync(string url)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        using var resp = await Http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return (false, Array.Empty<byte>(), "");
        var contentType = resp.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
        var bytes = await resp.Content.ReadAsByteArrayAsync();
        return (true, bytes, contentType);
    }

    private static (bool ok, byte[] bytes, string contentType) TryParseDataUri(string dataUri)
    {
        try
        {
            // Formato: data:[mime][;charset=utf-8];base64,AAAA
            if (!dataUri.StartsWith("data:", StringComparison.OrdinalIgnoreCase)) return (false, Array.Empty<byte>(), "");
            int comma = dataUri.IndexOf(',');
            if (comma < 0) return (false, Array.Empty<byte>(), "");
            string header = dataUri.Substring(5, comma - 5); // sin "data:"
            string base64 = dataUri.Substring(comma + 1);

            string contentType = "image/jpeg";
            var semi = header.IndexOf(';');
            if (semi >= 0)
            {
                var typePart = header.Substring(0, semi);
                if (!string.IsNullOrWhiteSpace(typePart)) contentType = typePart;
            }
            else if (!string.IsNullOrWhiteSpace(header))
            {
                contentType = header;
            }

            var bytes = Convert.FromBase64String(base64);
            return (true, bytes, contentType);
        }
        catch
        {
            return (false, Array.Empty<byte>(), "");
        }
    }

    private static string GetFileExtension(string url, string contentType)
    {
        static string FromContentType(string ct) => ct switch
        {
            var s when string.Equals(s, "image/jpeg", StringComparison.OrdinalIgnoreCase) => ".jpg",
            var s when string.Equals(s, "image/jpg", StringComparison.OrdinalIgnoreCase) => ".jpg",
            var s when string.Equals(s, "image/png", StringComparison.OrdinalIgnoreCase) => ".png",
            var s when string.Equals(s, "image/gif", StringComparison.OrdinalIgnoreCase) => ".gif",
            var s when string.Equals(s, "image/webp", StringComparison.OrdinalIgnoreCase) => ".webp",
            var s when string.Equals(s, "image/svg+xml", StringComparison.OrdinalIgnoreCase) => ".svg",
            _ => ".jpg"
        };

        string extFromCt = FromContentType(contentType);
        try
        {
            var path = new Uri(url, UriKind.RelativeOrAbsolute);
            if (path.IsAbsoluteUri)
            {
                var extFromUrl = System.IO.Path.GetExtension(path.AbsolutePath);
                if (!string.IsNullOrWhiteSpace(extFromUrl)) return extFromUrl;
            }
        }
        catch { /* ignore */ }
        return extFromCt;
    }

    private static string SanitizeFileName(string input)
    {
        var invalid = System.IO.Path.GetInvalidFileNameChars();
        var sb = new StringBuilder(input.Length);
        foreach (var ch in input)
        {
            if (invalid.Contains(ch)) continue;
            if (char.IsWhiteSpace(ch)) { sb.Append('-'); continue; }
            sb.Append(ch);
        }
        var result = sb.ToString();
        if (result.Length > 64) result = result.Substring(0, 64);
        return result;
    }
}
