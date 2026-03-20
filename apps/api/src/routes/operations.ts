import {
  consistEquipmentUpdateSchema,
  delayAdditionalInfoUpdateSchema,
  crewAssignmentUpdateSchema,
  delayEventBatchCreateSchema,
  delayTemplateCreateRequestSchema,
  fareEnforcementCreateSchema,
  delayEventUpdateSchema,
  fareEnforcementUpdateSchema,
  resourceSwapRequestSchema,
  stationStopUpdateSchema,
  trainRunInitializeRequestSchema,
  trainRunBatchApprovalUpdateSchema,
  trainRunApprovalUpdateSchema
} from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type {
  ConsistEquipmentUpdate,
  CrewAssignmentUpdate,
  DelayAdditionalInfoUpdate,
  DelayEventBatchCreate,
  DelayTemplateCreateRequest,
  FareEnforcementCreate,
  DelayEventUpdate,
  FareEnforcementUpdate,
  ResourceSwapRequest,
  StationStopUpdate,
  TrainRunInitializeRequest,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalUpdate
} from "@tps/types";

export async function registerOperationsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/train-schedules",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listTrainSchedules(request.property)
  );

  app.get(
    "/train-runs",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listTrainRuns(request.property)
  );

  app.put(
    "/train-runs/initialize",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "schedules.write");
      const payload = trainRunInitializeRequestSchema.parse(request.body) as TrainRunInitializeRequest;
      return app.dataAccess.operations.initializeTrainRuns(request.property, payload);
    }
  );

  app.put(
    "/train-runs/approval/batch",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "runs.approve");
      const payload = trainRunBatchApprovalUpdateSchema.parse(
        request.body
      ) as TrainRunBatchApprovalUpdate;
      return app.dataAccess.operations.updateTrainRunApprovalBatch(
        request.property,
        payload,
        request.user.displayName
      );
    }
  );

  app.put(
    "/train-runs/:runId/approval",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "runs.approve");
      const payload = trainRunApprovalUpdateSchema.parse(request.body) as TrainRunApprovalUpdate;
      return app.dataAccess.operations.updateTrainRunApproval(
        request.property,
        (request.params as { runId: string }).runId,
        payload,
        request.user.displayName
      );
    }
  );

  app.put(
    "/train-runs/:runId/reset",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "runs.write");
      return app.dataAccess.operations.resetTrainRun(
        request.property,
        (request.params as { runId: string }).runId
      );
    }
  );

  app.delete(
    "/train-runs/:runId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "runs.write");
      return app.dataAccess.operations.deleteTrainRun(
        request.property,
        (request.params as { runId: string }).runId
      );
    }
  );

  app.get(
    "/train-schedules/:scheduleId/approval-history",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listTrainScheduleApprovalHistory(
      request.property,
      (request.params as { scheduleId: string }).scheduleId
    )
  );

  app.get(
    "/train-schedules/:scheduleId/approval-summary",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.getTrainScheduleApprovalSummary(
      request.property,
      (request.params as { scheduleId: string }).scheduleId
    )
  );

  app.get(
    "/train-runs/:runId/approval-history",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listTrainRunApprovalHistory(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.get(
    "/train-runs/:runId/impacts",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.getTrainRunImpactSummary(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.get(
    "/train-runs/:runId/stops",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listStationStops(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.put(
    "/train-runs/:runId/stops/:stopId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "stops.write");
      const payload = stationStopUpdateSchema.parse(request.body) as StationStopUpdate;
      const params = request.params as { runId: string; stopId: string };

      return app.dataAccess.operations.updateStationStop(
        request.property,
        params.runId,
        params.stopId,
        payload
      );
    }
  );

  app.get(
    "/delays/common-locations",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listDelayCommonLocations(request.property)
  );

  app.get(
    "/delays/templates",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listDelayTemplates(request.property)
  );

  app.get(
    "/delays/special-movements",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listSpecialMovements(request.property)
  );

  app.get(
    "/delays/:delayId/additional-info",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.getDelayAdditionalInfo(
      request.property,
      (request.params as { delayId: string }).delayId
    )
  );

  app.put(
    "/delays/:delayId/additional-info",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "delays.write");
      const payload = delayAdditionalInfoUpdateSchema.parse(
        request.body
      ) as DelayAdditionalInfoUpdate;
      return app.dataAccess.operations.updateDelayAdditionalInfo(
        request.property,
        (request.params as { delayId: string }).delayId,
        payload
      );
    }
  );

  app.get(
    "/train-runs/:runId/delays",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listDelayEvents(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.post(
    "/train-runs/:runId/delays/template",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "delays.write");
      const payload = delayTemplateCreateRequestSchema.parse(request.body) as DelayTemplateCreateRequest;
      return app.dataAccess.operations.createDelayFromTemplate(
        request.property,
        (request.params as { runId: string }).runId,
        payload
      );
    }
  );

  app.post(
    "/train-runs/:runId/delays/batch",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "delays.write");
      const payload = delayEventBatchCreateSchema.parse(request.body) as DelayEventBatchCreate;
      return app.dataAccess.operations.createDelayEvents(
        request.property,
        (request.params as { runId: string }).runId,
        payload
      );
    }
  );

  app.delete(
    "/train-runs/:runId/delays/:delayId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "delays.write");
      const params = request.params as { runId: string; delayId: string };
      return app.dataAccess.operations.deleteDelayEvent(
        request.property,
        params.runId,
        params.delayId
      );
    }
  );

  app.put(
    "/train-runs/:runId/delays/:delayId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "delays.write");
      const payload = delayEventUpdateSchema.parse(request.body) as DelayEventUpdate;
      const params = request.params as { runId: string; delayId: string };

      return app.dataAccess.operations.updateDelayEvent(
        request.property,
        params.runId,
        params.delayId,
        payload
      );
    }
  );

  app.get(
    "/train-runs/:runId/consist",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listConsistEquipment(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.get(
    "/consist/templates",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listConsistTemplates(request.property)
  );

  app.post(
    "/train-runs/:runId/consist/swap",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "consist.write");
      const payload = resourceSwapRequestSchema.parse(request.body) as ResourceSwapRequest;
      return app.dataAccess.operations.swapConsistEquipment(
        request.property,
        (request.params as { runId: string }).runId,
        payload
      );
    }
  );

  app.put(
    "/train-runs/:runId/consist/:equipmentId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "consist.write");
      const payload = consistEquipmentUpdateSchema.parse(request.body) as ConsistEquipmentUpdate;
      const params = request.params as { runId: string; equipmentId: string };

      return app.dataAccess.operations.updateConsistEquipment(
        request.property,
        params.runId,
        params.equipmentId,
        payload
      );
    }
  );

  app.get(
    "/train-runs/:runId/crew",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listCrewAssignments(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.get(
    "/crew/templates",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listCrewTemplates(request.property)
  );

  app.post(
    "/train-runs/:runId/crew/swap",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "crew.assign");
      const payload = resourceSwapRequestSchema.parse(request.body) as ResourceSwapRequest;
      return app.dataAccess.operations.swapCrewAssignments(
        request.property,
        (request.params as { runId: string }).runId,
        payload
      );
    }
  );

  app.put(
    "/train-runs/:runId/crew/:assignmentId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "crew.assign");
      const payload = crewAssignmentUpdateSchema.parse(request.body) as CrewAssignmentUpdate;
      const params = request.params as { runId: string; assignmentId: string };

      return app.dataAccess.operations.updateCrewAssignment(
        request.property,
        params.runId,
        params.assignmentId,
        payload
      );
    }
  );

  app.get(
    "/fare-enforcement",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listFareEnforcement(
      request.property,
      (request.query as { runId?: string } | undefined)?.runId
    )
  );

  app.post(
    "/fare-enforcement",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "fare.write");
      const payload = fareEnforcementCreateSchema.parse(request.body) as FareEnforcementCreate;
      return app.dataAccess.operations.createFareEnforcement(request.property, payload);
    }
  );

  app.get(
    "/fare-enforcement/summary",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listFareEnforcementSummary(request.property)
  );

  app.get(
    "/fare-enforcement/dashboard",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.getFareEnforcementDashboard(request.property)
  );

  app.put(
    "/fare-enforcement/:recordId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "fare.write");
      const payload = fareEnforcementUpdateSchema.parse(request.body) as FareEnforcementUpdate;
      return app.dataAccess.operations.updateFareEnforcement(
        request.property,
        (request.params as { recordId: string }).recordId,
        payload
      );
    }
  );
}
