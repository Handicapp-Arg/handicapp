import { apiClient } from '@/lib/http';
import { logger } from '@/lib/utils/logger';

// ==================== API RESPONSE INTERFACES ====================

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== INTERFACES ====================

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  categoria_nombre: string;
  unidad_medida: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'bolsa';
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  precio_unitario: number;
  ubicacion?: string;
  proveedor_id?: number;
  proveedor_nombre?: string;
  estado: 'activo' | 'inactivo' | 'descontinuado';
  fecha_ultima_compra?: string;
  fecha_vencimiento?: string;
  imagen_url?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface CrearProductoDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  unidad_medida: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'bolsa';
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  precio_unitario: number;
  ubicacion?: string;
  proveedor_id?: number;
  fecha_vencimiento?: string;
  observaciones?: string;
}

export interface ActualizarProductoDTO {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  categoria_id?: number;
  unidad_medida?: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'bolsa';
  stock_minimo?: number;
  stock_maximo?: number;
  precio_unitario?: number;
  ubicacion?: string;
  proveedor_id?: number;
  estado?: 'activo' | 'inactivo' | 'descontinuado';
  fecha_vencimiento?: string;
  observaciones?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  total_productos: number;
  activo: boolean;
}

export interface Proveedor {
  id: number;
  nombre: string;
  razon_social: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  estado: 'activo' | 'inactivo';
  total_productos: number;
  ultima_compra?: string;
}

export interface Movimiento {
  id: number;
  producto_id: number;
  producto_nombre: string;
  producto_codigo: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolucion' | 'merma';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  precio_unitario?: number;
  monto_total?: number;
  motivo: string;
  proveedor_id?: number;
  proveedor_nombre?: string;
  usuario_id: number;
  usuario_nombre: string;
  referencia?: string;
  fecha: string;
  observaciones?: string;
  created_at: string;
}

export interface CrearMovimientoDTO {
  producto_id: number;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolucion' | 'merma';
  cantidad: number;
  precio_unitario?: number;
  motivo: string;
  proveedor_id?: number;
  referencia?: string;
  observaciones?: string;
}

export interface AlertaStock {
  id: number;
  producto_id: number;
  producto_nombre: string;
  producto_codigo: string;
  categoria_nombre: string;
  stock_actual: number;
  stock_minimo: number;
  diferencia: number;
  porcentaje: number;
  tipo: 'critico' | 'bajo' | 'normal' | 'alto';
  fecha_deteccion: string;
}

export interface EstadisticasInventario {
  total_productos: number;
  productos_activos: number;
  productos_inactivos: number;
  total_categorias: number;
  valor_inventario: number;
  alertas_stock: number;
  movimientos_mes: number;
  productos_sin_stock: number;
  productos_proximos_vencer: number;
}

export interface ProductoPorCategoria {
  categoria_id: number;
  categoria_nombre: string;
  total_productos: number;
  valor_total: number;
  porcentaje: number;
}

export interface MovimientosPorTipo {
  tipo: string;
  cantidad_movimientos: number;
  cantidad_total: number;
  valor_total: number;
  porcentaje: number;
}

export interface FiltrosProductos {
  categoria_id?: number;
  proveedor_id?: number;
  estado?: 'activo' | 'inactivo' | 'descontinuado';
  stock_bajo?: boolean;
  busqueda?: string;
}

export interface FiltrosMovimientos {
  producto_id?: number;
  tipo?: 'entrada' | 'salida' | 'ajuste' | 'devolucion' | 'merma';
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
}

// ==================== MOCK DATA ====================

const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Alimentos', descripcion: 'Alimentos para caballos', color: 'bg-green-100 text-green-800', icono: '🌾', total_productos: 15, activo: true },
  { id: 2, nombre: 'Medicamentos', descripcion: 'Medicamentos veterinarios', color: 'bg-red-100 text-red-800', icono: '💊', total_productos: 8, activo: true },
  { id: 3, nombre: 'Equipamiento', descripcion: 'Equipos y herramientas', color: 'bg-blue-100 text-blue-800', icono: '🔧', total_productos: 12, activo: true },
  { id: 4, nombre: 'Limpieza', descripcion: 'Productos de limpieza', color: 'bg-purple-100 text-purple-800', icono: '🧹', total_productos: 6, activo: true },
  { id: 5, nombre: 'Veterinaria', descripcion: 'Insumos veterinarios', color: 'bg-orange-100 text-orange-800', icono: '🏥', total_productos: 10, activo: true },
];

const mockProveedores: Proveedor[] = [
  {
    id: 1,
    nombre: 'AgriFood SA',
    razon_social: 'Agri Food Sociedad Anónima',
    cuit: '30-12345678-9',
    email: 'ventas@agrifood.com',
    telefono: '+54 11 4567-8900',
    direccion: 'Av. del Libertador 1234',
    ciudad: 'Buenos Aires',
    provincia: 'Buenos Aires',
    contacto_nombre: 'Juan Pérez',
    contacto_telefono: '+54 11 4567-8901',
    estado: 'activo',
    total_productos: 8,
    ultima_compra: '2025-10-15',
  },
  {
    id: 2,
    nombre: 'VetSupply',
    razon_social: 'Veterinaria Supply SRL',
    cuit: '30-98765432-1',
    email: 'info@vetsupply.com',
    telefono: '+54 11 5678-9012',
    direccion: 'Calle Veterinaria 567',
    ciudad: 'La Plata',
    provincia: 'Buenos Aires',
    contacto_nombre: 'María García',
    contacto_telefono: '+54 11 5678-9013',
    estado: 'activo',
    total_productos: 12,
    ultima_compra: '2025-10-18',
  },
  {
    id: 3,
    nombre: 'Equipo Total',
    razon_social: 'Equipo Total Argentina SA',
    cuit: '30-11223344-5',
    email: 'contacto@equipototal.com',
    telefono: '+54 11 6789-0123',
    direccion: 'Ruta 9 Km 45',
    ciudad: 'Pilar',
    provincia: 'Buenos Aires',
    contacto_nombre: 'Carlos López',
    contacto_telefono: '+54 11 6789-0124',
    estado: 'activo',
    total_productos: 15,
    ultima_compra: '2025-10-10',
  },
];

// ==================== SERVICE CLASS ====================

class InventarioService {
  // ==================== PRODUCTOS ====================

  async getProductos(filtros?: FiltrosProductos): Promise<Producto[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.categoria_id) params.append('categoria_id', filtros.categoria_id.toString());
      if (filtros?.proveedor_id) params.append('proveedor_id', filtros.proveedor_id.toString());
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.stock_bajo) params.append('stock_bajo', 'true');
      if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);

      const queryString = params.toString();
      const url = `/establecimiento/inventario/productos${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<ApiResponse<Producto[]> | Producto[]>(url);
      return Array.isArray(response) ? response : response.data;
    } catch (error) {
      console.error('Error fetching productos:', error);
      return [];
    }
  }

  async getProducto(id: number): Promise<Producto | null> {
    try {
      const response = await apiClient.get<ApiResponse<Producto> | Producto>(`/establecimiento/inventario/productos/${id}`);
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error(`Error fetching producto ${id}:`, error);
      return null;
    }
  }

  async crearProducto(data: CrearProductoDTO): Promise<Producto | null> {
    try {
      const response = await apiClient.post<ApiResponse<Producto> | Producto>('/establecimiento/inventario/productos', data);
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error('Error creating producto:', error);
      return null;
    }
  }

  async actualizarProducto(id: number, data: ActualizarProductoDTO): Promise<Producto | null> {
    try{
      const response = await apiClient.put<ApiResponse<Producto> | Producto>(`/establecimiento/inventario/productos/${id}`, data);
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error(`Error updating producto ${id}:`, error);
      return null;
    }
  }

  async eliminarProducto(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/establecimiento/inventario/productos/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting producto ${id}:`, error);
      return false;
    }
  }

  // ==================== CATEGORÍAS ====================

  async getCategorias(): Promise<Categoria[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/categorias') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching categorias:', error);
      return mockCategorias;
    }
  }

  // ==================== PROVEEDORES ====================

  async getProveedores(): Promise<Proveedor[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/proveedores') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      return mockProveedores;
    }
  }

  // ==================== MOVIMIENTOS ====================

  async getMovimientos(filtros?: FiltrosMovimientos): Promise<Movimiento[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.producto_id) params.append('producto_id', filtros.producto_id.toString());
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros?.proveedor_id) params.append('proveedor_id', filtros.proveedor_id.toString());

      const queryString = params.toString();
      const url = `/establecimiento/inventario/movimientos${queryString ? `?${queryString}` : ''}`;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get(url) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching movimientos:', error);
      return [];
    }
  }

  async crearMovimiento(data: CrearMovimientoDTO): Promise<Movimiento | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.post('/establecimiento/inventario/movimientos', data) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error creating movimiento:', error);
      return null;
    }
  }

  // ==================== ALERTAS ====================

  async getAlertasStock(): Promise<AlertaStock[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/alertas') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching alertas:', error);
      return [];
    }
  }

  // ==================== ESTADÍSTICAS ====================

  async getEstadisticas(): Promise<EstadisticasInventario> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/estadisticas') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      return {
        total_productos: 0,
        productos_activos: 0,
        productos_inactivos: 0,
        total_categorias: 0,
        valor_inventario: 0,
        alertas_stock: 0,
        movimientos_mes: 0,
        productos_sin_stock: 0,
        productos_proximos_vencer: 0,
      };
    }
  }

  async getProductosPorCategoria(): Promise<ProductoPorCategoria[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/estadisticas/por-categoria') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching productos por categoria:', error);
      return [];
    }
  }

  async getMovimientosPorTipo(): Promise<MovimientosPorTipo[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/estadisticas/movimientos') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching movimientos por tipo:', error);
      return [];
    }
  }

  // ==================== HELPERS ====================

  getColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      activo: 'bg-green-100 text-green-800 border-green-200',
      inactivo: 'bg-gray-100 text-gray-800 border-gray-200',
      descontinuado: 'bg-red-100 text-red-800 border-red-200',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getColorTipoMovimiento(tipo: string): string {
    const colores: Record<string, string> = {
      entrada: 'bg-green-100 text-green-800',
      salida: 'bg-red-100 text-red-800',
      ajuste: 'bg-blue-100 text-blue-800',
      devolucion: 'bg-orange-100 text-orange-800',
      merma: 'bg-purple-100 text-purple-800',
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  }

  getColorAlerta(tipo: string): string {
    const colores: Record<string, string> = {
      critico: 'bg-red-100 text-red-800 border-red-300',
      bajo: 'bg-orange-100 text-orange-800 border-orange-300',
      normal: 'bg-green-100 text-green-800 border-green-300',
      alto: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  getIconoTipoMovimiento(tipo: string): string {
    const iconos: Record<string, string> = {
      entrada: '📥',
      salida: '📤',
      ajuste: '⚙️',
      devolucion: '🔄',
      merma: '❌',
    };
    return iconos[tipo] || '📦';
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  calcularPorcentajeStock(actual: number, maximo: number): number {
    return maximo > 0 ? (actual / maximo) * 100 : 0;
  }
}

export const inventarioService = new InventarioService();
export default inventarioService;
