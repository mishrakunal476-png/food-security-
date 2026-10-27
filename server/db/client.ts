import mysql from 'mysql2/promise';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema';

let pool: mysql.Pool | null = null;
let database: MySql2Database<typeof schema> | null = null;

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('Managed database is not configured (DATABASE_URL is missing).');
  if (!pool) {
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

export function getDb() {
  if (!database) database = drizzle(getPool(), { schema, mode: 'default' });
  return database;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    database = null;
  }
}
