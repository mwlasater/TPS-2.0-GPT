import {
  consistEquipmentUpdateSchema,
  crewAssignmentUpdateSchema,
  delayEventUpdateSchema,
  fareEnforcementUpdateSchema,
  stationStopUpdateSchema,
  trainRunApprovalUpdateSchema
} from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type {
  ConsistEquipmentUpdate,
  CrewAssignmentUpdate,
  DelayEventUpdate,
  FareEnforcementUpdate,
  StationStopUpdate,
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
    "/train-runs/:runId/approval",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = trainRunApprovalUpdateSchema.parse(request.body) as TrainRunApprovalUpdate;
      return app.dataAccess.operations.updateTrainRunApproval(
        request.property,
        (request.params as { runId: string }).runId,
        payload,
        request.user.displayName
      );
    }
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
    "/train-runs/:runId/delays",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listDelayEvents(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.put(
    "/train-runs/:runId/delays/:delayId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
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

  app.put(
    "/train-runs/:runId/consist/:equipmentId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
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

  app.put(
    "/train-runs/:runId/crew/:assignmentId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
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

  app.get(
    "/fare-enforcement/summary",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listFareEnforcementSummary(request.property)
  );

  app.put(
    "/fare-enforcement/:recordId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = fareEnforcementUpdateSchema.parse(request.body) as FareEnforcementUpdate;
      return app.dataAccess.operations.updateFareEnforcement(
        request.property,
        (request.params as { recordId: string }).recordId,
        payload
      );
    }
  );
}
