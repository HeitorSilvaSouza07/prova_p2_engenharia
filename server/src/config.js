import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
dotenv.config({ path: path.join(rootDir, '.env') });

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'postgres';
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export const config = {
  rootDir,
  db: {
    url: databaseUrl(),
  },
  apiPort: Number(process.env.API_PORT || 4001),
  sessionSecret: process.env.SESSION_SECRET || 'prosiga-dev-secret',
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:3000',
};
