// Migration: Convert publicaciones.id from UUID to short text IDs (nanoid 10 chars)
// Usage: DATABASE_URL="postgresql://..." node scripts/migrate-short-ids.js

const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: Set DATABASE_URL environment variable before running.');
  console.error('Usage: DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" node scripts/migrate-short-ids.js');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'publicaciones' ORDER BY ordinal_position`;
  console.log('Columns:', cols.map(c => `${c.column_name}:${c.data_type}`).join(', '));

  const sample = await sql`SELECT id FROM publicaciones LIMIT 3`;
  console.log('Sample IDs:', sample.map(r => r.id));
  console.log('Total rows:', (await sql`SELECT count(*) as cnt FROM publicaciones`)[0].cnt);

  console.log('\n--- Running migration ---');

  await sql`ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS new_id text`;
  console.log('1. Added new_id column');

  await sql`UPDATE publicaciones SET new_id = substr(md5(random()::text), 1, 10) WHERE new_id IS NULL`;
  console.log('2. Generated short IDs');

  await sql`ALTER TABLE publicaciones DROP CONSTRAINT IF EXISTS publicaciones_pkey`;
  console.log('3. Dropped old PK');

  await sql`ALTER TABLE publicaciones DROP COLUMN id`;
  console.log('4. Dropped old id column');

  await sql`ALTER TABLE publicaciones RENAME COLUMN new_id TO id`;
  console.log('5. Renamed new_id -> id');

  await sql`ALTER TABLE publicaciones ALTER COLUMN id SET NOT NULL`;
  console.log('6. Set NOT NULL');

  await sql`ALTER TABLE publicaciones ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (id)`;
  console.log('7. Added new PK');

  await sql`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publicaciones' AND column_name='es_prueba') THEN
      ALTER TABLE publicaciones ADD COLUMN es_prueba boolean DEFAULT false NOT NULL;
    END IF;
  END $$`;
  console.log('8. Ensured es_prueba column');

  console.log('\n--- Verification ---');
  const newSample = await sql`SELECT id FROM publicaciones LIMIT 5`;
  console.log('New IDs:', newSample.map(r => r.id));
  console.log('Migration complete!');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
