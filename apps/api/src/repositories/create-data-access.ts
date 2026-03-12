import type { AppConfig } from "@tps/config";

import type { DataAccess } from "./contracts.js";
import { createMockDataAccess } from "./mock-data-access.js";
import { getPostgresPool } from "./postgres-client.js";
import { PostgresOperationsRepository } from "./postgres-operations-repository.js";
import { PostgresPlatformRepository } from "./postgres-platform-repository.js";
import { PostgresPropertyRepository } from "./postgres-property-repository.js";
import { PostgresUsersRepository } from "./postgres-users-repository.js";

export function createDataAccess(config: AppConfig): DataAccess {
  const mock = createMockDataAccess();

  if (config.DATA_ACCESS_MODE !== "postgres") {
    return mock;
  }

  const pool = getPostgresPool(config);
  const property = new PostgresPropertyRepository(pool);
  const operations = new PostgresOperationsRepository(pool);
  const platform = new PostgresPlatformRepository(pool);
  const users = new PostgresUsersRepository(pool);

  return {
    ...mock,
    property,
    platform,
    users,
    operations
  };
}
