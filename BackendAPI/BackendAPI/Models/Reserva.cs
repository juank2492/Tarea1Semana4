using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    public class Reserva
    {
        [Key]
        public int ReservaId { get; set; }

        [Required]
        public DateTime FechaReserva { get; set; }

        [Required]
        public TimeSpan HoraReserva { get; set; }

        [Required]
        public int NumeroPersonas { get; set; }

        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "Pendiente"; // Pendiente, Confirmada, Cancelada, Completada

        [StringLength(500)]
        public string ObservacionesEspeciales { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Foreign Key
        public int UsuarioId { get; set; }

        // Navigation Properties
        [ForeignKey("UsuarioId")]
        public virtual Usuario Usuario { get; set; } = null!;
    }
}
