using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MessageNotif : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "WhatsAppNumber",
                table: "Tourneys",
                newName: "WhatsappNumber");

            migrationBuilder.AddColumn<string>(
                name: "WhatsappNotif",
                table: "Tourneys",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WhatsappNotif",
                table: "Tourneys");

            migrationBuilder.RenameColumn(
                name: "WhatsappNumber",
                table: "Tourneys",
                newName: "WhatsAppNumber");
        }
    }
}
