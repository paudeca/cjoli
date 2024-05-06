using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MatchSimulationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchSimulation_Match_MatchId",
                table: "MatchSimulation");

            migrationBuilder.DropIndex(
                name: "IX_MatchSimulation_MatchId",
                table: "MatchSimulation");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "MatchSimulation",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MatchSimulation_MatchId",
                table: "MatchSimulation",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSimulation_UserId",
                table: "MatchSimulation",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MatchSimulation_Match_MatchId",
                table: "MatchSimulation",
                column: "MatchId",
                principalTable: "Match",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MatchSimulation_Users_UserId",
                table: "MatchSimulation",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchSimulation_Match_MatchId",
                table: "MatchSimulation");

            migrationBuilder.DropForeignKey(
                name: "FK_MatchSimulation_Users_UserId",
                table: "MatchSimulation");

            migrationBuilder.DropIndex(
                name: "IX_MatchSimulation_MatchId",
                table: "MatchSimulation");

            migrationBuilder.DropIndex(
                name: "IX_MatchSimulation_UserId",
                table: "MatchSimulation");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "MatchSimulation");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSimulation_MatchId",
                table: "MatchSimulation",
                column: "MatchId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MatchSimulation_Match_MatchId",
                table: "MatchSimulation",
                column: "MatchId",
                principalTable: "Match",
                principalColumn: "Id");
        }
    }
}
