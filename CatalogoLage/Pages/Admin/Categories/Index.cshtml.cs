using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.Categories;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;

    public List<Category> Categories { get; set; } = new();
    public Dictionary<int,int> ProductCounts { get; set; } = new();

    public async Task OnGetAsync()
    {
        Categories = await _ctx.Categories.OrderBy(c => c.Name).ToListAsync();
        ProductCounts = await _ctx.Products.GroupBy(p=>p.CategoryId)
            .ToDictionaryAsync(g=>g.Key, g=>g.Count());
    }
}