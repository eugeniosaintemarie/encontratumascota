-- Migration: add production user profile table for refuge features
-- Keeps demo behavior unchanged while enabling backend refuge flag per auth user.

CREATE TABLE IF NOT EXISTS usuarios_perfil (
  auth_user_id text PRIMARY KEY,
  es_refugio boolean NOT NULL DEFAULT false,
  nombre_refugio text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE usuarios_perfil IS 'Perfil de negocio por usuario de auth (flags como es_refugio)';
COMMENT ON COLUMN usuarios_perfil.auth_user_id IS 'ID del proveedor de auth (Neon Auth)';
COMMENT ON COLUMN usuarios_perfil.es_refugio IS 'Marca si el usuario actua como refugio';
COMMENT ON COLUMN usuarios_perfil.nombre_refugio IS 'Nombre publico del refugio (opcional)';
