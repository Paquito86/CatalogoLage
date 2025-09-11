using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoLage.Migrations
{
    /// <inheritdoc />
    public partial class AddGrapeTypesAndRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GrapeTypeId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "GrapeTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrapeTypes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_GrapeTypeId",
                table: "Products",
                column: "GrapeTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_GrapeTypes_GrapeTypeId",
                table: "Products",
                column: "GrapeTypeId",
                principalTable: "GrapeTypes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_GrapeTypes_GrapeTypeId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "GrapeTypes");

            migrationBuilder.DropIndex(
                name: "IX_Products_GrapeTypeId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "GrapeTypeId",
                table: "Products");
        }
    }
}
