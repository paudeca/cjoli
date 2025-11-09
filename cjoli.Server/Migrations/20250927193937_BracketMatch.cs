using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class BracketMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BracketCount",
                table: "Squad");

            migrationBuilder.AddColumn<string>(
                name: "MatchName",
                table: "Position",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "Winner",
                table: "Position",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Match",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatchName",
                table: "Position");

            migrationBuilder.DropColumn(
                name: "Winner",
                table: "Position");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Match");

            migrationBuilder.AddColumn<int>(
                name: "BracketCount",
                table: "Squad",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
