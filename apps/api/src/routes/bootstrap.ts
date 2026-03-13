import type { FastifyInstance } from "fastify";

import { getPropertySummaries } from "../lib/property-catalog.js";

export async function registerBootstrapRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/auth/session",
    {
      preHandler: [app.authenticate]
    },
    async (request) => {
      const availableProperties = getPropertySummaries(request.user.allowedProperties);

      return {
        user: request.user,
        availableProperties,
        defaultProperty: availableProperties[0]?.code ?? request.user.allowedProperties[0]
      };
    }
  );

  app.get(
    "/properties",
    {
      preHandler: [app.authenticate]
    },
    async (request) => ({
      items: getPropertySummaries(request.user.allowedProperties)
    })
  );
}
