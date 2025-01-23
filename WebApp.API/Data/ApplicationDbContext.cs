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
        public DbSet<PaymentBill> PaymentBills { get; set; }
        public DbSet<Province> Provinces { get; set; }
        public DbSet<District> Districts { get; set; }
        public DbSet<Commune> Communes { get; set; }

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

            modelBuilder.Entity<PaymentBill>(entity =>
            {
                entity.ToTable("payment_bills");

                entity.Property(e => e.file_url).HasMaxLength(500);
                entity.Property(e => e.cloudinary_public_id).HasMaxLength(255);
                entity.Property(e => e.uploaded_at).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(p => p.uploaded_by)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<District>(entity =>
            {
                entity.ToTable("ds_huyen");
                entity.HasIndex(e => e.ma).IsUnique();
                entity.Property(e => e.ma).IsRequired().HasMaxLength(3);
                entity.Property(e => e.ten).IsRequired().HasMaxLength(100);
                entity.Property(e => e.text).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ma_tinh).IsRequired().HasMaxLength(2);
                entity.Property(e => e.created_at).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne<Province>()
                    .WithMany()
                    .HasForeignKey(d => d.ma_tinh)
                    .HasPrincipalKey(p => p.ma)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Commune>(entity =>
            {
                entity.ToTable("ds_xa");
                entity.HasIndex(e => e.ma).IsUnique();
                entity.Property(e => e.ma).HasMaxLength(5);
                entity.Property(e => e.ten).IsRequired().HasMaxLength(100);
                entity.Property(e => e.text).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ma_huyen).IsRequired().HasMaxLength(3);
                entity.Property(e => e.created_at).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne<District>()
                    .WithMany()
                    .HasForeignKey(c => c.ma_huyen)
                    .HasPrincipalKey(d => d.ma)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
} 