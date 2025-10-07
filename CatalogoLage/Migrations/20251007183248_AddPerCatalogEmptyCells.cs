using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class AddPerCatalogEmptyCells : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CatalogCafeEmptyCells",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    X = table.Column<int>(type: "int", nullable: false),
                    Y = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogCafeEmptyCells", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CatalogSpiritsEmptyCells",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    X = table.Column<int>(type: "int", nullable: false),
                    Y = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogSpiritsEmptyCells", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CatalogCafeEmptyCells_X_Y",
                table: "CatalogCafeEmptyCells",
                columns: new[] { "X", "Y" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CatalogSpiritsEmptyCells_X_Y",
                table: "CatalogSpiritsEmptyCells",
                columns: new[] { "X", "Y" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatalogCafeEmptyCells");

            migrationBuilder.DropTable(
                name: "CatalogSpiritsEmptyCells");
        }
    }
}
