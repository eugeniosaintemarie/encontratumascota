-- Migration: Add "buscada" as a valid tipo_publicacion
-- This extends the tipo_publicacion column to accept "buscada" (missing pets reported by owners)

-- Note: The tipo_publicacion column is a text field that already accepts any string value.
-- This migration documents the new type and ensures consistency.

-- Add comment to document valid values (PostgreSQL specific)
COMMENT ON COLUMN publicaciones.tipo_publicacion IS 'Tipo de publicación: perdida (encontrada por alguien), adopcion (busca hogar), buscada (perdida por su dueño)';
