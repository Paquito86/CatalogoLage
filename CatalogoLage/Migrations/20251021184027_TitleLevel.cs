using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class TitleLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "CatalogTitleRows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "CatalogSpiritsTitleRows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "CatalogCafeTitleRows",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Level",
                table: "CatalogTitleRows");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "CatalogSpiritsTitleRows");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "CatalogCafeTitleRows");
        }
    }
}
