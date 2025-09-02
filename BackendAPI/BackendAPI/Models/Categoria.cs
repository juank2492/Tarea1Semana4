using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class Categoria
    {
        [Key]
        public int CategoriaId { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        public bool Activa { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [StringLength(255)]
        public string ImagenUrl { get; set; } = string.Empty;

        // Relaciones
        public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
