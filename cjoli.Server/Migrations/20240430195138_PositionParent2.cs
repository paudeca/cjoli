using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class PositionParent2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Position_Position_ParentId",
                table: "Position");

            migrationBuilder.RenameColumn(
                name: "ParentId",
                table: "Position",
                newName: "ParentPositionId");

            migrationBuilder.RenameIndex(
                name: "IX_Position_ParentId",
                table: "Position",
                newName: "IX_Position_ParentPositionId");

            migrationBuilder.CreateTable(
                name: "ParentPosition",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SquadId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParentPosition", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParentPosition_Squad_SquadId",
                        column: x => x.SquadId,
                        principalTable: "Squad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ParentPosition_SquadId",
                table: "ParentPosition",
                column: "SquadId");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_ParentPosition_ParentPositionId",
                table: "Position",
                column: "ParentPositionId",
                principalTable: "ParentPosition",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Position_ParentPosition_ParentPositionId",
                table: "Position");

            migrationBuilder.DropTable(
                name: "ParentPosition");

            migrationBuilder.RenameColumn(
                name: "ParentPositionId",
                table: "Position",
                newName: "ParentId");

            migrationBuilder.RenameIndex(
                name: "IX_Position_ParentPositionId",
                table: "Position",
                newName: "IX_Position_ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_Position_ParentId",
                table: "Position",
                column: "ParentId",
                principalTable: "Position",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
