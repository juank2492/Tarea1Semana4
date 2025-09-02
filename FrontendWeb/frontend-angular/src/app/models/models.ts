// Interfaces para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  rol?: string;
}

export interface CreateUsuarioRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  nombreUsuario: string;
  email: string;
  rol: string;
  expiration: string;
}

export interface Usuario {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  rol: string;
  fechaRegistro: string;
}

// Modelos del restaurante
export interface Categoria {
  categoriaId: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  fechaCreacion: string;
  imagenUrl: string;
  productos?: Producto[];
}

export interface Producto {
  productoId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
  imagenUrl?: string; // Opcional
  categoriaId: number;
  categoria?: Categoria;
}

// DTO para crear productos
export interface CreateProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
  imagenUrl?: string; // Opcional
  categoriaId: number;
}

export interface DetallePedido {
  detallePedidoId?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  observacionesItem?: string;
  pedidoId?: number;
  productoId: number;
  producto?: Producto;
}

export interface Pedido {
  pedidoId?: number;
  fechaPedido: string;
  estado: string;
  total: number;
  observaciones?: string;
  direccionEntrega?: string;
  usuarioId?: number;
  usuario?: Usuario;
  detallesPedido: DetallePedido[];
}

export interface CreatePedidoRequest {
  observaciones?: string;
  direccionEntrega?: string;
  detallesPedido: {
    cantidad: number;
    productoId: number;
    observacionesItem?: string;
  }[];
}

export interface Reserva {
  reservaId?: number;
  fechaReserva: string;
  horaReserva: string;
  numeroPersonas: number;
  estado: string;
  observacionesEspeciales?: string;
  fechaCreacion?: string;
  usuarioId?: number;
  usuario?: Usuario;
}

export interface CreateReservaRequest {
  fechaReserva: string;
  horaReserva: string;
  numeroPersonas: number;
  observacionesEspeciales?: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
  descripcion: string;
  imagenUrl?: string;
}

export interface CreateProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: number;
  imagenUrl?: string;
}

export interface DisponibilidadHora {
  hora: string;
  disponible: boolean;
  reservasActuales: number;
}

// Interfaz para el carrito de compras
export interface CartItem {
  producto: Producto;
  cantidad: number;
  observaciones?: string;
}

// Estados posibles
export type EstadoPedido = 'Pendiente' | 'EnPreparacion' | 'Listo' | 'Entregado' | 'Cancelado';
export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
export type Rol = 'Admin' | 'Empleado' | 'Cliente';
