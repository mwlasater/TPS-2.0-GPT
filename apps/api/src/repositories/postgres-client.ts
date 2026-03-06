import type { QueryResult, QueryResultRow } from "pg";
import { Pool } from "pg";

import type { AppConfig } from "@tps/config";

export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<R>>;
}

let pool: Pool | null = null;

export function getPostgresPool(config: AppConfig): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.DATABASE_URL
    });
  }

  return pool;
}

