import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

function sslConfig(connectionString) {
  const needsSsl =
    connectionString.includes('sslmode=require') ||
    connectionString.includes('.supabase.co') ||
    process.env.DB_SSL === 'true';
  return needsSsl ? { rejectUnauthorized: false } : undefined;
}

export const connectionString = config.db.url;

export const pool = new Pool({
  connectionString,
  ssl: sslConfig(connectionString),
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function one(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function run(sql, params = []) {
  const result = await pool.query(sql, params);
  return {
    rowCount: result.rowCount,
    rows: result.rows,
    insertId: result.rows[0]?.id ?? null,
  };
}

export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
