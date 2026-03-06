import type { FastifyInstance } from "fastify";

import { listAttendanceExceptions, listJobProfiles } from "../lib/baseline-data.js";
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

  app.get(
    "/job-profiles",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listJobProfiles(request.property)
  );

  app.get(
    "/attendance-exceptions",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listAttendanceExceptions(request.property)
  );
}
