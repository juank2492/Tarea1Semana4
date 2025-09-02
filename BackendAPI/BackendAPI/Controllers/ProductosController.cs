using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly RestauranteContext _context;

        public ProductosController(RestauranteContext context)
        {
            _context = context;
        }

        // GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoResponseDto>>> GetProductos()
        {
            var productos = await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.Disponible)
                .Select(p => new ProductoResponseDto
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Disponible = p.Disponible,
                    ImagenUrl = p.ImagenUrl,
                    CategoriaId = p.CategoriaId,
                    Categoria = new CategoriaBasicDto
                    {
                        CategoriaId = p.Categoria.CategoriaId,
                        Nombre = p.Categoria.Nombre,
                        Descripcion = p.Categoria.Descripcion,
                        ImagenUrl = p.Categoria.ImagenUrl
                    }
                })
                .ToListAsync();

            return productos;
        }

        // GET: api/Productos/categoria/5
        [HttpGet("categoria/{categoriaId}")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDto>>> GetProductosPorCategoria(int categoriaId)
        {
            var productos = await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.CategoriaId == categoriaId && p.Disponible)
                .Select(p => new ProductoResponseDto
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Disponible = p.Disponible,
                    ImagenUrl = p.ImagenUrl,
                    CategoriaId = p.CategoriaId,
                    Categoria = new CategoriaBasicDto
                    {
                        CategoriaId = p.Categoria.CategoriaId,
                        Nombre = p.Categoria.Nombre,
                        Descripcion = p.Categoria.Descripcion,
                        ImagenUrl = p.Categoria.ImagenUrl
                    }
                })
                .ToListAsync();

            return productos;
        }

        // GET: api/Productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoResponseDto>> GetProducto(int id)
        {
            var producto = await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.ProductoId == id)
                .Select(p => new ProductoResponseDto
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Disponible = p.Disponible,
                    ImagenUrl = p.ImagenUrl,
                    CategoriaId = p.CategoriaId,
                    Categoria = new CategoriaBasicDto
                    {
                        CategoriaId = p.Categoria.CategoriaId,
                        Nombre = p.Categoria.Nombre,
                        Descripcion = p.Categoria.Descripcion,
                        ImagenUrl = p.Categoria.ImagenUrl
                    }
                })
                .FirstOrDefaultAsync();

            if (producto == null)
            {
                return NotFound();
            }

            return producto;
        }

        // PUT: api/Productos/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutProducto(int id, UpdateProductoDto updateProductoDto)
        {
            try
            {
                // Verificar que el producto existe
                var existingProducto = await _context.Productos.FindAsync(id);
                if (existingProducto == null)
                {
                    return NotFound();
                }

                // Verificar que la categoría existe
                var categoria = await _context.Categorias.FindAsync(updateProductoDto.CategoriaId);
                if (categoria == null)
                {
                    return BadRequest(new { message = "La categoría especificada no existe" });
                }

                // Actualizar las propiedades
                existingProducto.Nombre = updateProductoDto.Nombre;
                existingProducto.Descripcion = updateProductoDto.Descripcion;
                existingProducto.Precio = updateProductoDto.Precio;
                existingProducto.Disponible = updateProductoDto.Disponible;
                existingProducto.ImagenUrl = updateProductoDto.ImagenUrl ?? string.Empty;
                existingProducto.CategoriaId = updateProductoDto.CategoriaId;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al actualizar el producto", details = ex.Message });
            }
        }
        

        // POST: api/Productos
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductoResponseDto>> PostProducto(CreateProductoDto createProductoDto)
        {
            try
            {
                // Verificar que la categoría existe
                var categoria = await _context.Categorias.FindAsync(createProductoDto.CategoriaId);
                if (categoria == null)
                {
                    return BadRequest(new { message = "La categoría especificada no existe" });
                }

                // Crear el producto usando el DTO
                var producto = new Producto
                {
                    Nombre = createProductoDto.Nombre,
                    Descripcion = createProductoDto.Descripcion,
                    Precio = createProductoDto.Precio,
                    Disponible = createProductoDto.Disponible,
                    ImagenUrl = createProductoDto.ImagenUrl ?? string.Empty,
                    CategoriaId = createProductoDto.CategoriaId
                };
                
                _context.Productos.Add(producto);
                await _context.SaveChangesAsync();

                // Crear el DTO de respuesta sin referencias circulares
                var productoResponse = new ProductoResponseDto
                {
                    ProductoId = producto.ProductoId,
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion,
                    Precio = producto.Precio,
                    Disponible = producto.Disponible,
                    ImagenUrl = producto.ImagenUrl,
                    CategoriaId = producto.CategoriaId,
                    Categoria = new CategoriaBasicDto
                    {
                        CategoriaId = categoria.CategoriaId,
                        Nombre = categoria.Nombre,
                        Descripcion = categoria.Descripcion,
                        ImagenUrl = categoria.ImagenUrl
                    }
                };

                return CreatedAtAction("GetProducto", new { id = producto.ProductoId }, productoResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al crear el producto", details = ex.Message });
            }
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            producto.Disponible = false; // Soft delete
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(e => e.ProductoId == id);
        }
    }
}
