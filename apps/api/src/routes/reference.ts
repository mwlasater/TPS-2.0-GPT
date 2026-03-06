import type { FastifyInstance } from "fastify";

import { getReferenceData } from "../lib/reference-data.js";

export async function registerReferenceRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/reference-data",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => getReferenceData(request.property)
  );
}
