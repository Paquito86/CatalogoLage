using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CatalogoLage.Models;

namespace CatalogoLage.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<GrapeType> GrapeTypes => Set<GrapeType>();
        public DbSet<CatalogTitleRow> CatalogTitleRows => Set<CatalogTitleRow>();
        public DbSet<CatalogEmptyCell> CatalogEmptyCells => Set<CatalogEmptyCell>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Índice único para evitar duplicados de posición vacía
            builder.Entity<CatalogEmptyCell>()
                .HasIndex(e => new { e.X, e.Y })
                .IsUnique();
        }
    }
}
