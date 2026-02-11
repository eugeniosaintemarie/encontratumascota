const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  // 1. Check current state
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'publicaciones' ORDER BY ordinal_position`;
  console.log('Columns:', cols.map(c => `${c.column_name}:${c.data_type}`).join(', '));

  const sample = await sql`SELECT id FROM publicaciones LIMIT 3`;
  console.log('Sample IDs:', sample.map(r => r.id));
  console.log('Total rows:', (await sql`SELECT count(*) as cnt FROM publicaciones`)[0].cnt);

  // 2. Run migration steps
  console.log('\n--- Running migration ---');

  console.log('Step 1: Add new_id column...');
  await sql`ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS new_id text`;

  console.log('Step 2: Generate short IDs...');
  await sql`UPDATE publicaciones SET new_id = substr(md5(random()::text), 1, 8) WHERE new_id IS NULL`;

  console.log('Step 3: Drop old PK...');
  await sql`ALTER TABLE publicaciones DROP CONSTRAINT IF EXISTS publicaciones_pkey`;

  console.log('Step 4: Drop old id column...');
  await sql`ALTER TABLE publicaciones DROP COLUMN id`;

  console.log('Step 5: Rename new_id to id...');
  await sql`ALTER TABLE publicaciones RENAME COLUMN new_id TO id`;

  console.log('Step 6: Set NOT NULL...');
  await sql`ALTER TABLE publicaciones ALTER COLUMN id SET NOT NULL`;

  console.log('Step 7: Add new PK...');
  await sql`ALTER TABLE publicaciones ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (id)`;

  console.log('Step 8: Add es_prueba if missing...');
  await sql`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='publicaciones' AND column_name='es_prueba') THEN
      ALTER TABLE publicaciones ADD COLUMN es_prueba boolean DEFAULT false NOT NULL;
    END IF;
  END $$`;

  // 3. Verify
  console.log('\n--- Verification ---');
  const newSample = await sql`SELECT id FROM publicaciones LIMIT 5`;
  console.log('New IDs:', newSample.map(r => r.id));

  const colsAfter = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'publicaciones' AND column_name = 'id'`;
  console.log('ID column type:', colsAfter[0]?.data_type);

  console.log('\nMigration complete!');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
