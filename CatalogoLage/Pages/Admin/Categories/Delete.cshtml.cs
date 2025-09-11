using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.Categories;

public class DeleteModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public DeleteModel(ApplicationDbContext ctx) => _ctx = ctx;

    public Category? Category { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Category = await _ctx.Categories.FindAsync(id);
        if (Category == null) return RedirectToPage("Index");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int id)
    {
        var category = await _ctx.Categories.Include(c=>c.Products).FirstOrDefaultAsync(c=>c.Id==id);
        if (category != null)
        {
            _ctx.Products.RemoveRange(category.Products); // cascade manual if not configured
            _ctx.Categories.Remove(category);
            await _ctx.SaveChangesAsync();
        }
        return RedirectToPage("Index");
    }
}