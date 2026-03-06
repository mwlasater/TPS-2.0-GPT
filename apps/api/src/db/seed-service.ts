import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AppConfig } from "@tps/config";
import { Client } from "pg";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const seedsDir = path.join(currentDir, "seeds");

export interface SeedFile {
  id: string;
  filename: string;
  sql: string;
}

export async function loadSeeds(): Promise<SeedFile[]> {
  const filenames = (await readdir(seedsDir))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => ({
      id: filename.replace(/\.sql$/, ""),
      filename,
      sql: await readFile(path.join(seedsDir, filename), "utf8")
    }))
  );
}

async function ensureSeedMetaTable(client: Client): Promise<void> {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS shared;
    CREATE TABLE IF NOT EXISTS shared.seed_history (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function getAppliedSeedIds(client: Client): Promise<Set<string>> {
  await ensureSeedMetaTable(client);
  const result = await client.query<{ id: string }>(
    "SELECT id FROM shared.seed_history ORDER BY id"
  );
  return new Set(result.rows.map((row) => row.id));
}

export async function applyPendingSeeds(config: AppConfig): Promise<string[]> {
  const client = new Client({
    connectionString: config.DATABASE_URL
  });
  await client.connect();

  try {
    const seeds = await loadSeeds();
    const applied = await getAppliedSeedIds(client);
    const pending = seeds.filter((seed) => !applied.has(seed.id));

    for (const seed of pending) {
      await client.query("BEGIN");
      try {
        await client.query(seed.sql);
        await client.query(
          "INSERT INTO shared.seed_history (id, filename) VALUES ($1, $2)",
          [seed.id, seed.filename]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    return pending.map((seed) => seed.id);
  } finally {
    await client.end();
  }
}

export async function getSeedStatus(config: AppConfig): Promise<{
  applied: string[];
  pending: string[];
}> {
  const client = new Client({
    connectionString: config.DATABASE_URL
  });
  await client.connect();

  try {
    const seeds = await loadSeeds();
    const applied = await getAppliedSeedIds(client);

    return {
      applied: seeds.filter((seed) => applied.has(seed.id)).map((seed) => seed.id),
      pending: seeds.filter((seed) => !applied.has(seed.id)).map((seed) => seed.id)
    };
  } finally {
    await client.end();
  }
}
