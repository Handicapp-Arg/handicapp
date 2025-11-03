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

const mockProductos: Producto[] = [
  {
    id: 1,
    codigo: 'ALI-001',
    nombre: 'Avena Premium',
    descripcion: 'Avena de alta calidad para alimentación equina',
    categoria_id: 1,
    categoria_nombre: 'Alimentos',
    unidad_medida: 'kg',
    stock_actual: 450,
    stock_minimo: 200,
    stock_maximo: 1000,
    precio_unitario: 85.50,
    ubicacion: 'Depósito A - Estante 1',
    proveedor_id: 1,
    proveedor_nombre: 'AgriFood SA',
    estado: 'activo',
    fecha_ultima_compra: '2025-10-15',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-10-15T14:30:00Z',
  },
  {
    id: 2,
    codigo: 'MED-001',
    nombre: 'Antibiótico Veterinario',
    descripcion: 'Antibiótico de amplio espectro',
    categoria_id: 2,
    categoria_nombre: 'Medicamentos',
    unidad_medida: 'unidad',
    stock_actual: 15,
    stock_minimo: 20,
    stock_maximo: 50,
    precio_unitario: 1250.00,
    ubicacion: 'Farmacia - Refrigerador 1',
    proveedor_id: 2,
    proveedor_nombre: 'VetSupply',
    estado: 'activo',
    fecha_ultima_compra: '2025-10-18',
    fecha_vencimiento: '2026-12-31',
    created_at: '2025-02-05T10:00:00Z',
    updated_at: '2025-10-18T16:00:00Z',
  },
  {
    id: 3,
    codigo: 'EQU-001',
    nombre: 'Cepillo para Caballos',
    descripcion: 'Cepillo de cerdas suaves',
    categoria_id: 3,
    categoria_nombre: 'Equipamiento',
    unidad_medida: 'unidad',
    stock_actual: 8,
    stock_minimo: 10,
    stock_maximo: 30,
    precio_unitario: 450.00,
    ubicacion: 'Depósito B - Caja 3',
    proveedor_id: 3,
    proveedor_nombre: 'Equipo Total',
    estado: 'activo',
    fecha_ultima_compra: '2025-10-10',
    created_at: '2025-03-15T10:00:00Z',
    updated_at: '2025-10-10T11:20:00Z',
  },
  {
    id: 4,
    codigo: 'ALI-002',
    nombre: 'Heno de Alfalfa',
    descripcion: 'Fardo de heno de alfalfa',
    categoria_id: 1,
    categoria_nombre: 'Alimentos',
    unidad_medida: 'unidad',
    stock_actual: 85,
    stock_minimo: 50,
    stock_maximo: 150,
    precio_unitario: 320.00,
    ubicacion: 'Galpón Principal',
    proveedor_id: 1,
    proveedor_nombre: 'AgriFood SA',
    estado: 'activo',
    fecha_ultima_compra: '2025-10-12',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-10-12T09:00:00Z',
  },
  {
    id: 5,
    codigo: 'LIM-001',
    nombre: 'Desinfectante',
    descripcion: 'Desinfectante de uso veterinario',
    categoria_id: 4,
    categoria_nombre: 'Limpieza',
    unidad_medida: 'litro',
    stock_actual: 12,
    stock_minimo: 15,
    stock_maximo: 40,
    precio_unitario: 280.00,
    ubicacion: 'Depósito C - Estante 2',
    proveedor_id: 2,
    proveedor_nombre: 'VetSupply',
    estado: 'activo',
    fecha_ultima_compra: '2025-10-08',
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2025-10-08T13:45:00Z',
  },
];

const mockMovimientos: Movimiento[] = [
  {
    id: 1,
    producto_id: 1,
    producto_nombre: 'Avena Premium',
    producto_codigo: 'ALI-001',
    tipo: 'entrada',
    cantidad: 200,
    stock_anterior: 250,
    stock_nuevo: 450,
    precio_unitario: 85.50,
    monto_total: 17100.00,
    motivo: 'Compra mensual',
    proveedor_id: 1,
    proveedor_nombre: 'AgriFood SA',
    usuario_id: 1,
    usuario_nombre: 'Juan Pérez',
    referencia: 'FC-001234',
    fecha: '2025-10-15',
    created_at: '2025-10-15T14:30:00Z',
  },
  {
    id: 2,
    producto_id: 2,
    producto_nombre: 'Antibiótico Veterinario',
    producto_codigo: 'MED-001',
    tipo: 'salida',
    cantidad: 5,
    stock_anterior: 20,
    stock_nuevo: 15,
    motivo: 'Tratamiento equino #1234',
    usuario_id: 2,
    usuario_nombre: 'María García',
    fecha: '2025-10-18',
    observaciones: 'Tratamiento de infección respiratoria',
    created_at: '2025-10-18T10:15:00Z',
  },
  {
    id: 3,
    producto_id: 3,
    producto_nombre: 'Cepillo para Caballos',
    producto_codigo: 'EQU-001',
    tipo: 'salida',
    cantidad: 2,
    stock_anterior: 10,
    stock_nuevo: 8,
    motivo: 'Asignación al personal',
    usuario_id: 1,
    usuario_nombre: 'Juan Pérez',
    fecha: '2025-10-17',
    created_at: '2025-10-17T09:20:00Z',
  },
  {
    id: 4,
    producto_id: 4,
    producto_nombre: 'Heno de Alfalfa',
    producto_codigo: 'ALI-002',
    tipo: 'entrada',
    cantidad: 50,
    stock_anterior: 35,
    stock_nuevo: 85,
    precio_unitario: 320.00,
    monto_total: 16000.00,
    motivo: 'Reposición stock',
    proveedor_id: 1,
    proveedor_nombre: 'AgriFood SA',
    usuario_id: 1,
    usuario_nombre: 'Juan Pérez',
    referencia: 'FC-001235',
    fecha: '2025-10-12',
    created_at: '2025-10-12T09:00:00Z',
  },
  {
    id: 5,
    producto_id: 5,
    producto_nombre: 'Desinfectante',
    producto_codigo: 'LIM-001',
    tipo: 'salida',
    cantidad: 3,
    stock_anterior: 15,
    stock_nuevo: 12,
    motivo: 'Limpieza semanal',
    usuario_id: 3,
    usuario_nombre: 'Carlos López',
    fecha: '2025-10-19',
    created_at: '2025-10-19T16:30:00Z',
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
      let productos = [...mockProductos];
      
      // Aplicar filtros al mock data
      if (filtros?.categoria_id) {
        productos = productos.filter(p => p.categoria_id === filtros.categoria_id);
      }
      if (filtros?.proveedor_id) {
        productos = productos.filter(p => p.proveedor_id === filtros.proveedor_id);
      }
      if (filtros?.estado) {
        productos = productos.filter(p => p.estado === filtros.estado);
      }
      if (filtros?.stock_bajo) {
        productos = productos.filter(p => p.stock_actual < p.stock_minimo);
      }
      if (filtros?.busqueda) {
        const search = filtros.busqueda.toLowerCase();
        productos = productos.filter(p => 
          p.nombre.toLowerCase().includes(search) ||
          p.codigo.toLowerCase().includes(search) ||
          p.descripcion?.toLowerCase().includes(search)
        );
      }
      
      return productos;
    }
  }

  async getProducto(id: number): Promise<Producto | null> {
    try {
      const response = await apiClient.get<ApiResponse<Producto> | Producto>(`/establecimiento/inventario/productos/${id}`);
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error(`Error fetching producto ${id}:`, error);
      return mockProductos.find(p => p.id === id) || null;
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
      let movimientos = [...mockMovimientos];
      
      // Aplicar filtros
      if (filtros?.producto_id) {
        movimientos = movimientos.filter(m => m.producto_id === filtros.producto_id);
      }
      if (filtros?.tipo) {
        movimientos = movimientos.filter(m => m.tipo === filtros.tipo);
      }
      
      return movimientos;
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
      
      // Generar alertas desde productos con stock bajo
      const alertas: AlertaStock[] = mockProductos
        .filter(p => p.stock_actual < p.stock_minimo)
        .map(p => {
          const diferencia = p.stock_minimo - p.stock_actual;
          const porcentaje = (p.stock_actual / p.stock_minimo) * 100;
          let tipo: 'critico' | 'bajo' | 'normal' | 'alto' = 'bajo';
          
          if (porcentaje <= 25) tipo = 'critico';
          else if (porcentaje <= 50) tipo = 'bajo';
          
          return {
            id: p.id,
            producto_id: p.id,
            producto_nombre: p.nombre,
            producto_codigo: p.codigo,
            categoria_nombre: p.categoria_nombre,
            stock_actual: p.stock_actual,
            stock_minimo: p.stock_minimo,
            diferencia,
            porcentaje: Math.round(porcentaje),
            tipo,
            fecha_deteccion: new Date().toISOString(),
          };
        });
      
      return alertas;
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
      
      const productosActivos = mockProductos.filter(p => p.estado === 'activo');
      const valorInventario = mockProductos.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
      const alertasStock = mockProductos.filter(p => p.stock_actual < p.stock_minimo).length;
      const sinStock = mockProductos.filter(p => p.stock_actual === 0).length;
      
      return {
        total_productos: mockProductos.length,
        productos_activos: productosActivos.length,
        productos_inactivos: mockProductos.filter(p => p.estado === 'inactivo').length,
        total_categorias: mockCategorias.length,
        valor_inventario: valorInventario,
        alertas_stock: alertasStock,
        movimientos_mes: mockMovimientos.length,
        productos_sin_stock: sinStock,
        productos_proximos_vencer: 1,
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
      
      const totalValor = mockProductos.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
      
      return mockCategorias.map(cat => {
        const productos = mockProductos.filter(p => p.categoria_id === cat.id);
        const valor = productos.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
        
        return {
          categoria_id: cat.id,
          categoria_nombre: cat.nombre,
          total_productos: productos.length,
          valor_total: valor,
          porcentaje: totalValor > 0 ? (valor / totalValor) * 100 : 0,
        };
      });
    }
  }

  async getMovimientosPorTipo(): Promise<MovimientosPorTipo[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get('/establecimiento/inventario/estadisticas/movimientos') as any;
      return response.data || response;
    } catch (error) {
      console.error('Error fetching movimientos por tipo:', error);
      
      const tipos = ['entrada', 'salida', 'ajuste', 'devolucion', 'merma'];
      const totalMovimientos = mockMovimientos.length;
      
      return tipos.map(tipo => {
        const movs = mockMovimientos.filter(m => m.tipo === tipo);
        const cantidadTotal = movs.reduce((sum, m) => sum + m.cantidad, 0);
        const valorTotal = movs.reduce((sum, m) => sum + (m.monto_total || 0), 0);
        
        return {
          tipo,
          cantidad_movimientos: movs.length,
          cantidad_total: cantidadTotal,
          valor_total: valorTotal,
          porcentaje: totalMovimientos > 0 ? (movs.length / totalMovimientos) * 100 : 0,
        };
      });
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
