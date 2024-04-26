using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class DeleteCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Match_Squad_SquadId",
                table: "Match");

            migrationBuilder.DropForeignKey(
                name: "FK_Phase_Tourneys_TourneyId",
                table: "Phase");

            migrationBuilder.DropForeignKey(
                name: "FK_Position_Squad_SquadId",
                table: "Position");

            migrationBuilder.DropForeignKey(
                name: "FK_Squad_Phase_PhaseId",
                table: "Squad");

            migrationBuilder.DropForeignKey(
                name: "FK_Team_Tourneys_TourneyId",
                table: "Team");

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Squad_SquadId",
                table: "Match",
                column: "SquadId",
                principalTable: "Squad",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Phase_Tourneys_TourneyId",
                table: "Phase",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Position_Squad_SquadId",
                table: "Position",
                column: "SquadId",
                principalTable: "Squad",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Squad_Phase_PhaseId",
                table: "Squad",
                column: "PhaseId",
                principalTable: "Phase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Team_Tourneys_TourneyId",
                table: "Team",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Match_Squad_SquadId",
                table: "Match");

            migrationBuilder.DropForeignKey(
                name: "FK_Phase_Tourneys_TourneyId",
                table: "Phase");

            migrationBuilder.DropForeignKey(
                name: "FK_Position_Squad_SquadId",
                table: "Position");

            migrationBuilder.DropForeignKey(
                name: "FK_Squad_Phase_PhaseId",
                table: "Squad");

            migrationBuilder.DropForeignKey(
                name: "FK_Team_Tourneys_TourneyId",
                table: "Team");

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Squad_SquadId",
                table: "Match",
                column: "SquadId",
                principalTable: "Squad",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Phase_Tourneys_TourneyId",
                table: "Phase",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_Squad_SquadId",
                table: "Position",
                column: "SquadId",
                principalTable: "Squad",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Squad_Phase_PhaseId",
                table: "Squad",
                column: "PhaseId",
                principalTable: "Phase",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Team_Tourneys_TourneyId",
                table: "Team",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id");
        }
    }
}
