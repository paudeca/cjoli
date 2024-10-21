using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class FavoriteTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FavoriteTeamId",
                table: "UserConfig",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserConfig_FavoriteTeamId",
                table: "UserConfig",
                column: "FavoriteTeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserConfig_Team_FavoriteTeamId",
                table: "UserConfig",
                column: "FavoriteTeamId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserConfig_Team_FavoriteTeamId",
                table: "UserConfig");

            migrationBuilder.DropIndex(
                name: "IX_UserConfig_FavoriteTeamId",
                table: "UserConfig");

            migrationBuilder.DropColumn(
                name: "FavoriteTeamId",
                table: "UserConfig");
        }
    }
}
