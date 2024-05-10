using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class Squad1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Match_Team_TeamAId",
                table: "Match");

            migrationBuilder.DropForeignKey(
                name: "FK_Match_Team_TeamBId",
                table: "Match");

            migrationBuilder.DropForeignKey(
                name: "FK_Match_Tourneys_TourneyId",
                table: "Match");

            migrationBuilder.RenameColumn(
                name: "TourneyId",
                table: "Match",
                newName: "SquadId");

            migrationBuilder.RenameColumn(
                name: "TeamBId",
                table: "Match",
                newName: "PositionBId");

            migrationBuilder.RenameColumn(
                name: "TeamAId",
                table: "Match",
                newName: "PositionAId");

            migrationBuilder.RenameIndex(
                name: "IX_Match_TourneyId",
                table: "Match",
                newName: "IX_Match_SquadId");

            migrationBuilder.RenameIndex(
                name: "IX_Match_TeamBId",
                table: "Match",
                newName: "IX_Match_PositionBId");

            migrationBuilder.RenameIndex(
                name: "IX_Match_TeamAId",
                table: "Match",
                newName: "IX_Match_PositionAId");

            migrationBuilder.CreateTable(
                name: "Phase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Time = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    TourneyId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Phase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Phase_Tourneys_TourneyId",
                        column: x => x.TourneyId,
                        principalTable: "Tourneys",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Squad",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PhaseId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Squad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Squad_Phase_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phase",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Position",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Value = table.Column<int>(type: "int", nullable: false),
                    TeamId = table.Column<int>(type: "int", nullable: true),
                    SquadId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Position", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Position_Squad_SquadId",
                        column: x => x.SquadId,
                        principalTable: "Squad",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Position_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Phase_TourneyId",
                table: "Phase",
                column: "TourneyId");

            migrationBuilder.CreateIndex(
                name: "IX_Position_SquadId",
                table: "Position",
                column: "SquadId");

            migrationBuilder.CreateIndex(
                name: "IX_Position_TeamId",
                table: "Position",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Squad_PhaseId",
                table: "Squad",
                column: "PhaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Position_PositionAId",
                table: "Match",
                column: "PositionAId",
                principalTable: "Position",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Position_PositionBId",
                table: "Match",
                column: "PositionBId",
                principalTable: "Position",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Squad_SquadId",
                table: "Match",
                column: "SquadId",
                principalTable: "Squad",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Match_Position_PositionAId",
                table: "Match");

            migrationBuilder.DropForeignKey(
                name: "FK_Match_Position_PositionBId",
                table: "Match");

            migrationBuilder.DropForeignKey(
                name: "FK_Match_Squad_SquadId",
                table: "Match");

            migrationBuilder.DropTable(
                name: "Position");

            migrationBuilder.DropTable(
                name: "Squad");

            migrationBuilder.DropTable(
                name: "Phase");

            migrationBuilder.RenameColumn(
                name: "SquadId",
                table: "Match",
                newName: "TourneyId");

            migrationBuilder.RenameColumn(
                name: "PositionBId",
                table: "Match",
                newName: "TeamBId");

            migrationBuilder.RenameColumn(
                name: "PositionAId",
                table: "Match",
                newName: "TeamAId");

            migrationBuilder.RenameIndex(
                name: "IX_Match_SquadId",
                table: "Match",
                newName: "IX_Match_TourneyId");

            migrationBuilder.RenameIndex(
                name: "IX_Match_PositionBId",
                table: "Match",
                newName: "IX_Match_TeamBId");

            migrationBuilder.RenameIndex(
                name: "IX_Match_PositionAId",
                table: "Match",
                newName: "IX_Match_TeamAId");

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Team_TeamAId",
                table: "Match",
                column: "TeamAId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Team_TeamBId",
                table: "Match",
                column: "TeamBId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Match_Tourneys_TourneyId",
                table: "Match",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id");
        }
    }
}
