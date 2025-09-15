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
}
