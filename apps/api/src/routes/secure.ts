import type { FastifyInstance } from "fastify";

export async function registerSecureRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/me",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => ({
      user: request.user,
      property: request.property
    })
  );
}

