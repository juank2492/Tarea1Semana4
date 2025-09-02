using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Services;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly RestauranteContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(RestauranteContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto loginDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (usuario == null || !PasswordHasher.VerifyPassword(loginDto.Password, usuario.PasswordHash))
            {
                return Unauthorized(new { message = "Credenciales inválidas" });
            }

            var token = _jwtService.GenerateToken(usuario);
            var expiration = DateTime.UtcNow.AddMinutes(60);

            return Ok(new LoginResponseDto
            {
                Token = token,
                NombreUsuario = usuario.NombreUsuario,
                Email = usuario.Email,
                Rol = usuario.Rol,
                Expiration = expiration
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponseDto>> Register(RegisterDto registerDto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest(new { message = "El email ya está registrado" });
            }

            var usuario = new Usuario
            {
                NombreUsuario = registerDto.NombreUsuario,
                Email = registerDto.Email,
                PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                Rol = registerDto.Rol,
                FechaRegistro = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(usuario);
            var expiration = DateTime.UtcNow.AddMinutes(60);

            return Ok(new LoginResponseDto
            {
                Token = token,
                NombreUsuario = usuario.NombreUsuario,
                Email = usuario.Email,
                Rol = usuario.Rol,
                Expiration = expiration
            });
        }
    }
}
