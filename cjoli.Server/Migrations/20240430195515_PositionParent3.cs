using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class PositionParent3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Position_ParentPosition_ParentPositionId",
                table: "Position");

            migrationBuilder.DropIndex(
                name: "IX_Position_ParentPositionId",
                table: "Position");

            migrationBuilder.DropColumn(
                name: "ParentPositionId",
                table: "Position");

            migrationBuilder.AddColumn<int>(
                name: "PositionId",
                table: "ParentPosition",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ParentPosition_PositionId",
                table: "ParentPosition",
                column: "PositionId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ParentPosition_Position_PositionId",
                table: "ParentPosition",
                column: "PositionId",
                principalTable: "Position",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParentPosition_Position_PositionId",
                table: "ParentPosition");

            migrationBuilder.DropIndex(
                name: "IX_ParentPosition_PositionId",
                table: "ParentPosition");

            migrationBuilder.DropColumn(
                name: "PositionId",
                table: "ParentPosition");

            migrationBuilder.AddColumn<int>(
                name: "ParentPositionId",
                table: "Position",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Position_ParentPositionId",
                table: "Position",
                column: "ParentPositionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Position_ParentPosition_ParentPositionId",
                table: "Position",
                column: "ParentPositionId",
                principalTable: "ParentPosition",
                principalColumn: "Id");
        }
    }
}
