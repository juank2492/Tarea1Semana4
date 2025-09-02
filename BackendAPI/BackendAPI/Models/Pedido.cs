using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    public class Pedido
    {
        [Key]
        public int PedidoId { get; set; }

        public DateTime FechaPedido { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "Pendiente"; // Pendiente, EnPreparacion, Listo, Entregado, Cancelado

        [Column(TypeName = "decimal(12,2)")]
        public decimal Total { get; set; }

        [StringLength(500)]
        public string Observaciones { get; set; } = string.Empty;

        [StringLength(200)]
        public string DireccionEntrega { get; set; } = string.Empty;

        // Foreign Key
        public int UsuarioId { get; set; }

        // Navigation Properties
        [ForeignKey("UsuarioId")]
        public virtual Usuario Usuario { get; set; } = null!;
        public virtual ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
    }
}
