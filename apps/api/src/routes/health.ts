import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({
    status: "ok" as const,
    version: app.config.APP_VERSION,
    time: new Date().toISOString()
  }));

  app.get("/version", async () => ({
    version: app.config.APP_VERSION,
    apiPrefix: app.config.API_PREFIX
  }));
}

