-- Migration: Add bidirectional association tracking to caballos_establecimientos
-- Purpose: Support propietario→establecimiento AND establecimiento→propietario workflows
-- Author: System
-- Date: 2025-10-25

BEGIN;

-- Add tracking fields for bidirectional workflow
ALTER TABLE caballos_establecimientos 
ADD COLUMN IF NOT EXISTS solicitante_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS aprobador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS fecha_solicitud TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS fecha_respuesta TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN caballos_establecimientos.solicitante_id IS 'Usuario que inició la solicitud de asociación (propietario o capataz)';
COMMENT ON COLUMN caballos_establecimientos.aprobador_id IS 'Usuario que aprobó/rechazó la solicitud';
COMMENT ON COLUMN caballos_establecimientos.fecha_solicitud IS 'Timestamp de cuando se creó la solicitud';
COMMENT ON COLUMN caballos_establecimientos.fecha_respuesta IS 'Timestamp de cuando se aprobó/rechazó';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_ce_solicitante ON caballos_establecimientos(solicitante_id) 
  WHERE solicitante_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_ce_aprobador ON caballos_establecimientos(aprobador_id) 
  WHERE aprobador_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_ce_pending_requests ON caballos_establecimientos(estado_asociacion, fecha_solicitud) 
  WHERE estado_asociacion = 'pending';

-- Add foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ce_solicitante'
  ) THEN
    ALTER TABLE caballos_establecimientos
      ADD CONSTRAINT fk_ce_solicitante 
      FOREIGN KEY (solicitante_id) 
      REFERENCES usuarios(id) 
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ce_aprobador'
  ) THEN
    ALTER TABLE caballos_establecimientos
      ADD CONSTRAINT fk_ce_aprobador 
      FOREIGN KEY (aprobador_id) 
      REFERENCES usuarios(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;
