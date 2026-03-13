import { loadConfig } from "@tps/config";

import { applyPendingMigrations, getMigrationStatus } from "./migration-service.js";

async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const command = process.argv[2] ?? "status";

  if (command === "up") {
    const applied = await applyPendingMigrations(config);
    console.log(
      applied.length
        ? `Applied migrations: ${applied.join(", ")}`
        : "No pending migrations."
    );
    return;
  }

  if (command === "status") {
    const status = await getMigrationStatus(config);
    console.log(`Applied: ${status.applied.join(", ") || "(none)"}`);
    console.log(`Pending: ${status.pending.join(", ") || "(none)"}`);
    return;
  }

  throw new Error(`Unknown migration command: ${command}`);
}

await main();

