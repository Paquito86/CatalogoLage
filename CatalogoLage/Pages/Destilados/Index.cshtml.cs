using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace CatalogoLage.Pages.Destilados;

public class IndexModel : PageModel
{
    private readonly ApplicationDbContext _ctx;
    public IndexModel(ApplicationDbContext ctx) => _ctx = ctx;

    public List<Product> Products { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
    public List<string> Wineries { get; set; } = new();
    public List<string> Origins { get; set; } = new();
    public List<GrapeType> GrapeTypes { get; set; } = new();

    public Product?[,] ProductMatrix { get; set; } = new Product[0, 0];
    public List<Product> UnpositionedProducts { get; set; } = new();
    public bool IsAdminMode { get; set; }
    public int MatrixRows { get; set; }
    public int MatrixColumns { get; set; } = 3;

    public List<CatalogSpiritsTitleRow> TitleRows { get; set; } = new();
    public HashSet<(int x,int y)> EmptyCells { get; set; } = new();

    public int MaxAllowedRows { get; set; }

    [BindProperty(SupportsGet = true)] public string? Query { get; set; }
    [BindProperty(SupportsGet = true)] public int? CategoryId { get; set; }
    [BindProperty(SupportsGet = true)] public string? Winery { get; set; }
    [BindProperty(SupportsGet = true)] public string? Origin { get; set; }
    [BindProperty(SupportsGet = true)] public int? GrapeTypeId { get; set; }
    [BindProperty(SupportsGet = true)] public bool AdminMode { get; set; }

    public bool IsFiltered { get; set; }
    public HashSet<int> TitleRowsWithProducts { get; set; } = new();

    private static IQueryable<Product> SpiritsOnly(IQueryable<Product> q)
        => q.Where(p => p.Category != null && p.Category.SortOrder == 2);

    public async Task OnGetAsync()
    {
        Categories = await _ctx.Categories
            .Where(c => c.SortOrder == 2)
            .OrderBy(c => c.Name).ToListAsync();

        var baseProducts = SpiritsOnly(_ctx.Products
            .Include(p => p.Category)
            .Include(p => p.GrapeType));

        Wineries = await baseProducts.Where(p => p.Winery != null && p.Winery != "").Select(p => p.Winery!)
            .Distinct().OrderBy(x => x).ToListAsync();
        Origins = await baseProducts.Where(p => p.Origin != null && p.Origin != "").Select(p => p.Origin!)
            .Distinct().OrderBy(x => x).ToListAsync();
        GrapeTypes = await _ctx.GrapeTypes.OrderBy(g => g.Name).ToListAsync();

        var q = baseProducts;
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

        TitleRows = await _ctx.CatalogSpiritsTitleRows.OrderBy(t => t.MatrixY).ToListAsync();
        EmptyCells = (await _ctx.CatalogSpiritsEmptyCells.ToListAsync()).Select(e => (e.X, e.Y)).ToHashSet();
        IsAdminMode = AdminMode && User.IsInRole("Admin");
        OrganizeProductsInMatrix();
        MaxAllowedRows = await ComputeMaxAllowedRowsAsync();

        IsFiltered = !string.IsNullOrWhiteSpace(Query) || CategoryId.HasValue || !string.IsNullOrWhiteSpace(Winery) || !string.IsNullOrWhiteSpace(Origin) || GrapeTypeId.HasValue;
        ComputeTitleRowsWithProducts();
    }

    private async Task<int> ComputeMaxAllowedRowsAsync()
    {
        int maxTitleY = (await _ctx.CatalogSpiritsTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogSpiritsEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxProductY = (await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).MaxAsync(p => (int?)p.MatrixYSpirits)) ?? -1;
        int maxRows = Math.Max(1, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        return maxRows;
    }

    private void OrganizeProductsInMatrix()
    {
        var reservedRows = TitleRows.Select(t => t.MatrixY).ToHashSet();
        int maxProductY = Products.Where(p => p.MatrixYSpirits.HasValue).Select(p => p.MatrixYSpirits!.Value).DefaultIfEmpty(-1).Max();
        int maxTitleY = reservedRows.DefaultIfEmpty(-1).Max();
        int maxEmptyY = EmptyCells.Select(e => e.y).DefaultIfEmpty(-1).Max();
        MatrixRows = Math.Max(1, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        ProductMatrix = new Product[MatrixRows, MatrixColumns];
        UnpositionedProducts = new List<Product>();
        foreach (var product in Products)
        {
            bool validCoords = product.MatrixXSpirits.HasValue && product.MatrixYSpirits.HasValue &&
                product.MatrixXSpirits >= 0 && product.MatrixXSpirits < MatrixColumns &&
                product.MatrixYSpirits >= 0 && product.MatrixYSpirits < MatrixRows &&
                !reservedRows.Contains(product.MatrixYSpirits.Value) &&
                !EmptyCells.Contains((product.MatrixXSpirits.Value, product.MatrixYSpirits.Value));
            if (validCoords && ProductMatrix[product.MatrixYSpirits!.Value, product.MatrixXSpirits!.Value] == null)
                ProductMatrix[product.MatrixYSpirits!.Value, product.MatrixXSpirits!.Value] = product;
            else
                UnpositionedProducts.Add(product);
        }
    }

    private void ComputeTitleRowsWithProducts()
    {
        TitleRowsWithProducts = new HashSet<int>();
        if (TitleRows.Count == 0 || MatrixRows <= 0) return;
        var sorted = TitleRows.OrderBy(t => t.MatrixY).ToList();
        for (int i = 0; i < sorted.Count; i++)
        {
            var t = sorted[i];
            int yStart = t.MatrixY + 1;
            int yEnd = (i + 1 < sorted.Count ? sorted[i + 1].MatrixY - 1 : MatrixRows - 1);
            yStart = Math.Max(yStart, 0);
            yEnd = Math.Min(yEnd, MatrixRows - 1);
            bool hasProduct = false;
            for (int y = yStart; y <= yEnd && !hasProduct; y++)
            {
                for (int x = 0; x < MatrixColumns; x++)
                {
                    if (ProductMatrix[y, x] != null) { hasProduct = true; break; }
                }
            }
            if (hasProduct) TitleRowsWithProducts.Add(t.MatrixY);
        }
    }

    public async Task<IActionResult> OnPostUpdatePositionAsync(int productId, int x, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var product = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p=>p.Id==productId);
        if (product == null) return NotFound();
        var reservedRows = await _ctx.CatalogSpiritsTitleRows.Select(t => t.MatrixY).ToListAsync(); if (reservedRows.Contains(y)) return BadRequest("No se puede colocar un producto en una fila de t?tulo");
        var emptyCell = await _ctx.CatalogSpiritsEmptyCells.FirstOrDefaultAsync(c => c.X == x && c.Y == y); if (emptyCell != null) _ctx.CatalogSpiritsEmptyCells.Remove(emptyCell);
        int maxRows = await ComputeMaxAllowedRowsAsync(); if (x < 0 || x >= MatrixColumns || y < 0 || y >= maxRows) return BadRequest("Coordenadas inv?lidas");
        var existingProduct = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p => p.MatrixXSpirits == x && p.MatrixYSpirits == y && p.Id != productId);
        if (existingProduct != null) { existingProduct.MatrixXSpirits = product.MatrixXSpirits; existingProduct.MatrixYSpirits = product.MatrixYSpirits; }
        product.MatrixXSpirits = x; product.MatrixYSpirits = y; await _ctx.SaveChangesAsync(); return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostVaciarCeldaAsync(int x, int y, int productId)
    {
        if (!User.IsInRole("Admin")) return Forbid(); var product = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p=>p.Id==productId); if (product == null) return NotFound();
        product.MatrixXSpirits = null; product.MatrixYSpirits = null; if (!await _ctx.CatalogSpiritsEmptyCells.AnyAsync(c => c.X == x && c.Y == y)) { _ctx.CatalogSpiritsEmptyCells.Add(new CatalogSpiritsEmptyCell { X = x, Y = y }); }
        await _ctx.SaveChangesAsync(); return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostPlaceUnassignedAsync(int productId, int x, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var product = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p=>p.Id==productId);
        if (product == null) return NotFound();
        int maxRows = await ComputeMaxAllowedRowsAsync();
        if (x < 0 || x >= MatrixColumns) return BadRequest("Columna fuera de rango");
        if (y < 0 || y >= maxRows) return BadRequest("Fila fuera de rango");
        bool isTitleRow = await _ctx.CatalogSpiritsTitleRows.AnyAsync(t => t.MatrixY == y);
        if (isTitleRow) return BadRequest("La fila indicada est? reservada por un t?tulo");
        var emptyCell = await _ctx.CatalogSpiritsEmptyCells.FirstOrDefaultAsync(c => c.X == x && c.Y == y);
        if (emptyCell != null) _ctx.CatalogSpiritsEmptyCells.Remove(emptyCell);
        bool occupied = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).AnyAsync(p => p.MatrixXSpirits == x && p.MatrixYSpirits == y);
        if (occupied) return BadRequest("La celda ya est? ocupada");
        product.MatrixXSpirits = x; product.MatrixYSpirits = y;
        await _ctx.SaveChangesAsync();
        return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostCreateTitleAsync(string text, int y, int level = 2)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        text = (text ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(text)) return BadRequest("El t?tulo es obligatorio");
        if (y < 0) y = 0;
        if (level != 1 && level != 2) level = 2;
        var exists = await _ctx.CatalogSpiritsTitleRows.AnyAsync(t => t.MatrixY == y);
        if (exists) return BadRequest("Ya existe un t?tulo en esa fila");
        await MoveProductsOutOfRowAsync(y);
        _ctx.CatalogSpiritsTitleRows.Add(new CatalogSpiritsTitleRow { Text = text, MatrixY = y, Level = level });
        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostUpdateTitleAsync(int id, string text, int y, int level = 2)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var title = await _ctx.CatalogSpiritsTitleRows.FindAsync(id);
        if (title == null) return NotFound();
        text = (text ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(text)) return BadRequest("El t?tulo es obligatorio");
        if (y < 0) y = 0;
        if (level != 1 && level != 2) level = 2;
        if (y != title.MatrixY)
        {
            var exists = await _ctx.CatalogSpiritsTitleRows.AnyAsync(t => t.MatrixY == y && t.Id != id);
            if (exists) return BadRequest("Ya existe un t?tulo en la fila destino");
            await MoveProductsOutOfRowAsync(y);
        }
        title.Text = text; title.MatrixY = y; title.Level = level;
        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostDeleteTitleAsync(int id)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var title = await _ctx.CatalogSpiritsTitleRows.FindAsync(id);
        if (title == null) return NotFound();
        _ctx.CatalogSpiritsTitleRows.Remove(title);
        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostInsertRowAsync(int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (y < 0) y = 0;
        int maxProductY = (await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).MaxAsync(p => (int?)p.MatrixYSpirits)) ?? -1;
        int maxTitleY = (await _ctx.CatalogSpiritsTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogSpiritsEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxY = new[] { maxProductY, maxTitleY, maxEmptyY }.Max();
        int newRowY = y + 1;
        if (newRowY > maxY + 1) newRowY = maxY + 1;
        var productsToShift = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).Where(p => p.MatrixYSpirits >= newRowY).ToListAsync(); foreach (var p in productsToShift) { p.MatrixYSpirits = (p.MatrixYSpirits ?? 0) + 1; }
        var titlesToShift = await _ctx.CatalogSpiritsTitleRows.Where(t => t.MatrixY >= newRowY).ToListAsync(); foreach (var t in titlesToShift) { t.MatrixY += 1; }
        var emptiesToShift = await _ctx.CatalogSpiritsEmptyCells.Where(e => e.Y >= newRowY).ToListAsync(); foreach (var e in emptiesToShift) { e.Y += 1; }
        for (int cx = 0; cx < MatrixColumns; cx++) if (!await _ctx.CatalogSpiritsEmptyCells.AnyAsync(c => c.X == cx && c.Y == newRowY)) _ctx.CatalogSpiritsEmptyCells.Add(new CatalogSpiritsEmptyCell { X = cx, Y = newRowY });
        await _ctx.SaveChangesAsync();
        return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostDeleteRowAsync(int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (y < 0) y = 0;
        await MoveProductsOutOfRowAsync(y);
        var titlesAtRow = await _ctx.CatalogSpiritsTitleRows.Where(t => t.MatrixY == y).ToListAsync(); if (titlesAtRow.Count > 0) _ctx.CatalogSpiritsTitleRows.RemoveRange(titlesAtRow);
        var emptiesAtRow = await _ctx.CatalogSpiritsEmptyCells.Where(e => e.Y == y).ToListAsync(); if (emptiesAtRow.Count > 0) _ctx.CatalogSpiritsEmptyCells.RemoveRange(emptiesAtRow);
        var productsBelow = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).Where(p => p.MatrixYSpirits > y).ToListAsync(); foreach (var p in productsBelow) { p.MatrixYSpirits = (p.MatrixYSpirits ?? 0) - 1; }
        var titlesBelow = await _ctx.CatalogSpiritsTitleRows.Where(t => t.MatrixY > y).ToListAsync(); foreach (var t in titlesBelow) { t.MatrixY -= 1; }
        var emptiesBelow = await _ctx.CatalogSpiritsEmptyCells.Where(e => e.Y > y).ToListAsync(); foreach (var e in emptiesBelow) { e.Y -= 1; }
        await _ctx.SaveChangesAsync(); return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostDeleteLastEmptyRowsAsync(int count)
    {
        if (!User.IsInRole("Admin")) return Forbid(); if (count <= 0) return RedirectToPage(new { AdminMode = true });
        int maxProductY = (await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).MaxAsync(p => (int?)p.MatrixYSpirits)) ?? -1;
        int maxTitleY = (await _ctx.CatalogSpiritsTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogSpiritsEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int y = new[] { maxProductY, maxTitleY, maxEmptyY }.Max(); int deleted = 0;
        while (deleted < count && y >= 0)
        {
            bool hasProduct = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).AnyAsync(p => p.MatrixYSpirits == y);
            bool hasTitle = await _ctx.CatalogSpiritsTitleRows.AnyAsync(t => t.MatrixY == y);
            if (hasProduct || hasTitle) break;
            var empties = await _ctx.CatalogSpiritsEmptyCells.Where(e => e.Y == y).ToListAsync(); if (empties.Count == 0) { y--; continue; }
            _ctx.CatalogSpiritsEmptyCells.RemoveRange(empties); deleted++; y--;
        }
        if (deleted > 0) await _ctx.SaveChangesAsync(); return RedirectToPage(new { AdminMode = true });
    }

    private async Task MoveProductsOutOfRowAsync(int targetRow)
    {
        var productsInRow = await SpiritsOnly(_ctx.Products.Include(p=>p.Category))
            .Where(p => p.MatrixYSpirits == targetRow)
            .OrderBy(p => p.MatrixXSpirits)
            .ToListAsync();
        if (productsInRow.Count == 0) return;

        var allProducts = await SpiritsOnly(_ctx.Products.Include(p=>p.Category)).ToListAsync();
        var reservedRows = (await _ctx.CatalogSpiritsTitleRows.ToListAsync()).Select(t => t.MatrixY).ToHashSet();
        reservedRows.Add(targetRow);
        int maxY = allProducts.Where(p => p.MatrixYSpirits.HasValue).Select(p => p.MatrixYSpirits!.Value).DefaultIfEmpty(-1).Max();
        int totalCount = allProducts.Count; int reservedCount = reservedRows.Count;
        int rowsNeededForProducts = totalCount > 0 ? (int)Math.Ceiling((double)totalCount / MatrixColumns) : 1;
        int matrixRows = Math.Max(rowsNeededForProducts + reservedCount, maxY + 1);
        if (matrixRows <= 0) matrixRows = 1;
        var occupied = new bool[matrixRows, MatrixColumns];
        foreach (var p in allProducts)
        {
            if (productsInRow.Contains(p)) continue;
            if (p.MatrixXSpirits.HasValue && p.MatrixYSpirits.HasValue &&
                p.MatrixXSpirits.Value >= 0 && p.MatrixXSpirits.Value < MatrixColumns &&
                p.MatrixYSpirits.Value >= 0 && p.MatrixYSpirits.Value < matrixRows &&
                !reservedRows.Contains(p.MatrixYSpirits.Value))
            {
                occupied[p.MatrixYSpirits.Value, p.MatrixXSpirits.Value] = true;
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
            int startX = p.MatrixXSpirits ?? 0;
            var (ny, nx) = FindNearestFreeByScan(targetRow, startX);
            p.MatrixXSpirits = nx; p.MatrixYSpirits = ny; occupied[ny, nx] = true;
        }
        await _ctx.SaveChangesAsync();
    }
}