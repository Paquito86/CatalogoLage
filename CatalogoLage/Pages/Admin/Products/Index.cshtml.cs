using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.Products;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;
    public List<Product> Products { get; set; } = new();

    public async Task OnGetAsync()
    {
        Products = await _ctx.Products.Include(p => p.Category).OrderBy(p => p.Name).ToListAsync();
    }
}