-- ================================================================
-- MIGRACIÓN: Agregar campos extendidos a tabla eventos
-- Fecha: 2025-10-29
-- Autor: HandicApp Team
-- Descripción: Agrega campos necesarios para funcionalidad completa
--              de eventos (horas, ubicación, estado, prioridad, etc.)
-- ================================================================

-- 1. Agregar columnas de tiempo
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS hora_fin TIME;

-- 2. Agregar ubicación
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(255);

-- 3. Agregar estado del evento (diferente de estado_validacion)
-- Estado: programado, en_progreso, completado, cancelado, reprogramado
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'programado';

-- 4. Agregar prioridad
-- Prioridad: baja, media, alta, critica
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'media';

-- 5. Agregar flags booleanos
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS es_publico BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requiere_validacion BOOLEAN DEFAULT false;

-- 6. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS ix_eventos_estado 
ON eventos(estado) 
WHERE eliminado_el IS NULL;

CREATE INDEX IF NOT EXISTS ix_eventos_prioridad 
ON eventos(prioridad) 
WHERE eliminado_el IS NULL;

CREATE INDEX IF NOT EXISTS ix_eventos_publicos 
ON eventos(es_publico) 
WHERE eliminado_el IS NULL AND es_publico = true;

-- 7. Agregar comentarios para documentación
COMMENT ON COLUMN eventos.hora_inicio IS 'Hora de inicio del evento';
COMMENT ON COLUMN eventos.hora_fin IS 'Hora de finalización del evento';
COMMENT ON COLUMN eventos.ubicacion IS 'Ubicación donde se realizará el evento';
COMMENT ON COLUMN eventos.estado IS 'Estado del evento: programado, en_progreso, completado, cancelado, reprogramado';
COMMENT ON COLUMN eventos.prioridad IS 'Prioridad del evento: baja, media, alta, critica';
COMMENT ON COLUMN eventos.es_publico IS 'Indica si el evento es visible públicamente';
COMMENT ON COLUMN eventos.requiere_validacion IS 'Indica si requiere validación veterinaria';

-- ================================================================
-- ROLLBACK (comentado, descomentar si necesitas revertir):
-- ================================================================
/*
ALTER TABLE eventos 
DROP COLUMN IF EXISTS hora_inicio,
DROP COLUMN IF EXISTS hora_fin,
DROP COLUMN IF EXISTS ubicacion,
DROP COLUMN IF EXISTS estado,
DROP COLUMN IF EXISTS prioridad,
DROP COLUMN IF EXISTS es_publico,
DROP COLUMN IF EXISTS requiere_validacion;

DROP INDEX IF EXISTS ix_eventos_estado;
DROP INDEX IF EXISTS ix_eventos_prioridad;
DROP INDEX IF EXISTS ix_eventos_publicos;
*/
