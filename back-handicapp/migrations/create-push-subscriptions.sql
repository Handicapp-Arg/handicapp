-- ============================================================================
-- MIGRATION: Push Subscriptions Table
-- ============================================================================
-- Fecha: 2025-10-22
-- Descripción: Crear tabla para almacenar suscripciones a push notifications
-- Requiere: web-push library instalada
-- ============================================================================

-- Crear tabla push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

-- Índices
CREATE INDEX IF NOT EXISTS ix_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Comentarios
COMMENT ON TABLE push_subscriptions IS 'Almacena suscripciones de usuarios a push notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL única del servicio de push (ej: https://fcm.googleapis.com/...)';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Clave pública del cliente para encriptación';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Clave de autenticación del cliente';
COMMENT ON COLUMN push_subscriptions.user_agent IS 'Información del navegador/dispositivo';

-- ============================================================================
-- ROLLBACK (si necesitas eliminar)
-- ============================================================================
-- DROP TABLE IF EXISTS push_subscriptions CASCADE;
