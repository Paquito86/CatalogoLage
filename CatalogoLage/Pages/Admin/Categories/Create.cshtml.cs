using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CatalogoLage.Pages.Admin.Categories;

public class CreateModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public CreateModel(ApplicationDbContext ctx) => _ctx = ctx;

    [BindProperty]
    public Category Category { get; set; } = new();

    public void OnGet(){}

    public async Task<IActionResult> OnPostAsync()
    {
        if(!ModelState.IsValid) return Page();
        _ctx.Categories.Add(Category);
        await _ctx.SaveChangesAsync();
        return RedirectToPage("Index");
    }
}