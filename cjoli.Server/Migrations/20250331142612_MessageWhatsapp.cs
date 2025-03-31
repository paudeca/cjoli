using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cjoli.Server.Migrations
{
    /// <inheritdoc />
    public partial class MessageWhatsapp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WhatsappNumber",
                table: "Tourneys",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WhatsappNumber",
                table: "Tourneys");
        }
    }
}
