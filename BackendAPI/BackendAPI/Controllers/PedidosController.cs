using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly RestauranteContext _context;

        public PedidosController(RestauranteContext context)
        {
            _context = context;
        }

        // GET: api/Pedidos
        [HttpGet]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
        {
            return await _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.DetallesPedido)
                    .ThenInclude(dp => dp.Producto)
                .OrderByDescending(p => p.FechaPedido)
                .ToListAsync();
        }

        // GET: api/Pedidos/mis-pedidos
        [HttpGet("mis-pedidos")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetMisPedidos()
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            return await _context.Pedidos
                .Include(p => p.DetallesPedido)
                    .ThenInclude(dp => dp.Producto)
                .Where(p => p.UsuarioId == usuarioId)
                .OrderByDescending(p => p.FechaPedido)
                .ToListAsync();
        }

        // GET: api/Pedidos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetPedido(int id)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var pedido = await _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.DetallesPedido)
                    .ThenInclude(dp => dp.Producto)
                .FirstOrDefaultAsync(p => p.PedidoId == id);

            if (pedido == null)
            {
                return NotFound();
            }

            // Solo el propietario del pedido o admin/empleado pueden ver el pedido
            if (pedido.UsuarioId != usuarioId && userRole != "Admin" && userRole != "Empleado")
            {
                return Forbid();
            }

            return pedido;
        }

        // POST: api/Pedidos
        [HttpPost]
        public async Task<ActionResult<Pedido>> PostPedido(Pedido pedido)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            pedido.UsuarioId = usuarioId;
            pedido.FechaPedido = DateTime.UtcNow;
            pedido.Estado = "Pendiente";

            // Calcular totales
            decimal total = 0;
            foreach (var detalle in pedido.DetallesPedido)
            {
                var producto = await _context.Productos.FindAsync(detalle.ProductoId);
                if (producto != null)
                {
                    detalle.PrecioUnitario = producto.Precio;
                    detalle.Subtotal = detalle.Cantidad * detalle.PrecioUnitario;
                    total += detalle.Subtotal;
                }
            }
            pedido.Total = total;

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPedido", new { id = pedido.PedidoId }, pedido);
        }

        // PUT: api/Pedidos/5/estado
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<IActionResult> CambiarEstadoPedido(int id, [FromBody] string nuevoEstado)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
            {
                return NotFound();
            }

            var estadosValidos = new[] { "Pendiente", "EnPreparacion", "Listo", "Entregado", "Cancelado" };
            if (!estadosValidos.Contains(nuevoEstado))
            {
                return BadRequest("Estado inválido");
            }

            pedido.Estado = nuevoEstado;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Pedidos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarPedido(int id)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
            {
                return NotFound();
            }

            // Solo el propietario o admin pueden cancelar
            if (pedido.UsuarioId != usuarioId && userRole != "Admin")
            {
                return Forbid();
            }

            // Solo se puede cancelar si está pendiente
            if (pedido.Estado != "Pendiente")
            {
                return BadRequest("Solo se pueden cancelar pedidos pendientes");
            }

            pedido.Estado = "Cancelado";
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
