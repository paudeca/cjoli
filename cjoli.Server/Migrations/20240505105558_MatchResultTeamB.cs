using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MatchResultTeamB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TeamAgaintyId",
                table: "MatchResult",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MatchResult_TeamAgaintyId",
                table: "MatchResult",
                column: "TeamAgaintyId");

            migrationBuilder.AddForeignKey(
                name: "FK_MatchResult_Team_TeamAgaintyId",
                table: "MatchResult",
                column: "TeamAgaintyId",
                principalTable: "Team",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchResult_Team_TeamAgaintyId",
                table: "MatchResult");

            migrationBuilder.DropIndex(
                name: "IX_MatchResult_TeamAgaintyId",
                table: "MatchResult");

            migrationBuilder.DropColumn(
                name: "TeamAgaintyId",
                table: "MatchResult");
        }
    }
}
