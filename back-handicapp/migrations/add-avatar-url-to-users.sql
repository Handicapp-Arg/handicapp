-- Migración: Agregar columna avatar_url a la tabla usuarios
-- Fecha: 2025-10-15
-- Descripción: Permite almacenar la URL del avatar de perfil del usuario

-- Agregar columna avatar_url
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);

-- Comentario para documentación
COMMENT ON COLUMN usuarios.avatar_url IS 'URL pública de la foto de perfil del usuario';
