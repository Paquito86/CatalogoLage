using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc; // BindProperty
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering; // SelectList
using Microsoft.EntityFrameworkCore;

namespace CatalogoLage.Pages.Admin.Products;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;
    public List<Product> Products { get; set; } = new();

    [BindProperty(SupportsGet = true)]
    public string? Q { get; set; }

    [BindProperty(SupportsGet = true)]
    public int? CategoryFilterId { get; set; }

    public SelectList CategoryOptions { get; set; } = default!;

    [BindProperty]
    public List<int> SelectedIds { get; set; } = new();

    [BindProperty]
    public int? NewCategoryId { get; set; }

    [BindProperty]
    public string? MakerField { get; set; } // "Winery" or "Manufacturer"

    [BindProperty]
    public string? NewMakerValue { get; set; }

    public async Task OnGetAsync()
    {
        // Categories select list (for filter + modal)
        var categories = await _ctx.Categories.OrderBy(c => c.Name).ToListAsync();
        CategoryOptions = new SelectList(categories, nameof(Models.Category.Id), nameof(Models.Category.Name));

        var query = _ctx.Products
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(Q))
        {
            var pattern = $"%{Q.Trim()}%";
            query = query.Where(p =>
                EF.Functions.Like(p.Name, pattern) ||
                (p.Winery != null && EF.Functions.Like(p.Winery, pattern)) ||
                (p.Manufacturer != null && EF.Functions.Like(p.Manufacturer, pattern)) ||
                (p.Origin != null && EF.Functions.Like(p.Origin, pattern))
            );
        }

        if (CategoryFilterId.HasValue)
        {
            query = query.Where(p => p.CategoryId == CategoryFilterId.Value);
        }

        Products = await query.OrderBy(p => p.Name).ToListAsync();
    }

    public async Task<IActionResult> OnPostBulkChangeCategoryAsync()
    {
        if (NewCategoryId is null || SelectedIds is null || SelectedIds.Count == 0)
        {
            // Nothing to do; return to list preserving filters
            return RedirectToPage(new { Q, CategoryFilterId });
        }

        var products = await _ctx.Products.Where(p => SelectedIds.Contains(p.Id)).ToListAsync();
        foreach (var p in products)
        {
            p.CategoryId = NewCategoryId.Value;
        }
        await _ctx.SaveChangesAsync();

        TempData["StatusMessage"] = $"Se actualizaron {products.Count} producto(s).";
        return RedirectToPage(new { Q, CategoryFilterId });
    }

    public async Task<IActionResult> OnPostBulkAssignMakerAsync()
    {
        if (SelectedIds is null || SelectedIds.Count == 0 || string.IsNullOrWhiteSpace(MakerField) || string.IsNullOrWhiteSpace(NewMakerValue))
        {
            TempData["StatusMessage"] = "No se han seleccionado elementos o faltan datos para la asignación.";
            return RedirectToPage(new { Q, CategoryFilterId });
        }

        var products = await _ctx.Products.Where(p => SelectedIds.Contains(p.Id)).ToListAsync();
        foreach (var p in products)
        {
            if (string.Equals(MakerField, "Winery", StringComparison.OrdinalIgnoreCase))
            {
                p.Winery = NewMakerValue;
            }
            else if (string.Equals(MakerField, "Manufacturer", StringComparison.OrdinalIgnoreCase))
            {
                p.Manufacturer = NewMakerValue;
            }
        }
        await _ctx.SaveChangesAsync();
        TempData["StatusMessage"] = $"Se asignó '{NewMakerValue}' a {products.Count} producto(s) en el campo {(MakerField == "Winery" ? "Bodega" : "Fabricante")}.";
        return RedirectToPage(new { Q, CategoryFilterId });
    }
}