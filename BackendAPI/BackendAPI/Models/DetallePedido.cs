using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    public class DetallePedido
    {
        [Key]
        public int DetallePedidoId { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PrecioUnitario { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal Subtotal { get; set; }

        [StringLength(300)]
        public string ObservacionesItem { get; set; } = string.Empty;

        // Foreign Keys
        public int PedidoId { get; set; }
        public int ProductoId { get; set; }

        // Navigation Properties
        [ForeignKey("PedidoId")]
        public virtual Pedido Pedido { get; set; } = null!;

        [ForeignKey("ProductoId")]
        public virtual Producto Producto { get; set; } = null!;
    }
}
