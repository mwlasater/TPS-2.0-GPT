import type { FastifyInstance } from "fastify";

import { listManagedUsers } from "../lib/managed-users.js";
import { getManagedUserDetail, listUserAdminActions } from "../lib/user-admin-data.js";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/users",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => listManagedUsers(request.property)
  );

  app.get(
    "/users/:userId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => getManagedUserDetail(
      (request.params as { userId: string }).userId,
      request.property
    )
  );

  app.get(
    "/users/:userId/actions",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async () => listUserAdminActions()
  );
}
