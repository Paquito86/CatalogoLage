using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore; // Precision

namespace CatalogoLage.Models;

public class Product
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = default!;

    [MaxLength(200)]
    public string? Manufacturer { get; set; } // For non-wine products

    [MaxLength(200)]
    public string? Winery { get; set; } // If it is wine

    [Range(0, 100000)]
    [DataType(DataType.Currency)]
    [Precision(12, 2)] // Avoid truncation warning, adjust as needed
    public decimal? Price { get; set; } // Optional

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    [MaxLength(50)]
    public string? Size { get; set; } // e.g., 750ml

    [Display(Name = "% Alcohol")]
    [Precision(5, 2)]
    public double? AlcoholPercent { get; set; }

    [MaxLength(100)]
    public string? Origin { get; set; }

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    // Nuevo: Tipo de uva (opcional)
    public int? GrapeTypeId { get; set; }
    public GrapeType? GrapeType { get; set; }

    // Coordenadas para matriz de drag and drop - Vinos (existentes)
    public int? MatrixX { get; set; }
    public int? MatrixY { get; set; }

    // Coordenadas para matriz de Destilados
    public int? MatrixXSpirits { get; set; }
    public int? MatrixYSpirits { get; set; }

    // Coordenadas para matriz de Café e Infusiones
    public int? MatrixXCafe { get; set; }
    public int? MatrixYCafe { get; set; }

    public bool IsWine => !string.IsNullOrWhiteSpace(Winery);
}