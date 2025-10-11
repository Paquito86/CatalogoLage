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
}
