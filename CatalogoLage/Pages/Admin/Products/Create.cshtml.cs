using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CatalogoLage.Pages.Admin.Products;

public class CreateModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public CreateModel(ApplicationDbContext ctx) => _ctx = ctx;

    [BindProperty]
    public Product Product { get; set; } = new();

    public SelectList CategoryList => new(_ctx.Categories.OrderBy(c=>c.Name), nameof(Category.Id), nameof(Category.Name));

    public void OnGet() {}

    public async Task<IActionResult> OnPostAsync()
    {
        if(!ModelState.IsValid) return Page();
        _ctx.Products.Add(Product);
        await _ctx.SaveChangesAsync();
        return RedirectToPage("Index");
    }
}