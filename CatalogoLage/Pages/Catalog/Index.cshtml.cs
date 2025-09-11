using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace CatalogoLage.Pages.Catalog;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;

    public List<Product> Products { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
    public List<string> Wineries { get; set; } = new();
    public List<string> Origins { get; set; } = new();
    public List<GrapeType> GrapeTypes { get; set; } = new();

    [BindProperty(SupportsGet = true)]
    public string? Query { get; set; }

    [BindProperty(SupportsGet = true)]
    public int? CategoryId { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Winery { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Origin { get; set; }

    [BindProperty(SupportsGet = true)]
    public int? GrapeTypeId { get; set; }

    public async Task OnGetAsync()
    {
        Categories = await _ctx.Categories.OrderBy(c => c.Name).ToListAsync();
        Wineries = await _ctx.Products
            .Where(p => p.Winery != null && p.Winery != "")
            .Select(p => p.Winery!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();
        Origins = await _ctx.Products
            .Where(p => p.Origin != null && p.Origin != "")
            .Select(p => p.Origin!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();
        GrapeTypes = await _ctx.GrapeTypes.OrderBy(g => g.Name).ToListAsync();

        var q = _ctx.Products.Include(p => p.Category).Include(p=>p.GrapeType).AsQueryable();
        if (!string.IsNullOrWhiteSpace(Query))
        {
            var term = $"%{Query.Trim()}%";
            q = q.Where(p =>
                EF.Functions.Like(p.Name, term) ||
                EF.Functions.Like(p.Description ?? string.Empty, term) ||
                EF.Functions.Like(p.Manufacturer ?? string.Empty, term) ||
                EF.Functions.Like(p.Winery ?? string.Empty, term) ||
                EF.Functions.Like(p.Origin ?? string.Empty, term) ||
                EF.Functions.Like(p.Size ?? string.Empty, term) ||
                EF.Functions.Like(p.Category!.Name, term) ||
                EF.Functions.Like(p.GrapeType!.Name, term)
            );
        }
        if (CategoryId.HasValue)
        {
            q = q.Where(p => p.CategoryId == CategoryId.Value);
        }
        if (!string.IsNullOrWhiteSpace(Winery))
        {
            q = q.Where(p => p.Winery == Winery);
        }
        if (!string.IsNullOrWhiteSpace(Origin))
        {
            q = q.Where(p => p.Origin == Origin);
        }
        if (GrapeTypeId.HasValue)
        {
            q = q.Where(p => p.GrapeTypeId == GrapeTypeId.Value);
        }
        Products = await q.OrderBy(p => p.Name).ToListAsync();
    }
}