using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc; // BindProperty
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.Products;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;
    public List<Product> Products { get; set; } = new();

    [BindProperty(SupportsGet = true)]
    public string? Q { get; set; }

    public async Task OnGetAsync()
    {
        var query = _ctx.Products
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(Q))
        {
            var pattern = $"%{Q.Trim()}%";
            query = query.Where(p =>
                EF.Functions.Like(p.Name, pattern) ||
                (p.Winery != null && EF.Functions.Like(p.Winery, pattern)) ||
                (p.Manufacturer != null && EF.Functions.Like(p.Manufacturer, pattern)) ||
                (p.Origin != null && EF.Functions.Like(p.Origin, pattern))
            );
        }

        Products = await query.OrderBy(p => p.Name).ToListAsync();
    }
}