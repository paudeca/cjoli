using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class TeamAlias2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Alias",
                table: "Team");

            migrationBuilder.AddColumn<int>(
                name: "AliasId",
                table: "Team",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Team_AliasId",
                table: "Team",
                column: "AliasId");

            migrationBuilder.AddForeignKey(
                name: "FK_Team_Team_AliasId",
                table: "Team",
                column: "AliasId",
                principalTable: "Team",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Team_Team_AliasId",
                table: "Team");

            migrationBuilder.DropIndex(
                name: "IX_Team_AliasId",
                table: "Team");

            migrationBuilder.DropColumn(
                name: "AliasId",
                table: "Team");

            migrationBuilder.AddColumn<string>(
                name: "Alias",
                table: "Team",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
