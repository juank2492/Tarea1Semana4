# API Restaurante - Backend

## Configuración inicial

### 1. Instalar paquetes NuGet
Ejecuta estos comandos en la consola del Administrador de paquetes de Visual Studio:

```
Install-Package Microsoft.EntityFrameworkCore.SqlServer
Install-Package Microsoft.EntityFrameworkCore.Tools
Install-Package Microsoft.EntityFrameworkCore.Design
Install-Package Microsoft.AspNetCore.Authentication.JwtBearer
Install-Package System.IdentityModel.Tokens.Jwt
```

### 2. Configurar SQL Server
- Asegúrate de tener SQL Server ejecutándose
- La cadena de conexión está configurada para: `Server=localhost;Database=RestauranteDB;User Id=sa;Password=123456`

### 3. Crear la base de datos
Ejecuta estos comandos en la consola del Administrador de paquetes:

```
Add-Migration InitialCreate
Update-Database
```

## Endpoints disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Categorías
- `GET /api/categorias` - Obtener todas las categorías
- `GET /api/categorias/{id}` - Obtener categoría por ID
- `POST /api/categorias` - Crear categoría (Admin)
- `PUT /api/categorias/{id}` - Actualizar categoría (Admin)
- `DELETE /api/categorias/{id}` - Eliminar categoría (Admin)

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/categoria/{categoriaId}` - Productos por categoría
- `GET /api/productos/{id}` - Obtener producto por ID
- `POST /api/productos` - Crear producto (Admin)
- `PUT /api/productos/{id}` - Actualizar producto (Admin)
- `DELETE /api/productos/{id}` - Eliminar producto (Admin)

### Pedidos
- `GET /api/pedidos` - Obtener todos los pedidos (Admin/Empleado)
- `GET /api/pedidos/mis-pedidos` - Pedidos del usuario actual
- `GET /api/pedidos/{id}` - Obtener pedido por ID
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/{id}/estado` - Cambiar estado (Admin/Empleado)
- `DELETE /api/pedidos/{id}` - Cancelar pedido

### Reservas
- `GET /api/reservas` - Obtener todas las reservas (Admin/Empleado)
- `GET /api/reservas/mis-reservas` - Reservas del usuario actual
- `GET /api/reservas/{id}` - Obtener reserva por ID
- `GET /api/reservas/disponibilidad?fecha={fecha}` - Ver disponibilidad
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/{id}/estado` - Cambiar estado (Admin/Empleado)
- `DELETE /api/reservas/{id}` - Cancelar reserva

## Configuración para Angular

La API está configurada para aceptar requests desde:
- `http://localhost:4200` (Angular dev server)
- `https://localhost:4200`

### Headers requeridos para autenticación
```
Authorization: Bearer {token}
```

## Modelos de datos

### Usuario
- UsuarioId (int)
- NombreUsuario (string)
- Email (string)
- PasswordHash (string)
- Rol (string): "Admin", "Empleado", "Cliente"
- FechaRegistro (DateTime)

### Categoria
- CategoriaId (int)
- Nombre (string)
- Descripcion (string)
- Activa (bool)
- FechaCreacion (DateTime)
- ImagenUrl (string)

### Producto
- ProductoId (int)
- Nombre (string)
- Descripcion (string)
- Precio (decimal)
- Disponible (bool)
- ImagenUrl (string)
- CategoriaId (int)

### Pedido
- PedidoId (int)
- FechaPedido (DateTime)
- Estado (string): "Pendiente", "EnPreparacion", "Listo", "Entregado", "Cancelado"
- Total (decimal)
- Observaciones (string)
- DireccionEntrega (string)
- UsuarioId (int)

### DetallePedido
- DetallePedidoId (int)
- Cantidad (int)
- PrecioUnitario (decimal)
- Subtotal (decimal)
- ObservacionesItem (string)
- PedidoId (int)
- ProductoId (int)

### Reserva
- ReservaId (int)
- FechaReserva (DateTime)
- HoraReserva (TimeSpan)
- NumeroPersonas (int)
- Estado (string): "Pendiente", "Confirmada", "Cancelada", "Completada"
- ObservacionesEspeciales (string)
- FechaCreacion (DateTime)
- UsuarioId (int)

## Ejemplo de uso con Postman/Thunder Client

### 1. Registrar usuario
```json
POST /api/auth/register
{
    "nombreUsuario": "admin",
    "email": "admin@restaurante.com",
    "password": "123456",
    "rol": "Admin"
}
```

### 2. Iniciar sesión
```json
POST /api/auth/login
{
    "email": "admin@restaurante.com",
    "password": "123456"
}
```

### 3. Crear producto (con token)
```json
POST /api/productos
Authorization: Bearer {token}
{
    "nombre": "Pizza Margherita",
    "descripcion": "Pizza con tomate, mozzarella y albahaca",
    "precio": 15.99,
    "disponible": true,
    "imagenUrl": "",
    "categoriaId": 2
}
```
