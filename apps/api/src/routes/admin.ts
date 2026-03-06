import type { FastifyInstance } from "fastify";

import { listPermissionGroups } from "../lib/permission-groups.js";
import { listReportConfig } from "../lib/report-config.js";

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/permission-groups",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listPermissionGroups(request.property)
  );

  app.get(
    "/report-config",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listReportConfig(request.property)
  );
}
