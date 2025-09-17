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

    // Títulos de filas (ocupan una fila completa)
    public List<CatalogTitleRow> TitleRows { get; set; } = new();
    // Celdas vacías reservadas
    public HashSet<(int x,int y)> EmptyCells { get; set; } = new();

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
        if (CategoryId.HasValue) q = q.Where(p => p.CategoryId == CategoryId.Value);
        if (!string.IsNullOrWhiteSpace(Winery)) q = q.Where(p => p.Winery == Winery);
        if (!string.IsNullOrWhiteSpace(Origin)) q = q.Where(p => p.Origin == Origin);
        if (GrapeTypeId.HasValue) q = q.Where(p => p.GrapeTypeId == GrapeTypeId.Value);
        
        Products = await q.OrderBy(p => p.Name).ToListAsync();

        // Cargar títulos de filas
        TitleRows = await _ctx.CatalogTitleRows.OrderBy(t => t.MatrixY).ToListAsync();
        // Cargar celdas vacías
        EmptyCells = (await _ctx.CatalogEmptyCells.ToListAsync()).Select(e => (e.X, e.Y)).ToHashSet();

        // Configurar modo administrador
        IsAdminMode = AdminMode && User.IsInRole("Admin");
        
        // Organizar
        OrganizeProductsInMatrix();
    }

    private void OrganizeProductsInMatrix()
    {
        var reservedRows = TitleRows.Select(t => t.MatrixY).ToHashSet();
        int productCount = Products.Count;
        int reservedCount = reservedRows.Count;
        int maxProductY = Products.Where(p => p.MatrixY.HasValue).Select(p => p.MatrixY!.Value).DefaultIfEmpty(-1).Max();
        int maxTitleY = reservedRows.DefaultIfEmpty(-1).Max();
        int maxEmptyY = EmptyCells.Select(e => e.y).DefaultIfEmpty(-1).Max();
        int rowsNeededForProducts = productCount > 0 ? (int)Math.Ceiling((double)productCount / MatrixColumns) : 1;
        MatrixRows = Math.Max(rowsNeededForProducts + reservedCount, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        if (MatrixRows <= 0) MatrixRows = 1;
        
        ProductMatrix = new Product[MatrixRows, MatrixColumns];
        UnpositionedProducts = new List<Product>();

        foreach (var product in Products)
        {
            if (product.MatrixX.HasValue && product.MatrixY.HasValue &&
                product.MatrixX >= 0 && product.MatrixX < MatrixColumns &&
                product.MatrixY >= 0 && product.MatrixY < MatrixRows &&
                !reservedRows.Contains(product.MatrixY.Value) &&
                !EmptyCells.Contains((product.MatrixX.Value, product.MatrixY.Value)) &&
                ProductMatrix[product.MatrixY.Value, product.MatrixX.Value] == null)
            {
                ProductMatrix[product.MatrixY.Value, product.MatrixX.Value] = product;
            }
            else
            {
                UnpositionedProducts.Add(product);
            }
        }

        foreach (var product in UnpositionedProducts.ToList())
        {
            bool placed = false;
            for (int y = 0; y < MatrixRows && !placed; y++)
            {
                if (reservedRows.Contains(y)) continue;
                for (int x = 0; x < MatrixColumns && !placed; x++)
                {
                    if (ProductMatrix[y, x] == null && !EmptyCells.Contains((x,y)))
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
        if (!User.IsInRole("Admin")) return Forbid();

        var product = await _ctx.Products.FindAsync(productId);
        if (product == null) return NotFound();

        var reservedRows = await _ctx.CatalogTitleRows.Select(t => t.MatrixY).ToListAsync();
        if (reservedRows.Contains(y)) return BadRequest("No se puede colocar un producto en una fila de título");

        // Si la celda estaba reservada como vacía, la liberamos
        var emptyCell = await _ctx.CatalogEmptyCells.FirstOrDefaultAsync(c => c.X == x && c.Y == y);
        if (emptyCell != null)
        {
            _ctx.CatalogEmptyCells.Remove(emptyCell); // desbloquear
        }

        var totalProducts = await _ctx.Products.CountAsync();
        var maxRows = totalProducts > 0 ? (int)Math.Ceiling((double)totalProducts / MatrixColumns) : 1;
        maxRows += reservedRows.Distinct().Count();
        // Permitir posiciones creadas por celdas vacías o títulos reservados
        int maxEmptyY = (await _ctx.CatalogEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxTitleY = (await _ctx.CatalogTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        maxRows = Math.Max(maxRows, Math.Max(maxEmptyY + 1, maxTitleY + 1));

        if (x < 0 || x >= MatrixColumns || y < 0 || y >= maxRows) return BadRequest("Coordenadas inválidas");

        var existingProduct = await _ctx.Products.FirstOrDefaultAsync(p => p.MatrixX == x && p.MatrixY == y && p.Id != productId);
        if (existingProduct != null)
        {
            existingProduct.MatrixX = product.MatrixX;
            existingProduct.MatrixY = product.MatrixY;
        }

        product.MatrixX = x;
        product.MatrixY = y;
        await _ctx.SaveChangesAsync();
        return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostCreateTitleAsync(string text, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        text = (text ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(text)) return BadRequest("El título es obligatorio");
        if (y < 0) y = 0;
        var exists = await _ctx.CatalogTitleRows.AnyAsync(t => t.MatrixY == y);
        if (exists) return BadRequest("Ya existe un título en esa fila");
        await MoveProductsOutOfRowAsync(y);
        _ctx.CatalogTitleRows.Add(new CatalogTitleRow { Text = text, MatrixY = y });
        await _ctx.SaveChangesAsync();
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostUpdateTitleAsync(int id, string text, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var title = await _ctx.CatalogTitleRows.FindAsync(id);
        if (title == null) return NotFound();
        text = (text ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(text)) return BadRequest("El título es obligatorio");
        if (y < 0) y = 0;
        if (y != title.MatrixY)
        {
            var exists = await _ctx.CatalogTitleRows.AnyAsync(t => t.MatrixY == y && t.Id != id);
            if (exists) return BadRequest("Ya existe un título en la fila destino");
            await MoveProductsOutOfRowAsync(y);
        }
        title.Text = text;
        title.MatrixY = y;
        await _ctx.SaveChangesAsync();
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostDeleteTitleAsync(int id)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var title = await _ctx.CatalogTitleRows.FindAsync(id);
        if (title == null) return NotFound();
        _ctx.CatalogTitleRows.Remove(title);
        await _ctx.SaveChangesAsync();
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostVaciarCeldaAsync(int x, int y, int productId)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        // Celda pasa a estar reservada como vacía
        var product = await _ctx.Products.FindAsync(productId);
        if (product == null) return NotFound();
        if (product.MatrixX != x || product.MatrixY != y)
        {
            return BadRequest("Datos inconsistentes");
        }
        product.MatrixX = null;
        product.MatrixY = null;
        if (!await _ctx.CatalogEmptyCells.AnyAsync(c => c.X == x && c.Y == y))
        {
            _ctx.CatalogEmptyCells.Add(new CatalogEmptyCell { X = x, Y = y });
        }
        await _ctx.SaveChangesAsync();
        return new JsonResult(new { success = true });
    }

    // Insertar una fila NUEVA después de la fila indicada (y), desplazando hacia abajo desde y+1.
    public async Task<IActionResult> OnPostInsertRowAsync(int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (y < 0) y = 0;
        // Máximos actuales
        int maxProductY = (await _ctx.Products.MaxAsync(p => (int?)p.MatrixY)) ?? -1;
        int maxTitleY = (await _ctx.CatalogTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxY = new[] { maxProductY, maxTitleY, maxEmptyY }.Max();

        // Nueva fila se insertará DESPUÉS de y => en newRowY
        int newRowY = y + 1;
        if (newRowY > maxY + 1) newRowY = maxY + 1; // insertar al final si excede

        // Desplazar todo lo que esté en o por debajo de newRowY
        var productsToShift = await _ctx.Products.Where(p => p.MatrixY >= newRowY).ToListAsync();
        foreach (var p in productsToShift)
        {
            p.MatrixY = p.MatrixY + 1;
        }
        var titlesToShift = await _ctx.CatalogTitleRows.Where(t => t.MatrixY >= newRowY).ToListAsync();
        foreach (var t in titlesToShift)
        {
            t.MatrixY += 1;
        }
        var emptiesToShift = await _ctx.CatalogEmptyCells.Where(e => e.Y >= newRowY).ToListAsync();
        foreach (var e in emptiesToShift)
        {
            e.Y += 1;
        }

        // Reservar la nueva fila completa como vacía (se visualizará con "VACÍA")
        for (int x = 0; x < MatrixColumns; x++)
        {
            if (!await _ctx.CatalogEmptyCells.AnyAsync(c => c.X == x && c.Y == newRowY))
            {
                _ctx.CatalogEmptyCells.Add(new CatalogEmptyCell { X = x, Y = newRowY });
            }
        }

        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    private async Task MoveProductsOutOfRowAsync(int targetRow)
    {
        var productsInRow = await _ctx.Products
            .Where(p => p.MatrixY == targetRow)
            .OrderBy(p => p.MatrixX)
            .ToListAsync();
        if (productsInRow.Count == 0) return;

        var allProducts = await _ctx.Products.ToListAsync();
        var reservedRows = (await _ctx.CatalogTitleRows.ToListAsync()).Select(t => t.MatrixY).ToHashSet();
        reservedRows.Add(targetRow);
        int maxY = allProducts.Where(p => p.MatrixY.HasValue).Select(p => p.MatrixY!.Value).DefaultIfEmpty(-1).Max();
        int totalCount = allProducts.Count;
        int reservedCount = reservedRows.Count;
        int rowsNeededForProducts = totalCount > 0 ? (int)Math.Ceiling((double)totalCount / MatrixColumns) : 1;
        int matrixRows = Math.Max(rowsNeededForProducts + reservedCount, maxY + 1);
        if (matrixRows <= 0) matrixRows = 1;

        var occupied = new bool[matrixRows, MatrixColumns];
        foreach (var p in allProducts)
        {
            if (productsInRow.Contains(p)) continue;
            if (p.MatrixX.HasValue && p.MatrixY.HasValue &&
                p.MatrixX.Value >= 0 && p.MatrixX.Value < MatrixColumns &&
                p.MatrixY.Value >= 0 && p.MatrixY.Value < matrixRows &&
                !reservedRows.Contains(p.MatrixY.Value))
            {
                occupied[p.MatrixY.Value, p.MatrixX.Value] = true;
            }
        }
        bool IsFree(int y, int x) => y >= 0 && x >= 0 && y < matrixRows && x < MatrixColumns && !occupied[y, x] && !reservedRows.Contains(y);
        (int y, int x) FindNearestFreeByScan(int fromY, int fromX)
        {
            int bestY = -1, bestX = -1; int bestDist = int.MaxValue;
            for (int y = 0; y < matrixRows; y++)
            {
                if (reservedRows.Contains(y)) continue;
                for (int x = 0; x < MatrixColumns; x++)
                {
                    if (!IsFree(y, x)) continue;
                    int dist = Math.Abs(y - fromY) + Math.Abs(x - fromX);
                    if (dist < bestDist) { bestDist = dist; bestY = y; bestX = x; if (bestDist == 0) return (bestY, bestX); }
                }
            }
            if (bestY == -1)
            {
                var newOcc = new bool[matrixRows + 1, MatrixColumns];
                for (int y = 0; y < matrixRows; y++)
                    for (int x = 0; x < MatrixColumns; x++)
                        newOcc[y, x] = occupied[y, x];
                occupied = newOcc; matrixRows++; return (matrixRows - 1, 0);
            }
            return (bestY, bestX);
        }
        foreach (var p in productsInRow)
        {
            int startX = p.MatrixX ?? 0; var (ny, nx) = FindNearestFreeByScan(targetRow, startX); p.MatrixX = nx; p.MatrixY = ny; occupied[ny, nx] = true;
        }
        await _ctx.SaveChangesAsync();
    }
}