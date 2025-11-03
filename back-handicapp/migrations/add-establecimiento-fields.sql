-- Agregar campos adicionales a la tabla establecimientos
-- Fecha: 2025-10-24
-- Descripción: Agrega tipo_establecimiento, estado, superficie_hectareas, cantidad_boxes y servicios

-- Crear tipo ENUM para tipo_establecimiento
DO $$ BEGIN
    CREATE TYPE tipo_establecimiento_enum AS ENUM ('haras', 'polo', 'salto', 'doma', 'turf', 'enduro', 'mixto', 'otro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tipo ENUM para estado_establecimiento
DO $$ BEGIN
    CREATE TYPE estado_establecimiento_enum AS ENUM ('activo', 'inactivo', 'mantenimiento', 'suspendido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregar columnas a la tabla establecimientos
ALTER TABLE establecimientos
ADD COLUMN IF NOT EXISTS tipo_establecimiento tipo_establecimiento_enum DEFAULT 'mixto',
ADD COLUMN IF NOT EXISTS estado estado_establecimiento_enum DEFAULT 'activo' NOT NULL,
ADD COLUMN IF NOT EXISTS superficie_hectareas DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS cantidad_boxes INTEGER,
ADD COLUMN IF NOT EXISTS servicios JSONB DEFAULT '[]'::jsonb;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS ix_establecimientos_tipo ON establecimientos(tipo_establecimiento);
CREATE INDEX IF NOT EXISTS ix_establecimientos_estado ON establecimientos(estado);
CREATE INDEX IF NOT EXISTS ix_establecimientos_servicios ON establecimientos USING GIN(servicios);

-- Comentarios
COMMENT ON COLUMN establecimientos.tipo_establecimiento IS 'Tipo de establecimiento ecuestre';
COMMENT ON COLUMN establecimientos.estado IS 'Estado operativo del establecimiento';
COMMENT ON COLUMN establecimientos.superficie_hectareas IS 'Superficie total en hectáreas';
COMMENT ON COLUMN establecimientos.cantidad_boxes IS 'Cantidad de boxes/caballerizas disponibles';
COMMENT ON COLUMN establecimientos.servicios IS 'Servicios disponibles en el establecimiento (array JSON)';
