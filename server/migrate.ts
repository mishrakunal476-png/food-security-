import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closePool, getPool } from './db/client';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const migrationName = '0001_foodloop_core';

async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing; no migration was applied.');
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_id VARCHAR(128) NOT NULL PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  const [existing] = await pool.execute('SELECT migration_id FROM schema_migrations WHERE migration_id = ?', [migrationName]);
  if (Array.isArray(existing) && existing.length > 0) {
    console.log(`Migration ${migrationName} is already recorded; no changes made.`);
    return;
  }
  const source = await readFile(resolve(root, 'drizzle/0001_foodloop_core.sql'), 'utf8');
  for (const statement of source.split(';').map((sql) => sql.trim()).filter(Boolean)) {
    await pool.query(statement);
  }
  await pool.execute('INSERT INTO schema_migrations (migration_id) VALUES (?)', [migrationName]);
  console.log(`Applied additive migration ${migrationName}.`);
}

try {
  await migrate();
} catch (error) {
  console.error('FoodLoop migration stopped:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
} finally {
  await closePool();
}
