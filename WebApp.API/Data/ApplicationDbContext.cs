using Microsoft.EntityFrameworkCore;
using WebApp.API.Models;

namespace WebApp.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");

                entity.HasIndex(e => e.username).IsUnique();
                entity.Property(e => e.username).IsRequired();
                entity.Property(e => e.password).IsRequired();

                // Đảm bảo các cột không null có giá trị mặc định
                entity.Property(e => e.ho_ten).HasMaxLength(100);
                entity.Property(e => e.email).HasMaxLength(100);
                entity.Property(e => e.so_dien_thoai).HasMaxLength(15);
                entity.Property(e => e.role).HasMaxLength(20);
                entity.Property(e => e.status).HasDefaultValue("active");
                entity.Property(e => e.created_at).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.updated_at).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
} 