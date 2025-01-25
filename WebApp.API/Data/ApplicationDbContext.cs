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
        public DbSet<DotKeKhai> DotKeKhais { get; set; }
        public DbSet<KeKhaiBHYT> KeKhaiBHYTs { get; set; }
        public DbSet<ThongTinThe> ThongTinThes { get; set; }

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

            modelBuilder.Entity<DotKeKhai>(entity =>
            {
                entity.ToTable("dot_ke_khai");

                entity.Property(e => e.ten_dot).IsRequired().HasMaxLength(200);
                entity.Property(e => e.so_dot).IsRequired();
                entity.Property(e => e.thang).IsRequired();
                entity.Property(e => e.nam).IsRequired();
                entity.Property(e => e.dich_vu).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ghi_chu).HasMaxLength(500);
                entity.Property(e => e.trang_thai).HasDefaultValue(true);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.nguoi_tao).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<KeKhaiBHYT>(entity =>
            {
                entity.ToTable("ke_khai_bhyt");

                entity.Property(e => e.nguoi_tao).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(k => k.DotKeKhai)
                    .WithMany()
                    .HasForeignKey(k => k.dot_ke_khai_id)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(k => k.ThongTinThe)
                    .WithMany()
                    .HasForeignKey(k => k.thong_tin_the_id)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ThongTinThe>(entity =>
            {
                entity.ToTable("thong_tin_the");

                entity.HasIndex(e => e.ma_so_bhxh).IsUnique();
                entity.HasIndex(e => e.cccd).IsUnique();

                entity.Property(e => e.nguoi_tao).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
} 