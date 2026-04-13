-- Migration: add indexes for high-frequency filters and lookups.

CREATE INDEX IF NOT EXISTS "publicaciones_activa_idx"
  ON "publicaciones" ("activa");

CREATE INDEX IF NOT EXISTS "publicaciones_tipo_publicacion_idx"
  ON "publicaciones" ("tipo_publicacion");

CREATE INDEX IF NOT EXISTS "publicaciones_usuario_id_idx"
  ON "publicaciones" ("usuario_id");

CREATE INDEX IF NOT EXISTS "publicaciones_fecha_publicacion_idx"
  ON "publicaciones" ("fecha_publicacion");

CREATE INDEX IF NOT EXISTS "usuarios_perfil_es_refugio_idx"
  ON "usuarios_perfil" ("es_refugio");
