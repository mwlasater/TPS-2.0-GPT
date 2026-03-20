import {
  attendanceExceptionUpdateSchema,
  delayCommonLocationUpdateSchema,
  delayTemplateUpdateSchema,
  jobProfileUpdateSchema,
  notificationUpdateSchema,
  permissionGroupCreateSchema,
  permissionGroupUpdateSchema,
  personnelStatusUpdateSchema,
  reportConfigUpdateSchema,
  specialMovementUpdateSchema
} from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type {
  AttendanceExceptionUpdate,
  DelayCommonLocationUpdate,
  DelayTemplateUpdate,
  JobProfileUpdate,
  NotificationUpdate,
  PermissionGroupCreate,
  PermissionGroupUpdate,
  PersonnelStatusUpdate,
  ReportConfigUpdate,
  SpecialMovementUpdate
} from "@tps/types";

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/permission-groups",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listPermissionGroups(request.property)
  );

  app.post(
    "/permission-groups",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = permissionGroupCreateSchema.parse(request.body) as PermissionGroupCreate;
      await app.dataAccess.users.createPermissionGroup(request.property, payload);
      return { ok: true };
    }
  );

  app.put(
    "/permission-groups/:groupId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = permissionGroupUpdateSchema.parse(request.body) as PermissionGroupUpdate;
      await app.dataAccess.users.updatePermissionGroup(
        request.property,
        (request.params as { groupId: string }).groupId,
        payload
      );
      return { ok: true };
    }
  );

  app.delete(
    "/permission-groups/:groupId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) =>
      app.dataAccess.users.deletePermissionGroup(
        request.property,
        (request.params as { groupId: string }).groupId
      )
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
    "/personnel",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listPersonnelRecords(request.property)
  );

  app.put(
    "/personnel/:personnelId/status",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = personnelStatusUpdateSchema.parse(request.body) as PersonnelStatusUpdate;
      return app.dataAccess.users.updatePersonnelStatus(
        request.property,
        (request.params as { personnelId: string }).personnelId,
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

  app.put(
    "/job-profiles/:profileId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = jobProfileUpdateSchema.parse(request.body) as JobProfileUpdate;
      return app.dataAccess.users.updateJobProfile(
        request.property,
        (request.params as { profileId: string }).profileId,
        payload
      );
    }
  );

  app.get(
    "/attendance-exceptions",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listAttendanceExceptions(request.property)
  );

  app.put(
    "/attendance-exceptions/:exceptionId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = attendanceExceptionUpdateSchema.parse(request.body) as AttendanceExceptionUpdate;
      return app.dataAccess.users.updateAttendanceException(
        request.property,
        (request.params as { exceptionId: string }).exceptionId,
        payload
      );
    }
  );

  app.get(
    "/files",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.platform.listFiles(request.property)
  );

  app.get(
    "/delay-common-locations",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listDelayCommonLocations(request.property)
  );

  app.put(
    "/delay-common-locations/:locationId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = delayCommonLocationUpdateSchema.parse(
        request.body
      ) as DelayCommonLocationUpdate;
      await app.dataAccess.operations.updateDelayCommonLocation(
        request.property,
        (request.params as { locationId: string }).locationId,
        payload
      );
      return { ok: true };
    }
  );

  app.get(
    "/delay-templates",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listDelayTemplates(request.property)
  );

  app.put(
    "/delay-templates/:templateId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = delayTemplateUpdateSchema.parse(request.body) as DelayTemplateUpdate;
      await app.dataAccess.operations.updateDelayTemplate(
        request.property,
        (request.params as { templateId: string }).templateId,
        payload
      );
      return { ok: true };
    }
  );

  app.get(
    "/special-movements",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listSpecialMovements(request.property)
  );

  app.put(
    "/special-movements/:movementId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = specialMovementUpdateSchema.parse(request.body) as SpecialMovementUpdate;
      await app.dataAccess.operations.updateSpecialMovement(
        request.property,
        (request.params as { movementId: string }).movementId,
        payload
      );
      return { ok: true };
    }
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
