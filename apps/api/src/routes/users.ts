import type { FastifyInstance } from "fastify";

import { listManagedUsers } from "../lib/managed-users.js";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/users",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listManagedUsers(request.property)
  );
}
