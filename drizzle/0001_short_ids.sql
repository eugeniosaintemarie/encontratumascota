-- Convert publicaciones.id from UUID to short text IDs (nanoid 8 chars)
-- This migration is safe to run on fresh or existing databases.

-- Step 1: Add a new column for the short IDs
ALTER TABLE "publicaciones" ADD COLUMN IF NOT EXISTS "new_id" text;

-- Step 2: Populate existing rows with 8-char pseudo-random IDs
UPDATE "publicaciones"
SET "new_id" = substr(md5(random()::text), 1, 8)
WHERE "new_id" IS NULL;

-- Step 3: Drop the old primary key constraint and the old id column
ALTER TABLE "publicaciones" DROP CONSTRAINT IF EXISTS "publicaciones_pkey";
ALTER TABLE "publicaciones" DROP COLUMN "id";

-- Step 4: Rename new_id to id
ALTER TABLE "publicaciones" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "publicaciones" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "publicaciones" ADD PRIMARY KEY ("id");

-- Step 5: Add es_prueba column if it doesn't exist (used by some queries)
ALTER TABLE "publicaciones" ADD COLUMN IF NOT EXISTS "es_prueba" boolean DEFAULT false NOT NULL;
