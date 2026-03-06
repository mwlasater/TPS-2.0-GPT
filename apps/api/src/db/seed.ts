import { loadConfig } from "@tps/config";

import { applyPendingSeeds, getSeedStatus } from "./seed-service.js";

async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const command = process.argv[2] ?? "status";

  if (command === "up") {
    const applied = await applyPendingSeeds(config);
    console.log(applied.length ? `Applied seeds: ${applied.join(", ")}` : "No pending seeds.");
    return;
  }

  if (command === "status") {
    const status = await getSeedStatus(config);
    console.log(`Applied: ${status.applied.join(", ") || "(none)"}`);
    console.log(`Pending: ${status.pending.join(", ") || "(none)"}`);
    return;
  }

  throw new Error(`Unknown seed command: ${command}`);
}

await main();
