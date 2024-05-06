using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MatchResultTeamB2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchResult_Team_TeamAgaintyId",
                table: "MatchResult");

            migrationBuilder.RenameColumn(
                name: "TeamAgaintyId",
                table: "MatchResult",
                newName: "TeamAgainstId");

            migrationBuilder.RenameIndex(
                name: "IX_MatchResult_TeamAgaintyId",
                table: "MatchResult",
                newName: "IX_MatchResult_TeamAgainstId");

            migrationBuilder.AddForeignKey(
                name: "FK_MatchResult_Team_TeamAgainstId",
                table: "MatchResult",
                column: "TeamAgainstId",
                principalTable: "Team",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchResult_Team_TeamAgainstId",
                table: "MatchResult");

            migrationBuilder.RenameColumn(
                name: "TeamAgainstId",
                table: "MatchResult",
                newName: "TeamAgaintyId");

            migrationBuilder.RenameIndex(
                name: "IX_MatchResult_TeamAgainstId",
                table: "MatchResult",
                newName: "IX_MatchResult_TeamAgaintyId");

            migrationBuilder.AddForeignKey(
                name: "FK_MatchResult_Team_TeamAgaintyId",
                table: "MatchResult",
                column: "TeamAgaintyId",
                principalTable: "Team",
                principalColumn: "Id");
        }
    }
}
