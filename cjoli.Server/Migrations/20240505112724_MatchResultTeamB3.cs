using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MatchResultTeamB3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchResult_Team_TeamAgainstId",
                table: "MatchResult");

            migrationBuilder.AlterColumn<int>(
                name: "TeamAgainstId",
                table: "MatchResult",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MatchResult_Team_TeamAgainstId",
                table: "MatchResult",
                column: "TeamAgainstId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchResult_Team_TeamAgainstId",
                table: "MatchResult");

            migrationBuilder.AlterColumn<int>(
                name: "TeamAgainstId",
                table: "MatchResult",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_MatchResult_Team_TeamAgainstId",
                table: "MatchResult",
                column: "TeamAgainstId",
                principalTable: "Team",
                principalColumn: "Id");
        }
    }
}
