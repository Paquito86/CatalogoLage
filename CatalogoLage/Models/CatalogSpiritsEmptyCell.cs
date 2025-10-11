using System.ComponentModel.DataAnnotations;

namespace CatalogoLage.Models;

public class CatalogSpiritsEmptyCell
{
    public int Id { get; set; }

    [Range(0,int.MaxValue)]
    public int X { get; set; }

    [Range(0,int.MaxValue)]
    public int Y { get; set; }
}
