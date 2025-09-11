using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CatalogoLage.Pages.Admin.GrapeTypes;

public class CreateModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public CreateModel(ApplicationDbContext ctx) => _ctx = ctx;

    [BindProperty]
    public GrapeType Item { get; set; } = new();

    public void OnGet() {}

    public async Task<IActionResult> OnPostAsync()
    {
        if(!ModelState.IsValid) return Page();
        _ctx.GrapeTypes.Add(Item);
        await _ctx.SaveChangesAsync();
        return RedirectToPage("Index");
    }
}