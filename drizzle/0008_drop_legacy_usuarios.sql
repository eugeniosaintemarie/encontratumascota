-- Migration: remove legacy local-auth table now that auth is fully handled by Neon Auth.
-- Safe on environments where the table no longer exists.

DROP TABLE IF EXISTS "usuarios";
