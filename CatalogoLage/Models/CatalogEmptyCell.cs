using System.ComponentModel.DataAnnotations;

namespace CatalogoLage.Models;

// Representa una posición reservada vacía en la matriz que no debe ser usada automáticamente.
public class CatalogEmptyCell
{
    public int Id { get; set; }

    [Range(0,int.MaxValue)]
    public int X { get; set; }

    [Range(0,int.MaxValue)]
    public int Y { get; set; }
}
