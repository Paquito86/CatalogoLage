using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.GrapeTypes;

public class DeleteModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public DeleteModel(ApplicationDbContext ctx) => _ctx = ctx;

    public GrapeType? Item { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Item = await _ctx.GrapeTypes.FindAsync(id);
        if (Item == null) return RedirectToPage("Index");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(int id)
    {
        var entity = await _ctx.GrapeTypes.Include(g=>g.Products).FirstOrDefaultAsync(g=>g.Id==id);
        if (entity != null)
        {
            _ctx.Products.RemoveRange(entity.Products);
            _ctx.GrapeTypes.Remove(entity);
            await _ctx.SaveChangesAsync();
        }
        return RedirectToPage("Index");
    }
}