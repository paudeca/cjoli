using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MoveTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Team_Tourneys_TourneyId",
                table: "Team");

            migrationBuilder.DropIndex(
                name: "IX_Team_TourneyId",
                table: "Team");

            migrationBuilder.DropColumn(
                name: "TourneyId",
                table: "Team");

            migrationBuilder.AlterColumn<bool>(
                name: "ForfeitB",
                table: "UserMatch",
                type: "tinyint(1)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "ForfeitA",
                table: "UserMatch",
                type: "tinyint(1)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "TeamTourney",
                columns: table => new
                {
                    TeamsId = table.Column<int>(type: "int", nullable: false),
                    TourneysId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamTourney", x => new { x.TeamsId, x.TourneysId });
                    table.ForeignKey(
                        name: "FK_TeamTourney_Team_TeamsId",
                        column: x => x.TeamsId,
                        principalTable: "Team",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamTourney_Tourneys_TourneysId",
                        column: x => x.TourneysId,
                        principalTable: "Tourneys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_TeamTourney_TourneysId",
                table: "TeamTourney",
                column: "TourneysId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeamTourney");

            migrationBuilder.AlterColumn<int>(
                name: "ForfeitB",
                table: "UserMatch",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)");

            migrationBuilder.AlterColumn<int>(
                name: "ForfeitA",
                table: "UserMatch",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)");

            migrationBuilder.AddColumn<int>(
                name: "TourneyId",
                table: "Team",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Team_TourneyId",
                table: "Team",
                column: "TourneyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Team_Tourneys_TourneyId",
                table: "Team",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
