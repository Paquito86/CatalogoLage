using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CatalogoLage.Pages.Admin.Categories;

public class EditModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public EditModel(ApplicationDbContext ctx) => _ctx = ctx;

    [BindProperty]
    public Category? Category { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Category = await _ctx.Categories.FindAsync(id);
        if (Category == null) return RedirectToPage("Index");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int id)
    {
        var cat = await _ctx.Categories.FindAsync(id);
        if (cat == null) return RedirectToPage("Index");
        if(!ModelState.IsValid) { Category = cat; return Page(); }
        if(Category != null)
        {
            cat.Name = Category.Name;
            cat.Description = Category.Description;
            cat.SortOrder = Category.SortOrder; // persistir
            await _ctx.SaveChangesAsync();
        }
        return RedirectToPage("Index");
    }
}