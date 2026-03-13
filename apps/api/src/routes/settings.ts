import { propertySettingsUpdateSchema } from "@tps/validation";
import type { FastifyInstance } from "fastify";

export async function registerSettingsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/settings/property",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.property.getSettings(request.property)
  );

  app.put(
    "/settings/property",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = propertySettingsUpdateSchema.parse(request.body);
      return app.dataAccess.property.updateSettings(request.property, payload);
    }
  );
}
