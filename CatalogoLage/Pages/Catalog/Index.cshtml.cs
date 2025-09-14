using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace CatalogoLage.Pages.Catalog;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;

    public List<Product> Products { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
    public List<string> Wineries { get; set; } = new();
    public List<string> Origins { get; set; } = new();
    public List<GrapeType> GrapeTypes { get; set; } = new();

    // Matriz dinámica para mostrar productos organizados
    public Product?[,] ProductMatrix { get; set; } = new Product[0, 0];
    public List<Product> UnpositionedProducts { get; set; } = new();
    public bool IsAdminMode { get; set; }
    public int MatrixRows { get; set; }
    public int MatrixColumns { get; set; } = 3;

    [BindProperty(SupportsGet = true)]
    public string? Query { get; set; }

    [BindProperty(SupportsGet = true)]
    public int? CategoryId { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Winery { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Origin { get; set; }

    [BindProperty(SupportsGet = true)]
    public int? GrapeTypeId { get; set; }

    [BindProperty(SupportsGet = true)]
    public bool AdminMode { get; set; }

    public async Task OnGetAsync()
    {
        Categories = await _ctx.Categories.OrderBy(c => c.Name).ToListAsync();
        Wineries = await _ctx.Products
            .Where(p => p.Winery != null && p.Winery != "")
            .Select(p => p.Winery!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();
        Origins = await _ctx.Products
            .Where(p => p.Origin != null && p.Origin != "")
            .Select(p => p.Origin!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();
        GrapeTypes = await _ctx.GrapeTypes.OrderBy(g => g.Name).ToListAsync();

        var q = _ctx.Products.Include(p => p.Category).Include(p=>p.GrapeType).AsQueryable();
        
        // Aplicar filtros
        if (!string.IsNullOrWhiteSpace(Query))
        {
            var term = $"%{Query.Trim()}%";
            q = q.Where(p =>
                EF.Functions.Like(p.Name, term) ||
                EF.Functions.Like(p.Description ?? string.Empty, term) ||
                EF.Functions.Like(p.Manufacturer ?? string.Empty, term) ||
                EF.Functions.Like(p.Winery ?? string.Empty, term) ||
                EF.Functions.Like(p.Origin ?? string.Empty, term) ||
                EF.Functions.Like(p.Size ?? string.Empty, term) ||
                EF.Functions.Like(p.Category!.Name, term) ||
                EF.Functions.Like(p.GrapeType!.Name, term)
            );
        }
        if (CategoryId.HasValue)
        {
            q = q.Where(p => p.CategoryId == CategoryId.Value);
        }
        if (!string.IsNullOrWhiteSpace(Winery))
        {
            q = q.Where(p => p.Winery == Winery);
        }
        if (!string.IsNullOrWhiteSpace(Origin))
        {
            q = q.Where(p => p.Origin == Origin);
        }
        if (GrapeTypeId.HasValue)
        {
            q = q.Where(p => p.GrapeTypeId == GrapeTypeId.Value);
        }
        
        Products = await q.OrderBy(p => p.Name).ToListAsync();

        // Configurar modo administrador si está habilitado
        IsAdminMode = AdminMode && User.IsInRole("Admin");
        
        // Siempre organizar productos en matriz para mostrar el layout organizado
        OrganizeProductsInMatrix();
    }

    private void OrganizeProductsInMatrix()
    {
        // Calcular número de filas dinámicamente basado en la cantidad de productos
        int productCount = Products.Count;
        MatrixRows = productCount > 0 ? (int)Math.Ceiling((double)productCount / MatrixColumns) : 1;
        
        // Inicializar matriz dinámica
        ProductMatrix = new Product[MatrixRows, MatrixColumns];
        UnpositionedProducts = new List<Product>();

        // Colocar productos con coordenadas definidas
        foreach (var product in Products)
        {
            if (product.MatrixX.HasValue && product.MatrixY.HasValue &&
                product.MatrixX >= 0 && product.MatrixX < MatrixColumns &&
                product.MatrixY >= 0 && product.MatrixY < MatrixRows &&
                ProductMatrix[product.MatrixY.Value, product.MatrixX.Value] == null)
            {
                ProductMatrix[product.MatrixY.Value, product.MatrixX.Value] = product;
            }
            else
            {
                UnpositionedProducts.Add(product);
            }
        }

        // Colocar productos sin coordenadas en espacios vacíos
        foreach (var product in UnpositionedProducts.ToList())
        {
            bool placed = false;
            for (int y = 0; y < MatrixRows && !placed; y++)
            {
                for (int x = 0; x < MatrixColumns && !placed; x++)
                {
                    if (ProductMatrix[y, x] == null)
                    {
                        ProductMatrix[y, x] = product;
                        UnpositionedProducts.Remove(product);
                        placed = true;
                    }
                }
            }
        }
    }

    public async Task<IActionResult> OnPostUpdatePositionAsync(int productId, int x, int y)
    {
        if (!User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var product = await _ctx.Products.FindAsync(productId);
        if (product == null)
        {
            return NotFound();
        }

        // Obtener la cantidad de productos para calcular las filas máximas
        var totalProducts = await _ctx.Products.CountAsync();
        var maxRows = totalProducts > 0 ? (int)Math.Ceiling((double)totalProducts / MatrixColumns) : 1;

        // Validar coordenadas
        if (x < 0 || x >= MatrixColumns || y < 0 || y >= maxRows)
        {
            return BadRequest("Coordenadas inválidas");
        }

        // Verificar si la posición está ocupada
        var existingProduct = await _ctx.Products
            .FirstOrDefaultAsync(p => p.MatrixX == x && p.MatrixY == y && p.Id != productId);
        
        if (existingProduct != null)
        {
            // Intercambiar posiciones
            existingProduct.MatrixX = product.MatrixX;
            existingProduct.MatrixY = product.MatrixY;
        }

        product.MatrixX = x;
        product.MatrixY = y;

        await _ctx.SaveChangesAsync();

        return new JsonResult(new { success = true });
    }
}