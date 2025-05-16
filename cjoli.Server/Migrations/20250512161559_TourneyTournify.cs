using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class TourneyTournify : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tournify",
                table: "Tourneys",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tournify",
                table: "Tourneys");
        }
    }
}
