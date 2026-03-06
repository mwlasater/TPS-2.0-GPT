import cors from "@fastify/cors";
import { createDevelopmentSession } from "@tps/auth";
import { loadConfig } from "@tps/config";
import type { PropertyCode, UserSession } from "@tps/types";
import Fastify from "fastify";

import { createErrorResponse } from "./lib/errors.js";
import { ensurePropertyAccess } from "./lib/tenant-access.js";
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

    const devSession = createDevelopmentSession(
      token,
      config.JWT_DEV_TOKEN,
      (config.userPropertyAccess["local-dev-user"] ?? []) as PropertyCode[]
    );

    if (!devSession) {
      throw new HttpError(401, "auth.invalid");
    }

    request.user = devSession;
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

  app.setErrorHandler((error, _request, reply) => {
    const statusCode =
      error instanceof HttpError
        ? error.statusCode
        : typeof error === "object" && error !== null && "statusCode" in error
          ? Number((error as { statusCode: number }).statusCode)
          : 500;
    const message = error instanceof Error ? error.message : "internal.error";
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
