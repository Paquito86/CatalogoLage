using System.ComponentModel.DataAnnotations;

namespace CatalogoLage.Models;

public class CatalogCafeTitleRow
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Text { get; set; } = default!;

    [Range(0, int.MaxValue)]
    public int MatrixY { get; set; }

    [Range(1, 2)]
    public int Level { get; set; } = 2; // 1=h1, 2=h2 (por defecto)
}
