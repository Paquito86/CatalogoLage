using System.ComponentModel.DataAnnotations;

namespace CatalogoLage.Models;

public class CatalogTitleRow
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Text { get; set; } = default!;

    // Row index in the matrix (Y coordinate). This row is reserved for the title.
    [Range(0, int.MaxValue)]
    public int MatrixY { get; set; }

    // Heading level: 1 => h1, 2 => h2 (por defecto todos serán h2)
    [Range(1, 2)]
    public int Level { get; set; } = 2;
}
