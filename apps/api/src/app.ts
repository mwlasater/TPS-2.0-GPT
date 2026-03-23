import cors from "@fastify/cors";
import { createDevelopmentSession } from "@tps/auth";
import { loadConfig } from "@tps/config";
import type { PropertyCode, UserSession } from "@tps/types";
import Fastify from "fastify";
import { ZodError } from "zod";

import { createErrorResponse } from "./lib/errors.js";
import { getUserIdentityFromClaims, verifyJwtToken } from "./lib/jwt-auth.js";
import { ensurePropertyPermission } from "./lib/permissions.js";
import { ensurePropertyAccess } from "./lib/tenant-access.js";
import { loadPersistedUserAuthorization } from "./lib/user-session-auth.js";
import { registerBootstrapRoutes } from "./routes/bootstrap.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerOperationsRoutes } from "./routes/operations.js";
import { registerReferenceRoutes } from "./routes/reference.js";
import { registerSecureRoutes } from "./routes/secure.js";
import { registerSettingsRoutes } from "./routes/settings.js";
import { registerUserRoutes } from "./routes/users.js";
import { createDataAccess } from "./repositories/create-data-access.js";
import type { DataAccess } from "./repositories/contracts.js";
import { getPostgresPool } from "./repositories/postgres-client.js";

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    config: ReturnType<typeof loadConfig>;
    dataAccess: DataAccess;
    authenticate: (request: import("fastify").FastifyRequest) => Promise<void>;
    requireProperty: (request: import("fastify").FastifyRequest) => Promise<void>;
    requirePermission: (
      request: import("fastify").FastifyRequest,
      permission: string
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user: UserSession;
    property: PropertyCode;
  }
}

export function buildApp(env: NodeJS.ProcessEnv = process.env) {
  const config = loadConfig(env);

  const app = Fastify({
    logger:
      config.NODE_ENV === "development"
        ? {
            level: "info",
            transport: {
              target: "pino-pretty"
            }
          }
        : {
            level: "warn"
          },
    genReqId: () => crypto.randomUUID()
  });

  app.decorate("config", config);
  app.decorate("dataAccess", createDataAccess(config));

  app.decorate("authenticate", async (request) => {
    const authorization = request.headers.authorization;
    const token = authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new HttpError(401, "auth.required");
    }

    let identity: Pick<UserSession, "id" | "email" | "displayName">;

    try {
      identity =
        config.JWT_AUTH_MODE === "development"
          ? (() => {
              const session = createDevelopmentSession(
                token,
                config.JWT_DEV_TOKEN,
                [],
                {}
              );

              if (!session) {
                throw new HttpError(401, "auth.invalid");
              }

              return {
                id: session.id,
                email: session.email,
                displayName: session.displayName
              };
            })()
          : getUserIdentityFromClaims(
              await verifyJwtToken(token, {
                audience: config.JWT_AUDIENCE,
                issuer: config.JWT_ISSUER,
                jwksUri: config.JWT_JWKS_URI,
                clockToleranceSeconds: config.JWT_CLOCK_TOLERANCE_SECONDS
              })
            );
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : "auth.invalid";
      throw new HttpError(401, message.startsWith("auth.") ? message : "auth.invalid");
    }

    const authorizationContext =
      config.DATA_ACCESS_MODE === "postgres"
        ? await loadPersistedUserAuthorization(getPostgresPool(config), identity.id)
        : {
            allowedProperties: (config.userPropertyAccess[identity.id] ?? []) as PropertyCode[],
            propertyPermissions: (config.userPropertyPermissions[identity.id] ?? {}) as Partial<
              Record<PropertyCode, string[]>
            >
          };

    request.user = {
      id: identity.id,
      email: identity.email,
      displayName: identity.displayName,
      allowedProperties: authorizationContext.allowedProperties,
      propertyPermissions: authorizationContext.propertyPermissions
    };
  });

  app.decorate("requireProperty", async (request) => {
    try {
      request.property = ensurePropertyAccess(
        request.headers["x-property"] as string | undefined,
        config.propertyCodes,
        request.user
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "property.invalid";
      if (message === "property.required" || message === "property.invalid") {
        throw new HttpError(400, message);
      }

      throw new HttpError(403, message);
    }
  });

  app.decorate("requirePermission", async (request, permission) => {
    try {
      ensurePropertyPermission(request.user, request.property, permission);
    } catch (error) {
      const message = error instanceof Error ? error.message : "permission.forbidden";
      throw new HttpError(403, message);
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    const inferredMessage = error instanceof Error ? error.message : "internal.error";
    const statusCode =
      error instanceof HttpError
        ? error.statusCode
        : error instanceof ZodError
          ? 400
          : inferredMessage.endsWith(".approval_blocked")
            ? 409
          : inferredMessage.endsWith(".not_found")
            ? 404
            : inferredMessage.endsWith(".locked")
              ? 403
        : typeof error === "object" && error !== null && "statusCode" in error
          ? Number((error as { statusCode: number }).statusCode)
          : 500;
    const message =
      error instanceof ZodError
        ? "validation.failed"
        : error instanceof Error
          ? inferredMessage
          : "internal.error";
    reply.status(statusCode).send(createErrorResponse(statusCode, message));
  });

  void app.register(cors, {
    origin: config.WEB_ORIGIN
  });

  app.register(async (api) => {
    await registerHealthRoutes(api);
    await registerBootstrapRoutes(api);
    await registerSecureRoutes(api);
    await registerAdminRoutes(api);
    await registerSettingsRoutes(api);
    await registerUserRoutes(api);
    await registerReferenceRoutes(api);
    await registerOperationsRoutes(api);
  }, { prefix: config.API_PREFIX });

  return app;
}
