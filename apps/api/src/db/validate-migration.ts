import { loadMigrations } from "./migration-service.js";
import { migrationManifest } from "./migration-manifest.js";

async function main(): Promise<void> {
  const migrations = await loadMigrations();
  const migrationIds = migrations.map((migration) => migration.id);
  const manifestIds = migrationManifest.map((entry) => entry.id);

  const missingFromManifest = migrationIds.filter((id) => !manifestIds.includes(id));
  const missingFromDisk = manifestIds.filter((id) => !migrationIds.includes(id));

  if (missingFromManifest.length || missingFromDisk.length) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          missingFromManifest,
          missingFromDisk
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        migrationCount: migrationIds.length,
        domains: Array.from(new Set(migrationManifest.map((entry) => entry.domain)))
      },
      null,
      2
    )
  );
}

void main();
