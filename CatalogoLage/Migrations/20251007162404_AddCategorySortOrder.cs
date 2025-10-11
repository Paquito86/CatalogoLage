using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class AddCategorySortOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Categories",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Categories");
        }
    }
}
