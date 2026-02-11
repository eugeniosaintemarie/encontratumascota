-- Migrar publicaciones.id de UUID a TEXT con IDs cortos (8 chars alfanuméricos)
-- 1. Crear columna temporal text
ALTER TABLE "publicaciones" ADD COLUMN "new_id" text;
--> statement-breakpoint
-- 2. Generar IDs cortos para filas existentes (substr de md5 como fallback server-side)
UPDATE "publicaciones" SET "new_id" = substr(md5(random()::text), 1, 8) WHERE "new_id" IS NULL;
--> statement-breakpoint
-- 3. Eliminar PK vieja
ALTER TABLE "publicaciones" DROP CONSTRAINT "publicaciones_pkey";
--> statement-breakpoint
-- 4. Eliminar columna UUID vieja
ALTER TABLE "publicaciones" DROP COLUMN "id";
--> statement-breakpoint
-- 5. Renombrar nueva columna
ALTER TABLE "publicaciones" RENAME COLUMN "new_id" TO "id";
--> statement-breakpoint
-- 6. Agregar NOT NULL
ALTER TABLE "publicaciones" ALTER COLUMN "id" SET NOT NULL;
--> statement-breakpoint
-- 7. Agregar PK nueva
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id");
--> statement-breakpoint
-- 8. Agregar flag es_prueba si no existe (por compatibilidad)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publicaciones' AND column_name='es_prueba') THEN
    ALTER TABLE "publicaciones" ADD COLUMN "es_prueba" boolean DEFAULT false NOT NULL;
  END IF;
END $$;
