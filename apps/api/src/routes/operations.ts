import type { FastifyInstance } from "fastify";

import { listTrainRuns, listTrainSchedules } from "../lib/operations-data.js";

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
}
