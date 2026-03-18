-- Migration: Add transfer history tracking for publicaciones
-- Allows storing a JSON array of previous caretakers when a pet publication is transferred

ALTER TABLE publicaciones
ADD COLUMN historial_transferencias jsonb;

-- Add comment documenting the structure
COMMENT ON COLUMN publicaciones.historial_transferencias IS 'JSON array of previous caretakers: [{ "nombre": string, "telefono": string, "email": string, "fecha": ISO timestamp }, ...]';
