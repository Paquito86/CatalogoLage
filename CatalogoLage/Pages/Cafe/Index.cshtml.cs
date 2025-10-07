using CatalogoLage.Data;
using CatalogoLage.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace CatalogoLage.Pages.Cafe;

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

    public List<CatalogCafeTitleRow> TitleRows { get; set; } = new();
    public HashSet<(int x,int y)> EmptyCells { get; set; } = new();

    public int MaxAllowedRows { get; set; }

    [BindProperty(SupportsGet = true)] public string? Query { get; set; }
    [BindProperty(SupportsGet = true)] public int? CategoryId { get; set; }
    [BindProperty(SupportsGet = true)] public string? Winery { get; set; }
    [BindProperty(SupportsGet = true)] public string? Origin { get; set; }
    [BindProperty(SupportsGet = true)] public int? GrapeTypeId { get; set; }
    [BindProperty(SupportsGet = true)] public bool AdminMode { get; set; }

    private static IQueryable<Product> CafeOnly(IQueryable<Product> q)
        => q.Where(p => p.Category != null && p.Category.SortOrder == 3);

    public async Task OnGetAsync()
    {
        Categories = await _ctx.Categories
            .Where(c => c.SortOrder == 3)
            .OrderBy(c => c.Name).ToListAsync();

        var baseProducts = CafeOnly(_ctx.Products
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

        TitleRows = await _ctx.CatalogCafeTitleRows.OrderBy(t => t.MatrixY).ToListAsync();
        EmptyCells = (await _ctx.CatalogCafeEmptyCells.ToListAsync()).Select(e => (e.X, e.Y)).ToHashSet();
        IsAdminMode = AdminMode && User.IsInRole("Admin");
        OrganizeProductsInMatrix();
        MaxAllowedRows = await ComputeMaxAllowedRowsAsync();
    }

    private async Task<int> ComputeMaxAllowedRowsAsync()
    {
        int maxTitleY = (await _ctx.CatalogCafeTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogCafeEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int maxProductY = (await CafeOnly(_ctx.Products.Include(p=>p.Category)).MaxAsync(p => (int?)p.MatrixYCafe)) ?? -1;
        int maxRows = Math.Max(1, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        return maxRows;
    }

    private void OrganizeProductsInMatrix()
    {
        var reservedRows = TitleRows.Select(t => t.MatrixY).ToHashSet();
        int maxProductY = Products.Where(p => p.MatrixYCafe.HasValue).Select(p => p.MatrixYCafe!.Value).DefaultIfEmpty(-1).Max();
        int maxTitleY = reservedRows.DefaultIfEmpty(-1).Max();
        int maxEmptyY = EmptyCells.Select(e => e.y).DefaultIfEmpty(-1).Max();
        MatrixRows = Math.Max(1, Math.Max(maxProductY + 1, Math.Max(maxTitleY + 1, maxEmptyY + 1)));
        ProductMatrix = new Product[MatrixRows, MatrixColumns];
        UnpositionedProducts = new List<Product>();
        foreach (var product in Products)
        {
            bool validCoords = product.MatrixXCafe.HasValue && product.MatrixYCafe.HasValue &&
                product.MatrixXCafe >= 0 && product.MatrixXCafe < MatrixColumns &&
                product.MatrixYCafe >= 0 && product.MatrixYCafe < MatrixRows &&
                !reservedRows.Contains(product.MatrixYCafe.Value) &&
                !EmptyCells.Contains((product.MatrixXCafe.Value, product.MatrixYCafe.Value));
            if (validCoords && ProductMatrix[product.MatrixYCafe!.Value, product.MatrixXCafe!.Value] == null)
                ProductMatrix[product.MatrixYCafe!.Value, product.MatrixXCafe!.Value] = product;
            else
                UnpositionedProducts.Add(product);
        }
    }

    public async Task<IActionResult> OnPostUpdatePositionAsync(int productId, int x, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var product = await CafeOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p=>p.Id==productId);
        if (product == null) return NotFound();
        var reservedRows = await _ctx.CatalogCafeTitleRows.Select(t => t.MatrixY).ToListAsync(); if (reservedRows.Contains(y)) return BadRequest("No se puede colocar un producto en una fila de título");
        var emptyCell = await _ctx.CatalogCafeEmptyCells.FirstOrDefaultAsync(c => c.X == x && c.Y == y); if (emptyCell != null) _ctx.CatalogCafeEmptyCells.Remove(emptyCell);
        int maxRows = await ComputeMaxAllowedRowsAsync(); if (x < 0 || x >= MatrixColumns || y < 0 || y >= maxRows) return BadRequest("Coordenadas inválidas");
        var existingProduct = await CafeOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p => p.MatrixXCafe == x && p.MatrixYCafe == y && p.Id != productId); if (existingProduct != null) { existingProduct.MatrixXCafe = product.MatrixXCafe; existingProduct.MatrixYCafe = product.MatrixYCafe; }
        product.MatrixXCafe = x; product.MatrixYCafe = y; await _ctx.SaveChangesAsync(); return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostVaciarCeldaAsync(int x, int y, int productId)
    {
        if (!User.IsInRole("Admin")) return Forbid(); var product = await CafeOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p=>p.Id==productId); if (product == null) return NotFound();
        product.MatrixXCafe = null; product.MatrixYCafe = null; if (!await _ctx.CatalogCafeEmptyCells.AnyAsync(c => c.X == x && c.Y == y)) { _ctx.CatalogCafeEmptyCells.Add(new CatalogCafeEmptyCell { X = x, Y = y }); }
        await _ctx.SaveChangesAsync(); return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostPlaceUnassignedAsync(int productId, int x, int y)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        var product = await CafeOnly(_ctx.Products.Include(p=>p.Category)).FirstOrDefaultAsync(p=>p.Id==productId);
        if (product == null) return NotFound();
        int maxRows = await ComputeMaxAllowedRowsAsync();
        if (x < 0 || x >= MatrixColumns) return BadRequest("Columna fuera de rango");
        if (y < 0 || y >= maxRows) return BadRequest("Fila fuera de rango");
        bool isTitleRow = await _ctx.CatalogCafeTitleRows.AnyAsync(t => t.MatrixY == y);
        if (isTitleRow) return BadRequest("La fila indicada está reservada por un título");
        var emptyCell = await _ctx.CatalogCafeEmptyCells.FirstOrDefaultAsync(c => c.X == x && c.Y == y);
        if (emptyCell != null) _ctx.CatalogCafeEmptyCells.Remove(emptyCell);
        bool occupied = await CafeOnly(_ctx.Products.Include(p=>p.Category)).AnyAsync(p => p.MatrixXCafe == x && p.MatrixYCafe == y);
        if (occupied) return BadRequest("La celda ya está ocupada");
        product.MatrixXCafe = x; product.MatrixYCafe = y;
        await _ctx.SaveChangesAsync();
        return new JsonResult(new { success = true });
    }

    public async Task<IActionResult> OnPostDeleteRowAsync(int y)
    {
        if (!User.IsInRole("Admin")) return Forbid(); if (y < 0) y = 0; await MoveProductsOutOfRowAsync(y);
        var titlesAtRow = await _ctx.CatalogCafeTitleRows.Where(t => t.MatrixY == y).ToListAsync(); if (titlesAtRow.Count > 0) _ctx.CatalogCafeTitleRows.RemoveRange(titlesAtRow);
        var emptiesAtRow = await _ctx.CatalogCafeEmptyCells.Where(e => e.Y == y).ToListAsync(); if (emptiesAtRow.Count > 0) _ctx.CatalogCafeEmptyCells.RemoveRange(emptiesAtRow);
        var productsBelow = await CafeOnly(_ctx.Products.Include(p=>p.Category)).Where(p => p.MatrixYCafe > y).ToListAsync(); foreach (var p in productsBelow) { p.MatrixYCafe = (p.MatrixYCafe ?? 0) - 1; }
        var titlesBelow = await _ctx.CatalogCafeTitleRows.Where(t => t.MatrixY > y).ToListAsync(); foreach (var t in titlesBelow) { t.MatrixY -= 1; }
        var emptiesBelow = await _ctx.CatalogCafeEmptyCells.Where(e => e.Y > y).ToListAsync(); foreach (var e in emptiesBelow) { e.Y -= 1; }
        await _ctx.SaveChangesAsync(); return RedirectToPage(new { AdminMode = true });
    }

    public async Task<IActionResult> OnPostDeleteLastEmptyRowsAsync(int count)
    {
        if (!User.IsInRole("Admin")) return Forbid(); if (count <= 0) return RedirectToPage(new { AdminMode = true });
        int maxProductY = (await CafeOnly(_ctx.Products.Include(p=>p.Category)).MaxAsync(p => (int?)p.MatrixYCafe)) ?? -1;
        int maxTitleY = (await _ctx.CatalogCafeTitleRows.MaxAsync(t => (int?)t.MatrixY)) ?? -1;
        int maxEmptyY = (await _ctx.CatalogCafeEmptyCells.MaxAsync(e => (int?)e.Y)) ?? -1;
        int y = new[] { maxProductY, maxTitleY, maxEmptyY }.Max(); int deleted = 0;
        while (deleted < count && y >= 0)
        {
            bool hasProduct = await CafeOnly(_ctx.Products.Include(p=>p.Category)).AnyAsync(p => p.MatrixYCafe == y);
            bool hasTitle = await _ctx.CatalogCafeTitleRows.AnyAsync(t => t.MatrixY == y);
            if (hasProduct || hasTitle) break;
            var empties = await _ctx.CatalogCafeEmptyCells.Where(e => e.Y == y).ToListAsync(); if (empties.Count == 0) { y--; continue; }
            _ctx.CatalogCafeEmptyCells.RemoveRange(empties); deleted++; y--;
        }
        if (deleted > 0) await _ctx.SaveChangesAsync(); return RedirectToPage(new { AdminMode = true });
    }

    private async Task MoveProductsOutOfRowAsync(int targetRow)
    {
        var productsInRow = await CafeOnly(_ctx.Products.Include(p=>p.Category))
            .Where(p => p.MatrixYCafe == targetRow)
            .OrderBy(p => p.MatrixXCafe)
            .ToListAsync();
        if (productsInRow.Count == 0) return;

        var allProducts = await CafeOnly(_ctx.Products.Include(p=>p.Category)).ToListAsync();
        var reservedRows = (await _ctx.CatalogCafeTitleRows.ToListAsync()).Select(t => t.MatrixY).ToHashSet(); reservedRows.Add(targetRow);
        int maxY = allProducts.Where(p => p.MatrixYCafe.HasValue).Select(p => p.MatrixYCafe!.Value).DefaultIfEmpty(-1).Max();
        int totalCount = allProducts.Count; int reservedCount = reservedRows.Count;
        int rowsNeededForProducts = totalCount > 0 ? (int)Math.Ceiling((double)totalCount / MatrixColumns) : 1; int matrixRows = Math.Max(rowsNeededForProducts + reservedCount, maxY + 1); if (matrixRows <= 0) matrixRows = 1;
        var occupied = new bool[matrixRows, MatrixColumns];
        foreach (var p in allProducts)
        {
            if (productsInRow.Contains(p)) continue; if (p.MatrixXCafe.HasValue && p.MatrixYCafe.HasValue && p.MatrixXCafe.Value >= 0 && p.MatrixXCafe.Value < MatrixColumns && p.MatrixYCafe.Value >= 0 && p.MatrixYCafe.Value < matrixRows && !reservedRows.Contains(p.MatrixYCafe.Value)) occupied[p.MatrixYCafe.Value, p.MatrixXCafe.Value] = true;
        }
        bool IsFree(int y, int x) => y >= 0 && x >= 0 && y < matrixRows && x < MatrixColumns && !occupied[y, x] && !reservedRows.Contains(y);
        (int y, int x) FindNearestFreeByScan(int fromY, int fromX)
        {
            int bestY = -1, bestX = -1; int bestDist = int.MaxValue; for (int y = 0; y < matrixRows; y++) { if (reservedRows.Contains(y)) continue; for (int x = 0; x < MatrixColumns; x++) { if (!IsFree(y, x)) continue; int dist = Math.Abs(y - fromY) + Math.Abs(x - fromX); if (dist < bestDist) { bestDist = dist; bestY = y; bestX = x; if (bestDist == 0) return (bestY, bestX); } } } if (bestY == -1) { var newOcc = new bool[matrixRows + 1, MatrixColumns]; for (int y = 0; y < matrixRows; y++) for (int x = 0; x < MatrixColumns; x++) newOcc[y, x] = occupied[y, x]; occupied = newOcc; matrixRows++; return (matrixRows - 1, 0); } return (bestY, bestX);
        }
        foreach (var p in productsInRow) { int startX = p.MatrixXCafe ?? 0; var (ny, nx) = FindNearestFreeByScan(targetRow, startX); p.MatrixXCafe = nx; p.MatrixYCafe = ny; occupied[ny, nx] = true; }
        await _ctx.SaveChangesAsync();
    }
}