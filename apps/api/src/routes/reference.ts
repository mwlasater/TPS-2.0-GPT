import type { FastifyInstance } from "fastify";

export async function registerReferenceRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/reference-data",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.property.getReferenceData(request.property)
  );
}
