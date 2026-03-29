-- Migration: store parent breed data for mestizo mascotas
-- Adds nullable columns to keep track of the reported padre and madre razas.

ALTER TABLE publicaciones
ADD COLUMN padre_raza text;

ALTER TABLE publicaciones
ADD COLUMN madre_raza text;

COMMENT ON COLUMN publicaciones.padre_raza IS 'Raza del padre informado cuando la mascota es mestiza';
COMMENT ON COLUMN publicaciones.madre_raza IS 'Raza de la madre informada cuando la mascota es mestiza';
