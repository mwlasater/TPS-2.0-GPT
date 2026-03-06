import type { FastifyInstance } from "fastify";

import { listTrainRuns, listTrainSchedules } from "../lib/operations-data.js";
import { listDelayEvents, listStationStops } from "../lib/run-detail-data.js";

export async function registerOperationsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/train-schedules",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listTrainSchedules(request.property)
  );

  app.get(
    "/train-runs",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listTrainRuns(request.property)
  );

  app.get(
    "/train-runs/:runId/stops",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listStationStops(
      request.property,
      (request.params as { runId: string }).runId
    )
  );

  app.get(
    "/train-runs/:runId/delays",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listDelayEvents(
      request.property,
      (request.params as { runId: string }).runId
    )
  );
}
