using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class Estimate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchSimulation");

            migrationBuilder.RenameColumn(
                name: "UseCustomSimulation",
                table: "UserConfig",
                newName: "UseCustomEstimate");

            migrationBuilder.RenameColumn(
                name: "ActiveSimulation",
                table: "UserConfig",
                newName: "ActiveEstimate");

            migrationBuilder.CreateTable(
                name: "MatchEstimate",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    ScoreA = table.Column<int>(type: "int", nullable: false),
                    ScoreB = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchEstimate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchEstimate_Match_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Match",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchEstimate_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_MatchEstimate_MatchId",
                table: "MatchEstimate",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchEstimate_UserId",
                table: "MatchEstimate",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchEstimate");

            migrationBuilder.RenameColumn(
                name: "UseCustomEstimate",
                table: "UserConfig",
                newName: "UseCustomSimulation");

            migrationBuilder.RenameColumn(
                name: "ActiveEstimate",
                table: "UserConfig",
                newName: "ActiveSimulation");

            migrationBuilder.CreateTable(
                name: "MatchSimulation",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    ScoreA = table.Column<int>(type: "int", nullable: false),
                    ScoreB = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchSimulation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchSimulation_Match_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Match",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchSimulation_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSimulation_MatchId",
                table: "MatchSimulation",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSimulation_UserId",
                table: "MatchSimulation",
                column: "UserId");
        }
    }
}
