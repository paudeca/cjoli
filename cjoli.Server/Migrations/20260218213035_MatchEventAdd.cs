using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MatchEventAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GoalKeeperInNum",
                table: "MatchEvent",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Penalty",
                table: "MatchEvent",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "PenaltyTime",
                table: "MatchEvent",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoalKeeperInNum",
                table: "MatchEvent");

            migrationBuilder.DropColumn(
                name: "Penalty",
                table: "MatchEvent");

            migrationBuilder.DropColumn(
                name: "PenaltyTime",
                table: "MatchEvent");
        }
    }
}
