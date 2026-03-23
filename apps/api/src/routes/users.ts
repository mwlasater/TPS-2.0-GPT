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
import { getPropertyPermissions } from "../lib/permissions.js";

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
      await app.requirePermission(request, "users.invite");
      const payload = managedUserCreateSchema.parse(request.body) as ManagedUserCreate;
      return app.dataAccess.users.createUser(request.property, payload, request.user.displayName);
    }
  );

  app.get(
    "/users/:userId/history",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) =>
      app.dataAccess.users.listUserAdminHistory(
        (request.params as { userId: string }).userId,
        request.property
      )
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
    async (request) =>
      app.dataAccess.users.listUserAdminActions(
        request.property,
        getPropertyPermissions(request.user, request.property)
      )
  );

  app.post(
    "/users/:userId/actions/:actionId",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const actionId = (request.params as { userId: string; actionId: string }).actionId;
      await app.requirePermission(
        request,
        actionId === "resend-invite" ? "users.invite" : "users.manage"
      );
      return app.dataAccess.users.executeUserAdminAction(
        (request.params as { userId: string; actionId: string }).userId,
        request.property,
        actionId,
        request.user.displayName
      );
    }
  );

  app.put(
    "/users/:userId/property-access",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "users.access.write");
      const payload = userPropertyAccessUpdateSchema.parse(request.body) as UserPropertyAccessUpdate;
      return app.dataAccess.users.updateUserPropertyAccess(
        (request.params as { userId: string }).userId,
        request.property,
        payload,
        request.user.displayName
      );
    }
  );

  app.put(
    "/users/:userId/permission-groups",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      await app.requirePermission(request, "users.access.write");
      const payload =
        userPermissionGroupUpdateSchema.parse(request.body) as UserPermissionGroupUpdate;
      return app.dataAccess.users.updateUserPermissionGroups(
        (request.params as { userId: string }).userId,
        request.property,
        payload,
        request.user.displayName
      );
    }
  );
}
