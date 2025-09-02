using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    // DTO para crear productos
    public class CreateProductoDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El precio es obligatorio")]
        public decimal Precio { get; set; }

        public bool Disponible { get; set; } = true;

        [StringLength(255)]
        public string? ImagenUrl { get; set; } // Opcional

        [Required(ErrorMessage = "La categoría es obligatoria")]
        public int CategoriaId { get; set; }
    }

    // DTO para actualizar productos
    public class UpdateProductoDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "El precio es obligatorio")]
        public decimal Precio { get; set; }

        public bool Disponible { get; set; } = true;

        [StringLength(255)]
        public string? ImagenUrl { get; set; } // Opcional

        [Required(ErrorMessage = "La categoría es obligatoria")]
        public int CategoriaId { get; set; }
    }

    // DTO para respuestas de productos (evita referencias circulares)
    public class ProductoResponseDto
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public bool Disponible { get; set; }
        public string? ImagenUrl { get; set; }
        public int CategoriaId { get; set; }
        public CategoriaBasicDto? Categoria { get; set; }
    }

    // DTO básico de categoría (sin lista de productos para evitar referencias circulares)
    public class CategoriaBasicDto
    {
        public int CategoriaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }
    }
}
