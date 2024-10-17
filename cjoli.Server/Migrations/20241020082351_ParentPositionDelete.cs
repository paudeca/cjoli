using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class ParentPositionDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParentPosition_Position_PositionId",
                table: "ParentPosition");

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

            migrationBuilder.AddForeignKey(
                name: "FK_ParentPosition_Position_PositionId",
                table: "ParentPosition",
                column: "PositionId",
                principalTable: "Position",
                principalColumn: "Id");
        }
    }
}
