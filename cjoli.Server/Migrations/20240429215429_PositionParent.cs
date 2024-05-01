using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class PositionParent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "Position",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Position_ParentId",
                table: "Position",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_Position_ParentId",
                table: "Position",
                column: "ParentId",
                principalTable: "Position",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Position_Position_ParentId",
                table: "Position");

            migrationBuilder.DropIndex(
                name: "IX_Position_ParentId",
                table: "Position");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Position");
        }
    }
}
