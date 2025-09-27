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

    // Límite superior permitido de filas (cálculo global, sin filtros)
    public int MaxAllowedRows { get; set; }

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

        // Cargar títulos de filas y celdas vacías
        TitleRows = await _ctx.CatalogTitleRows.OrderBy(t => t.MatrixY).ToListAsync();
        EmptyCells = (await _ctx.CatalogEmptyCells.ToListAsync()).Select(e => (e.X, e.Y)).ToHashSet();

        // Configurar modo administrador
        IsAdminMode = AdminMode && User.IsInRole("Admin");
        
        // Organizar
        OrganizeProductsInMatrix();

        // Calcular el límite superior permitido de filas (global, sin filtros)
        MaxAllowedRows = await ComputeMaxAllowedRowsAsync();
    }

    private async Task<int> ComputeMaxAllowedRowsAsync()
    {
        int maxTitleY = (await _ctx.CatalogTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxProductY = (await _ctx.Products.MaxAsync(p => (int?)p.MatrixY)) ?? -1;
        int maxRows = Math.Max(1, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        return maxRows;
    }

    private void OrganizeProductsInMatrix()
    {
        var reservedRows = TitleRows.Select(t => t.MatrixY).ToHashSet();
        int maxProductY = Products.Where(p => p.MatrixY.HasValue).Select(p => p.MatrixY!.Value).DefaultIfEmpty(-1).Max();
        int maxTitleY = reservedRows.DefaultIfEmpty(-1).Max();
        int maxEmptyY = EmptyCells.Select(e => e.y).DefaultIfEmpty(-1).Max();
        MatrixRows = Math.Max(1, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        
        ProductMatrix = new Product[MatrixRows, MatrixColumns];
        UnpositionedProducts = new List<Product>();

        // Solo colocar productos con coordenadas válidas. El resto quedará en UnpositionedProducts.
        foreach (var product in Products)
        {
            bool validCoords = product.MatrixX.HasValue && product.MatrixY.HasValue &&
                product.MatrixX >= 0 && product.MatrixX < MatrixColumns &&
                product.MatrixY >= 0 && product.MatrixY < MatrixRows &&
                !reservedRows.Contains(product.MatrixY.Value) &&
                !EmptyCells.Contains((product.MatrixX.Value, product.MatrixY.Value));

            if (validCoords && ProductMatrix[product.MatrixY!.Value, product.MatrixX!.Value] == null)
            {
                ProductMatrix[product.MatrixY!.Value, product.MatrixX!.Value] = product;
            }
            else
            {
                UnpositionedProducts.Add(product);
            }
        }
        // No auto-ubicar productos sin coordenadas.
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
            _ctx.CatalogEmptyCells.Remove(emptyCell);
        }

        // Calcular filas máximas permitidas de forma consistente con la vista (global, sin filtros)
        int maxRows = await ComputeMaxAllowedRowsAsync();

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

    public async Task<IActionResult> OnPostPlaceUnassignedAsync(int productId, int x, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (x < 0 || x >= MatrixColumns) return BadRequest("Columna fuera de rango");
        var product = await _ctx.Products.FindAsync(productId);
        if (product == null) return NotFound();
        // Opcional: exigir que esté sin coordenadas
        // if (product.MatrixX.HasValue || product.MatrixY.HasValue) return BadRequest("El producto ya tiene coordenadas");

        int maxRows = await ComputeMaxAllowedRowsAsync();
        if (y < 0 || y >= maxRows) return BadRequest("Fila fuera de rango");

        // Fila de título reservada
        bool isTitleRow = await _ctx.CatalogTitleRows.AnyAsync(t => t.MatrixY == y);
        if (isTitleRow) return BadRequest("La fila indicada está reservada por un título");

        // Celda reservada como vacía
        bool isEmptyReserved = await _ctx.CatalogEmptyCells.AnyAsync(c => c.X == x && c.Y == y);
        if (isEmptyReserved) return BadRequest("La celda está reservada como vacía");

        // Celda ocupada por otro producto
        bool occupied = await _ctx.Products.AnyAsync(p => p.MatrixX == x && p.MatrixY == y);
        if (occupied) return BadRequest("La celda ya está ocupada");

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

        var product = await _ctx.Products.FindAsync(productId);
        if (product == null) return NotFound();

        // No exigir que el producto tenga las mismas coordenadas persistidas que la vista.
        product.MatrixX = null;
        product.MatrixY = null;

        if (!await _ctx.CatalogEmptyCells.AnyAsync(c => c.X == x && c.Y == y))
        {
            _ctx.CatalogEmptyCells.Add(new CatalogEmptyCell { X = x, Y = y });
        }
        await _ctx.SaveChangesAsync();
        return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostInsertRowAsync(int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (y < 0) y = 0;
        int maxProductY = (await _ctx.Products.MaxAsync(p => (int?)p.MatrixY)) ?? -1;
        int maxTitleY = (await _ctx.CatalogTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxY = new[] { maxProductY, maxTitleY, maxEmptyY }.Max();

        int newRowY = y + 1;
        if (newRowY > maxY + 1) newRowY = maxY + 1;

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

        // Importante: NO reservar automáticamente la nueva fila.

        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostDeleteRowAsync(int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (y < 0) y = 0;

        // Mover productos fuera de la fila antes de eliminarla
        await MoveProductsOutOfRowAsync(y);

        // Eliminar título en esa fila (si existe)
        var titlesAtRow = await _ctx.CatalogTitleRows.Where(t => t.MatrixY == y).ToListAsync();
        if (titlesAtRow.Count > 0)
        {
            _ctx.CatalogTitleRows.RemoveRange(titlesAtRow);
        }

        // Eliminar celdas vacías de esa fila
        var emptiesAtRow = await _ctx.CatalogEmptyCells.Where(e => e.Y == y).ToListAsync();
        if (emptiesAtRow.Count > 0)
        {
            _ctx.CatalogEmptyCells.RemoveRange(emptiesAtRow);
        }

        // Desplazar hacia arriba todo lo que esté por debajo de y
        var productsBelow = await _ctx.Products.Where(p => p.MatrixY > y).ToListAsync();
        foreach (var p in productsBelow)
        {
            p.MatrixY = (p.MatrixY ?? 0) - 1;
        }
        var titlesBelow = await _ctx.CatalogTitleRows.Where(t => t.MatrixY > y).ToListAsync();
        foreach (var t in titlesBelow)
        {
            t.MatrixY -= 1;
        }
        var emptiesBelow = await _ctx.CatalogEmptyCells.Where(e => e.Y > y).ToListAsync();
        foreach (var e in emptiesBelow)
        {
            e.Y -= 1;
        }

        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostDeleteLastEmptyRowsAsync(int count)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (count <= 0) return RedirectToPage(new { AdminMode = true });

        int maxProductY = (await _ctx.Products.MaxAsync(p => (int?)p.MatrixY)) ?? -1;
        int maxTitleY = (await _ctx.CatalogTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int y = new[] { maxProductY, maxTitleY, maxEmptyY }.Max();

        int deleted = 0;
        while (deleted < count && y >= 0)
        {
            bool hasProduct = await _ctx.Products.AnyAsync(p => p.MatrixY == y);
            bool hasTitle = await _ctx.CatalogTitleRows.AnyAsync(t => t.MatrixY == y);
            if (hasProduct || hasTitle) break;
            var empties = await _ctx.CatalogEmptyCells.Where(e => e.Y == y).ToListAsync();
            if (empties.Count == 0) { y--; continue; }
            _ctx.CatalogEmptyCells.RemoveRange(empties);
            deleted++; y--;
        }

        if (deleted > 0) await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    private async Task MoveProductsOutOfRowAsync(int targetRow)
    {
        var productsInRow = await _ctx.Products.Where(p => p.MatrixY == targetRow).OrderBy(p => p.MatrixX).ToListAsync();
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