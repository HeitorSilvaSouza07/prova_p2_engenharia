import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env') });

const migrationsDir = path.join(rootDir, 'db', 'migrations');
const onlyStatus = process.argv.includes('--status');

function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'postgres';
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function sslConfig(url) {
  const needsSsl =
    url.includes('sslmode=require') || url.includes('.supabase.co') || process.env.DB_SSL === 'true';
  return needsSsl ? { rejectUnauthorized: false } : undefined;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function main() {
  const url = connectionString();
  const client = new pg.Client({ connectionString: url, ssl: sslConfig(url) });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(255) PRIMARY KEY,
        checksum   CHAR(64)     NOT NULL,
        applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows } = await client.query('SELECT version, checksum FROM schema_migrations');
    const applied = new Map(rows.map((row) => [row.version, row.checksum]));

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.toLowerCase().endsWith('.sql'))
      .sort();

    if (onlyStatus) {
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        const checksum = sha256(sql);
        const appliedChecksum = applied.get(file);
        const state = !appliedChecksum ? 'PENDENTE' : appliedChecksum === checksum ? 'aplicada' : 'ALTERADA';
        console.log(`${state.padEnd(9)} ${file}`);
      }
      return;
    }

    let aplicadas = 0;

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const checksum = sha256(sql);
      const appliedChecksum = applied.get(file);

      if (appliedChecksum === checksum) {
        console.log(`= ${file} (já aplicada)`);
        continue;
      }

      if (appliedChecksum) {
        console.log(`! ${file} foi alterada depois de aplicada — aplicando novamente.`);
      }

      console.log(`> aplicando ${file} ...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)
             ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum,
                                                 applied_at = CURRENT_TIMESTAMP`,
          [file, checksum]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      aplicadas += 1;
    }

    console.log(
      aplicadas === 0
        ? 'Nenhuma migration pendente. Banco atualizado.'
        : `${aplicadas} migration(s) aplicada(s) com sucesso.`
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  const detalhe =
    error.message || error.code || (error.errors && error.errors.map((e) => e.message).join('; ')) || error;
  console.error('Falha ao executar as migrations:', detalhe);
  if (!process.env.DATABASE_URL) {
    console.error('Dica: configure DATABASE_URL no arquivo .env com a connection string do Supabase.');
  }
  process.exitCode = 1;
});
