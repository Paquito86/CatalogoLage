using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class AddSpiritsAndCafeTitleRows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CatalogCafeTitleRows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MatrixY = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogCafeTitleRows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CatalogSpiritsTitleRows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MatrixY = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogSpiritsTitleRows", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CatalogTitleRows_MatrixY",
                table: "CatalogTitleRows",
                column: "MatrixY",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CatalogCafeTitleRows_MatrixY",
                table: "CatalogCafeTitleRows",
                column: "MatrixY",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CatalogSpiritsTitleRows_MatrixY",
                table: "CatalogSpiritsTitleRows",
                column: "MatrixY",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatalogCafeTitleRows");

            migrationBuilder.DropTable(
                name: "CatalogSpiritsTitleRows");

            migrationBuilder.DropIndex(
                name: "IX_CatalogTitleRows_MatrixY",
                table: "CatalogTitleRows");
        }
    }
}
