using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class SynchroName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasTournifySynchroName",
                table: "Tourneys",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasTournifySynchroName",
                table: "Tourneys");
        }
    }
}
