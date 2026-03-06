import type { FastifyInstance } from "fastify";

import { getPropertySettings } from "../lib/property-settings.js";

export async function registerSettingsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/settings/property",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => getPropertySettings(request.property)
  );
}
