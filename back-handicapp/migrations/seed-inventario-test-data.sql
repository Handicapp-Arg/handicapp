-- Script para insertar datos de prueba en el inventario
-- Fecha: 2025-10-30

-- Insertar productos de prueba para el establecimiento ID 1
INSERT INTO inventario_producto (
  establecimiento_id, categoria_id, codigo, nombre, descripcion,
  unidad_medida, precio_unitario, stock_actual, stock_minimo, stock_maximo,
  estado, creado_el
) VALUES
  (1, 1, 'ALF-001', 'Alfalfa Premium', 'Alfalfa de primera calidad para alimentación equina', 
   'kg', 150.00, 500.00, 100.00, 1000.00, 'activo', NOW()),
  (1, 1, 'AVI-002', 'Avena Fortificada', 'Avena enriquecida con vitaminas y minerales',
   'kg', 80.00, 300.00, 50.00, 500.00, 'activo', NOW()),
  (1, 2, 'MED-003', 'Antiinflamatorio Equino', 'Medicamento antiinflamatorio de uso veterinario',
   'unidad', 450.00, 15.00, 5.00, 30.00, 'activo', NOW()),
  (1, 3, 'MON-004', 'Montura de Salto', 'Montura profesional para salto ecuestre',
   'unidad', 25000.00, 3.00, 1.00, 5.00, 'activo', NOW()),
  (1, 4, 'SH-005', 'Shampoo Equino', 'Shampoo especial para cuidado del pelaje',
   'litro', 280.00, 20.00, 5.00, 40.00, 'activo', NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Insertar algunos movimientos de ejemplo
-- Nota: Ajustar usuario_id según tu base de datos (debe ser un usuario con rol establecimiento)
INSERT INTO inventario_movimiento (
  producto_id, tipo, cantidad, motivo, usuario_id, stock_anterior, stock_nuevo, creado_el
)
SELECT 
  p.id, 
  'entrada', 
  100.00, 
  'Compra inicial de stock', 
  (SELECT id FROM usuarios WHERE email LIKE '%establecimiento%' LIMIT 1),
  0,
  100.00,
  NOW() - INTERVAL '7 days'
FROM inventario_producto p
WHERE p.codigo = 'ALF-001'
LIMIT 1;

INSERT INTO inventario_movimiento (
  producto_id, tipo, cantidad, motivo, usuario_id, stock_anterior, stock_nuevo, creado_el
)
SELECT 
  p.id, 
  'salida', 
  50.00, 
  'Consumo mensual', 
  (SELECT id FROM usuarios WHERE email LIKE '%establecimiento%' LIMIT 1),
  100.00,
  50.00,
  NOW() - INTERVAL '3 days'
FROM inventario_producto p
WHERE p.codigo = 'ALF-001'
LIMIT 1;

COMMENT ON SCRIPT IS 'Datos de prueba para el módulo de inventario';
