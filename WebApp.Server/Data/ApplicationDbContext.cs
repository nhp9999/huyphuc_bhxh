using Microsoft.EntityFrameworkCore;
using WebApp.API.Models;
using System.ComponentModel.DataAnnotations.Schema;
using WebApp.Server.Models;
using WebApp.API.Models.BienlaiDienTu;

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
        public DbSet<DanhMucTinh> DanhMucTinhs { get; set; }
        public DbSet<DanhMucHuyen> DanhMucHuyens { get; set; }
        public DbSet<DanhMucXa> DanhMucXas { get; set; }
        public DbSet<DotKeKhai> DotKeKhais { get; set; }
        public DbSet<KeKhaiBHYT> KeKhaiBHYTs { get; set; }
        public DbSet<ThongTinThe> ThongTinThes { get; set; }
        public DbSet<DanhMucCSKCB> DanhMucCSKCBs { get; set; }
        public DbSet<DonVi> DonVis { get; set; }
        public DbSet<HoaDonThanhToan> HoaDonThanhToans { get; set; }
        public DbSet<NguoiDung> NguoiDungs { get; set; }
        public DbSet<DaiLy> DaiLys { get; set; }
        public DbSet<DaiLyDonVi> DaiLyDonVis { get; set; }
        public DbSet<QuyenBienLai> QuyenBienLais { get; set; }
        public DbSet<BienLai> BienLais { get; set; }
        public DbSet<KeKhaiBHXH> KeKhaiBHXHs { get; set; }
        public DbSet<QuyenBienLaiDienTu> QuyenBienLaiDienTus { get; set; }
        public DbSet<BienLaiDienTu> BienLaiDienTus { get; set; }
        public DbSet<VNPTAccount> VNPTAccounts { get; set; }

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

            modelBuilder.Entity<DanhMucHuyen>(entity =>
            {
                entity.ToTable("ds_huyen");
                entity.HasIndex(e => e.ma).IsUnique();
                entity.Property(e => e.ma).IsRequired().HasMaxLength(3);
                entity.Property(e => e.ten).IsRequired().HasMaxLength(100);
                entity.Property(e => e.text).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ma_tinh).IsRequired().HasMaxLength(2);
                entity.Property(e => e.created_at).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne<DanhMucTinh>()
                    .WithMany()
                    .HasForeignKey(d => d.ma_tinh)
                    .HasPrincipalKey(p => p.ma)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DanhMucXa>(entity =>
            {
                entity.ToTable("ds_xa");
                entity.HasIndex(e => e.ma).IsUnique();
                entity.Property(e => e.ma).HasMaxLength(5);
                entity.Property(e => e.ten).IsRequired().HasMaxLength(100);
                entity.Property(e => e.text).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ma_huyen).IsRequired().HasMaxLength(3);
                entity.Property(e => e.created_at).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne<DanhMucHuyen>()
                    .WithMany()
                    .HasForeignKey(c => c.ma_huyen)
                    .HasPrincipalKey(d => d.ma)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DotKeKhai>(entity =>
            {
                entity.ToTable("dot_ke_khai");

                entity.HasKey(e => e.id);

                // Cấu hình quan hệ với DaiLy
                entity.HasOne(d => d.DaiLy)
                    .WithMany()
                    .HasForeignKey(d => d.dai_ly_id)
                    .OnDelete(DeleteBehavior.Restrict);

                // Cấu hình quan hệ với DonVi
                entity.HasOne(d => d.DonVi)
                    .WithMany()
                    .HasForeignKey(d => d.don_vi_id)
                    .OnDelete(DeleteBehavior.Restrict);

                // Các cấu hình khác
                entity.Property(e => e.ten_dot).HasMaxLength(200);
                entity.Property(e => e.dich_vu).HasMaxLength(10);
                entity.Property(e => e.ghi_chu).HasMaxLength(500);
                entity.Property(e => e.trang_thai).HasDefaultValue("chua_gui");
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<KeKhaiBHYT>(entity =>
            {
                entity.ToTable("ke_khai_bhyt");

                entity.Property(e => e.nguoi_tao).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.dot_ke_khai_id).HasColumnName("dot_ke_khai_id");

                entity.HasOne(k => k.DotKeKhai)
                    .WithMany(d => d.KeKhaiBHYTs)
                    .HasForeignKey(k => k.dot_ke_khai_id)
                    .HasConstraintName("FK_KeKhaiBHYT_DotKeKhai")
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(k => k.ThongTinThe)
                    .WithMany()
                    .HasForeignKey(k => k.thong_tin_the_id)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(k => k.QuyenBienLai)
                    .WithMany()
                    .HasForeignKey(k => k.quyen_bien_lai_id);
            });

            modelBuilder.Entity<ThongTinThe>(entity =>
            {
                entity.ToTable("thong_tin_the");

                entity.HasIndex(e => e.ma_so_bhxh).IsUnique();
                entity.HasIndex(e => e.cccd).IsUnique();

                entity.Property(e => e.nguoi_tao).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Cấu hình cho ma_tinh_ks không bắt buộc
                entity.Property(e => e.ma_tinh_ks).IsRequired(false);
            });

            modelBuilder.Entity<DanhMucCSKCB>(entity =>
            {
                entity.ToTable("dm_cskcb");
                entity.HasKey(e => e.id);
            });

            modelBuilder.Entity<DonVi>(entity =>
            {
                entity.ToTable("don_vi");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.MaCoQuanBHXH).IsRequired().HasMaxLength(10);
                entity.Property(e => e.MaSoBHXH).IsRequired().HasMaxLength(10);
                entity.Property(e => e.TenDonVi).IsRequired().HasMaxLength(255);
                entity.Property(e => e.TrangThai).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<HoaDonThanhToan>(entity =>
            {
                entity.ToTable("hoa_don_thanh_toan");
                entity.HasKey(e => e.id);

                entity.Property(e => e.ghi_chu).IsRequired(false);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ngay_thanh_toan).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.trang_thai).HasDefaultValue("cho_duyet");

                entity.HasOne(h => h.DotKeKhai)
                    .WithMany()
                    .HasForeignKey(h => h.dot_ke_khai_id)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<NguoiDung>(entity =>
            {
                entity.ToTable("nguoi_dung");
                entity.HasKey(e => e.id);

                entity.HasIndex(e => e.user_name).IsUnique();
                entity.Property(e => e.user_name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ho_ten).IsRequired().HasMaxLength(100);
                entity.Property(e => e.don_vi_cong_tac).HasMaxLength(200);
                entity.Property(e => e.chuc_danh).HasMaxLength(100);
                entity.Property(e => e.email).HasMaxLength(100);
                entity.Property(e => e.so_dien_thoai).HasMaxLength(20);
                entity.Property(e => e.roles).HasColumnType("text[]");
                entity.Property(e => e.client_id).HasMaxLength(100);
                entity.Property(e => e.status).HasDefaultValue(1);
                entity.Property(e => e.created_at).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.updated_at).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<DaiLy>(entity =>
            {
                entity.ToTable("dai_ly");
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.Ma).IsUnique();
                entity.Property(e => e.Ma).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Ten).IsRequired().HasMaxLength(200);
                entity.Property(e => e.DiaChi).HasMaxLength(500);
                entity.Property(e => e.SoDienThoai).HasMaxLength(15);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.NguoiDaiDien).HasMaxLength(100);
                entity.Property(e => e.TrangThai).HasDefaultValue(true);
                entity.Property(e => e.NgayTao).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.NguoiTao).HasMaxLength(50);
            });

            // Cấu hình mối quan hệ nhiều-nhiều
            modelBuilder.Entity<DaiLyDonVi>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<DaiLyDonVi>()
                .HasOne(x => x.DaiLy)
                .WithMany()
                .HasForeignKey(x => x.DaiLyId);

            modelBuilder.Entity<DaiLyDonVi>()
                .HasOne(x => x.DonVi)
                .WithMany()
                .HasForeignKey(x => x.DonViId);

            modelBuilder.Entity<QuyenBienLai>(entity =>
            {
                entity.ToTable("quyen_bien_lai");
                entity.HasKey(e => e.id);

                entity.Property(e => e.quyen_so).IsRequired().HasMaxLength(20);
                entity.Property(e => e.tu_so).IsRequired().HasMaxLength(20);
                entity.Property(e => e.den_so).IsRequired().HasMaxLength(20);
                entity.Property(e => e.nguoi_cap).IsRequired().HasMaxLength(50);
                entity.Property(e => e.trang_thai).HasMaxLength(20);
                entity.Property(e => e.so_hien_tai).HasMaxLength(20);

                entity.Property(e => e.ngay_cap)
                    .HasColumnType("timestamp without time zone")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.NguoiThu)
                    .WithMany()
                    .HasForeignKey(e => e.nhan_vien_thu)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure BienLai
            modelBuilder.Entity<BienLai>(entity =>
            {
                entity.ToTable("bien_lai");

                entity.HasOne(b => b.KeKhaiBHYT)
                      .WithOne(k => k.BienLai)
                      .HasForeignKey<BienLai>(b => b.ke_khai_bhyt_id)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // QuyenBienLaiDienTu configuration
            modelBuilder.Entity<QuyenBienLaiDienTu>(entity =>
            {
                entity.ToTable("quyen_bien_lai_dien_tu");
                entity.HasKey(e => e.id);

                entity.Property(e => e.ky_hieu).IsRequired().HasMaxLength(20);
                entity.Property(e => e.tu_so).IsRequired().HasMaxLength(20);
                entity.Property(e => e.den_so).IsRequired().HasMaxLength(20);
                entity.Property(e => e.nguoi_cap).IsRequired().HasMaxLength(50);
                entity.Property(e => e.trang_thai).IsRequired().HasMaxLength(20);
                entity.Property(e => e.so_hien_tai).HasMaxLength(20);
                entity.Property(e => e.ngay_cap).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // BienLaiDienTu configuration
            modelBuilder.Entity<BienLaiDienTu>(entity =>
            {
                entity.ToTable("bien_lai_dien_tu");
                entity.HasKey(e => e.id);

                entity.Property(e => e.ky_hieu).IsRequired().HasMaxLength(20);
                entity.Property(e => e.so_bien_lai).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ten_nguoi_dong).IsRequired().HasMaxLength(200);
                entity.Property(e => e.so_tien).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ghi_chu).HasMaxLength(500);
                entity.Property(e => e.trang_thai).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ngay_tao).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ngay_bien_lai).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ma_so_bhxh).IsRequired().HasMaxLength(10);
                entity.Property(e => e.ma_nhan_vien).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ma_co_quan_bhxh).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ma_so_bhxh_don_vi).IsRequired().HasMaxLength(10);

                entity.HasOne(b => b.KeKhaiBHYT)
                    .WithMany()
                    .HasForeignKey(b => b.ke_khai_bhyt_id)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.QuyenBienLaiDienTu)
                    .WithMany()
                    .HasForeignKey(b => b.quyen_bien_lai_dien_tu_id)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // VNPTAccount configuration
            modelBuilder.Entity<VNPTAccount>(entity =>
            {
                entity.ToTable("vnpt_accounts");
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.MaNhanVien).IsUnique();
                entity.Property(e => e.MaNhanVien).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Account).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ACPass).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Pattern).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Serial).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ServiceUrl).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
}