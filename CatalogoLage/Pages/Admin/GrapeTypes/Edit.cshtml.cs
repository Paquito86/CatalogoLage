using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CatalogoLage.Pages.Admin.GrapeTypes;

public class EditModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public EditModel(ApplicationDbContext ctx) => _ctx = ctx;

    [BindProperty]
    public GrapeType? Item { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Item = await _ctx.GrapeTypes.FindAsync(id);
        if (Item == null) return RedirectToPage("Index");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int id)
    {
        var entity = await _ctx.GrapeTypes.FindAsync(id);
        if (entity == null) return RedirectToPage("Index");
        if(!ModelState.IsValid) { Item = entity; return Page(); }
        if(Item != null)
        {
            entity.Name = Item.Name;
            entity.Description = Item.Description;
            await _ctx.SaveChangesAsync();
        }
        return RedirectToPage("Index");
    }
}