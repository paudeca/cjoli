using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class Player : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MatchEvent",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Time = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    PlayerNum = table.Column<int>(type: "int", nullable: true),
                    Assist1Num = table.Column<int>(type: "int", nullable: true),
                    Assist2Num = table.Column<int>(type: "int", nullable: true),
                    TeamId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchEvent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchEvent_Match_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Match",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchEvent_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Player",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Birthday = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Player", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PlayerTeam",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PlayerId = table.Column<int>(type: "int", nullable: false),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    BeginDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerTeam", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerTeam_Player_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Player",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayerTeam_Team_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Team",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TourneyTeamPlayer",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Number = table.Column<int>(type: "int", nullable: false),
                    IsGoalKeeper = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsCaptain = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsAssistant = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PlayerId = table.Column<int>(type: "int", nullable: true),
                    TourneyId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TourneyTeamPlayer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TourneyTeamPlayer_PlayerTeam_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "PlayerTeam",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TourneyTeamPlayer_TeamData_TourneyId",
                        column: x => x.TourneyId,
                        principalTable: "TeamData",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_MatchEvent_MatchId",
                table: "MatchEvent",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchEvent_TeamId",
                table: "MatchEvent",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerTeam_PlayerId",
                table: "PlayerTeam",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerTeam_TeamId",
                table: "PlayerTeam",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TourneyTeamPlayer_PlayerId",
                table: "TourneyTeamPlayer",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_TourneyTeamPlayer_TourneyId",
                table: "TourneyTeamPlayer",
                column: "TourneyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchEvent");

            migrationBuilder.DropTable(
                name: "TourneyTeamPlayer");

            migrationBuilder.DropTable(
                name: "PlayerTeam");

            migrationBuilder.DropTable(
                name: "Player");
        }
    }
}
