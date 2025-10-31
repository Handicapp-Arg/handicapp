-- Script para insertar datos de prueba en el inventario
-- Establecimiento ID: 1 (ajustar según tu base de datos)

-- Insertar productos de prueba
INSERT INTO inventario_producto (
  establecimiento_id,
  categoria_id,
  codigo,
  nombre,
  descripcion,
  unidad_medida,
  precio_unitario,
  stock_actual,
  stock_minimo,
  stock_maximo,
  estado,
  creado_el
) VALUES
  (1, 1, 'ALI-001', 'Heno Premium', 'Heno de alfalfa de alta calidad', 'kg', 150.00, 500, 200, 1000, 'activo', NOW()),
  (1, 1, 'ALI-002', 'Avena Grano', 'Avena en grano para alimentación', 'kg', 80.00, 150, 100, 500, 'activo', NOW()),
  (1, 2, 'MED-001', 'Ivermectina', 'Antiparasitario de amplio espectro', 'unidad', 1200.00, 5, 3, 15, 'activo', NOW()),
  (1, 3, 'EQU-001', 'Silla de Montar', 'Silla de montar inglesa profesional', 'unidad', 25000.00, 2, 1, 5, 'activo', NOW()),
  (1, 4, 'CUI-001', 'Shampoo Equino', 'Shampoo especial para caballos', 'litro', 450.00, 10, 5, 20, 'activo', NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Productos de prueba insertados correctamente' AS mensaje;
