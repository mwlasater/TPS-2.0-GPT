import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AppConfig } from "@tps/config";
import { Client } from "pg";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(currentDir, "migrations");

export interface MigrationFile {
  id: string;
  filename: string;
  sql: string;
}

export async function loadMigrations(): Promise<MigrationFile[]> {
  const filenames = (await readdir(migrationsDir))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => ({
      id: filename.replace(/\.sql$/, ""),
      filename,
      sql: await readFile(path.join(migrationsDir, filename), "utf8")
    }))
  );
}

async function ensureMetaTable(client: Client): Promise<void> {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS shared;
    CREATE TABLE IF NOT EXISTS shared.schema_migration (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function getAppliedMigrationIds(client: Client): Promise<Set<string>> {
  await ensureMetaTable(client);
  const result = await client.query<{ id: string }>(
    "SELECT id FROM shared.schema_migration ORDER BY id"
  );
  return new Set(result.rows.map((row) => row.id));
}

export async function applyPendingMigrations(config: AppConfig): Promise<string[]> {
  const client = new Client({
    connectionString: config.DATABASE_URL
  });
  await client.connect();

  try {
    const migrations = await loadMigrations();
    const applied = await getAppliedMigrationIds(client);
    const pending = migrations.filter((migration) => !applied.has(migration.id));

    for (const migration of pending) {
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query(
          "INSERT INTO shared.schema_migration (id, filename) VALUES ($1, $2)",
          [migration.id, migration.filename]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    return pending.map((migration) => migration.id);
  } finally {
    await client.end();
  }
}

export async function getMigrationStatus(config: AppConfig): Promise<{
  applied: string[];
  pending: string[];
}> {
  const client = new Client({
    connectionString: config.DATABASE_URL
  });
  await client.connect();

  try {
    const migrations = await loadMigrations();
    const applied = await getAppliedMigrationIds(client);

    return {
      applied: migrations.filter((migration) => applied.has(migration.id)).map((migration) => migration.id),
      pending: migrations.filter((migration) => !applied.has(migration.id)).map((migration) => migration.id)
    };
  } finally {
    await client.end();
  }
}

