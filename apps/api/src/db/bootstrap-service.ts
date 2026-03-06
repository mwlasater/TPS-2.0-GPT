import type { AppConfig } from "@tps/config";

import { applyPendingMigrations } from "./migration-service.js";
import { applyPendingSeeds } from "./seed-service.js";

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function bootstrapDatabase(config: AppConfig): Promise<void> {
  if (!config.DB_AUTO_BOOTSTRAP || config.DATA_ACCESS_MODE !== "postgres") {
    return;
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt < config.DB_BOOTSTRAP_MAX_ATTEMPTS) {
    attempt += 1;

    try {
      await applyPendingMigrations(config);
      await applyPendingSeeds(config);
      return;
    } catch (error) {
      lastError = error;

      if (attempt >= config.DB_BOOTSTRAP_MAX_ATTEMPTS) {
        break;
      }

      await wait(config.DB_BOOTSTRAP_RETRY_MS);
    }
  }

  throw lastError instanceof Error
    ? new Error(`db.bootstrap_failed: ${lastError.message}`)
    : new Error("db.bootstrap_failed");
}
