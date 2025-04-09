using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class ParentPhase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "SquadId",
                table: "ParentPosition",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "PhaseId",
                table: "ParentPosition",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParentPosition_PhaseId",
                table: "ParentPosition",
                column: "PhaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_ParentPosition_Phase_PhaseId",
                table: "ParentPosition",
                column: "PhaseId",
                principalTable: "Phase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParentPosition_Phase_PhaseId",
                table: "ParentPosition");

            migrationBuilder.DropIndex(
                name: "IX_ParentPosition_PhaseId",
                table: "ParentPosition");

            migrationBuilder.DropColumn(
                name: "PhaseId",
                table: "ParentPosition");

            migrationBuilder.AlterColumn<int>(
                name: "SquadId",
                table: "ParentPosition",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
