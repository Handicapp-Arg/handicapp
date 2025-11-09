-- Migration: Add geolocation, images, ratings and reviews to establecimientos
-- Date: 2025-11-08
-- Description: Enhance establecimientos with map features, photo galleries and review system

-- Step 1: Add new fields to establecimientos table
ALTER TABLE establecimientos
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS imagenes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rating_promedio DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_resenas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_verificacion TIMESTAMP;

-- Step 2: Add indexes for geolocation queries
CREATE INDEX IF NOT EXISTS ix_establecimientos_latitud ON establecimientos(latitud);
CREATE INDEX IF NOT EXISTS ix_establecimientos_longitud ON establecimientos(longitud);
CREATE INDEX IF NOT EXISTS ix_establecimientos_rating ON establecimientos(rating_promedio DESC);
CREATE INDEX IF NOT EXISTS ix_establecimientos_verificado ON establecimientos(verificado);

-- Step 3: Add composite index for map queries (lat/lng together)
CREATE INDEX IF NOT EXISTS ix_establecimientos_geo ON establecimientos(latitud, longitud) 
WHERE latitud IS NOT NULL AND longitud IS NOT NULL;

-- Step 4: Create establecimiento_resenas table
CREATE TABLE IF NOT EXISTS establecimiento_resenas (
  id SERIAL PRIMARY KEY,
  establecimiento_id INTEGER NOT NULL REFERENCES establecimientos(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  respuesta_establecimiento TEXT,
  respondido_por_usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  respondido_el TIMESTAMP,
  visible BOOLEAN DEFAULT true,
  creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_el TIMESTAMP,
  
  -- Ensure one review per user per establecimiento
  CONSTRAINT ux_resena_usuario_establecimiento UNIQUE (establecimiento_id, usuario_id)
);

-- Step 5: Add indexes to resenas table
CREATE INDEX IF NOT EXISTS ix_resenas_establecimiento ON establecimiento_resenas(establecimiento_id);
CREATE INDEX IF NOT EXISTS ix_resenas_usuario ON establecimiento_resenas(usuario_id);
CREATE INDEX IF NOT EXISTS ix_resenas_rating ON establecimiento_resenas(rating);
CREATE INDEX IF NOT EXISTS ix_resenas_visible ON establecimiento_resenas(visible);
CREATE INDEX IF NOT EXISTS ix_resenas_creado ON establecimiento_resenas(creado_el DESC);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN establecimientos.latitud IS 'Latitud en grados decimales (-90 a 90)';
COMMENT ON COLUMN establecimientos.longitud IS 'Longitud en grados decimales (-180 a 180)';
COMMENT ON COLUMN establecimientos.descripcion IS 'Descripción extendida del establecimiento para mostrar en detalle';
COMMENT ON COLUMN establecimientos.imagenes IS 'Array JSON de URLs de imágenes del establecimiento';
COMMENT ON COLUMN establecimientos.rating_promedio IS 'Rating promedio calculado de todas las reseñas (0-5)';
COMMENT ON COLUMN establecimientos.total_resenas IS 'Contador de reseñas totales (cache)';
COMMENT ON COLUMN establecimientos.verificado IS 'Indica si el establecimiento fue verificado por un admin';

COMMENT ON TABLE establecimiento_resenas IS 'Reseñas y ratings de establecimientos por usuarios';
COMMENT ON COLUMN establecimiento_resenas.rating IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN establecimiento_resenas.respuesta_establecimiento IS 'Respuesta del establecimiento a la reseña';
COMMENT ON COLUMN establecimiento_resenas.visible IS 'Control de moderación de reseñas';

-- Step 7: Create function to update rating promedio automatically
CREATE OR REPLACE FUNCTION actualizar_rating_establecimiento()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE establecimientos
  SET 
    rating_promedio = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM establecimiento_resenas
      WHERE establecimiento_id = COALESCE(NEW.establecimiento_id, OLD.establecimiento_id)
        AND visible = true
    ),
    total_resenas = (
      SELECT COUNT(*)
      FROM establecimiento_resenas
      WHERE establecimiento_id = COALESCE(NEW.establecimiento_id, OLD.establecimiento_id)
        AND visible = true
    )
  WHERE id = COALESCE(NEW.establecimiento_id, OLD.establecimiento_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger to auto-update ratings
DROP TRIGGER IF EXISTS trigger_actualizar_rating ON establecimiento_resenas;
CREATE TRIGGER trigger_actualizar_rating
AFTER INSERT OR UPDATE OR DELETE ON establecimiento_resenas
FOR EACH ROW
EXECUTE FUNCTION actualizar_rating_establecimiento();

-- Step 9: Add sample data for testing (optional - comment out in production)
-- UPDATE establecimientos 
-- SET 
--   latitud = -34.6037,
--   longitud = -58.3816,
--   descripcion = 'Establecimiento ecuestre de primer nivel con instalaciones modernas y completas.',
--   imagenes = '["https://picsum.photos/800/600?random=1", "https://picsum.photos/800/600?random=2"]'::jsonb,
--   verificado = true,
--   fecha_verificacion = CURRENT_TIMESTAMP
-- WHERE id = 1;

COMMENT ON FUNCTION actualizar_rating_establecimiento() IS 'Trigger function para mantener rating_promedio y total_resenas actualizados';
