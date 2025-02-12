using Microsoft.EntityFrameworkCore.Migrations;

namespace WebApp.API.Migrations
{
    public partial class AddDaiLyIdToDonVi : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "dai_ly_id",
                table: "don_vi",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_don_vi_dai_ly_id",
                table: "don_vi",
                column: "dai_ly_id");

            migrationBuilder.AddForeignKey(
                name: "FK_don_vi_dai_ly_dai_ly_id",
                table: "don_vi",
                column: "dai_ly_id",
                principalTable: "dai_ly",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_don_vi_dai_ly_dai_ly_id",
                table: "don_vi");

            migrationBuilder.DropIndex(
                name: "IX_don_vi_dai_ly_id",
                table: "don_vi");

            migrationBuilder.DropColumn(
                name: "dai_ly_id",
                table: "don_vi");
        }
    }
} 