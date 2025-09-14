using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class AddMatrixCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MatrixX",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatrixY",
                table: "Products",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatrixX",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MatrixY",
                table: "Products");
        }
    }
}
