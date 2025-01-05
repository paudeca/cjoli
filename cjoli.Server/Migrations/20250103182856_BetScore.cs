using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class BetScore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "BetDiff",
                table: "UserMatch",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "BetGoal",
                table: "UserMatch",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "BetPerfect",
                table: "UserMatch",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "BetScore",
                table: "UserMatch",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "BetWinner",
                table: "UserMatch",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BetDiff",
                table: "UserMatch");

            migrationBuilder.DropColumn(
                name: "BetGoal",
                table: "UserMatch");

            migrationBuilder.DropColumn(
                name: "BetPerfect",
                table: "UserMatch");

            migrationBuilder.DropColumn(
                name: "BetScore",
                table: "UserMatch");

            migrationBuilder.DropColumn(
                name: "BetWinner",
                table: "UserMatch");
        }
    }
}
