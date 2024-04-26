using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class DeleteCascadeTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Position_Team_TeamId",
                table: "Position");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_Team_TeamId",
                table: "Position",
                column: "TeamId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Position_Team_TeamId",
                table: "Position");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_Team_TeamId",
                table: "Position",
                column: "TeamId",
                principalTable: "Team",
                principalColumn: "Id");
        }
    }
}
