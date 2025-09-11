using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.GrapeTypes;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;

    public List<GrapeType> Items { get; set; } = new();
    public Dictionary<int,int> ProductCounts { get; set; } = new();

    public async Task OnGetAsync()
    {
        Items = await _ctx.GrapeTypes.OrderBy(c => c.Name).ToListAsync();
        ProductCounts = await _ctx.Products.Where(p=>p.GrapeTypeId!=null)
            .GroupBy(p=>p.GrapeTypeId!.Value)
            .ToDictionaryAsync(g=>g.Key, g=>g.Count());
    }
}