import { referenceDatasetSchema } from "@tps/validation";
import type { FastifyInstance } from "fastify";
import type { ReferenceDataset } from "@tps/types";

export async function registerReferenceRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/reference-data",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => app.dataAccess.property.getReferenceData(request.property)
  );

  app.put(
    "/reference-data",
    {
      preHandler: [app.authenticate, app.requireProperty]
    },
    async (request) => {
      const payload = referenceDatasetSchema.parse(request.body) as ReferenceDataset;
      return app.dataAccess.property.updateReferenceData(request.property, payload);
    }
  );
}
