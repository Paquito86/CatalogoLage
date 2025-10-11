using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class AddPerCatalogCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MatrixXCafe",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatrixXSpirits",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatrixYCafe",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatrixYSpirits",
                table: "Products",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatrixXCafe",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MatrixXSpirits",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MatrixYCafe",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MatrixYSpirits",
                table: "Products");
        }
    }
}
