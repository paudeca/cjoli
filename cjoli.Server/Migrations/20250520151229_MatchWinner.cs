using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MatchWinner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WinnerId",
                table: "Match",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Match_WinnerId",
                table: "Match",
                column: "WinnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Position_WinnerId",
                table: "Match",
                column: "WinnerId",
                principalTable: "Position",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Match_Position_WinnerId",
                table: "Match");

            migrationBuilder.DropIndex(
                name: "IX_Match_WinnerId",
                table: "Match");

            migrationBuilder.DropColumn(
                name: "WinnerId",
                table: "Match");
        }
    }
}
