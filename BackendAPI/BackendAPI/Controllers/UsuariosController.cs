using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Data;
using BackendAPI.Models;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly RestauranteContext _context;

        public UsuariosController(RestauranteContext context)
        {
            _context = context;
        }

        // GET: api/usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios
                .Select(u => new Usuario
                {
                    UsuarioId = u.UsuarioId,
                    NombreUsuario = u.NombreUsuario,
                    Email = u.Email,
                    Rol = u.Rol,
                    FechaRegistro = u.FechaRegistro
                    // No incluir PasswordHash por seguridad
                })
                .ToListAsync();
        }

        // GET: api/usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios
                .Where(u => u.UsuarioId == id)
                .Select(u => new Usuario
                {
                    UsuarioId = u.UsuarioId,
                    NombreUsuario = u.NombreUsuario,
                    Email = u.Email,
                    Rol = u.Rol,
                    FechaRegistro = u.FechaRegistro
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario;
        }

        // POST: api/usuarios
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            // Validar que no exista el email
            if (await _context.Usuarios.AnyAsync(u => u.Email == usuario.Email))
            {
                return BadRequest(new { message = "El email ya está registrado" });
            }

            // Hash de la contraseña (asumiendo que viene en PasswordHash)
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(usuario.PasswordHash);
            usuario.FechaRegistro = DateTime.UtcNow;

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Retornar sin el PasswordHash
            var usuarioResponse = new Usuario
            {
                UsuarioId = usuario.UsuarioId,
                NombreUsuario = usuario.NombreUsuario,
                Email = usuario.Email,
                Rol = usuario.Rol,
                FechaRegistro = usuario.FechaRegistro
            };

            return CreatedAtAction("GetUsuario", new { id = usuario.UsuarioId }, usuarioResponse);
        }

        // PUT: api/usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {
            if (id != usuario.UsuarioId)
            {
                return BadRequest();
            }

            var existingUsuario = await _context.Usuarios.FindAsync(id);
            if (existingUsuario == null)
            {
                return NotFound();
            }

            // Actualizar solo los campos permitidos
            existingUsuario.NombreUsuario = usuario.NombreUsuario;
            existingUsuario.Email = usuario.Email;
            existingUsuario.Rol = usuario.Rol;

            // Si se proporciona una nueva contraseña
            if (!string.IsNullOrEmpty(usuario.PasswordHash))
            {
                existingUsuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(usuario.PasswordHash);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UsuarioExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UsuarioExists(int id)
        {
            return _context.Usuarios.Any(e => e.UsuarioId == id);
        }
    }
}
