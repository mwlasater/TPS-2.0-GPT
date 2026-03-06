import type { FastifyInstance } from "fastify";

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
    "/train-runs/:runId/crew",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.operations.listCrewAssignments(
      request.property,
      (request.params as { runId: string }).runId
    )
  );
}
