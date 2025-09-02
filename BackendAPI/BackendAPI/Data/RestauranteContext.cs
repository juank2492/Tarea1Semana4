using Microsoft.EntityFrameworkCore;
using BackendAPI.Models;

namespace BackendAPI.Data
{
    public class RestauranteContext : DbContext
    {
        public RestauranteContext(DbContextOptions<RestauranteContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallesPedido { get; set; }
        public DbSet<Reserva> Reservas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales si son necesarias
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<DetallePedido>()
                .HasOne(dp => dp.Pedido)
                .WithMany(p => p.DetallesPedido)
                .HasForeignKey(dp => dp.PedidoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DetallePedido>()
                .HasOne(dp => dp.Producto)
                .WithMany(p => p.DetallesPedido)
                .HasForeignKey(dp => dp.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Datos iniciales
            modelBuilder.Entity<Categoria>().HasData(
                new Categoria { CategoriaId = 1, Nombre = "Entradas", Descripcion = "Platos de entrada", Activa = true },
                new Categoria { CategoriaId = 2, Nombre = "Platos Principales", Descripcion = "Platos principales", Activa = true },
                new Categoria { CategoriaId = 3, Nombre = "Postres", Descripcion = "Postres y dulces", Activa = true },
                new Categoria { CategoriaId = 4, Nombre = "Bebidas", Descripcion = "Bebidas frías y calientes", Activa = true }
            );
        }
    }
}
