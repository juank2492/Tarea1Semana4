using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    public class Producto
    {
        [Key]
        public int ProductoId { get; set; }

        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Precio { get; set; }

        public bool Disponible { get; set; } = true;

        [StringLength(255)]
        public string? ImagenUrl { get; set; } = string.Empty; // Opcional

        // Foreign Key
        public int CategoriaId { get; set; }

        // Navigation Properties
        [ForeignKey("CategoriaId")]
        public virtual Categoria Categoria { get; set; } = null!;
        public virtual ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
    }
}
