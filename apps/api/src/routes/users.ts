import {
  managedUserCreateSchema,
  userPermissionGroupUpdateSchema,
  userPropertyAccessUpdateSchema
} from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type {
  ManagedUserCreate,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate
} from "@tps/types";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/users",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.users.listUsers(request.property)
  );

  app.post(
    "/users",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = managedUserCreateSchema.parse(request.body) as ManagedUserCreate;
      return app.dataAccess.users.createUser(request.property, payload);
    }
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

  app.post(
    "/users/:userId/actions/:actionId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) =>
      app.dataAccess.users.executeUserAdminAction(
        (request.params as { userId: string; actionId: string }).userId,
        request.property,
        (request.params as { userId: string; actionId: string }).actionId
      )
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

  app.put(
    "/users/:userId/permission-groups",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload =
        userPermissionGroupUpdateSchema.parse(request.body) as UserPermissionGroupUpdate;
      return app.dataAccess.users.updateUserPermissionGroups(
        (request.params as { userId: string }).userId,
        request.property,
        payload
      );
    }
  );
}
