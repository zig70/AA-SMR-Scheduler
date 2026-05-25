using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SMR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceTypeAndNotesToAppointment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ServiceType",
                table: "Appointments",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "ServiceType",
                table: "Appointments");
        }
    }
}
