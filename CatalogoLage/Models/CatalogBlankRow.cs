using System.ComponentModel.DataAnnotations;

namespace CatalogoLage.Models;

// Representa una fila "en blanco" insertada por el usuario para crear espacio en la matriz.
public class CatalogBlankRow
{
    public int Id { get; set; }

    [Range(0, int.MaxValue)]
    public int MatrixY { get; set; }
}
