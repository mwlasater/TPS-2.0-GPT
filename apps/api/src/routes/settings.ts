import type { FastifyInstance } from "fastify";

export async function registerSettingsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/settings/property",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.property.getSettings(request.property)
  );
}
