import { bootstrapDatabase } from "./db/bootstrap-service.js";
import { buildApp } from "./app.js";

const app = buildApp();

try {
  await bootstrapDatabase(app.config);
  await app.listen({
    host: app.config.HOST,
    port: app.config.PORT
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
