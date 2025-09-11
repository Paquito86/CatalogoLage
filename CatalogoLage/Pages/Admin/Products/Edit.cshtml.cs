using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CatalogoLage.Pages.Admin.Products;

public class EditModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public EditModel(ApplicationDbContext ctx) => _ctx = ctx;

    [BindProperty]
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
        if (product == null) return RedirectToPage("Index");
        if(!ModelState.IsValid) { Product = product; return Page(); }
        if(Product != null)
        {
            // Update allowed fields
            product.Name = Product.Name;
            product.Manufacturer = Product.Manufacturer;
            product.Winery = Product.Winery;
            product.Price = Product.Price;
            product.Description = Product.Description;
            product.ImageUrl = Product.ImageUrl;
            product.Size = Product.Size;
            product.AlcoholPercent = Product.AlcoholPercent;
            product.Origin = Product.Origin;
            product.CategoryId = Product.CategoryId;
            await _ctx.SaveChangesAsync();
        }
        return RedirectToPage("Index");
    }
}