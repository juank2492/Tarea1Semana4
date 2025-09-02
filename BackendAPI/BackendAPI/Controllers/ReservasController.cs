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
    public class ReservasController : ControllerBase
    {
        private readonly RestauranteContext _context;

        public ReservasController(RestauranteContext context)
        {
            _context = context;
        }

        // GET: api/Reservas
        [HttpGet]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<ActionResult<IEnumerable<Reserva>>> GetReservas()
        {
            return await _context.Reservas
                .Include(r => r.Usuario)
                .OrderBy(r => r.FechaReserva)
                .ThenBy(r => r.HoraReserva)
                .ToListAsync();
        }

        // GET: api/Reservas/mis-reservas
        [HttpGet("mis-reservas")]
        public async Task<ActionResult<IEnumerable<Reserva>>> GetMisReservas()
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            return await _context.Reservas
                .Where(r => r.UsuarioId == usuarioId)
                .OrderBy(r => r.FechaReserva)
                .ThenBy(r => r.HoraReserva)
                .ToListAsync();
        }

        // GET: api/Reservas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reserva>> GetReserva(int id)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var reserva = await _context.Reservas
                .Include(r => r.Usuario)
                .FirstOrDefaultAsync(r => r.ReservaId == id);

            if (reserva == null)
            {
                return NotFound();
            }

            // Solo el propietario de la reserva o admin/empleado pueden ver la reserva
            if (reserva.UsuarioId != usuarioId && userRole != "Admin" && userRole != "Empleado")
            {
                return Forbid();
            }

            return reserva;
        }

        // POST: api/Reservas
        [HttpPost]
        public async Task<ActionResult<Reserva>> PostReserva(Reserva reserva)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            reserva.UsuarioId = usuarioId;
            reserva.FechaCreacion = DateTime.UtcNow;
            reserva.Estado = "Pendiente";

            // Validar que la fecha de reserva sea futura
            var fechaCompleta = reserva.FechaReserva.Date.Add(reserva.HoraReserva);
            if (fechaCompleta <= DateTime.Now)
            {
                return BadRequest("La fecha y hora de reserva debe ser futura");
            }

            // Verificar disponibilidad (ejemplo: máximo 10 reservas por hora)
            var reservasEnHora = await _context.Reservas
                .Where(r => r.FechaReserva.Date == reserva.FechaReserva.Date 
                         && r.HoraReserva == reserva.HoraReserva 
                         && r.Estado != "Cancelada")
                .CountAsync();

            if (reservasEnHora >= 10)
            {
                return BadRequest("No hay disponibilidad para esa fecha y hora");
            }

            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReserva", new { id = reserva.ReservaId }, reserva);
        }

        // PUT: api/Reservas/5/estado
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "Admin,Empleado")]
        public async Task<IActionResult> CambiarEstadoReserva(int id, [FromBody] string nuevoEstado)
        {
            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva == null)
            {
                return NotFound();
            }

            var estadosValidos = new[] { "Pendiente", "Confirmada", "Cancelada", "Completada" };
            if (!estadosValidos.Contains(nuevoEstado))
            {
                return BadRequest("Estado inválido");
            }

            reserva.Estado = nuevoEstado;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Reservas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarReserva(int id)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva == null)
            {
                return NotFound();
            }

            // Solo el propietario o admin pueden cancelar
            if (reserva.UsuarioId != usuarioId && userRole != "Admin")
            {
                return Forbid();
            }

            reserva.Estado = "Cancelada";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Reservas/disponibilidad
        [HttpGet("disponibilidad")]
        public async Task<ActionResult<object>> GetDisponibilidad([FromQuery] DateTime fecha)
        {
            var horasDisponibles = new List<object>();
            var horaInicio = new TimeSpan(12, 0, 0); // 12:00 PM
            var horaFin = new TimeSpan(22, 0, 0);    // 10:00 PM

            for (var hora = horaInicio; hora <= horaFin; hora = hora.Add(TimeSpan.FromHours(1)))
            {
                var reservasEnHora = await _context.Reservas
                    .Where(r => r.FechaReserva.Date == fecha.Date 
                             && r.HoraReserva == hora 
                             && r.Estado != "Cancelada")
                    .CountAsync();

                horasDisponibles.Add(new
                {
                    Hora = hora.ToString(@"hh\:mm"),
                    Disponible = reservasEnHora < 10,
                    ReservasActuales = reservasEnHora
                });
            }

            return Ok(horasDisponibles);
        }
    }
}
