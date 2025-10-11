namespace CatalogoLage.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    // Nuevo: columna entera opcional (nullable)
    public int? SortOrder { get; set; } // Determina en que catalogo se mostrará la categoría

    public ICollection<Product> Products { get; set; } = new List<Product>();
}