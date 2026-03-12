import { userPropertyAccessUpdateSchema } from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type { UserPropertyAccessUpdate } from "@tps/types";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/users",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listUsers(request.property)
  );

  app.get(
    "/users/:userId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.getUserDetail(
      (request.params as { userId: string }).userId,
      request.property
    )
  );

  app.get(
    "/users/:userId/actions",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async () => app.dataAccess.users.listUserAdminActions()
  );

  app.put(
    "/users/:userId/property-access",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = userPropertyAccessUpdateSchema.parse(request.body) as UserPropertyAccessUpdate;
      return app.dataAccess.users.updateUserPropertyAccess(
        (request.params as { userId: string }).userId,
        request.property,
        payload
      );
    }
  );
}
