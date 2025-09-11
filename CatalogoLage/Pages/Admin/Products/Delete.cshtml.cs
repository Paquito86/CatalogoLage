using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CatalogoLage.Pages.Admin.Products;

public class DeleteModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public DeleteModel(ApplicationDbContext ctx) => _ctx = ctx;

    public Product? Product { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Product = await _ctx.Products.FindAsync(id);
        if (Product == null) return RedirectToPage("Index");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int id)
    {
        var product = await _ctx.Products.FindAsync(id);
        if (product != null)
        {
            _ctx.Products.Remove(product);
            await _ctx.SaveChangesAsync();
        }
        return RedirectToPage("Index");
    }
}