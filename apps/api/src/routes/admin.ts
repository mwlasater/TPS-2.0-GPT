import {
  notificationUpdateSchema,
  reportConfigUpdateSchema
} from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type { NotificationUpdate, ReportConfigUpdate } from "@tps/types";

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/permission-groups",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listPermissionGroups(request.property)
  );

  app.get(
    "/report-config",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.platform.listReportConfig(request.property)
  );

  app.put(
    "/report-config/:reportId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = reportConfigUpdateSchema.parse(request.body) as ReportConfigUpdate;
      return app.dataAccess.platform.updateReportConfig(
        request.property,
        (request.params as { reportId: string }).reportId,
        payload
      );
    }
  );

  app.get(
    "/job-profiles",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listJobProfiles(request.property)
  );

  app.get(
    "/attendance-exceptions",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listAttendanceExceptions(request.property)
  );

  app.get(
    "/files",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.platform.listFiles(request.property)
  );

  app.get(
    "/notifications",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.platform.listNotifications(request.property)
  );

  app.put(
    "/notifications/:notificationId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = notificationUpdateSchema.parse(request.body) as NotificationUpdate;
      return app.dataAccess.platform.updateNotification(
        request.property,
        (request.params as { notificationId: string }).notificationId,
        payload
      );
    }
  );

  app.get(
    "/power-bi",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.platform.listPowerBiEmbeds(request.property)
  );
}
