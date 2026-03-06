import type { AppConfig } from "@tps/config";

import type { DataAccess } from "./contracts.js";
import { createMockDataAccess } from "./mock-data-access.js";
import { getPostgresPool } from "./postgres-client.js";
import { PostgresPropertyRepository } from "./postgres-property-repository.js";

export function createDataAccess(config: AppConfig): DataAccess {
  const mock = createMockDataAccess();

  if (config.DATA_ACCESS_MODE !== "postgres") {
    return mock;
  }

  const property = new PostgresPropertyRepository(getPostgresPool(config));

  return {
    ...mock,
    property
  };
}
