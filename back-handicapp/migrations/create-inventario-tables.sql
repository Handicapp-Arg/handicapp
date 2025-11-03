-- Migración: Crear tablas de Inventario
-- Fecha: 2025-10-30
-- Descripción: Crea las tablas necesarias para el módulo de inventario

-- Tabla de categorías de inventario
CREATE TABLE IF NOT EXISTS inventario_categoria (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(20),
  icono VARCHAR(50),
  creado_el TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_el TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS inventario_proveedor (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  contacto VARCHAR(200),
  telefono VARCHAR(50),
  email VARCHAR(200),
  direccion TEXT,
  cuit VARCHAR(20),
  notas TEXT,
  creado_el TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_el TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS inventario_producto (
  id SERIAL PRIMARY KEY,
  establecimiento_id INTEGER NOT NULL REFERENCES establecimientos(id) ON DELETE CASCADE,
  categoria_id INTEGER NOT NULL REFERENCES inventario_categoria(id) ON DELETE RESTRICT,
  proveedor_id INTEGER REFERENCES inventario_proveedor(id) ON DELETE SET NULL,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  unidad_medida VARCHAR(20) NOT NULL DEFAULT 'unidad' CHECK (unidad_medida IN ('kg', 'litro', 'unidad')),
  precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_actual DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_minimo DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_maximo DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  imagen_url VARCHAR(500),
  notas TEXT,
  creado_el TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_el TIMESTAMP,
  eliminado_el TIMESTAMP
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventario_movimiento (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES inventario_producto(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2),
  motivo TEXT,
  referencia VARCHAR(100),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  stock_anterior DECIMAL(10, 2) NOT NULL,
  stock_nuevo DECIMAL(10, 2) NOT NULL,
  creado_el TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_producto_establecimiento ON inventario_producto(establecimiento_id);
CREATE INDEX IF NOT EXISTS idx_producto_categoria ON inventario_producto(categoria_id);
CREATE INDEX IF NOT EXISTS idx_producto_proveedor ON inventario_producto(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_producto_codigo ON inventario_producto(codigo);
CREATE INDEX IF NOT EXISTS idx_producto_estado ON inventario_producto(estado);
CREATE INDEX IF NOT EXISTS idx_movimiento_producto ON inventario_movimiento(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_tipo ON inventario_movimiento(tipo);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON inventario_movimiento(creado_el);

-- Insertar categorías iniciales
INSERT INTO inventario_categoria (nombre, descripcion, color, icono, creado_el) VALUES
  ('Alimentos', 'Alimentos y suplementos para caballos', '#10b981', 'utensils', CURRENT_TIMESTAMP),
  ('Medicamentos', 'Medicamentos y productos veterinarios', '#ef4444', 'pill', CURRENT_TIMESTAMP),
  ('Equipamiento', 'Equipamiento y accesorios', '#3b82f6', 'box', CURRENT_TIMESTAMP),
  ('Cuidado', 'Productos de cuidado e higiene', '#8b5cf6', 'sparkles', CURRENT_TIMESTAMP),
  ('Otros', 'Otros productos', '#6b7280', 'package', CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE inventario_categoria IS 'Categorías de productos del inventario';
COMMENT ON TABLE inventario_proveedor IS 'Proveedores de productos';
COMMENT ON TABLE inventario_producto IS 'Productos del inventario de cada establecimiento';
COMMENT ON TABLE inventario_movimiento IS 'Historial de movimientos de inventario (entradas, salidas, ajustes)';
