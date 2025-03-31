using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MessageDestination : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Message_Tourneys_TourneyId",
                table: "Message");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Message",
                table: "Message");

            migrationBuilder.RenameTable(
                name: "Message",
                newName: "Messages");

            migrationBuilder.RenameIndex(
                name: "IX_Message_TourneyId",
                table: "Messages",
                newName: "IX_Messages_TourneyId");

            migrationBuilder.AddColumn<string>(
                name: "Destination",
                table: "Messages",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Messages",
                table: "Messages",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Tourneys_TourneyId",
                table: "Messages",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Tourneys_TourneyId",
                table: "Messages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Messages",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Destination",
                table: "Messages");

            migrationBuilder.RenameTable(
                name: "Messages",
                newName: "Message");

            migrationBuilder.RenameIndex(
                name: "IX_Messages_TourneyId",
                table: "Message",
                newName: "IX_Message_TourneyId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Message",
                table: "Message",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Message_Tourneys_TourneyId",
                table: "Message",
                column: "TourneyId",
                principalTable: "Tourneys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
